import Vue from 'vue'
import { routes } from '@/router/routes'
import { mount, createLocalVue } from '@vue/test-utils'
import PreviewRow from '@/components/widgets/PreviewRow'
import ButtonLink from '@/components/widgets/ButtonLink'
import VueRouter from 'vue-router'

const localVue = createLocalVue()
localVue.use(VueRouter)
const router = new VueRouter({
  routes
})

describe('PreviewRow', () => {
  const wrapper = mount(PreviewRow, {
    propsData: {
      preview: {
        id: 'preview-2',
        revision: 'foo'
      }
    },
    localVue,
    router
  })

  const link = wrapper.findComponent(ButtonLink)

  describe('Mount', () => {
    it('should be default', () => {
      expect(wrapper.classes('selected')).toBe(false)
      expect(link.text()).toEqual('vfoo')
      expect(link.attributes('href')).toEqual('#/wrong-browser')
    })
  })
})
