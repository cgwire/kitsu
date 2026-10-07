import { flushPromises, shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'
import { describe, expect, it, vi } from 'vitest'

import MovieBitrateField from '@/components/pages/production/MovieBitrateField.vue'
import ProductionVideoSettings from '@/components/pages/production/ProductionVideoSettings.vue'

const mountSettings = async (production = {}) => {
  const store = createStore({
    getters: {
      currentProduction: () => ({
        id: 'production-1',
        fps: '25',
        ratio: '16:9',
        resolution: '1920x1080',
        hd_bitrate_compression: 28,
        ld_bitrate_compression: 6,
        ...production
      }),
      // An instance whose MOVIE_HIGHDEF_BITRATE is above the usual 28.
      movieBitrateDefaults: () => ({
        hd_bitrate_compression: 40,
        ld_bitrate_compression: 8
      })
    }
  })
  store.dispatch = vi.fn(() => Promise.resolve())
  const wrapper = shallowMount(ProductionVideoSettings, {
    global: { plugins: [store], mocks: { $t: key => key } }
  })
  // The form fills on mount.
  await flushPromises()
  return { store, wrapper }
}

const bitrateFields = wrapper => {
  const [hd, ld] = wrapper.findAllComponents(MovieBitrateField)
  return { hd, ld }
}

describe('ProductionVideoSettings', () => {
  it('says the settings only apply to the next uploads', async () => {
    const { wrapper } = await mountSettings()

    expect(wrapper.text()).toContain('productions.video.next_uploads_only')
    expect(wrapper.text()).toContain('productions.video.bitrate_explanation')
  })

  it('groups the bitrates under their own title and explanation', async () => {
    const { wrapper } = await mountSettings()
    const title = wrapper.find('h3.section-title')

    expect(title.text()).toBe('productions.video.bitrates')
    expect(title.element.nextElementSibling.textContent.trim()).toBe(
      'productions.video.bitrate_explanation'
    )
  })

  it('describes each bitrate and reminds the instance default', async () => {
    const { wrapper } = await mountSettings()
    const { hd, ld } = bitrateFields(wrapper)

    expect(hd.props()).toMatchObject({
      label: 'productions.fields.hd_bitrate_compression',
      description: 'productions.video.hd_bitrate_description',
      defaultValue: 40,
      isLowDefinition: false,
      max: 40,
      modelValue: 28
    })
    expect(ld.props()).toMatchObject({
      label: 'productions.fields.ld_bitrate_compression',
      ceiling: 40,
      description: 'productions.video.ld_bitrate_description',
      defaultValue: 8,
      isLowDefinition: true,
      modelValue: 6
    })
  })

  it('keeps the low definition under the high definition typed', async () => {
    const { wrapper } = await mountSettings()
    const { hd, ld } = bitrateFields(wrapper)
    expect(ld.props('max')).toBe(28)

    await hd.vm.$emit('update:modelValue', 12)
    expect(ld.props('max')).toBe(12)

    await hd.vm.$emit('update:modelValue', null)
    expect(ld.props('max')).toBe(40)
  })

  // Kitsu capped every bitrate at 28 whatever the instance allowed.
  it('saves up to the instance ceiling, in whole Mbit/s', async () => {
    const { store, wrapper } = await mountSettings()
    const { hd, ld } = bitrateFields(wrapper)

    await hd.vm.$emit('update:modelValue', 35)
    await ld.vm.$emit('update:modelValue', 12.5)
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(store.dispatch).toHaveBeenCalledWith(
      'editProduction',
      expect.objectContaining({
        id: 'production-1',
        hd_bitrate_compression: 35,
        ld_bitrate_compression: 13
      })
    )
    expect(ld.props('modelValue')).toBe(13)
  })
})
