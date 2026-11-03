import { shallowMount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import BackgroundSettings from '@/components/pages/production/BackgroundSettings.vue'

describe('BackgroundSettings', () => {
  // The settings block no longer scrolls, so that it does not cut the
  // combobox lists: a table wider than the block scrolls on its own.
  it('puts the table in a scroll wrapper', () => {
    const background = { id: 'background-1', name: 'Studio grey' }
    const wrapper = shallowMount(BackgroundSettings, {
      props: { backgrounds: [background], allBackgrounds: [background] }
    })

    expect(wrapper.find('.datatable-wrapper > table.datatable').exists()).toBe(
      true
    )
  })
})
