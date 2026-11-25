import { createStore } from 'vuex'

import ComboboxStudio from '@/components/widgets/ComboboxStudio.vue'

import { shallowMountWithI18n } from '../fixtures/i18n'

const studios = [{ id: 'studio-1', name: 'North', color: '#111' }]

const mountCombobox = (props = {}) => {
  const store = createStore({
    strict: true,
    getters: {
      studios: () => studios,
      studioMap: () => new Map(studios.map(studio => [studio.id, studio]))
    }
  })
  return shallowMountWithI18n(ComboboxStudio, {
    props: { modelValue: 'studio-1', ...props },
    global: { plugins: [store] }
  })
}

describe('ComboboxStudio', () => {
  it('names the combobox by its label', () => {
    const labeled = mountCombobox({ label: 'Studio' })
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
