import { mount } from '@vue/test-utils'
import { h } from 'vue'
import { describe, expect, it } from 'vitest'

import { mountWithI18n } from '../fixtures/i18n'

import ModalFooter from '@/components/modals/ModalFooter.vue'
import RemoveTaskTypeModal from '@/components/modals/RemoveTaskTypeModal.vue'

const taskType = { id: 'task-type-modeling', name: 'Modeling' }

const mountModal = () =>
  mount(RemoveTaskTypeModal, {
    props: { active: true, nbTasks: 3, taskType },
    global: { mocks: { $t: key => key } }
  })

describe('RemoveTaskTypeModal', () => {
  it('tells the remaining tasks stay once the task type is removed', () => {
    const text = nbTasks =>
      mountWithI18n({
        render: () => h(RemoveTaskTypeModal, { active: true, nbTasks, taskType })
      })
        .get('.remaining-tasks')
        .text()

    // The shot lists and the to-do lists keep showing them: no promise
    // that they get hidden.
    expect(text(3)).toEqual(
      'Modeling still has 3 tasks in this production. Removing the task ' +
        'type does not delete them.'
    )
    expect(text(1)).toEqual(
      'Modeling still has 1 task in this production. Removing the task ' +
        'type does not delete it.'
    )
  })

  it('keeps the tasks unless asked to delete them', async () => {
    const wrapper = mountModal()

    expect(wrapper.find('input.input').exists()).toBe(false)
    wrapper.findComponent(ModalFooter).vm.$emit('confirm')

    expect(wrapper.emitted('confirm')).toEqual([[false]])
  })

  // Deleting the tasks also deletes their comments and previews: the name
  // of the task type is asked first, like for the Delete all of the lists.
  it('asks for the task type name before deleting the tasks', async () => {
    const wrapper = mountModal()
    const footer = wrapper.findComponent(ModalFooter)

    await wrapper.get('input[type=checkbox]').setValue(true)
    expect(footer.props('isDisabled')).toBe(true)

    await wrapper.get('input.input').setValue('Model')
    expect(footer.props('isDisabled')).toBe(true)
    // Enter in the field confirms too, past the disabled button.
    await wrapper.get('input.input').trigger('keyup.enter')
    expect(wrapper.emitted('confirm')).toBeUndefined()

    await wrapper.get('input.input').setValue('Modeling')
    expect(footer.props('isDisabled')).toBe(false)
    footer.vm.$emit('confirm')

    expect(wrapper.emitted('confirm')).toEqual([[true]])
  })
})
