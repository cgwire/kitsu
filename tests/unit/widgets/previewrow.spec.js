import Vue from 'vue'
import { mount, createLocalVue } from '@vue/test-utils'
import PreviewRow from '../../../src/components/widgets/PreviewRow'
import ButtonLink from '../../../src/components/widgets/ButtonLink'
import VueRouter from 'vue-router'

const localVue = createLocalVue()

localVue.use(VueRouter)

const router = new VueRouter()

describe('PreviewRow', () => {
  const wrapper = mount(PreviewRow, {
    propsData: {
      preview: {
        revision: 'foo'
      }
    },
    localVue,
    router
  })

  const link = wrapper.find(ButtonLink)

  describe('Mount', () => {
    it('should be default', () => {
      expect(wrapper.classes('selected')).toBe(false)
      expect(link.text()).toEqual('vfoo')
      expect(link.attributes('href')).toEqual('#/')
    })

    it('should have a valid link', done => {
      wrapper.setProps({ previewPath: '/path/to/' })
      Vue.nextTick(() => {
        expect(link.attributes('href')).toEqual('#/path/to/')
        done()
      })
    })

    it('should have a selected class', done => {
      wrapper.setProps({ selected: true })
      Vue.nextTick(() => {
        expect(wrapper.classes('selected')).toBe(true)
        done()
      })
    })
  })
})
