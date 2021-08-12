import Vue from 'vue'
import { mount, createLocalVue } from '@vue/test-utils'
import PreviewRow from '@/components/widgets/PreviewRow'
import ButtonLink from '@/components/widgets/ButtonLink'
import VueRouter from 'vue-router'
import { routes } from '@/router/routes'

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

    it('should have a valid link', done => {
      const route = {
        name: 'task-preview',
        params: {
          production_id: 'production-1',
          type: 'assets',
          task_id: 'task-1',
          preview_id: 'preview-1'
        }
      }
      wrapper.setProps({ previewPath: route })
      Vue.nextTick(() => {
        expect(link.attributes('href'))
          .toEqual('#/productions/production-1/assets/tasks/task-1/previews/preview-1')
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
