import { flushPromises, shallowMount } from '@vue/test-utils'

import resizableColumn from '@/directives/resizable-column'

export const production = { id: 'production-1', production_type: 'short' }

export const descriptor = {
  id: 'descriptor-1',
  field_name: 'mood',
  name: 'Mood',
  data_type: 'string',
  departments: []
}

export const taskTypeId = 'task-type-1'

// A validation column only shows once one of its entities has a task.
export const filledColumns = { [taskTypeId]: true }

// jsdom lays nothing out: give the sticky headers the widths the offsets
// add up.
const HEADER_WIDTHS = {
  name: 200,
  'metadata-header-stub': 120,
  'validation-header-stub': 150
}

export const stubHeaderWidths = () =>
  vi
    .spyOn(Element.prototype, 'getBoundingClientRect')
    .mockImplementation(function () {
      const key = Object.keys(HEADER_WIDTHS).find(
        name =>
          this.tagName.toLowerCase() === name || this.classList.contains(name)
      )
      return { width: HEADER_WIDTHS[key] || 0 }
    })

export const stickyLeft = (wrapper, stub) =>
  wrapper.find(`thead ${stub}`).attributes('left')

// Sticks the metadata descriptor and the task type for the production.
export const stickColumns = type => {
  localStorage.setItem(
    `stick-${type}s-${production.id}`,
    JSON.stringify({ [descriptor.id]: true, [taskTypeId]: true })
  )
}

const neutralValue = name => {
  if (name.endsWith('Map') || name.startsWith('selected')) return new Map()
  if (name.startsWith('is')) return false
  if (name.startsWith('displayed') || name.startsWith('nb')) return 0
  if (name.endsWith('SearchText')) return ''
  if (name.endsWith('SelectionGrid')) return new Set()
  if (name.endsWith('FilledColumns')) return {}
  if (name.startsWith('current')) return null
  return []
}

// The lists read dozens of getters, some under an alias: every getter gets a
// neutral value, so a spec only sets the ones its scenario depends on.
const buildStore = getters => ({
  getters: new Proxy(getters, {
    has: () => true,
    get: (target, name) =>
      typeof name !== 'string' || name in target
        ? target[name]
        : neutralValue(name)
  }),
  commit: vi.fn(),
  dispatch: vi.fn()
})

export const mountEntityList = async (component, { getters, props }) => {
  const wrapper = shallowMount(component, {
    global: {
      // No task in the rows: task links never resolve a route.
      mocks: { $router: {}, $store: buildStore(getters) },
      plugins: [resizableColumn],
      stubs: { RouterLink: true }
    },
    props: {
      displaySettings: { showInfos: true },
      isError: false,
      isLoading: false,
      validationColumns: [taskTypeId],
      ...props
    }
  })
  await flushPromises()
  return wrapper
}
