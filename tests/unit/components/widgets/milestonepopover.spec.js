import { mount } from '@vue/test-utils'
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
      return wrapper
    }

    it('sits next to the date for a single milestone', async () => {
      const wrapper = await showGroup([group.milestones[0]])

      expect(headerDepartment().textContent).toContain('Lighting')
      expect(
        document.querySelector('.milestone-popover-meta .department-name')
      ).toBeNull()
      wrapper.unmount()
    })

    it('sits on the line of each milestone of a merged flag', async () => {
      const wrapper = await showGroup(group.milestones)

      const metas = document.querySelectorAll('.milestone-popover-meta')
      expect(headerDepartment()).toBeNull()
      expect(metas[0].querySelector('.department-name').textContent).toContain(
        'Lighting'
      )
      expect(metas[1].querySelector('.department-name')).toBeNull()
      wrapper.unmount()
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
    wrapper.unmount()
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
    wrapper.unmount()
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
    const press = async (element, key) => {
      element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
      await nextTick()
    }

    beforeEach(() => {
      flag = document.createElement('div')
      flag.tabIndex = 0
      document.body.append(flag)
    })

    afterEach(() => {
      flag.remove()
    })

    it('moves the focus to the first milestone on request', async () => {
      const wrapper = await mountPopover()

      expect(document.activeElement).toBe(items()[0])
      wrapper.unmount()
    })

    it('keeps the focus where it is by default', async () => {
      flag.focus()
      const wrapper = await mountPopover({ moveFocus: false })

      expect(document.activeElement).toBe(flag)
      wrapper.unmount()
    })

    it.each(['Enter', ' '])('edits the milestone on "%s"', async key => {
      const wrapper = await mountPopover()

      await press(items()[1], key)

      expect(wrapper.emitted('edit')).toEqual([[group.milestones[1]]])
      wrapper.unmount()
    })

    it('gives the focus back to the flag before editing', async () => {
      let focusedOnEdit = null
      const wrapper = await mountPopover({
        onEdit: () => (focusedOnEdit = document.activeElement)
      })

      await press(items()[0], 'Enter')

      expect(focusedOnEdit).toBe(flag)
      wrapper.unmount()
    })

    it('closes on Escape and gives the focus back to the flag', async () => {
      const wrapper = await mountPopover()

      await press(items()[0], 'Escape')

      expect(items()).toHaveLength(0)
      expect(document.activeElement).toBe(flag)
      wrapper.unmount()
    })

    it('closes once the focus leaves it', async () => {
      vi.useFakeTimers()
      const wrapper = await mountPopover()

      items()[0].blur()
      vi.advanceTimersByTime(200)
      await nextTick()

      expect(items()).toHaveLength(0)
      wrapper.unmount()
      vi.useRealTimers()
    })

    it('stays open while the focus moves between milestones', async () => {
      vi.useFakeTimers()
      const wrapper = await mountPopover()

      items()[1].focus()
      vi.advanceTimersByTime(200)
      await nextTick()

      expect(items()).toHaveLength(2)
      wrapper.unmount()
      vi.useRealTimers()
    })

    it('leaves the milestones out of the Tab order when read-only', async () => {
      const wrapper = await mountPopover({ canEdit: false })

      expect(items()[0].getAttribute('tabindex')).toBeNull()
      expect(items()[0].getAttribute('role')).toBeNull()
      expect(document.activeElement).not.toBe(items()[0])
      wrapper.unmount()
    })
  })
})
