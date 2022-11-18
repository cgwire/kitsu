import auth from '@/lib/auth'
import i18n from '@/lib/i18n'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import ShotLine from '@/components/pages/breakdown/ShotLine'
import Vuex from 'vuex'

const localVue = createLocalVue()
localVue.use(Vuex)

localVue.prototype.$locale = {
  change (locale) {
    i18n.locale = locale
  },
  current () {
    return i18n.locale
  }
}

describe('ShotLine', () => {
  const store = new Vuex.Store({
    strict: true,
    modules: {
      mainStore: {
        getters: {
          isCurrentUserManager: (state) => true,
          isShowInfosBreakdown: (state) => false
        }
      }
    }
  })
  const wrapper = shallowMount(ShotLine, {
    propsData: {
      entity: {
        id: 'shot-1',
        is_casting_stand_by: false
      },
      selected: true,
      name: 'foobar',
      assets: []
    },
    localVue,
    i18n,
    auth,
    store
  })

  describe('Mount', () => {
    it('should be mounted', () => {
      const element = wrapper.findAll('.shot')
      expect(element).toHaveLength(1)
    })
    it('should be selected', () => {
      const element = wrapper.findAll('.shot.selected')
      expect(element).toHaveLength(1)
    })
    it('should display the name of the shot', () => {
      const name = wrapper.findAll('.shot-name')
      expect(name.at(0).text()).toBe('foobar')
    })
  })
})
