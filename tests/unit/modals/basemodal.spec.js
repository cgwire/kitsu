import { mount } from '@vue/test-utils'

import BaseModal from '@/components/modals/BaseModal.vue'

describe('BaseModal', () => {
  let wrapper = null

  // `trigger` cannot set the click count: `detail` is read-only on its event.
  const clickBackground = clickCount =>
    wrapper
      .find('.modal-background')
      .element.dispatchEvent(
        new MouseEvent('click', { bubbles: true, detail: clickCount })
      )

  beforeEach(() => {
    wrapper = mount(BaseModal, {
      attachTo: document.body,
      props: { active: true }
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  test('cancels on a click on its background', () => {
    clickBackground(1)

    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  // The button that opens a modal gets the first click of a double click, and
  // the background the second.
  test('stays open on the second click of a double click', () => {
    clickBackground(2)

    expect(wrapper.emitted('cancel')).toBeUndefined()
  })

  test('cancels on a click after a double click', () => {
    clickBackground(2)
    clickBackground(1)

    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })
})
