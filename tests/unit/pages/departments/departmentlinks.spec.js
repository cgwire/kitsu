import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createStore } from 'vuex'

import DepartmentLinks from '@/components/pages/departments/DepartmentLinks.vue'

const departments = [
  { id: 'dep-anim', name: 'Animation', color: '#e74c3c' },
  { id: 'dep-comp', name: 'Compositing', color: '#3498db' }
]
const items = [
  { id: 'hw-1', name: 'Wacom Cintiq' },
  { id: 'hw-2', name: 'Workstation' },
  { id: 'hw-3', name: 'Dual monitor' }
]

const mountLinks = () => {
  // In the state, as in the app: a second press deselects a department only
  // when the row and the selection hold the same reactive object.
  const store = createStore({
    state: { departments },
    getters: { departments: state => state.departments }
  })
  return mount(DepartmentLinks, {
    props: { items, linkedItems: { 'dep-anim': [items[0]] } },
    global: { plugins: [store] }
  })
}

const departmentRows = wrapper => wrapper.findAll('.column-departments li')
const linkedColumn = wrapper => wrapper.find('.column-middle')
const availableColumn = wrapper => wrapper.find('.column-hardware')
const actionRows = column => column.findAll('[role="button"]')

const selectDepartment = (wrapper, name) =>
  departmentRows(wrapper)
    .find(row => row.text() === name)
    .trigger('click')

describe('DepartmentLinks', () => {
  it('selects a department with Space too', async () => {
    const wrapper = mountLinks()
    const [animation] = departmentRows(wrapper)

    await animation.trigger('keydown', { key: ' ' })

    expect(animation.classes()).toContain('selected')
    wrapper.unmount()
  })

  // Each press toggles the selection.
  it.each([
    ['Space', ' '],
    ['Enter', 'Enter']
  ])('ignores the repeats of a held %s on a department', async (_, key) => {
    const wrapper = mountLinks()
    const [animation] = departmentRows(wrapper)

    await animation.trigger('keydown', { key })
    await animation.trigger('keydown', { key, repeat: true })

    expect(animation.classes()).toContain('selected')
    wrapper.unmount()
  })

  it('asks to select a department first', () => {
    const wrapper = mountLinks()

    expect(linkedColumn(wrapper).text()).toContain(
      'departments.select_department'
    )
    wrapper.unmount()
  })

  // A click did nothing there: the items must not look clickable.
  it('lists the items without any action until a department is selected', () => {
    const wrapper = mountLinks()

    expect(availableColumn(wrapper).text()).toContain('Wacom Cintiq')
    expect(actionRows(availableColumn(wrapper))).toHaveLength(0)
    wrapper.unmount()
  })

  it('links an available item to the selected department', async () => {
    const wrapper = mountLinks()
    await selectDepartment(wrapper, 'Animation')
    const rows = actionRows(availableColumn(wrapper))

    expect(rows.map(row => row.text())).toEqual(['Workstation', 'Dual monitor'])
    expect(rows[0].attributes('title')).toBe('main.click_to_add')
    await rows[0].trigger('keydown', { key: ' ' })

    expect(wrapper.emitted('link-item')).toEqual([
      [{ departmentId: 'dep-anim', itemId: 'hw-2' }]
    ])
    wrapper.unmount()
  })

  it('unlinks a linked item from the selected department', async () => {
    const wrapper = mountLinks()
    await selectDepartment(wrapper, 'Animation')
    const rows = actionRows(linkedColumn(wrapper))

    expect(rows.map(row => row.text())).toEqual(['Wacom Cintiq'])
    expect(rows[0].attributes('title')).toBe('main.click_to_remove')
    await rows[0].trigger('keydown', { key: ' ' })

    expect(wrapper.emitted('unlink-item')).toEqual([
      [{ departmentId: 'dep-anim', itemId: 'hw-1' }]
    ])
    wrapper.unmount()
  })

  it('says when the selected department has no linked item', async () => {
    const wrapper = mountLinks()
    await selectDepartment(wrapper, 'Compositing')

    expect(linkedColumn(wrapper).text()).toContain(
      'departments.no_items_linked'
    )
    wrapper.unmount()
  })
})
