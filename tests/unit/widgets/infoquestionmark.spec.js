import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import InfoQuestionMark from '@/components/widgets/InfoQuestionMark.vue'

describe('InfoQuestionMark', () => {
  let theme, wrapper

  beforeEach(() => {
    // The text teleports to the layer that App.vue renders.
    theme = document.createElement('div')
    theme.className = 'theme'
    theme.innerHTML = '<div id="theme-popups"></div>'
    document.body.appendChild(theme)
    vi.stubGlobal('innerWidth', 1600)
    vi.stubGlobal('innerHeight', 900)
  })

  afterEach(() => {
    wrapper.unmount()
    theme.remove()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  const mountMark = (props = {}) => {
    wrapper = mount(InfoQuestionMark, {
      props: { text: 'Leave empty to use the **Video** tab.', ...props },
      attachTo: document.body
    })
  }

  const text = () => document.querySelector('.question-text')

  // jsdom lays nothing out: the icon and its text get the rects of laid out
  // ones.
  const hoverAt = async (markRect, textSize = { width: 320, height: 119 }) => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      function () {
        return this.classList.contains('question-mark') ? markRect : textSize
      }
    )
    await wrapper.trigger('mouseenter')
    await nextTick()
  }

  const leave = async (element, relatedTarget) => {
    element.dispatchEvent(new MouseEvent('mouseleave', { relatedTarget }))
    await nextTick()
  }

  // The LD bitrate column of the production task types (1600 x 900).
  const ldColumnMark = { top: 328, bottom: 350, left: 897, right: 913 }

  test('shows the text over the page, out of the blocks that clip it', async () => {
    mountMark()
    expect(text()).toBeNull()
    await hoverAt(ldColumnMark)
    expect(text().parentElement.id).toBe('theme-popups')
    expect(wrapper.element.contains(text())).toBe(false)
    expect(text().innerHTML).toContain('<strong>Video</strong>')
  })

  test('opens the text under the icon, from its left edge', async () => {
    mountMark({ position: 'left' })
    await hoverAt(ldColumnMark)
    expect(text().style.top).toBe('350px')
    expect(text().style.left).toBe('897px')
    expect(text().style.width).toBe('320px')
  })

  test('ends a right text at the right edge of the icon', async () => {
    mountMark({ position: 'right' })
    await hoverAt({ top: 100, bottom: 122, left: 600, right: 616 })
    expect(text().style.left).toBe('296px')
  })

  test('keeps the text in the window', async () => {
    vi.stubGlobal('innerWidth', 1024)
    vi.stubGlobal('innerHeight', 768)
    mountMark({ position: 'left' })
    await hoverAt(
      { top: 328, bottom: 350, left: 761, right: 777 },
      { width: 500, height: 119 }
    )
    expect(text().style.left).toBe('516px')
  })

  test('opens above an icon at the bottom of the window', async () => {
    vi.stubGlobal('innerWidth', 1024)
    vi.stubGlobal('innerHeight', 768)
    mountMark()
    await hoverAt({ top: 700, bottom: 722, left: 100, right: 116 })
    expect(text().style.top).toBe('')
    expect(text().style.bottom).toBe('68px')
  })

  test('stays open while the pointer goes from the icon to the text', async () => {
    mountMark()
    await hoverAt(ldColumnMark)
    await leave(wrapper.element, text())
    expect(text()).not.toBeNull()
    await leave(text(), wrapper.element)
    expect(text()).not.toBeNull()
    await leave(wrapper.element, document.body)
    expect(text()).toBeNull()
  })

  test('hides the text when the pointer leaves it for the page', async () => {
    mountMark()
    await hoverAt(ldColumnMark)
    await leave(wrapper.element, text())
    await leave(text(), document.body)
    expect(text()).toBeNull()
  })

  test('hides the text when the page under it scrolls', async () => {
    mountMark()
    await hoverAt(ldColumnMark)
    text().dispatchEvent(new Event('scroll'))
    await nextTick()
    expect(text()).not.toBeNull()
    document.body.dispatchEvent(new Event('scroll'))
    await nextTick()
    expect(text()).toBeNull()
  })
})
