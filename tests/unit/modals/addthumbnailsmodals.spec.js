import { shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'
import { createMemoryHistory, createRouter } from 'vue-router'

// Load @/store first (via @/lib/auth) to avoid a circular-import race when
// AddThumbnailsModal transitively imports assets/shots store modules.
import '@/lib/auth'

import AddThumbnailsModal from '@/components/modals/AddThumbnailsModal.vue'

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
        shotValidationColumns: () => []
      },
      actions: {}
    }
    store = createStore({
      strict: true,
      modules: {
        shots: shotStore
      }
    })

    wrapper = shallowMount(AddThumbnailsModal, {
      global: {
        plugins: [store, router],
        stubs: {
          BaseModal: { template: '<div><slot /></div>' },
          FileUpload: {
            template: '<div></div>',
            methods: { reset() {} }
          }
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
