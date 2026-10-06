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
      props: { modelValue: 'Snowy downfall', editable: true, ...props }
    })
  }

  // jsdom lays nothing out: the cell gets the rect of a laid out one.
  const openAt = async rect => {
    vi.spyOn(wrapper.element, 'getBoundingClientRect').mockReturnValue(rect)
    await wrapper.trigger('click')
    await nextTick()
  }

  const popup = () => document.querySelector('.metadata-textarea-popup')
  const editor = () => document.querySelector('.metadata-textarea-editor')

  const typeAndPressEscape = async text => {
    editor().value = text
    editor().dispatchEvent(new KeyboardEvent('keyup', { key: 'Escape' }))
    await nextTick()
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
})
