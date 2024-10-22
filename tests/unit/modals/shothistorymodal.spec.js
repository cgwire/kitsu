import { nextTick } from 'vue'
import { shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'

import i18n from '@/lib/i18n'

import ShotHistoryModal from '@/components/modals/ShotHistoryModal.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'

import peopleStoreFixture from '../fixtures/person-store'

describe('ShotHistoryModal', () => {
  let store, shotStore
  let wrapper
  let getters

  beforeEach(() => {
    shotStore = {
      getters: {
      },
      actions: {
        loadShotHistory () {
          return Promise.resolve([
            {
              id: 'version-1',
              name: 'SH01',
              data: {
                frame_in: 12,
                frame_out: 22
              }
            },
            {
              id: 'version-2',
              name: 'SH01',
              data: {
                frame_in: 14,
                frame_out: 24
              }
            }
          ])
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

    wrapper = shallowMount(ShotHistoryModal, {
      store,
      getters,
      i18n,
      global: {
        mocks: {
          $store: store
        }
      },
      props: {
        active: true,
        shot: { id: 'shot-01' }
      }
    })
  })

  describe('Mount', () => {
    it('empty', () => {
      const modal = wrapper.findComponent(ShotHistoryModal)
      const tableInfo = wrapper.findComponent(TableInfo)
      expect(tableInfo.props().isLoading).toBe(false)
      expect(modal.findAll('.shot-version')).toHaveLength(0)
    })
    it('spinner on loading', () => new Promise(done => {
      wrapper.setData({ isLoading: true })
      nextTick(() => {
        const modal = wrapper.findComponent(ShotHistoryModal)
        const tableInfo = wrapper.findComponent(TableInfo)
        expect(tableInfo.props().isLoading).toBe(true)
        expect(modal.findAll('.shot-version')).toHaveLength(0)
        done()
      })
    }))
    it('data loaded', async () => {
      await wrapper.vm.loadData()
      const modal = wrapper.findComponent(ShotHistoryModal)
      const tableInfo = wrapper.findComponent(TableInfo)
      expect(tableInfo.props().isLoading).toBe(false)
      expect(modal.findAll('.shot-version')).toHaveLength(2)
    })
  })
})
