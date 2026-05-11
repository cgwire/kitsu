import { flushPromises, shallowMount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createStore } from 'vuex'

import ShotHistoryModal from '@/components/modals/ShotHistoryModal.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'

import peopleStoreFixture from '../fixtures/person-store'

describe('ShotHistoryModal', () => {
  let store, shotStore
  let resolveLoad

  const versionsFixture = [
    {
      id: 'version-1',
      name: 'SH01',
      data: { frame_in: 12, frame_out: 22 }
    },
    {
      id: 'version-2',
      name: 'SH01',
      data: { frame_in: 14, frame_out: 24 }
    }
  ]

  const mountModal = (props = {}) =>
    shallowMount(ShotHistoryModal, {
      global: {
        plugins: [store],
        stubs: {
          BaseModal: { template: '<div><slot /></div>' }
        }
      },
      props: { active: false, shot: { id: 'shot-01' }, ...props }
    })

  beforeEach(() => {
    shotStore = {
      getters: {},
      actions: {
        loadShotHistory() {
          return new Promise(resolve => {
            resolveLoad = resolve
          })
        }
      }
    }
    store = createStore({
      strict: true,
      modules: {
        shots: shotStore,
        people: { ...peopleStoreFixture }
      }
    })
  })

  describe('Mount', () => {
    it('empty', () => {
      const wrapper = mountModal({ active: false })
      const tableInfo = wrapper.findComponent(TableInfo)
      expect(tableInfo.props().isLoading).toBe(false)
      expect(wrapper.findAll('.shot-version')).toHaveLength(0)
    })

    it('spinner on loading', async () => {
      const wrapper = mountModal({ active: false })
      await wrapper.setProps({ active: true })
      await nextTick()
      const tableInfo = wrapper.findComponent(TableInfo)
      expect(tableInfo.props().isLoading).toBe(true)
      expect(wrapper.findAll('.shot-version')).toHaveLength(0)
    })

    it('data loaded', async () => {
      const wrapper = mountModal({ active: false })
      await wrapper.setProps({ active: true })
      resolveLoad(versionsFixture)
      await flushPromises()
      const tableInfo = wrapper.findComponent(TableInfo)
      expect(tableInfo.props().isLoading).toBe(false)
      expect(wrapper.findAll('.shot-version')).toHaveLength(2)
    })
  })
})
