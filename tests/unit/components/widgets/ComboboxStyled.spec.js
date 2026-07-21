import { mount } from '@vue/test-utils'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: key => key })
}))
vi.mock('vue-router', () => ({
  useRouter: () => ({ resolve: () => ({ href: '' }) })
}))

import ComboboxStyled from '@/components/widgets/ComboboxStyled.vue'

const options = [
  { label: 'entity_name', value: 'entity_name' },
  { label: 'priority', value: 'priority' },
  { label: 'Render layer', value: 'metadata.render_layer', raw: true }
]

describe('widgets/ComboboxStyled', () => {
  test('renders every option, raw metadata labels untranslated', async () => {
    const wrapper = mount(ComboboxStyled, {
      props: {
        options,
        localeKeyPrefix: 'tasks.fields.',
        modelValue: 'entity_name'
      }
    })
    await wrapper.find('.combo').trigger('click')
    const lines = wrapper.findAll('.option-line')
    expect(lines).toHaveLength(3)
    expect(lines[0].text()).toContain('tasks.fields.entity_name')
    expect(lines[2].text()).toContain('Render layer')
  })
})
