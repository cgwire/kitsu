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

describe('ProductionParameters: preview options', () => {
  it('leaves the preview options to the Video tab', () => {
    const wrapper = mountWithProduction({
      ...baseProduction,
      is_frame_in_numbering: true
    })
    expect(wrapper.vm.form.is_frame_in_numbering).toBeUndefined()
    expect(wrapper.vm.form.revision_padding).toBeUndefined()
  })
})

describe('ProductionParameters — client isolation', () => {
  it('has no is_clients_isolated field', () => {
    const wrapper = mountWithProduction({
      ...baseProduction,
      is_clients_isolated: true
    })
    expect(wrapper.vm.form.is_clients_isolated).toBeUndefined()
  })
})
