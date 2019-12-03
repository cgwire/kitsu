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

    it('should have a valid link', () => {
      wrapper.setProps({ previewPath: '/path/to/' })
      expect(link.attributes('href')).toEqual('#/path/to/')
    })

    it('should have a selected class', () => {
      wrapper.setProps({ selected: true })
      expect(wrapper.classes('selected')).toBe(true)
    })
  })
})
