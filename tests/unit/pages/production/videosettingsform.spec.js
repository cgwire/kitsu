import { shallowMount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import Checkbox from '@/components/widgets/Checkbox.vue'
import MovieBitrateField from '@/components/pages/production/MovieBitrateField.vue'
import VideoSettingsForm from '@/components/pages/production/VideoSettingsForm.vue'

const modelValue = {
  fps: '25',
  ratio: '16:9',
  resolution: '1920x1080',
  hd_bitrate_compression: 28,
  ld_bitrate_compression: 6,
  is_preview_download_allowed: false,
  is_set_preview_automated: false,
  is_single_preview_per_revision: false,
  is_frame_in_numbering: false
}

const mountForm = (props = {}, slots = {}) =>
  shallowMount(VideoSettingsForm, {
    props: {
      modelValue,
      defaultBitrates: { hd_bitrate_compression: 40, ld_bitrate_compression: 8 },
      ...props
    },
    slots,
    global: { mocks: { $t: key => key } }
  })

describe('VideoSettingsForm', () => {
  it('emits the whole object with a toggled preview option', async () => {
    const wrapper = mountForm()
    const [download] = wrapper.findAllComponents(Checkbox)

    await download.vm.$emit('update:modelValue', true)

    expect(wrapper.emitted('update:model-value')[0][0]).toEqual({
      ...modelValue,
      is_preview_download_allowed: true
    })
  })

  it('emits the updated object for a bitrate', async () => {
    const wrapper = mountForm()
    const [hd] = wrapper.findAllComponents(MovieBitrateField)

    await hd.vm.$emit('update:modelValue', 12)

    expect(wrapper.emitted('update:model-value')[0][0]).toEqual({
      ...modelValue,
      hd_bitrate_compression: 12
    })
  })

  it('caps the low definition at the high definition value', () => {
    const wrapper = mountForm()
    const [, ld] = wrapper.findAllComponents(MovieBitrateField)
    expect(ld.props('max')).toBe(28)
  })

  it('renders the previews-extra slot in the previews section', () => {
    const wrapper = mountForm({}, { 'previews-extra': '<i class="extra" />' })
    expect(wrapper.find('.previews .extra').exists()).toBe(true)
  })

  it('shows the ratio and resolution errors', () => {
    const wrapper = mountForm({
      errors: { ratio: 'bad ratio', resolution: 'bad resolution' }
    })
    const errors = wrapper.findAll('.field-error').map(e => e.text())
    expect(errors).toEqual(['bad ratio', 'bad resolution'])
  })
})
