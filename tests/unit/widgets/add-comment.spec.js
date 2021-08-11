import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import i18n from '@/lib/i18n'
import AddComment from '@/components/widgets/AddComment'


const localVue = createLocalVue()
localVue.use(Vuex)

describe('AddComment', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(AddComment, {
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
      i18n
    })
  })

  describe('Mount', () => {
    test('Empty props', () => {
    })

    test('Ensure widget', () => {
    })
  })

  describe('Methods', () => {
    test('iconClass', () => {
    })
  })
})
