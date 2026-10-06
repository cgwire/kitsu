import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'

import { isFreeEscape } from '@/lib/keyboard'

import DescriptionCell from '@/components/cells/DescriptionCell.vue'

describe('DescriptionCell', () => {
  const store = createStore({
    getters: {
      isDarkTheme: () => false
    }
  })

  test('keeps the full description in compact cells', () => {
    const description = 'A description long enough to fill a resized column'
    const wrapper = mount(DescriptionCell, {
      global: { plugins: [store] },
      props: { entry: { description } }
    })

    expect(wrapper.find('.description-shorten-text').text()).toBe(description)
  })

  // The tooltip closes on the keyup: on the keydown, the page must see it
  // open, or the action panel clears the task selection too.
  test('holds the Escape back from the page while its tooltip is open', async () => {
    const wrapper = mount(DescriptionCell, {
      attachTo: document.body,
      global: { plugins: [store] },
      props: { entry: { description: 'A long description' } }
    })
    const isFreeOnKeyDown = () => {
      let isFree = null
      const listener = event => {
        isFree = isFreeEscape(event)
      }
      window.addEventListener('keydown', listener)
      wrapper.trigger('keydown', { key: 'Escape', keyCode: 27 })
      window.removeEventListener('keydown', listener)
      return isFree
    }
    expect(isFreeOnKeyDown()).toBe(true)

    await wrapper.trigger('click')
    expect(document.querySelector('.tooltip')).not.toBeNull()
    expect(isFreeOnKeyDown()).toBe(false)

    await wrapper.trigger('keyup', { key: 'Escape', keyCode: 27 })
    expect(document.querySelector('.tooltip')).toBeNull()
    expect(isFreeOnKeyDown()).toBe(true)

    wrapper.unmount()
  })
})
