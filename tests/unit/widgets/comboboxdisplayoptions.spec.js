import { shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'

import i18n from '@/lib/i18n'
import ComboboxDisplayOptions from '@/components/widgets/ComboboxDisplayOptions.vue'

const optionValues = (type, isClient) => {
  const store = createStore({ getters: { isCurrentUserClient: () => isClient } })
  const wrapper = shallowMount(ComboboxDisplayOptions, {
    global: { plugins: [i18n, store] },
    props: { type }
  })
  return wrapper
    .findComponent({ name: 'ComboboxOptions' })
    .props('options')
    .map(option => option.value)
}

describe('ComboboxDisplayOptions', () => {
  test('offers the task type names and the library to the studio', () => {
    const values = optionValues('asset', false)
    expect(values).toContain('showAssignations')
    expect(values).toContain('fullTaskTypeNames')
    expect(values).toContain('showSharedAssets')
  })

  test('keeps the assignations, the task type names and the library from a client', () => {
    const values = optionValues('asset', true)
    expect(values).not.toContain('showAssignations')
    expect(values).not.toContain('fullTaskTypeNames')
    expect(values).not.toContain('showSharedAssets')
    expect(values).toContain('showInfos')
  })
})
