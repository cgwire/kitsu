import resizableColumn from '@/directives/resizable-column'

describe('resizable column directive', () => {
  test('adds resize handles to supported columns', () => {
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
    const header = document.querySelector('thead')

    directive.updated(header)

    expect(header.querySelectorAll('.resizable-knob')).toHaveLength(3)
    expect(
      header.querySelector('.description > .resizable-knob')
    ).not.toBeNull()

    directive.unmounted(header)
  })
})
