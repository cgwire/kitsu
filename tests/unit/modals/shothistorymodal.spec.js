import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import i18n from '../../../src/lib/i18n'
import ShotHistoryModal from '../../../src/components/modals/ShotHistoryModal'
import TableInfo from '../../../src/components/widgets/TableInfo'

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
        shots: shotStore
      }
    })

    getters = {
      castingSequenceOptions: []
    }

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
      const modal = wrapper.find(ShotHistoryModal)
      const tableInfo = wrapper.find(TableInfo)
      expect(tableInfo.props().isLoading).toBe(false)
      expect(modal.findAll('.shot-version').length).toBe(0)
    })
    it('spinner on loading', () => {
      wrapper.setData({ isLoading: true })
      const modal = wrapper.find(ShotHistoryModal)
      const tableInfo = wrapper.find(TableInfo)
      expect(tableInfo.props().isLoading).toBe(true)
      expect(modal.findAll('.shot-version').length).toBe(0)
    })
    it('data loaded', async () => {
      await wrapper.vm.loadData()
      const modal = wrapper.find(ShotHistoryModal)
      const tableInfo = wrapper.find(TableInfo)
      expect(tableInfo.props().isLoading).toBe(false)
      expect(modal.findAll('.shot-version').length).toBe(2)
    })
  })
})
