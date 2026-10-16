import { mount } from '@vue/test-utils'

import PlayerAnnotationBar from '@/components/players/bars/PlayerAnnotationBar.vue'

const mountBar = (props = {}) =>
  mount(PlayerAnnotationBar, {
    props: { isMovie: true, ...props },
    global: {
      mocks: { $t: key => key },
      stubs: {
        ButtonSimple: true,
        ColorPicker: true,
        OnionSkinPicker: true,
        PencilPicker: true,
        ShapePicker: true
      }
    }
  })

describe('players/PlayerAnnotationBar', () => {
  // Opt-in control: a consumer that does not bind it gets no picker.
  it('shows the onion skin picker to the consumer binding it', () => {
    expect(
      mountBar({ isOnionSkinOn: false }).find('onion-skin-picker-stub').exists()
    ).toBe(true)
  })

  it('keeps the onion skin picker from a consumer not binding it', () => {
    expect(mountBar().find('onion-skin-picker-stub').exists()).toBe(false)
  })
})
