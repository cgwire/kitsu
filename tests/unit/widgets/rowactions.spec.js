import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import RowActions from '../../../src/components/widgets/RowActions'

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(VueRouter)

const router = new VueRouter()

describe('RowActions', () => {
  let state
  let store
  let getters
  let wrapper
  let buttonEdit
  let buttonRestore
  let buttonDelete
  let buttonDeleteAdmin

  beforeEach(() => {
    state = {
      isCurrentUserAdmin: true
    }

    getters = {
      isCurrentUserAdmin: state => state.isCurrentUserAdmin
    }

    store = new Vuex.Store({
      strict: true,
      modules: {
        tasks: {
          state,
          getters
        }
      }
    })

    wrapper = shallowMount(RowActions, {
      propsData: {
        entry: { canceled: false }
      },
      localVue,
      store,
      router
    })
  })

  describe('Mount', () => {
    it('should only display Edit & Delete Admin buttons', () => {
      buttonEdit = wrapper.findAll('[data-test="button-edit"]')
      buttonRestore = wrapper.findAll('[data-test="button-restore"]')
      buttonDelete = wrapper.findAll('[data-test="button-delete"]')
      buttonDeleteAdmin = wrapper.findAll('[data-test="button-delete-admin"]')
      expect(buttonEdit.exists()).toBe(true)
      expect(buttonRestore.exists()).toBe(false)
      expect(buttonDeleteAdmin.exists()).toBe(true)
      expect(buttonDelete.exists()).toBe(false)
    })

    it('should only display Restore & Delete buttons', () => {
      wrapper.setProps({ entry: { canceled: true } })
      buttonEdit = wrapper.findAll('[data-test="button-edit"]')
      buttonRestore = wrapper.findAll('[data-test="button-restore"]')
      buttonDelete = wrapper.findAll('[data-test="button-delete"]')
      buttonDeleteAdmin = wrapper.findAll('[data-test="button-delete-admin"]')
      expect(buttonEdit.exists()).toBe(false)
      expect(buttonRestore.exists()).toBe(true)
      expect(buttonDeleteAdmin.exists()).toBe(false)
      expect(buttonDelete.exists()).toBe(true)
    })

    it('should only display Delete Admin button', () => {
      wrapper.setProps({ hideEdit: true })
      buttonEdit = wrapper.findAll('[data-test="button-edit"]')
      buttonRestore = wrapper.findAll('[data-test="button-restore"]')
      buttonDelete = wrapper.findAll('[data-test="button-delete"]')
      buttonDeleteAdmin = wrapper.findAll('[data-test="button-delete-admin"]')
      expect(buttonEdit.exists()).toBe(false)
      expect(buttonRestore.exists()).toBe(false)
      expect(buttonDeleteAdmin.exists()).toBe(true)
      expect(buttonDelete.exists()).toBe(false)
    })

    it('should only display Edit button', () => {
      wrapper.setProps({ hideDelete: true })
      buttonEdit = wrapper.findAll('[data-test="button-edit"]')
      buttonRestore = wrapper.findAll('[data-test="button-restore"]')
      buttonDelete = wrapper.findAll('[data-test="button-delete"]')
      buttonDeleteAdmin = wrapper.findAll('[data-test="button-delete-admin"]')
      expect(buttonEdit.exists()).toBe(true)
      expect(buttonRestore.exists()).toBe(false)
      expect(buttonDeleteAdmin.exists()).toBe(false)
      expect(buttonDelete.exists()).toBe(false)
    })
  })
})
