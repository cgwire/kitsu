import { mount } from '@vue/test-utils'

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: key => key }) }))

import ComboboxTaskTypeOptions from '@/components/widgets/ComboboxTaskTypeOptions.vue'
import ComboboxVisibleOptions from '@/components/widgets/ComboboxVisibleOptions.vue'
import TaskTypeName from '@/components/widgets/TaskTypeName.vue'

const taskTypes = [
  { id: 'modeling', name: 'Modeling', color: '#ff0000' },
  { id: 'rigging', name: 'Rigging', color: '#00ff00' }
]

const mountWidget = (props = {}) =>
  mount(ComboboxTaskTypeOptions, {
    props: { taskTypes, ...props },
    global: { stubs: { TaskTypeName: true } }
  })

describe('ComboboxTaskTypeOptions', () => {
  it('offers one option per task type', () => {
    const wrapper = mountWidget({ label: 'Task types', hidden: ['rigging'] })
    expect(wrapper.findComponent(ComboboxVisibleOptions).props()).toMatchObject(
      {
        label: 'Task types',
        hidden: ['rigging'],
        options: [
          { label: 'Modeling', value: 'modeling' },
          { label: 'Rigging', value: 'rigging' }
        ]
      }
    )
  })

  it('names the options the way task types are named everywhere', async () => {
    const wrapper = mountWidget()
    await wrapper.find('[role="combobox"]').trigger('click')
    const names = wrapper.findAllComponents(TaskTypeName)
    expect(names.map(name => name.props('taskType'))).toEqual(taskTypes)
    expect(names[0].props('isLink')).toBe(false)
    expect(wrapper.find('.option-line').text()).not.toContain('Modeling')
  })

  it('reports the task types the user hides', async () => {
    const wrapper = mountWidget()
    await wrapper.find('[role="combobox"]').trigger('click')
    await wrapper.find('.option-line').trigger('click')
    expect(wrapper.emitted('update:hidden')).toEqual([[['modeling']]])
  })
})
