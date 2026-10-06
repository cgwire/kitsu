import { flushPromises, mount } from '@vue/test-utils'
import { createStore } from 'vuex'

import MetadataPerson from '@/components/cells/MetadataPerson.vue'
import PeopleField from '@/components/widgets/PeopleField.vue'

// jsdom has no layout: the rects below are derived from the inline styles the
// component sets, with the height Chromium renders for the people field.
const PICKER_HEIGHT = 42
const POPUP_WIDTH = 280
const MARGIN = 8
// Sub-pixel tolerance: positions are computed from decimal sizes.
const EPSILON = 0.01

const toRect = ({ top, left, width, height }) => ({
  top,
  left,
  width,
  height,
  bottom: top + height,
  right: left + width,
  x: left,
  y: top
})

describe('cells/MetadataPerson', () => {
  const people = [
    { id: 'person-1', name: 'Bruno Layout', color: '#000' },
    { id: 'person-2', name: 'Eva Fx', color: '#000' }
  ]

  let anchorRect, focusedPopupRect, theme, wrapper

  const findPopup = () => document.querySelector('.metadata-person-popup')
  const findMultiselect = () => document.querySelector('.multiselect')

  const popupRect = () => {
    const popup = findPopup()
    const top = popup.style.top
      ? parseFloat(popup.style.top)
      : window.innerHeight - parseFloat(popup.style.bottom) - PICKER_HEIGHT
    return toRect({
      top,
      left: parseFloat(popup.style.left),
      width: POPUP_WIDTH,
      height: PICKER_HEIGHT
    })
  }

  const open = async ({ anchor, width = 1912, height = 962, editable = true }) => {
    vi.stubGlobal('innerWidth', width)
    vi.stubGlobal('innerHeight', height)
    anchorRect = toRect({ left: 449, width: 119, ...anchor })
    wrapper = mount(MetadataPerson, {
      props: { person: people[1], people, editable },
      global: {
        plugins: [createStore({ getters: { isDarkTheme: () => false } })],
        stubs: { RouterLink: true }
      }
    })
    await wrapper.find('.display').trigger('click')
    await flushPromises()
    return findPopup() && popupRect()
  }

  // The people list next to the picker, on the side its class tells, at its
  // max height (the most options it shows).
  const listRect = () => {
    const picker = popupRect()
    const height = parseFloat(
      document.querySelector('.multiselect__content-wrapper').style.maxHeight
    )
    const isAbove = findMultiselect().classList.contains('multiselect--above')
    return toRect({
      top: isAbove ? picker.top - height : picker.bottom,
      left: picker.left,
      width: POPUP_WIDTH,
      height
    })
  }

  const expectInViewport = rect => {
    expect(rect.top).toBeGreaterThanOrEqual(MARGIN - EPSILON)
    expect(rect.left).toBeGreaterThanOrEqual(MARGIN - EPSILON)
    expect(rect.bottom).toBeLessThanOrEqual(
      window.innerHeight - MARGIN + EPSILON
    )
    expect(rect.right).toBeLessThanOrEqual(window.innerWidth - MARGIN + EPSILON)
  }

  // The people list picks its direction from where the picker sits when it
  // gets the focus.
  const onFocus = event => {
    if (event.target.classList?.contains('multiselect') && !focusedPopupRect) {
      focusedPopupRect = popupRect()
    }
  }

  beforeEach(() => {
    focusedPopupRect = null
    theme = document.createElement('div')
    theme.className = 'theme'
    document.body.appendChild(theme)
    document.addEventListener('focus', onFocus, true)
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      function () {
        if (this.classList.contains('display')) return anchorRect
        if (
          this.classList.contains('metadata-person-popup') ||
          this.classList.contains('multiselect')
        ) {
          return popupRect()
        }
        return toRect({ top: 0, left: 0, width: 0, height: 0 })
      }
    )
  })

  afterEach(() => {
    wrapper?.unmount()
    wrapper = null
    document.removeEventListener('focus', onFocus, true)
    theme.remove()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  describe('placement', () => {
    it('opens below the cell when the picker and its list fit there', async () => {
      const popup = await open({ anchor: { top: 309.8, height: 112 } })
      expect(popup.top).toBeCloseTo(anchorRect.bottom + 4)
      expectInViewport(popup)
      expect(findMultiselect().classList).not.toContain('multiselect--above')
    })

    it('opens above the cell of the last visible row', async () => {
      // Shots list scrolled to its end in a 1912x962 window (#2244).
      const popup = await open({ anchor: { top: 806.8, height: 112 } })
      expectInViewport(popup)
      expect(popup.bottom).toBeLessThanOrEqual(anchorRect.top)
      expect(findMultiselect().classList).toContain('multiselect--above')
    })

    it('opens above a row clipped by the bottom of the list', async () => {
      // Only the top 29 px of the cell show: its bottom is below the window.
      const popup = await open({ anchor: { top: 890.8, height: 112 } })
      expectInViewport(popup)
      expect(popup.bottom).toBeLessThanOrEqual(anchorRect.top)
    })

    it('focuses the picker once it is in place', async () => {
      const popup = await open({ anchor: { top: 806.8, height: 112 } })
      expect(focusedPopupRect).toEqual(popup)
      expectInViewport(focusedPopupRect)
    })

    it('keeps the picker off the right edge of the window', async () => {
      const popup = await open({
        anchor: { top: 309.8, left: 1800, height: 112 }
      })
      expect(popup.left).toBe(1912 - POPUP_WIDTH - MARGIN)
    })
  })

  describe('people list', () => {
    // Cells measured in Chromium, Shots list unless told otherwise. A list
    // over the cell takes the second click of a double click on an option,
    // which replaces or clears the person.
    it.each([
      ['last row at 1366x768', 1366, 768, { top: 592.8 }],
      ['last row at 1366x600', 1366, 600, { top: 424.8 }],
      ['last Assets row at 1912x962', 1912, 962, { top: 792.8, left: 629 }],
      ['first row at 1366x600', 1366, 600, { top: 309.8 }],
      // The list scrolled by 82 px: no side holds the picker and its list.
      ['second row at 1366x768', 1366, 768, { top: 340 }],
      ['last row at 1912x962', 1912, 962, { top: 806.8 }],
      ['first row at 1912x962', 1912, 962, { top: 309.8 }]
    ])(
      'opens off the cell and in the window: %s',
      async (_, width, height, anchor) => {
        await open({ anchor: { height: 112, ...anchor }, width, height })
        const list = listRect()
        expect(
          list.bottom <= anchorRect.top || list.top >= anchorRect.bottom
        ).toBe(true)
        expectInViewport(list)
      }
    )
  })

  describe('selection', () => {
    it('emits the picked person and closes', async () => {
      await open({ anchor: { top: 806.8, height: 112 } })
      wrapper
        .findComponent(PeopleField)
        .vm.$emit('update:model-value', people[0])
      await flushPromises()
      expect(wrapper.emitted('select')).toEqual([['person-1']])
      expect(findPopup()).toBeNull()
    })

    it('closes on a click on the mask', async () => {
      await open({ anchor: { top: 806.8, height: 112 } })
      document.querySelector('.metadata-person-mask').click()
      await flushPromises()
      expect(findPopup()).toBeNull()
      expect(wrapper.emitted('select')).toBeUndefined()
    })

    it('does not open when not editable', async () => {
      await open({ anchor: { top: 806.8, height: 112 }, editable: false })
      expect(findPopup()).toBeNull()
    })
  })
})
