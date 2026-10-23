import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'

import resizableColumn from '@/directives/resizable-column'

import MetadataHeader from '@/components/cells/MetadataHeader.vue'

// MouseEventInit has no pageX key, so jsdom drops it in the constructor.
const mouseEvent = (type, pageX) => {
  const event = new MouseEvent(type, { bubbles: true })
  Object.defineProperty(event, 'pageX', { value: pageX })
  return event
}

// My Tasks merges the descriptors of several productions into one column:
// the merged descriptor has no id, only its field name.
const mergedDescriptor = {
  field_name: 'description',
  name: 'Description',
  departments: []
}

const Host = {
  components: { MetadataHeader },
  props: { descriptor: { type: Object, default: () => mergedDescriptor } },
  template: `
    <table>
      <thead id="datatable-todos" v-columns-resizable>
        <tr>
          <th class="description" data-column-key="description">
            Description
          </th>
          <metadata-header :descriptor="descriptor" no-menu />
        </tr>
      </thead>
    </table>
  `
}

const mountHost = props =>
  mount(Host, {
    props,
    global: {
      plugins: [
        createStore({ getters: { departmentMap: () => new Map() } }),
        resizableColumn
      ]
    }
  })

// jsdom lays nothing out: a column starts from a 0px width.
const drag = (knob, fromX, toX) => {
  knob.dispatchEvent(mouseEvent('mousedown', fromX))
  document.dispatchEvent(mouseEvent('mousemove', toX))
  document.dispatchEvent(mouseEvent('mouseup', toX))
}

describe('cells/MetadataHeader', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  test('keeps its width apart from a built-in column named alike', () => {
    const wrapper = mountHost()
    const knob = wrapper.find('th.description .resizable-knob').element

    drag(knob, 100, 400)
    wrapper.unmount()
    const remounted = mountHost()

    expect(remounted.find('th.description').element.style.width).toBe('300px')
    expect(
      remounted.find('th.metadata-descriptor').element.style.width
    ).toBe('')

    remounted.unmount()
  })

  // A renamed descriptor keeps its width: its label is not part of the key.
  test.each([
    ['without id', mergedDescriptor, 'datatable-todos-metadata-description'],
    [
      'with id',
      { ...mergedDescriptor, id: 'descriptor-1' },
      'datatable-todos-metadata-descriptor-1'
    ]
  ])('stores its width under its descriptor %s', (label, descriptor, key) => {
    const wrapper = mountHost({ descriptor })
    const setItem = vi.spyOn(localStorage, 'setItem')

    drag(wrapper.find('th.metadata-descriptor .resizable-knob').element, 0, 150)

    expect(setItem.mock.calls).toEqual([[key, '150px']])

    wrapper.unmount()
  })
})
