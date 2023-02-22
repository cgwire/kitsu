import Vue from 'vue'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import i18n from '../../../src/lib/i18n'
import ShowInfosButton from '../../../src/components/widgets/ShowInfosButton'

const localVue = createLocalVue()

localVue.use(Vuex)

describe('ShowInfosButton', () => {
  let actions
  let state
  let store
  let mutations
  let getters
  let wrapper

  beforeEach(() => {
    state = {
      isShowInfos: true,
      isShowInfosBreakdown: true
    }

    mutations = {
      toggleState (state) {
        state.isShowInfos = !state.isShowInfos
      }
    }

    actions = {
      showInfos: vi.fn(),
      hideInfos: vi.fn()
    }

    getters = {
      isShowInfos: state => state.isShowInfos,
      isShowInfosBreakdown: state => state.isShowInfosBreakdown
    }

    store = new Vuex.Store({
      strict: true,
      modules: {
        tasks: {
          actions,
          state,
          mutations,
          getters
        }
      }
    })

    wrapper = shallowMount(ShowInfosButton, {
      localVue,
      store,
      i18n
    })
  })

  describe('Mount', () => {
    it('should be On', () => {
      expect(wrapper.element.getAttribute('title')).toMatch('tasks.hide_infos')
    })

    it('should trigger a function on click', done => {
      const button = wrapper.find('button')
      button.trigger('click')
      Vue.nextTick(() => {
        expect(actions.hideInfos).toHaveBeenCalled()
        done()
      })
    })

    it('should be Off', done => {
      store.commit('toggleState')
      Vue.nextTick(() => {
        expect(wrapper.element.getAttribute('title')).toMatch('Show additional information')
        done()
      })
    })
  })
})
