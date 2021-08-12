import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import i18n from '@/lib/i18n'
import AddComment from '@/components/widgets/AddComment'


const localVue = createLocalVue()
localVue.use(Vuex)

describe('AddComment', () => {
  let wrappers, getters
  let store, mainStore

  beforeEach(() => {

    mainStore = {
      state: {},
      getters: {
        isDarkTheme: () => false
      },
      actions: {
      }
    }

    getters = {
      isDarkTheme: () => false
    }

    store = new Vuex.Store({
      strict: true,
      modules: {
        main: mainStore
      }
    })

    wrapper = shallowMount(AddComment, {
      propsData: {
        addComment: () => {},
        isLoading: false,
        isError: false,
        light: false,
        task: {},
        taskStatus: [{
          short_name: 'TODO'
        }],
        user: {},
        attachedFileName: '',
        team: []
      },
      store,
      getters,
      i18n
    })
  })

  describe('Mount', () => {
    test.skip('Empty props', () => {
    })

    test.skip('Ensure widget', () => {
    })
  })

  describe('Methods', () => {
    test.skip('iconClass', () => {
    })
  })
})
