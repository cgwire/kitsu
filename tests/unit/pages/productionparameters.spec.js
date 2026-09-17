import { shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'
import { describe, expect, it, vi } from 'vitest'

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: key => key }) }))

import ProductionParameters from '@/components/pages/production/ProductionParameters.vue'

const mountWithProduction = production => {
  const store = createStore({
    getters: {
      currentProduction: () => production,
      productionAvatarFormData: () => null,
      isTVShow: () => false
    }
  })
  store.dispatch = vi.fn()
  return shallowMount(ProductionParameters, {
    global: {
      plugins: [store],
      mocks: { $t: key => key },
      directives: { focus: () => {} },
      stubs: {
        // resetForm calls the upload widget's reset() through a template ref.
        FileUpload: { template: '<div />', methods: { reset() {} } }
      }
    }
  })
}

const baseProduction = {
  id: 'prod-1',
  name: 'Test',
  start_date: '2026-01-01',
  end_date: '2026-12-31'
}

describe('ProductionParameters — is_frame_in_numbering', () => {
  it('maps an explicit true to an enabled toggle', () => {
    const wrapper = mountWithProduction({
      ...baseProduction,
      is_frame_in_numbering: true
    })
    expect(wrapper.vm.form.is_frame_in_numbering).toBe('true')
  })

  // The option is an opt-in; old zou versions without the column stay off.
  it('defaults to disabled when the field is missing', () => {
    const wrapper = mountWithProduction(baseProduction)
    expect(wrapper.vm.form.is_frame_in_numbering).toBe('false')
  })
})
