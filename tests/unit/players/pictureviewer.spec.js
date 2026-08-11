import { mount } from '@vue/test-utils'

import PictureViewer from '@/components/players/viewers/PictureViewer.vue'

describe('players/PictureViewer', () => {
  test('uses black by default and applies the selected background color', async () => {
    const wrapper = mount(PictureViewer)

    expect(wrapper.find('.picture-wrapper').element.style.backgroundColor).toBe(
      'rgb(0, 0, 0)'
    )

    await wrapper.setProps({ backgroundColor: '#FFFFFF' })

    expect(wrapper.find('.picture-wrapper').element.style.backgroundColor).toBe(
      'rgb(255, 255, 255)'
    )
  })
})
