import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createStore } from 'vuex'

import EmojiButton from '@/components/widgets/EmojiButton.vue'

const picker = vi.hoisted(() => ({ loaded: false }))

vi.mock('vue3-emoji-picker', async () => {
  const { defineComponent, h } = await import('vue')
  picker.loaded = true
  return {
    default: defineComponent({
      name: 'EmojiPicker',
      emits: ['select'],
      setup: () => () => h('div', { class: 'picker-mock' })
    })
  }
})

describe('EmojiButton', () => {
  let wrapper

  const mountButton = () =>
    mount(EmojiButton, {
      global: {
        plugins: [createStore({ getters: { isDarkTheme: () => false } })]
      }
    })

  const openPicker = async () => {
    await wrapper.find('.emoji-button').trigger('click')
    await vi.dynamicImportSettled()
    await flushPromises()
  }

  afterEach(() => {
    wrapper?.unmount()
  })

  // Keep this test first: the library stays loaded once a test opens it.
  it('loads the picker library on the first click only', async () => {
    wrapper = mountButton()
    expect(picker.loaded).toBe(false)

    await openPicker()

    expect(picker.loaded).toBe(true)
    expect(wrapper.find('.picker-mock').exists()).toBe(true)
  })

  it('sends the chosen emoji and closes the picker', async () => {
    wrapper = mountButton()
    await openPicker()
    const emoji = { i: '👍', n: ['thumbs up'] }

    wrapper.findComponent({ name: 'EmojiPicker' }).vm.$emit('select', emoji)
    await flushPromises()

    expect(wrapper.emitted('select')).toEqual([[emoji]])
    expect(wrapper.find('.picker-mock').exists()).toBe(false)
  })
})
