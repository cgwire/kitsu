import { DOMWrapper, enableAutoUnmount, mount } from '@vue/test-utils'
import { nextTick } from 'vue'

vi.mock('vuex', () => ({
  useStore: () => ({
    getters: {
      departmentMap: new Map([
        ['dep-1', { id: 'dep-1', name: 'Lighting', color: '#ff0000' }]
      ]),
      dateFormat: 'DD/MM/YYYY',
      isDarkTheme: false
    }
  })
}))

import MilestonePopover from '@/components/widgets/MilestonePopover.vue'

// A failed assertion skips the end of its test: a popover left on the body
// would fail the next tests too.
enableAutoUnmount(afterEach)

const group = {
  date: '2026-11-02',
  milestones: [
    {
      id: 'm1',
      name: 'Animation lock',
      milestone_type: 'approval',
      color: null,
      department_id: 'dep-1'
    },
    {
      id: 'm2',
      name: 'Kickoff',
      milestone_type: 'kickoff',
      color: null,
      department_id: null
    }
  ]
}

describe('widgets/MilestonePopover', () => {
  describe('department', () => {
    const headerDepartment = () =>
      document.querySelector('.milestone-popover-header .department-name')
    const showGroup = async milestones => {
      const wrapper = mount(MilestonePopover, {
        global: { mocks: { $t: key => key } },
        attachTo: document.body
      })
      wrapper.vm.show({ ...group, milestones }, document.body)
      await nextTick()
    }

    it('sits next to the date for a single milestone', async () => {
      await showGroup([group.milestones[0]])

      expect(headerDepartment().textContent).toContain('Lighting')
      expect(
        document.querySelector('.milestone-popover-meta .department-name')
      ).toBeNull()
    })

    it('sits on the line of each milestone of a merged flag', async () => {
      await showGroup(group.milestones)

      const metas = document.querySelectorAll('.milestone-popover-meta')
      expect(headerDepartment()).toBeNull()
      expect(metas[0].querySelector('.department-name').textContent).toContain(
        'Lighting'
      )
      expect(metas[1].querySelector('.department-name')).toBeNull()
    })
  })

  it('shows the date in the user format, above the milestones', async () => {
    const wrapper = mount(MilestonePopover, {
      global: { mocks: { $t: key => key } },
      attachTo: document.body
    })

    wrapper.vm.show(group, document.body)
    await nextTick()

    expect(document.querySelector('.milestone-popover-date').textContent).toBe(
      '02/11/2026'
    )
  })

  it('puts the type under the name', async () => {
    const wrapper = mount(MilestonePopover, {
      global: { mocks: { $t: key => key } },
      attachTo: document.body
    })

    wrapper.vm.show(group, document.body)
    await nextTick()

    const item = document.querySelector('.milestone-popover-item')
    const meta = item.querySelector('.milestone-popover-meta')
    expect(item.querySelector('.milestone-popover-name').textContent).toBe(
      'Animation lock'
    )
    expect(meta.textContent).toContain('schedule.milestone.types.approval')
  })

  describe('keyboard', () => {
    let flag
    const items = () => [...document.querySelectorAll('.milestone-popover-item')]
    const mountPopover = async ({
      canEdit = true,
      moveFocus = true,
      onEdit
    } = {}) => {
      const wrapper = mount(MilestonePopover, {
        props: { canEdit, onEdit },
        global: { mocks: { $t: key => key } },
        attachTo: document.body
      })
      wrapper.vm.show(group, flag, { moveFocus })
      await nextTick()
      await nextTick()
      return wrapper
    }
    // Vue skips a listener when the event is no newer than the listener, to
    // the millisecond: a bare dispatchEvent() fired in the millisecond of the
    // render loses the Escape listener of the popover, above the item that
    // stamps the event. trigger() stamps it 1 ms ahead.
    const press = (element, key) =>
      new DOMWrapper(element).trigger('keydown', { key })

    beforeEach(() => {
      flag = document.createElement('div')
      flag.tabIndex = 0
      document.body.append(flag)
    })

    afterEach(() => {
      vi.useRealTimers()
      flag.remove()
    })

    it('moves the focus to the first milestone on request', async () => {
      await mountPopover()

      expect(document.activeElement).toBe(items()[0])
    })

    it('keeps the focus where it is by default', async () => {
      flag.focus()
      await mountPopover({ moveFocus: false })

      expect(document.activeElement).toBe(flag)
    })

    it.each(['Enter', ' '])('edits the milestone on "%s"', async key => {
      const wrapper = await mountPopover()

      await press(items()[1], key)

      expect(wrapper.emitted('edit')).toEqual([[group.milestones[1]]])
    })

    it('gives the focus back to the flag before editing', async () => {
      let focusedOnEdit = null
      await mountPopover({
        onEdit: () => (focusedOnEdit = document.activeElement)
      })

      await press(items()[0], 'Enter')

      expect(focusedOnEdit).toBe(flag)
    })

    it('closes on Escape and gives the focus back to the flag', async () => {
      await mountPopover()

      await press(items()[0], 'Escape')

      expect(items()).toHaveLength(0)
      expect(document.activeElement).toBe(flag)
    })

    it('closes once the focus leaves it', async () => {
      vi.useFakeTimers()
      await mountPopover()

      items()[0].blur()
      vi.advanceTimersByTime(200)
      await nextTick()

      expect(items()).toHaveLength(0)
    })

    it('stays open while the focus moves between milestones', async () => {
      vi.useFakeTimers()
      await mountPopover()

      items()[1].focus()
      vi.advanceTimersByTime(200)
      await nextTick()

      expect(items()).toHaveLength(2)
    })

    it('leaves the milestones out of the Tab order when read-only', async () => {
      await mountPopover({ canEdit: false })

      expect(items()[0].getAttribute('tabindex')).toBeNull()
      expect(items()[0].getAttribute('role')).toBeNull()
      expect(document.activeElement).not.toBe(items()[0])
    })
  })
})
