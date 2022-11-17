import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import VueRouter from 'vue-router'

import i18n from '@/lib/i18n'
import auth from '@/lib/auth'
import AddThumbnailsModal from '@/components/modals/AddThumbnailsModal'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VueRouter)
const router = new VueRouter()

describe('AddThumbnailsModal', () => {
  let store, shotStore
  let wrapper
  let getters

  beforeEach(() => {
    shotStore = {
      getters: {
        assetValidationColumns: () => [],
        shotValidationColumns: () => []
      },
      actions: {
      }
    }
    store = new Vuex.Store({
      strict: true,
      modules: {
        shots: shotStore
      }
    })

    wrapper = shallowMount(AddThumbnailsModal, {
      store,
      getters,
      localVue,
      i18n,
      router,
      auth,
      propsData: {
        parent: 'assets'
      }
    })
  })

  describe('Mount', () => {
    it('empty', () => {
      wrapper.findComponent(AddThumbnailsModal)
    })
  })
})
