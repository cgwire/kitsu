import { mount } from '@vue/test-utils'
import { vi } from 'vitest'
import { nextTick } from 'vue'
import { createStore } from 'vuex'

import ShowInfosButton from '@/components/widgets/ShowInfosButton.vue'

const mountButton = errorHandler => {
  const store = createStore({
    state: () => ({ isShown: false }),
    getters: { isShowInfosBreakdown: state => state.isShown },
    actions: {
      showInfosBreakdown: ({ state }) => (state.isShown = true),
      hideInfosBreakdown: ({ state }) => (state.isShown = false)
    }
  })
  return mount(ShowInfosButton, {
    global: {
      plugins: [store],
      config: { errorHandler },
      mocks: { $t: key => key },
      stubs: { KitsuIcon: true }
    }
  })
}

describe('ShowInfosButton', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  test('remembers the choice', async () => {
    const wrapper = mountButton()
    await nextTick()

    await wrapper.find('.button').trigger('click')

    expect(localStorage.getItem('show-infos-breakdown')).toBe('false')
  })

  // Full or disabled storage: losing the preference is fine, breaking the
  // toggle is not.
  test('survives a storage that refuses the write', async () => {
    const errorHandler = vi.fn()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    const wrapper = mountButton(errorHandler)
    await nextTick()

    await wrapper.find('.button').trigger('click')

    expect(errorHandler).not.toHaveBeenCalled()
  })
})
