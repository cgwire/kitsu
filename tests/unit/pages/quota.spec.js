import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import i18n from '../../../src/lib/i18n'
import Quota from '../../../src/components/pages/quota/Quota'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VueRouter)
const router = new VueRouter()

describe('Quota', () => {
  let store, shotStore, peopleStore
  let wrapper

  beforeEach(() => {
    shotStore = {
      getters: {
        currentEpisode: () => ({}),
        isShotsLoading: () => false,
        shotMap: () => ({
          '24ec56f9-0c00-43e5-9233-3dec2ee06a98': {},
          '32c5b3a2-eaa7-49b6-8f86-03f2b1c4b7bd': {}
        })
      },
      actions: {
        loadShots: jest.fn(),
        computeQuota: () => ({
          'cd5f95f0-8293-4cf2-8220-6928b594ede7': {
            '2020-02-03': 70,
            average: {
              '2020-02': 50
            },
            count: {
              '2020-02': 1
            },
            total: {
              '2020-02': 70
            }
          }
        })
      }
    }
    peopleStore = {
      getters: {
        personMap: () => ({
          'cd5f95f0-8293-4cf2-8220-6928b594ede7': {
            full_name: 'Alicia Cooper'
          }
        })
      },
      actions: {
      }
    }
    store = new Vuex.Store({
      strict: true,
      modules: {
        shots: shotStore,
        people: peopleStore
      }
    })

    wrapper = shallowMount(Quota, {
      store,
      localVue,
      router,
      i18n,
      propsData: {
        detailLevel: 'day',
        countMode: 'frames',
        taskTypeId: '9a3a5d14-a9ff-4cd8-a14f-487724d0c184',
        year: 2020,
        month: 2,
        week: 32,
        day: 3
      }
    })
  })

  describe('Mount', () => {
    test('mounted', () => {
    })
  })

  describe('Quota displayed', () => {
    test.skip('The 3rd column of the table should have a quota displayed', () => {
      const dayCell = wrapper.findAll(
        '.quota-scrolled .quota-row:not(.quota-header) .row-cell'
      )
      expect(dayCell.text()).toMatch('70')
    })
  })
})
