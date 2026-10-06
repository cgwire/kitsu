import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import MetadataTextarea from '@/components/cells/MetadataTextarea.vue'

describe('cells/MetadataTextarea', () => {
  let theme, wrapper

  beforeEach(() => {
    // The popup teleports to the app root that App.vue renders.
    theme = document.createElement('div')
    theme.className = 'theme'
    document.body.appendChild(theme)
    // The reporter's window (cgwire/kitsu#2244)
    vi.stubGlobal('innerWidth', 1912)
    vi.stubGlobal('innerHeight', 962)
  })

  afterEach(() => {
    wrapper.unmount()
    theme.remove()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  const mountCell = (props = {}) => {
    wrapper = mount(MetadataTextarea, {
      props: { modelValue: 'Snowy downfall', editable: true, ...props },
      attachTo: document.body
    })
  }

  // jsdom lays nothing out: the cell gets the rect of a laid out one. A
  // mouse click focuses the cell before it opens the popup.
  const openAt = async rect => {
    vi.spyOn(wrapper.element, 'getBoundingClientRect').mockReturnValue(rect)
    wrapper.element.focus()
    await wrapper.trigger('click')
    await nextTick()
  }

  const popup = () => document.querySelector('.metadata-textarea-popup')
  const editor = () => document.querySelector('.metadata-textarea-editor')

  // keydown then keyup, both bubbling up to the window
  const pressKey = async (target, key, options = {}) => {
    const init = { key, bubbles: true, cancelable: true, ...options }
    const keydown = new KeyboardEvent('keydown', init)
    target.dispatchEvent(keydown)
    target.dispatchEvent(new KeyboardEvent('keyup', init))
    await nextTick()
    return keydown
  }

  const typeAndPressEscape = async text => {
    editor().value = text
    await pressKey(editor(), 'Escape')
  }

  test('opens above a last row cell, not past the window bottom', async () => {
    mountCell()
    await openAt({ top: 807, bottom: 919, left: 329, right: 448 })
    expect(popup().style.top).toBe('')
    expect(popup().style.bottom).toBe('159px')
    expect(popup().style.maxHeight).toBe('795px')
  })

  test('bounds the popup to the larger side when no side holds it', async () => {
    vi.stubGlobal('innerWidth', 1366)
    vi.stubGlobal('innerHeight', 600)
    mountCell()
    await openAt({ top: 60, bottom: 520, left: 224, right: 343 })
    expect(popup().style.top).toBe('524px')
    expect(popup().style.maxHeight).toBe('68px')
  })

  test('keeps opening below a cell with room below it', async () => {
    mountCell()
    await openAt({ top: 310, bottom: 422, left: 1800, right: 1912 })
    expect(popup().style.top).toBe('426px')
    expect(popup().style.left).toBe('1604px')
    expect(popup().style.width).toBe('300px')
  })

  test('focuses the editor and saves the edit on Escape', async () => {
    mountCell()
    await openAt({ top: 807, bottom: 919, left: 329, right: 448 })
    expect(document.activeElement).toBe(editor())
    await typeAndPressEscape('Snowy downfall, light wind')
    expect(popup()).toBeNull()
    expect(wrapper.emitted('update:model-value')).toEqual([
      ['Snowy downfall, light wind']
    ])
  })

  test('opens a long text at its start, for reading', async () => {
    mountCell({ modelValue: 'Snowy downfall\nLight wind\n'.repeat(20) })
    await openAt({ top: 310, bottom: 422, left: 329, right: 448 })
    expect(document.activeElement).toBe(editor())
    expect(editor().selectionStart).toBe(0)
    expect(editor().selectionEnd).toBe(0)
  })

  test('saves the edit on a click outside the popup', async () => {
    mountCell()
    await openAt({ top: 807, bottom: 919, left: 329, right: 448 })
    editor().value = 'Snowy downfall, light wind'
    document.querySelector('.metadata-textarea-mask').click()
    await nextTick()
    expect(popup()).toBeNull()
    expect(wrapper.emitted('update:model-value')).toEqual([
      ['Snowy downfall, light wind']
    ])
  })

  test('saves nothing from a read-only cell', async () => {
    mountCell({ editable: false })
    await openAt({ top: 807, bottom: 919, left: 329, right: 448 })
    expect(editor().readOnly).toBe(true)
    await typeAndPressEscape('Snowy downfall, light wind')
    expect(popup()).toBeNull()
    expect(wrapper.emitted('update:model-value')).toBeUndefined()
  })

  describe('keyboard', () => {
    const rect = { top: 310, bottom: 422, left: 329, right: 448 }

    test('keeps the editor focus on a click in the popup padding', async () => {
      mountCell()
      await openAt(rect)
      const mousedown = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true
      })
      popup().dispatchEvent(mousedown)
      expect(mousedown.defaultPrevented).toBe(true)
    })

    test.each([
      ['Tab', {}],
      ['Shift+Tab', { shiftKey: true }]
    ])('saves and closes on %s like a click outside', async (_, options) => {
      mountCell()
      await openAt(rect)
      editor().value = 'Snowy downfall, light wind'
      const tab = await pressKey(editor(), 'Tab', options)
      expect(popup()).toBeNull()
      expect(wrapper.emitted('update:model-value')).toEqual([
        ['Snowy downfall, light wind']
      ])
      // The browser then moves the focus on from the cell.
      expect(tab.defaultPrevented).toBe(false)
      expect(document.activeElement).toBe(wrapper.element)
    })

    test('takes the Escape it closes on, even from an empty editor', async () => {
      mountCell({ modelValue: '' })
      await openAt(rect)
      const escape = await pressKey(editor(), 'Escape')
      expect(popup()).toBeNull()
      // The page listeners run once the popup is gone: the mark tells them.
      expect(escape.defaultPrevented).toBe(true)
    })

    test.each([
      ['Escape', () => pressKey(editor(), 'Escape')],
      [
        'a click outside',
        () => {
          document.querySelector('.metadata-textarea-mask').click()
          return nextTick()
        }
      ]
    ])('gives the focus back to the cell on %s', async (_, close) => {
      mountCell()
      await openAt(rect)
      await close()
      expect(popup()).toBeNull()
      expect(document.activeElement).toBe(wrapper.element)
    })
  })
})
