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
      isShowInfos: true
    }

    mutations = {
      toggleState (state) {
        state.isShowInfos = !state.isShowInfos
      }
    }

    actions = {
      showInfos: jest.fn(),
      hideInfos: jest.fn()
    }

    getters = {
      isShowInfos: state => state.isShowInfos
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
      expect(wrapper.element.getAttribute('title')).toMatch('Hide additional information')
    })

    it('should trigger a function on click', () => {
      const button = wrapper.find('button')
      button.trigger('click')
      expect(actions.hideInfos).toHaveBeenCalled()
    })

    it('should be Off', () => {
      store.commit('toggleState')
      expect(wrapper.element.getAttribute('title')).toMatch('Show additional information')
    })
  })
})
