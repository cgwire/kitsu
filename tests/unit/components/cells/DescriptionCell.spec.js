import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'

import DescriptionCell from '@/components/cells/DescriptionCell.vue'

describe('DescriptionCell', () => {
  test('keeps the full description in compact cells', () => {
    const description = 'A description long enough to fill a resized column'
    const store = createStore({
      getters: {
        isDarkTheme: () => false
      }
    })
    const wrapper = mount(DescriptionCell, {
      global: { plugins: [store] },
      props: { entry: { description } }
    })

    expect(wrapper.find('.description-shorten-text').text()).toBe(description)
  })
})
