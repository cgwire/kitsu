import { mount } from '@vue/test-utils'

import EditProjectTemplateModal from '@/components/modals/EditProjectTemplateModal.vue'

const template = {
  id: 'template-1',
  name: 'Series',
  description: 'For the episodic series.\nWith a layout step.',
  production_type: 'tvshow',
  production_style: '2d3d'
}

// The form takes the template when it changes, not at mount.
const mountModal = async () => {
  const wrapper = mount(EditProjectTemplateModal, {
    props: { active: false },
    global: { stubs: { ComboboxStyled: true } }
  })
  await wrapper.setProps({ active: true, templateToEdit: template })
  return wrapper
}

const findDescription = wrapper => {
  const label = wrapper
    .findAll('label')
    .find(item => item.text() === 'project_templates.fields.description')
  return wrapper.find(`[id="${label.attributes('for')}"]`)
}

describe('EditProjectTemplateModal', () => {
  describe('description', () => {
    it('shows every line of the template description', async () => {
      const wrapper = await mountModal()
      expect(findDescription(wrapper).element.value).toBe(template.description)
    })

    it('sends its lines as typed', async () => {
      const wrapper = await mountModal()
      await findDescription(wrapper).setValue('First line\nSecond line')
      await wrapper.find('.modal-footer .is-primary').trigger('click')
      expect(wrapper.emitted('confirm')[0][0].description).toBe(
        'First line\nSecond line'
      )
    })
  })
})
