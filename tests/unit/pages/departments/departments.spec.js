import Vue from 'vue'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import vuescroll from 'vue-scroll'
import Vuex from 'vuex'
import i18n from '@/lib/i18n'
import departmentsStoreModule from '@/store/modules/departments'
import Departments from '@/components/pages/departments/Departments'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(vuescroll)

function initialiseStore (actions) {
  return new Vuex.Store({
    strict: true,
    modules: {
      departments: {
        state: departmentsStoreModule.state,
        getters: departmentsStoreModule.getters,
        actions: {
          loadDepartments () {
            return new Promise((resolve) => {
              resolve()
            })
          },
          ...actions
        },
        mutations: departmentsStoreModule.mutations
      }
    }
  })
}

function initialiseWrapper (store, localVue, i18n) {
  return shallowMount(Departments, {
    store,
    localVue,
    i18n
  })
}

describe('Departements', () => {
  beforeEach(() => {
  })

  describe('Mounted', () => {
    test('mount Departements page', async () => {
      const loadFunction = jest.fn()
      const store = initialiseStore(
        {
          loadDepartments ({ state }) {
            loadFunction()
            return state
          }
        }
      )
      initialiseWrapper(store, localVue, i18n)
      expect(loadFunction).toHaveBeenCalled()
    })
  })

  describe('Methods', () => {
    test('onNewClicked', async () => {
      const store = initialiseStore()
      const wrapper = initialiseWrapper(store, localVue, i18n)
      expect(wrapper.vm.departmentToEdit).toBe(null)
      expect(wrapper.vm.modals.edit).toBe(false)
      wrapper.vm.onNewClicked()
      expect(wrapper.vm.departmentToEdit).toStrictEqual({ name: '', color: '#999999' })
      expect(wrapper.vm.modals.edit).toBe(true)
    })

    test('onEditClicked', async () => {
      const store = initialiseStore()
      const wrapper = initialiseWrapper(store, localVue, i18n)
      const departmentToEdit = {
        id: 'ID',
        name: 'NAME',
        color: '#ffffff'
      }
      expect(wrapper.vm.departmentToEdit).toBe(null)
      expect(wrapper.vm.modals.edit).toBe(false)
      wrapper.vm.onEditClicked(departmentToEdit)
      expect(wrapper.vm.departmentToEdit).toStrictEqual(departmentToEdit)
      expect(wrapper.vm.modals.edit).toBe(true)
    })

    test('onDeleteClicked', async () => {
      const store = initialiseStore()
      const wrapper = initialiseWrapper(store, localVue, i18n)
      const departmentToDelete = {
        id: 'ID',
        name: 'NAME',
        color: '#ffffff'
      }
      expect(wrapper.vm.departmentToDelete).toBe(null)
      expect(wrapper.vm.modals.del).toBe(false)
      wrapper.vm.onDeleteClicked(departmentToDelete)
      expect(wrapper.vm.departmentToDelete).toStrictEqual(departmentToDelete)
      expect(wrapper.vm.modals.del).toBe(true)
    })

    test('confirmDeleteDepartment', async () => {
      const deleteFunction = jest.fn()
      const store = initialiseStore(
        {
          deleteDepartment () {
            deleteFunction()
          }
        }
      )
      const wrapper = initialiseWrapper(store, localVue, i18n)
      const departmentToDelete = {
        id: 'ID',
        name: 'NAME',
        color: '#ffffff'
      }
      wrapper.vm.onDeleteClicked(departmentToDelete)
      await wrapper.vm.confirmDeleteDepartment()
      expect(deleteFunction).toHaveBeenCalled()
      // await Vue.nextTick()
      expect(wrapper.vm.modals.del).toBe(false)
      expect(wrapper.vm.loading.del).toBe(false)
      expect(wrapper.vm.errors.del).toBe(false)
    })

    test('[ERROR] confirmDeleteDepartment', async () => {
      // const deleteFunction = jest.fn()
      const store = initialiseStore(
        {
          deleteDepartment () {
            return Promise.reject(new Error('some error'))
          }
        }
      )
      const wrapper = initialiseWrapper(store, localVue, i18n)
      const departmentToDelete = {
        id: 'ID',
        name: 'NAME',
        color: '#ffffff'
      }
      wrapper.vm.onDeleteClicked(departmentToDelete)
      await wrapper.vm.confirmDeleteDepartment()
      expect(wrapper.vm.modals.del).toBe(true)
      expect(wrapper.vm.errors.del).toBe(true)
      expect(wrapper.vm.loading.del).toBe(false)
    })

    test('[NEW] confirmEditDepartment', async () => {
      const newFunction = jest.fn()
      const store = initialiseStore(
        {
          newDepartement ({ state }) {
            newFunction()
            return state
          }
        }
      )
      const wrapper = initialiseWrapper(store, localVue, i18n)
      const form = {
        id: null,
        name: 'NAME',
        color: '#ffffff'
      }
      expect(wrapper.vm.departmentToEdit).toBe(null)
      expect(wrapper.vm.modals.edit).toBe(false)
      await wrapper.vm.onEditClicked(form)
      await wrapper.vm.confirmEditDepartment(form)
      expect(newFunction).toHaveBeenCalled()

      expect(wrapper.vm.loading.edit).toBe(true)
      expect(wrapper.vm.modals.edit).toBe(true)
      await Vue.nextTick()
      expect(wrapper.vm.loading.edit).toBe(false)
      expect(wrapper.vm.modals.edit).toBe(false)
      expect(wrapper.vm.errors.edit).toBe(false)
    })

    test('[EDIT] confirmEditDepartment', async () => {
      const editFunction = jest.fn()
      const store = initialiseStore(
        {
          editDepartement () {
            editFunction()
          }
        }
      )
      const wrapper = initialiseWrapper(store, localVue, i18n)
      const form = {
        id: 'ID',
        name: 'NAME',
        color: '#ffffff'
      }
      expect(wrapper.vm.departmentToEdit).toBe(null)
      expect(wrapper.vm.modals.edit).toBe(false)
      await wrapper.vm.onEditClicked(form)
      await wrapper.vm.confirmEditDepartment(form)
      expect(editFunction).toHaveBeenCalled()
      expect(wrapper.vm.loading.edit).toBe(true)
      expect(wrapper.vm.modals.edit).toBe(true)
      await Vue.nextTick()
      expect(wrapper.vm.loading.edit).toBe(false)
      expect(wrapper.vm.modals.edit).toBe(false)
      expect(wrapper.vm.errors.edit).toBe(false)
    })

    test('[ERROR] confirmEditDepartment', async () => {
      const store = initialiseStore(
        {
          newDepartement () {
            return Promise.reject(new Error('some error'))
          }
        }
      )
      const wrapper = initialiseWrapper(store, localVue, i18n)
      const form = {
        id: null,
        name: 'NAME',
        color: '#ffffff'
      }
      expect(wrapper.vm.departmentToEdit).toBe(null)
      expect(wrapper.vm.modals.edit).toBe(false)
      await wrapper.vm.onEditClicked(form)
      await wrapper.vm.confirmEditDepartment(form)
      expect(wrapper.vm.loading.edit).toBe(true)
      expect(wrapper.vm.modals.edit).toBe(true)
      await Vue.nextTick()
      expect(wrapper.vm.loading.edit).toBe(false)
      expect(wrapper.vm.modals.edit).toBe(true)
      expect(wrapper.vm.errors.edit).toBe(true)
    })
  })
})
