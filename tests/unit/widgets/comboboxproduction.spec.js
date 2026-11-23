import ComboboxProduction from '@/components/widgets/ComboboxProduction.vue'

import { shallowMountWithI18n } from '../fixtures/i18n'

const productionList = [
  { id: 'production-1', name: 'Alpha' },
  { id: 'production-2', name: 'Beta' }
]

const mountCombobox = (props = {}) =>
  shallowMountWithI18n(ComboboxProduction, {
    props: { productionList, modelValue: 'production-1', ...props }
  })

describe('ComboboxProduction', () => {
  it('names the combobox by its label', () => {
    const labeled = mountCombobox({ label: 'Production' })
    const unlabeled = mountCombobox()

    const labelId = labeled.find('label').attributes('id')
    expect(labelId).toBeTruthy()
    expect(
      labeled.find('[role="combobox"]').attributes('aria-labelledby')
    ).toBe(labelId)
    expect(
      unlabeled.find('[role="combobox"]').attributes('aria-labelledby')
    ).toBeUndefined()
  })
})
