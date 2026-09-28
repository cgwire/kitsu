import resizableColumn from '@/directives/resizable-column'

const mountHeader = (extraHeaders = '') => {
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
          <th class="name" data-column-key="name">Name</th>
          ${extraHeaders}
          <th class="metadata-descriptor">Metadata</th>
          <th class="description" data-column-key="description">
            Description
          </th>
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

const drag = (knob, fromX, toX) => {
  knob.dispatchEvent(mouseEvent('mousedown', fromX))
  document.dispatchEvent(mouseEvent('mousemove', toX))
  document.dispatchEvent(mouseEvent('mouseup', toX))
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

  test('sets up the header as soon as it mounts', () => {
    localStorage.setItem('asset-list-name', '120px')
    const { directive, header } = mountHeader()

    directive.mounted(header)

    expect(header.querySelectorAll('.resizable-knob')).toHaveLength(3)
    expect(header.querySelector('.name').style.width).toBe('120px')

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
    expect(setItem).toHaveBeenCalledWith('asset-list-name', '40px')

    directive.unmounted(header)
  })

  test('keeps the resized width on the next re-render', () => {
    localStorage.setItem('asset-list-name', '120px')
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
    localStorage.setItem('asset-list-name', '120px')
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
    localStorage.setItem('asset-list-name', '120px')
    const { directive, header } = mountHeader()
    const getItem = vi.spyOn(localStorage, 'getItem')

    directive.updated(header)
    directive.updated(header)

    expect(getItem).toHaveBeenCalledTimes(3)
    expect(header.querySelector('.name').style.width).toBe('120px')

    directive.unmounted(header)
  })

  test('keys a column by its data-column-key, not by its label', () => {
    const { directive, header } = mountHeader()
    header.querySelector('.name').firstChild.textContent = 'Nom'
    directive.updated(header)
    const setItem = vi.spyOn(localStorage, 'setItem')

    drag(header.querySelector('.name > .resizable-knob'), 100, 140)

    expect(setItem).toHaveBeenCalledWith('asset-list-name', '40px')

    directive.unmounted(header)
  })

  test('keys a column without data-column-key by its label', () => {
    const { directive, header } = mountHeader()
    directive.updated(header)
    const setItem = vi.spyOn(localStorage, 'setItem')

    drag(header.querySelector('.metadata-descriptor > .resizable-knob'), 0, 90)

    expect(setItem).toHaveBeenCalledWith('asset-list-Metadata', '90px')

    directive.unmounted(header)
  })

  test('stores the widths of each scope apart', () => {
    const { directive, header } = mountHeader()
    directive.updated(header, { value: 'production-a' })
    const setItem = vi.spyOn(localStorage, 'setItem')

    drag(header.querySelector('.name > .resizable-knob'), 100, 140)

    expect(setItem.mock.calls).toEqual([['asset-list-production-a-name', '40px']])

    directive.unmounted(header)
  })

  test('applies the width stored for the new scope', () => {
    localStorage.setItem('asset-list-production-a-name', '120px')
    localStorage.setItem('asset-list-production-b-name', '200px')
    const { directive, header } = mountHeader()

    directive.mounted(header, { value: 'production-a' })
    expect(header.querySelector('.name').style.width).toBe('120px')

    directive.updated(header, { value: 'production-b' })
    expect(header.querySelector('.name').style.width).toBe('200px')
    expect(header.querySelector('.name').style.minWidth).toBe('200px')

    directive.unmounted(header)
  })

  test('drops the width of the previous scope when the new one has none', () => {
    localStorage.setItem('asset-list-production-a-description', '300px')
    const { directive, header } = mountHeader()
    directive.mounted(header, { value: 'production-a' })
    drag(header.querySelector('.name > .resizable-knob'), 100, 140)

    directive.updated(header, { value: 'production-b' })

    const name = header.querySelector('.name')
    const description = header.querySelector('.description')
    expect([name.style.width, name.style.minWidth]).toEqual(['', ''])
    expect([description.style.width, description.style.minWidth]).toEqual([
      '',
      ''
    ])

    directive.unmounted(header)
  })

  test('saves a resize made after a scope switch under the new scope', () => {
    const { directive, header } = mountHeader()
    directive.mounted(header, { value: 'production-a' })
    directive.updated(header, { value: 'production-b' })
    const setItem = vi.spyOn(localStorage, 'setItem')

    drag(header.querySelector('.name > .resizable-knob'), 100, 140)

    expect(setItem.mock.calls).toEqual([['asset-list-production-b-name', '40px']])

    directive.unmounted(header)
  })
})
