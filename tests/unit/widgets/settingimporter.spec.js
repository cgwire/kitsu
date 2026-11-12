import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import { describe, expect, it } from 'vitest'

import SettingImporter from '@/components/widgets/SettingImporter.vue'

const items = [
  { id: 'asset-type-1', name: 'Character' },
  { id: 'asset-type-2', name: 'Prop' }
]

// No other open production: the import from a production stays hidden.
const mountImporter = (props = {}) => {
  const store = createStore({
    getters: {
      currentProduction: () => ({ id: 'production-1' }),
      openProductions: () => [{ id: 'production-1', name: 'Alpha' }]
    }
  })
  return mount(SettingImporter, {
    props: { items, loadingImport: false, ...props },
    slots: { 'item-line': '<template #item-line="{ item }">{{ item.name }}</template>' },
    global: { plugins: [store] }
  })
}

const findRows = wrapper => wrapper.findAll('.import-list .item-to-add')

describe('SettingImporter', () => {
  it('lists the available items', () => {
    const wrapper = mountImporter()

    expect(findRows(wrapper).map(row => row.text())).toEqual([
      'Character',
      'Prop'
    ])
    wrapper.unmount()
  })

  it('marks every item with an add icon', () => {
    const wrapper = mountImporter()

    findRows(wrapper).forEach(row => {
      expect(row.find('.add-icon').exists()).toBe(true)
    })
    wrapper.unmount()
  })

  it('tells in a tooltip that a click adds the item', () => {
    const wrapper = mountImporter()

    findRows(wrapper).forEach(row => {
      expect(row.attributes('title')).toBe('main.click_to_add')
    })
    wrapper.unmount()
  })

  it('adds an item on click', async () => {
    const wrapper = mountImporter()

    await findRows(wrapper)[1].trigger('click')

    expect(wrapper.emitted('import-item')).toEqual([[items[1]]])
    wrapper.unmount()
  })

  it('adds an item with Enter or Space, like a button', async () => {
    const wrapper = mountImporter()
    const [first, second] = findRows(wrapper)

    await first.trigger('keydown', { key: 'Enter' })
    await second.trigger('keydown', { key: ' ' })

    expect(wrapper.emitted('import-item')).toEqual([[items[0]], [items[1]]])
    wrapper.unmount()
  })

  it('says when no item is left to add', () => {
    const wrapper = mountImporter({ items: [] })

    expect(wrapper.find('.import-list').exists()).toBe(false)
    expect(wrapper.find('.infos').text()).toBe(
      'settings.no_more_available_items'
    )
    wrapper.unmount()
  })
})
