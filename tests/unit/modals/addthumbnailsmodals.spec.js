import { shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'
import { createMemoryHistory, createRouter } from 'vue-router'

import i18n from '@/lib/i18n'
import auth from '@/lib/auth'

import AddThumbnailsModal from '@/components/modals/AddThumbnailsModal.vue'
import FileUpload from '@/components/widgets/FileUpload.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: []
})

describe('AddThumbnailsModal', () => {
  let store, shotStore
  let wrapper

  beforeEach(() => {
    shotStore = {
      state() {
        return {}
      },
      getters: {
        isAssets: () => true,
        assetValidationColumns: () => [],
        shotValidationColumns: () => [],
      },
      actions: {
      }
    }
    store = createStore({
      strict: true,
      modules: {
        shots: shotStore
      }
    })

    wrapper = shallowMount(AddThumbnailsModal, {
      store,
      i18n,
      router,
      auth,
      global: {
        mocks: {
          $store: store,
        },
        stubs: {
          'file-upload': FileUpload
        }
      },
      props: {
        entityType: 'Asset',
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
