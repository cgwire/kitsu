import Vue from 'Vue'
import { shallowMount } from '@vue/test-utils'
import ColorPicker from '../../../src/components/widgets/ColorPicker'

describe('ColorPicker', () => {
  const wrapper = shallowMount(ColorPicker, {
    propsData: {
      isActive: true,
      isOpen: false,
      color: '#000',
      palette: ['#FFF', '#F00', '#CCC']
    }
  })

  const picker = wrapper.findAll('.color-picker')
  const palette = wrapper.findAll('.color-palette')
  const labels = wrapper.findAll('.color-palette label')

  describe('Mount', () => {
    it('should be default', () => {
      expect(picker.at(0).element.style.color).toMatch('rgb(0, 0, 0)')
      expect(palette.isVisible()).toBe(false)
    })

    it('should open the palette', done => {
      wrapper.find('button').trigger('click')
      Vue.nextTick(() => {
        expect(palette.isVisible()).toBe(true)
        expect(labels.at(0).element.style.color).toMatch('rgb(255, 255, 255)')
        expect(labels.at(1).element.style.color).toMatch('rgb(255, 0, 0)')
        expect(labels.at(2).element.style.color).toMatch('rgb(204, 204, 204)')
        done()
      })
    })
  })
})
