import { mount } from '@vue/test-utils'
import { h } from 'vue'
import { describe, expect, it } from 'vitest'

import { mountWithI18n } from '../fixtures/i18n'

import ModalFooter from '@/components/modals/ModalFooter.vue'
import RemoveTaskTypeModal from '@/components/modals/RemoveTaskTypeModal.vue'
import TextField from '@/components/widgets/TextField.vue'

const taskType = { id: 'task-type-modeling', name: 'Modeling' }

const mountModal = (props = {}) =>
  mount(RemoveTaskTypeModal, {
    props: { active: true, nbTasks: 3, taskType, ...props }
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

  // The lock asks for intent, not for an exact copy: a user typed RIGGING,
  // as the uppercase label showed it, for a task type named Rigging.
  it('takes the name whatever its case and outer spaces', async () => {
    const wrapper = mountModal()
    const footer = wrapper.findComponent(ModalFooter)

    await wrapper.get('input[type=checkbox]').setValue(true)
    await wrapper.get('input.input').setValue('MODELING')
    expect(footer.props('isDisabled')).toBe(false)

    await wrapper.get('input.input').setValue(' modeling  ')
    expect(footer.props('isDisabled')).toBe(false)
  })

  it('keeps the tasks locked without a name to match', async () => {
    const wrapper = mountModal({ taskType: null })

    await wrapper.get('input[type=checkbox]').setValue(true)

    expect(wrapper.findComponent(ModalFooter).props('isDisabled')).toBe(true)
  })

  // A start of the name is unfinished, not wrong: the field turns red only
  // once the text can no longer become the name.
  it('flags the field once the text can no longer be the name', async () => {
    const wrapper = mountWithI18n({
      render: () =>
        h(RemoveTaskTypeModal, { active: true, nbTasks: 3, taskType })
    })
    await wrapper.get('input[type=checkbox]').setValue(true)
    const field = wrapper.findComponent(TextField)
    const input = field.get('input')

    expect(input.attributes('aria-invalid')).toBe('false')
    await input.setValue('mod')
    expect(input.attributes('aria-invalid')).toBe('false')
    expect(field.find('p.error').exists()).toBe(false)

    await input.setValue('Modx')
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(field.get('p.error').text()).toBe('The name does not match.')

    await input.setValue('')
    expect(input.attributes('aria-invalid')).toBe('false')
  })

  // Enter tries to confirm: an unfinished name is refused in red, and the
  // next edit clears it.
  it('flags an unfinished name when Enter is pressed', async () => {
    const wrapper = mountWithI18n({
      render: () =>
        h(RemoveTaskTypeModal, { active: true, nbTasks: 3, taskType })
    })
    await wrapper.get('input[type=checkbox]').setValue(true)
    const field = wrapper.findComponent(TextField)
    const input = field.get('input')

    await input.setValue('Mod')
    await input.trigger('keyup.enter')
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(field.get('p.error').text()).toBe('The name does not match.')
    const modal = wrapper.findComponent(RemoveTaskTypeModal)
    expect(modal.emitted('confirm')).toBeUndefined()

    await input.setValue('Mode')
    expect(input.attributes('aria-invalid')).toBe('false')
  })

  it('forgets a refused Enter once the deletion is unchecked', async () => {
    const wrapper = mountModal()
    const checkbox = wrapper.get('input[type=checkbox]')

    await checkbox.setValue(true)
    await wrapper.get('input.input').trigger('keyup.enter')
    expect(wrapper.get('input.input').attributes('aria-invalid')).toBe('true')

    await checkbox.setValue(false)
    await checkbox.setValue(true)
    expect(wrapper.get('input.input').attributes('aria-invalid')).toBe('false')
  })

  // The modal stays open while the tasks are deleted: Enter must not send
  // the removal a second time.
  it('confirms once while the removal runs', async () => {
    const wrapper = mountModal()
    await wrapper.get('input[type=checkbox]').setValue(true)
    await wrapper.get('input.input').setValue('Modeling')
    await wrapper.get('input.input').trigger('keyup.enter')
    await wrapper.setProps({ isLoading: true })

    await wrapper.get('input.input').trigger('keyup.enter')

    expect(wrapper.emitted('confirm')).toEqual([[true]])
  })
})
