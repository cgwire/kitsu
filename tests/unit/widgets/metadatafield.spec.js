import { shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'

import MetadataField from '@/components/widgets/MetadataField.vue'

// "[x] " ticks an option by default.
const descriptor = {
  id: 'descriptor-1',
  name: 'Steps',
  entity_type: 'Asset',
  field_name: 'steps',
  data_type: 'checklist',
  choices: ['[ ] Layout', '[ ] Lighting', '[x] Render'],
  departments: []
}

const stored = '{"Layout":true,"Lighting":false,"Render":false}'

const store = createStore({ getters: { isCurrentUserAdmin: () => true } })

const mountField = props =>
  shallowMount(MetadataField, {
    props: { descriptor, entity: {}, ...props },
    global: { plugins: [store] }
  })

// An edit modal copies the stored data into its form.
const mountEditField = () =>
  mountField({
    entity: { id: 'asset-1', data: { steps: stored } },
    modelValue: stored
  })

const findBoxes = wrapper => wrapper.findAll('input[type="checkbox"]')

const getTicks = wrapper => findBoxes(wrapper).map(box => box.element.checked)

const getLastValue = wrapper =>
  JSON.parse(wrapper.emitted('update:model-value').at(-1)[0])

// Clicks a box, then hands the emitted value back like the v-model of the
// modal form.
const toggle = async (wrapper, index) => {
  const box = findBoxes(wrapper)[index]
  await box.setValue(!box.element.checked)
  await wrapper.setProps({
    modelValue: wrapper.emitted('update:model-value').at(-1)[0]
  })
}

describe('MetadataField', () => {
  describe('checklist', () => {
    it('keeps every toggle made before the save', async () => {
      const wrapper = mountEditField()

      await toggle(wrapper, 0)
      await toggle(wrapper, 1)

      expect(getLastValue(wrapper)).toEqual({
        Layout: false,
        Lighting: true,
        Render: false
      })
    })

    it('starts a new entity from the default options', async () => {
      const wrapper = mountField()
      expect(getTicks(wrapper)).toEqual([false, false, true])

      await toggle(wrapper, 2)
      await toggle(wrapper, 0)

      expect(getLastValue(wrapper)).toEqual({
        Layout: true,
        Lighting: false,
        Render: false
      })
    })

    it('shows the form value over the stored one', () => {
      const wrapper = mountField({
        entity: { id: 'asset-1', data: { steps: stored } },
        modelValue: '{"Layout":false,"Lighting":true,"Render":false}'
      })

      expect(getTicks(wrapper)).toEqual([false, true, false])
    })

    it('shows the stored value while the form has none', () => {
      const wrapper = mountField({
        entity: { id: 'asset-1', data: { steps: stored } }
      })

      expect(getTicks(wrapper)).toEqual([true, false, false])
    })

    // The modal stays mounted once closed: a cancel resets its form to the
    // stored value.
    it('drops the ticks of a canceled edit', async () => {
      const wrapper = mountEditField()
      await toggle(wrapper, 1)

      await wrapper.setProps({ modelValue: stored })

      expect(getTicks(wrapper)).toEqual([true, false, false])
    })

    // Confirm and stay empties the form for the next asset.
    it('drops the ticks of an emptied form', async () => {
      const wrapper = mountField()
      await toggle(wrapper, 0)

      await wrapper.setProps({ entity: { name: '' }, modelValue: undefined })

      expect(getTicks(wrapper)).toEqual([false, false, true])
    })
  })
})
