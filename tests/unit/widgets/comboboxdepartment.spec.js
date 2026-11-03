import { createStore } from 'vuex'
import { describe, expect, it } from 'vitest'

import ComboboxDepartment from '@/components/widgets/ComboboxDepartment.vue'

import { shallowMountWithI18n } from '../fixtures/i18n'

const departments = [
  { id: 'dep-1', name: 'Animation', color: '#111' },
  { id: 'dep-2', name: 'Lighting', color: '#222' },
  { id: 'dep-3', name: 'Rigging', color: '#333' }
]

const mountCombobox = ({ props = {}, getters = {} } = {}) => {
  const store = createStore({
    strict: true,
    getters: {
      departmentMap: () => new Map(departments.map(d => [d.id, d])),
      departments: () => departments,
      isCurrentUserManager: () => false,
      isCurrentUserSupervisor: () => true,
      user: () => ({ id: 'user-1', departments: ['dep-1'] }),
      ...getters
    }
  })
  return shallowMountWithI18n(ComboboxDepartment, {
    props: { displayAllAndMyDepartments: true, ...props },
    global: { plugins: [store] }
  })
}

const listedIds = wrapper => wrapper.vm.departmentList.map(({ id }) => id)

describe('ComboboxDepartment', () => {
  describe('with displayAllAndMyDepartments', () => {
    it('lists my departments, all of them and every department', () => {
      const wrapper = mountCombobox()

      expect(listedIds(wrapper)).toEqual([
        'MY_DEPARTMENTS',
        'ALL',
        'dep-1',
        'dep-2',
        'dep-3'
      ])
      wrapper.unmount()
    })

    it('restricts a user to their departments with myDepartmentsOnly', () => {
      const wrapper = mountCombobox({ props: { myDepartmentsOnly: true } })

      expect(listedIds(wrapper)).toEqual(['MY_DEPARTMENTS', 'dep-1'])
      wrapper.unmount()
    })

    // The page decides the scope: a global manager supervising the selected
    // production is restricted like a supervisor.
    it('restricts a manager too when the page asks', () => {
      const wrapper = mountCombobox({
        props: { myDepartmentsOnly: true },
        getters: {
          isCurrentUserManager: () => true,
          isCurrentUserSupervisor: () => false
        }
      })

      expect(listedIds(wrapper)).toEqual(['MY_DEPARTMENTS', 'dep-1'])
      wrapper.unmount()
    })

    it('keeps every department for a supervisor attached to none', () => {
      const wrapper = mountCombobox({
        props: { myDepartmentsOnly: true },
        getters: { user: () => ({ id: 'user-1', departments: [] }) }
      })

      expect(listedIds(wrapper)).toEqual(['ALL', 'dep-1', 'dep-2', 'dep-3'])
      wrapper.unmount()
    })
  })
})
