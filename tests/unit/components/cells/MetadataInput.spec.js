import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createStore } from 'vuex'

import MetadataInput from '@/components/cells/MetadataInput.vue'

import { useNumberField } from '../../fixtures/number-input'

const descriptor = {
  id: 'descriptor-1',
  field_name: 'drawings',
  data_type: 'number',
  departments: []
}

describe('cells/MetadataInput', () => {
  describe('number', () => {
    // A list saving each key, the way the entity pages do: the new value
    // comes back to the cell at once.
    const mountCell = () => {
      const store = createStore({
        getters: {
          currentProduction: () => ({ id: 'production-1', team: [] }),
          isCurrentUserAdmin: () => true,
          isCurrentUserManager: () => true,
          isCurrentUserSupervisor: () => false,
          personMap: () => new Map(),
          selectedAssets: () => new Map(),
          selectedEdits: () => new Map(),
          selectedShots: () => new Map(),
          selectedTasks: () => new Map(),
          taskTypeMap: () => new Map(),
          user: () => ({ departments: [] })
        }
      })
      const i18n = createI18n({ legacy: false, locale: 'en' })
      const wrapper = mount(MetadataInput, {
        attachTo: document.body,
        props: {
          descriptor,
          entity: { id: 'shot-1', data: {} },
          onMetadataChanged: ({ entry, value }) =>
            wrapper.setProps({
              entity: { ...entry, data: { [descriptor.field_name]: value } }
            })
        },
        global: { plugins: [store, i18n] }
      })
      return wrapper
    }

    const savedValues = wrapper =>
      wrapper.emitted('metadata-changed').map(([{ value }]) => value)

    // Written back from the number saved, "1.0" turned into "1": typing 1.05
    // key by key saved 15.
    test('keeps the zero typed after the decimal point', async () => {
      const wrapper = mountCell()
      const field = useNumberField(wrapper.find('input').element)

      expect(await field.type('1.05')).toEqual(['1', '1.', '1.0', '1.05'])
      expect(savedValues(wrapper)).toEqual([1, 1, 1.05])

      wrapper.unmount()
    })

    test('shows a value saved elsewhere', async () => {
      const wrapper = mountCell()
      const field = useNumberField(wrapper.find('input').element)
      await field.type('1.0')

      await wrapper.setProps({
        entity: { id: 'shot-1', data: { drawings: 3 } }
      })
      expect(field.text()).toBe('3')
      await wrapper.setProps({ entity: { id: 'shot-1', data: {} } })
      expect(field.text()).toBe('')

      wrapper.unmount()
    })
  })
})
