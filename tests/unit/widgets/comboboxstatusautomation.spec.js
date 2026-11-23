import { shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'

import ComboboxStatusAutomation from '@/components/widgets/ComboboxStatusAutomation.vue'

const automation = { id: 'automation-1' }

const mountCombobox = (props = {}) =>
  shallowMount(ComboboxStatusAutomation, {
    props: { statusAutomationsList: [automation], ...props },
    global: {
      plugins: [
        createStore({
          getters: {
            statusAutomationMap: () => new Map([[automation.id, automation]])
          }
        })
      ]
    }
  })

describe('ComboboxStatusAutomation', () => {
  it('names the combobox by its label', () => {
    const labeled = mountCombobox({ label: 'Automation' })
    const unlabeled = mountCombobox()

    const labelId = labeled.find('label').attributes('id')
    expect(labelId).toBeTruthy()
    expect(
      labeled.find('[role="combobox"]').attributes('aria-labelledby')
    ).toBe(labelId)
    expect(
      unlabeled.find('[role="combobox"]').attributes('aria-labelledby')
    ).toBeUndefined()
    labeled.unmount()
    unlabeled.unmount()
  })

  // The production settings show no label next to the picker.
  it('names the combobox without a label', () => {
    const named = mountCombobox({ ariaLabel: 'Automations' })
    const unnamed = mountCombobox()

    expect(named.find('[role="combobox"]').attributes('aria-label')).toBe(
      'Automations'
    )
    expect(
      unnamed.find('[role="combobox"]').attributes('aria-label')
    ).toBeUndefined()
    named.unmount()
    unnamed.unmount()
  })
})
