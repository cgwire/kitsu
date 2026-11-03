import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

vi.mock('vuex', () => ({
  useStore: () => ({
    getters: {
      departmentMap: new Map([
        ['dep-1', { id: 'dep-1', name: 'Lighting', color: '#ff0000' }]
      ]),
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
  it('shows the department of each milestone that has one', async () => {
    const wrapper = mount(MilestonePopover, {
      global: { mocks: { $t: key => key } },
      attachTo: document.body
    })

    wrapper.vm.show(group, document.body)
    await nextTick()

    const items = [...document.querySelectorAll('.milestone-popover-item')]
    expect(items).toHaveLength(2)
    expect(items[0].querySelector('.department-name').textContent).toContain(
      'Lighting'
    )
    expect(items[1].querySelector('.department-name')).toBeNull()
    wrapper.unmount()
  })
})
