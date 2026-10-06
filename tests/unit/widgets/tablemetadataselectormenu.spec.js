import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createStore } from 'vuex'

import i18n from '@/lib/i18n'

import TableMetadataSelectorMenu from '@/components/widgets/TableMetadataSelectorMenu.vue'

import './setup'

describe('TableMetadataSelectorMenu', () => {
  let theme, wrapper

  const descriptors = Array.from({ length: 12 }, (_, index) => ({
    id: `descriptor-${index}`,
    entity_type: 'Shot',
    field_name: `extra_${index}`,
    name: `Extra ${index}`,
    position: index
  }))

  beforeEach(() => {
    // The menu teleports to the app root that App.vue renders.
    theme = document.createElement('div')
    theme.className = 'theme'
    document.body.appendChild(theme)
    vi.stubGlobal('innerWidth', 1366)
    vi.stubGlobal('innerHeight', 600)
  })

  afterEach(() => {
    wrapper.unmount()
    theme.remove()
    localStorage.clear()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  // jsdom lays nothing out: the host gets the rect of a list header.
  const placeHost = top => {
    const host = wrapper.find('.table-metadata-selector-host').element
    vi.spyOn(host, 'getBoundingClientRect').mockReturnValue({
      top,
      bottom: top,
      left: 1358,
      right: 1358
    })
  }

  const openMenu = async ({ namespace = 'shots', hostTop }) => {
    const store = createStore({
      getters: { isCurrentUserManager: () => false }
    })
    wrapper = mount(TableMetadataSelectorMenu, {
      props: { descriptors, modelValue: {}, namespace },
      global: { plugins: [i18n, store] }
    })
    placeHost(hostTop)
    await wrapper.setProps({ isOpen: true })
    await nextTick()
  }

  const menu = () => document.querySelector('.column-menu')

  test('bounds the menu to the room below the Shots header', async () => {
    await openMenu({ hostTop: 219 })
    expect(menu().style.top).toBe('259px')
    expect(menu().style.maxHeight).toBe('333px')
  })

  test('keeps the 400 px height cap in a tall window', async () => {
    vi.stubGlobal('innerHeight', 962)
    await openMenu({ hostTop: 219 })
    expect(menu().style.top).toBe('259px')
    expect(menu().style.maxHeight).toBe('400px')
  })

  test('bounds the menu again when the window gets shorter', async () => {
    vi.stubGlobal('innerHeight', 962)
    await openMenu({ hostTop: 219 })
    vi.stubGlobal('innerHeight', 600)
    window.dispatchEvent(new Event('resize'))
    await nextTick()
    expect(menu().style.maxHeight).toBe('333px')
  })

  test('bounds the menu again when a scroll moves the header', async () => {
    await openMenu({ hostTop: 400 })
    expect(menu().style.maxHeight).toBe('152px')
    placeHost(219)
    document.dispatchEvent(new Event('scroll'))
    await nextTick()
    expect(menu().style.top).toBe('259px')
    expect(menu().style.maxHeight).toBe('333px')
  })

  test('bounds the menu under the Breakdown options row', async () => {
    await openMenu({ namespace: 'breakdown', hostTop: 216 })
    expect(menu().style.top).toBe('246px')
    expect(menu().style.maxHeight).toBe('346px')
  })

  test('keeps 64 px of menu under a header near the window bottom', async () => {
    await openMenu({ hostTop: 580 })
    expect(menu().style.top).toBe('528px')
    expect(menu().style.maxHeight).toBe('64px')
  })

  const pressEscape = () => {
    const event = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true
    })
    document.body.dispatchEvent(event)
    return event
  }

  // Closed before the page sees the key, the menu leaves only that mark: the
  // action panel would clear the task selection on it too.
  test('takes the Escape it closes on', async () => {
    await openMenu({ hostTop: 219 })

    const escape = pressEscape()

    expect(wrapper.emitted('update:is-open')).toEqual([[false]])
    expect(escape.defaultPrevented).toBe(true)
  })

  test('leaves the Escape to the page once closed', async () => {
    await openMenu({ hostTop: 219 })
    await wrapper.setProps({ isOpen: false })

    expect(pressEscape().defaultPrevented).toBe(false)
  })
})
