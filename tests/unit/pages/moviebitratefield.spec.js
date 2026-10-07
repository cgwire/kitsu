import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import MovieBitrateField from '@/components/pages/production/MovieBitrateField.vue'

// Shows the interpolated values next to the key.
const $t = (key, params) => (params ? `${key} ${JSON.stringify(params)}` : key)

const mountField = ({ attachTo, ...props } = {}) => {
  const wrapper = mount(MovieBitrateField, {
    attachTo,
    props: {
      label: 'HD bitrate',
      description: 'Full-resolution version.',
      defaultValue: 28,
      max: 28,
      modelValue: '',
      'onUpdate:modelValue': value => wrapper.setProps({ modelValue: value }),
      ...props
    },
    global: { mocks: { $t } }
  })
  return wrapper
}

const restoreButton = wrapper => wrapper.find('.restore-button')

describe('MovieBitrateField', () => {
  it('takes whole Mbit/s between 1 and the instance ceiling', () => {
    const wrapper = mountField({ max: 40 })
    const input = wrapper.find('input')

    expect(input.attributes('step')).toBe('1')
    expect(input.attributes('min')).toBe('1')
    expect(input.attributes('max')).toBe('40')
    expect(input.attributes('placeholder')).toBe('28')
    wrapper.unmount()
  })

  it('describes the version the bitrate encodes under the field', () => {
    const wrapper = mountField()

    expect(wrapper.find('.help').text()).toBe('Full-resolution version.')
    wrapper.unmount()
  })

  it('reminds the default even once the value is changed', () => {
    const wrapper = mountField({ modelValue: 12 })

    expect(wrapper.text()).toContain(
      'productions.video.bitrate_default {"value":28}'
    )
    wrapper.unmount()
  })

  it('gives the weight of a minute of movie at the typed bitrate', async () => {
    const wrapper = mountField({ modelValue: 12 })
    expect(wrapper.text()).toContain('productions.video.bitrate_size {"size":90}')

    await wrapper.find('input').setValue('6')

    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual([6])
    expect(wrapper.text()).toContain('productions.video.bitrate_size {"size":45}')
    wrapper.unmount()
  })

  it('weighs an empty field at the default bitrate it falls back on', () => {
    const wrapper = mountField({ modelValue: null })

    expect(wrapper.text()).toContain(
      'productions.video.bitrate_size {"size":210}'
    )
    wrapper.unmount()
  })

  // The low definition one never goes above the high definition one.
  it('weighs the bitrate the movies will get, within the ceiling', () => {
    const lowDefinition = mountField({ defaultValue: 6, max: 4 })
    expect(lowDefinition.text()).toContain(
      'productions.video.bitrate_size {"size":30}'
    )
    lowDefinition.unmount()

    const tooHigh = mountField({ modelValue: 40 })
    expect(tooHigh.text()).toContain('productions.video.bitrate_size {"size":210}')
    tooHigh.unmount()
  })

  it('offers to restore the default only when the value differs', async () => {
    const wrapper = mountField({ modelValue: 28 })
    expect(restoreButton(wrapper).exists()).toBe(false)

    await wrapper.setProps({ modelValue: '' })
    expect(restoreButton(wrapper).exists()).toBe(false)

    await wrapper.setProps({ modelValue: 12 })
    expect(restoreButton(wrapper).text()).toBe(
      'productions.video.restore_default'
    )
    wrapper.unmount()
  })

  // An empty field follows the default, even once the default changes.
  it('empties the field to restore the default', async () => {
    const wrapper = mountField({ modelValue: 12 })
    // Inside the form of the Video tab, a submit button would catch the
    // Enter key of every field.
    expect(restoreButton(wrapper).attributes('type')).toBe('button')

    await restoreButton(wrapper).trigger('click')

    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual([null])
    expect(wrapper.find('input').element.value).toBe('')
    expect(wrapper.find('input').attributes('placeholder')).toBe('28')
    expect(restoreButton(wrapper).exists()).toBe(false)
    wrapper.unmount()
  })

  // The button hides itself once clicked.
  it('hands the focus to the field it filled', async () => {
    const wrapper = mountField({ modelValue: 12, attachTo: document.body })
    restoreButton(wrapper).element.focus()

    await restoreButton(wrapper).trigger('click')

    expect(document.activeElement).toBe(wrapper.find('input').element)
    wrapper.unmount()
  })

  // The low definition field: its default sits under the ceiling.
  it('falls back on, reminds and restores the default, not the ceiling', async () => {
    const wrapper = mountField({ defaultValue: 6, max: 28 })
    expect(wrapper.text()).toContain(
      'productions.video.bitrate_default {"value":6}'
    )
    expect(wrapper.text()).toContain('productions.video.bitrate_size {"size":45}')
    expect(wrapper.find('input').attributes('placeholder')).toBe('6')

    await wrapper.setProps({ modelValue: 6 })
    expect(restoreButton(wrapper).exists()).toBe(false)

    await wrapper.setProps({ modelValue: 12 })
    await restoreButton(wrapper).trigger('click')

    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual([null])
    expect(restoreButton(wrapper).exists()).toBe(false)
    wrapper.unmount()
  })

  // Zou encodes an unset low definition bitrate at the high definition one
  // when that one is lower.
  it('caps the default of the low definition at the high definition', async () => {
    const wrapper = mountField({ defaultValue: 6, max: 4, modelValue: 3 })
    expect(wrapper.text()).toContain(
      'productions.video.bitrate_default {"value":4}'
    )

    await restoreButton(wrapper).trigger('click')

    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual([null])
    expect(restoreButton(wrapper).exists()).toBe(false)
    expect(wrapper.find('input').attributes('placeholder')).toBe('4')
    wrapper.unmount()
  })
})
