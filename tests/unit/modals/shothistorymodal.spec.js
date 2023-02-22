import Vue from 'vue'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import i18n from '../../../src/lib/i18n'
import ShotHistoryModal from '../../../src/components/modals/ShotHistoryModal'
import TableInfo from '../../../src/components/widgets/TableInfo'
import peopleStoreFixture from '../fixtures/person-store.js'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('ShotHistoryModal', () => {
  let store, shotStore
  let wrapper
  let getters

  beforeEach(() => {
    shotStore = {
      getters: {
      },
      actions: {
        loadShotHistory: () => Promise.resolve([
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
    store = new Vuex.Store({
      strict: true,
      modules: {
        shots: shotStore,
        people: { ...peopleStoreFixture }
      }
    })

    wrapper = shallowMount(ShotHistoryModal, {
      store,
      getters,
      localVue,
      i18n,
      propsData: {
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
      Vue.nextTick(() => {
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
