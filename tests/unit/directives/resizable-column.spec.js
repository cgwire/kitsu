import resizableColumn from '@/directives/resizable-column'

const mountHeader = () => {
  let directive
  resizableColumn.install({
    directive: (name, definition) => {
      directive = definition
    }
  })

  document.body.innerHTML = `
    <table>
      <thead id="asset-list">
        <tr>
          <th class="name">Name</th>
          <th class="metadata-descriptor">Metadata</th>
          <th class="description">Description</th>
        </tr>
      </thead>
    </table>
  `
  return { directive, header: document.querySelector('thead') }
}

// MouseEventInit has no pageX key, so jsdom drops it in the constructor:
// set it on the instance, the directive reads it on every event.
const mouseEvent = (type, pageX) => {
  const event = new MouseEvent(type, { bubbles: true })
  Object.defineProperty(event, 'pageX', { value: pageX })
  return event
}

describe('resizable column directive', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  test('adds resize handles to supported columns', () => {
    const { directive, header } = mountHeader()

    directive.updated(header)

    expect(header.querySelectorAll('.resizable-knob')).toHaveLength(3)
    expect(
      header.querySelector('.description > .resizable-knob')
    ).not.toBeNull()

    directive.unmounted(header)
  })

  test('persists the column width once the resize ends', () => {
    const { directive, header } = mountHeader()
    directive.updated(header)
    const setItem = vi.spyOn(localStorage, 'setItem')
    const knob = header.querySelector('.name > .resizable-knob')

    knob.dispatchEvent(mouseEvent('mousedown', 100))
    document.dispatchEvent(mouseEvent('mousemove', 120))
    document.dispatchEvent(mouseEvent('mousemove', 140))
    expect(setItem).not.toHaveBeenCalled()
    expect(header.querySelector('.name').style.width).toBe('40px')

    document.dispatchEvent(mouseEvent('mouseup', 140))
    expect(setItem).toHaveBeenCalledTimes(1)
    expect(setItem).toHaveBeenCalledWith('asset-list-Name', '40px')

    directive.unmounted(header)
  })

  test('keeps the resized width on the next re-render', () => {
    localStorage.setItem('asset-list-Name', '120px')
    const { directive, header } = mountHeader()
    directive.updated(header)
    const getItem = vi.spyOn(localStorage, 'getItem')
    const knob = header.querySelector('.name > .resizable-knob')

    knob.dispatchEvent(mouseEvent('mousedown', 100))
    document.dispatchEvent(mouseEvent('mousemove', 140))
    document.dispatchEvent(mouseEvent('mouseup', 140))
    directive.updated(header)

    expect(header.querySelector('.name').style.width).toBe('40px')
    expect(getItem).not.toHaveBeenCalled()

    directive.unmounted(header)
  })

  test('keeps the live width when the header re-renders mid-drag', () => {
    localStorage.setItem('asset-list-Name', '120px')
    const { directive, header } = mountHeader()
    directive.updated(header)
    const knob = header.querySelector('.name > .resizable-knob')

    knob.dispatchEvent(mouseEvent('mousedown', 100))
    document.dispatchEvent(mouseEvent('mousemove', 140))
    directive.updated(header)

    expect(header.querySelector('.name').style.width).toBe('40px')

    document.dispatchEvent(mouseEvent('mouseup', 140))
    directive.unmounted(header)
  })

  test('releases the drag even when the width cannot be persisted', () => {
    const { directive, header } = mountHeader()
    directive.updated(header)
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const knob = header.querySelector('.name > .resizable-knob')

    knob.dispatchEvent(mouseEvent('mousedown', 100))
    document.dispatchEvent(mouseEvent('mousemove', 140))
    document.dispatchEvent(mouseEvent('mouseup', 140))
    document.dispatchEvent(mouseEvent('mousemove', 200))

    expect(header.querySelector('.name').style.width).toBe('40px')

    directive.unmounted(header)
  })

  test('reads the stored widths once per header', () => {
    localStorage.setItem('asset-list-Name', '120px')
    const { directive, header } = mountHeader()
    const getItem = vi.spyOn(localStorage, 'getItem')

    directive.updated(header)
    directive.updated(header)

    expect(getItem).toHaveBeenCalledTimes(3)
    expect(header.querySelector('.name').style.width).toBe('120px')

    directive.unmounted(header)
  })
})
