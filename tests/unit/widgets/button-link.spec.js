import { mount, createLocalVue } from '@vue/test-utils'
import VueRouter from 'vue-router'
import router from '../../../src/testrouter'
import ButtonLink from '../../../src/components/widgets/ButtonLink'

const localVue = createLocalVue()
localVue.use(VueRouter)

describe('ButtonLink', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(ButtonLink, {
      propsData: {
        icon: 'download',
        text: 'My Button',
        title: 'My Button title',
        path: { name: 'open-productions' }
      },
      router,
      localVue
    })
  })

  describe('Mount', () => {
    test('Empty props', () => {
      const emptyWrapper = mount(ButtonLink, {
        propsData: {},
        router,
        localVue
      })
      const buttons = emptyWrapper.findAll('.button')
      expect(buttons).toHaveLength(1)
    })

    test('Ensure button', () => {
      const buttons = wrapper.findAll('button')
    })
  })
})
