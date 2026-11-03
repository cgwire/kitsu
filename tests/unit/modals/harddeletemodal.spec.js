import { describe, expect, it } from 'vitest'

import { mountWithI18n } from '../fixtures/i18n'

import HardDeleteModal from '@/components/modals/HardDeleteModal.vue'

const mountModal = (props = {}) =>
  mountWithI18n(HardDeleteModal, {
    props: {
      active: true,
      lockText: 'Old show',
      text: 'Delete Old show?',
      ...props
    }
  })

const getConfirmButton = wrapper => wrapper.get('a.button.is-danger')

describe('HardDeleteModal', () => {
  // The disabled look only stops the mouse: Tab then Enter on the button
  // deleted a production whose name was never typed.
  it('does not confirm while the name is not typed', async () => {
    const wrapper = mountModal()
    const button = getConfirmButton(wrapper)

    await button.trigger('keydown.enter')
    await button.trigger('keydown.space')
    await button.trigger('click')

    expect(wrapper.emitted('confirm')).toBeUndefined()
  })

  it('keeps the locked button out of the tab order', async () => {
    const wrapper = mountModal()

    expect(getConfirmButton(wrapper).attributes('tabindex')).toBe('-1')
    expect(getConfirmButton(wrapper).attributes('aria-disabled')).toBe('true')

    await wrapper.get('input.input').setValue('Old show')

    expect(getConfirmButton(wrapper).attributes('tabindex')).toBe('0')
    expect(getConfirmButton(wrapper).attributes('aria-disabled')).toBe('false')
  })

  it('confirms once the name is typed', async () => {
    const wrapper = mountModal()

    await wrapper.get('input.input').setValue('Old show')
    await getConfirmButton(wrapper).trigger('keydown.enter')

    expect(wrapper.emitted('confirm')).toEqual([[true]])
  })

  it('does not confirm twice while the deletion runs', async () => {
    const wrapper = mountModal()
    await wrapper.get('input.input').setValue('Old show')
    await wrapper.setProps({ isLoading: true })

    await getConfirmButton(wrapper).trigger('keydown.enter')

    expect(wrapper.emitted('confirm')).toBeUndefined()
  })
})
