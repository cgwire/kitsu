import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import TransferListItem from '@/components/widgets/TransferListItem.vue'

const mountItem = (props = {}) =>
  mount(TransferListItem, {
    props,
    slots: { default: '<span>Character</span>' }
  })

// A list whose items leave once added, like the lists of the pages.
const ItemList = {
  components: { TransferListItem },
  data: () => ({ items: ['Character', 'Prop', 'Set'] }),
  methods: {
    drop(name) {
      this.items = this.items.filter(item => item !== name)
    }
  },
  template: `<div>
    <transfer-list-item
      :key="item"
      @add="drop(item)"
      v-for="item in items"
    >{{ item }}</transfer-list-item>
  </div>`
}

// A list whose items leave once their request is answered, like the lists
// of the template settings.
const SlowItemList = {
  components: { TransferListItem },
  data: () => ({ items: ['Character', 'Prop', 'Set'], pending: [] }),
  methods: {
    answer() {
      this.items = this.items.filter(item => !this.pending.includes(item))
      this.pending = []
    }
  },
  template: `<div>
    <button class="elsewhere">Elsewhere</button>
    <transfer-list-item
      :key="item"
      @add="pending.push(item)"
      v-for="item in items"
    >{{ item }}</transfer-list-item>
  </div>`
}

describe('TransferListItem', () => {
  it('shows its content with an add icon', () => {
    const wrapper = mountItem()

    expect(wrapper.text()).toBe('Character')
    expect(wrapper.find('.add-icon').exists()).toBe(true)
    expect(wrapper.find('.remove-icon').exists()).toBe(false)
    wrapper.unmount()
  })

  it('is a button that the keyboard reaches', () => {
    const wrapper = mountItem()

    expect(wrapper.attributes('role')).toBe('button')
    expect(wrapper.attributes('tabindex')).toBe('0')
    wrapper.unmount()
  })

  it('tells in a tooltip that a click adds the item', () => {
    const wrapper = mountItem()

    expect(wrapper.attributes('title')).toBe('main.click_to_add')
    wrapper.unmount()
  })

  it('asks to add the item on a click, Enter, or Space', async () => {
    const wrapper = mountItem()

    await wrapper.trigger('click')
    await wrapper.trigger('keydown', { key: 'Enter' })
    await wrapper.trigger('keydown', { key: ' ' })
    await wrapper.trigger('keydown', { key: 'a' })

    expect(wrapper.emitted('add')).toHaveLength(3)
    wrapper.unmount()
  })

  it('ignores the repeats of a held key', async () => {
    const wrapper = mountItem()

    await wrapper.trigger('keydown', { key: 'Enter', repeat: true })
    await wrapper.trigger('keydown', { key: ' ', repeat: true })

    expect(wrapper.emitted('add')).toBeUndefined()
    wrapper.unmount()
  })

  describe('as a remove action', () => {
    it('shows a remove icon and tooltip', () => {
      const wrapper = mountItem({ action: 'remove' })

      expect(wrapper.find('.remove-icon').exists()).toBe(true)
      expect(wrapper.find('.add-icon').exists()).toBe(false)
      expect(wrapper.attributes('title')).toBe('main.click_to_remove')
      wrapper.unmount()
    })

    it('asks to remove the item on a click, Enter, or Space', async () => {
      const wrapper = mountItem({ action: 'remove' })

      await wrapper.trigger('click')
      await wrapper.trigger('keydown', { key: 'Enter' })
      await wrapper.trigger('keydown', { key: ' ' })

      expect(wrapper.emitted('remove')).toHaveLength(3)
      expect(wrapper.emitted('add')).toBeUndefined()
      wrapper.unmount()
    })
  })

  // The item leaves the list: the focus must not fall back to the page.
  describe('keyboard focus', () => {
    let wrapper

    const mountList = () => {
      wrapper = mount(ItemList, { attachTo: document.body })
      return wrapper.findAllComponents(TransferListItem)
    }

    afterEach(() => {
      wrapper.unmount()
    })

    it('moves to the next item when an item added from the keyboard leaves', async () => {
      const rows = mountList()

      rows[1].element.focus()
      await rows[1].trigger('keydown', { key: 'Enter' })
      await nextTick()

      expect(document.activeElement).toBe(rows[2].element)
    })

    it('moves to the previous item when the last one leaves', async () => {
      const rows = mountList()

      rows[2].element.focus()
      await rows[2].trigger('keydown', { key: ' ' })
      await nextTick()

      expect(document.activeElement).toBe(rows[1].element)
    })

    // The repeats of the held key reach the item that took the focus.
    it('adds only the first item while a key is held', async () => {
      const rows = mountList()

      rows[0].element.focus()
      await rows[0].trigger('keydown', { key: 'Enter' })
      await nextTick()
      const focused = wrapper
        .findAllComponents(TransferListItem)
        .find(row => row.element === document.activeElement)
      await focused.trigger('keydown', { key: 'Enter', repeat: true })
      await nextTick()

      expect(wrapper.findAllComponents(TransferListItem)).toHaveLength(2)
    })

    it('moves to the next item when an item leaves after its request', async () => {
      wrapper = mount(SlowItemList, { attachTo: document.body })
      const rows = wrapper.findAllComponents(TransferListItem)

      rows[1].element.focus()
      await rows[1].trigger('keydown', { key: 'Enter' })
      wrapper.vm.answer()
      await nextTick()

      expect(document.activeElement).toBe(rows[2].element)
    })

    it('leaves the focus where the user moved it before the item left', async () => {
      wrapper = mount(SlowItemList, { attachTo: document.body })
      const rows = wrapper.findAllComponents(TransferListItem)
      const elsewhere = wrapper.find('.elsewhere').element

      rows[1].element.focus()
      await rows[1].trigger('keydown', { key: 'Enter' })
      elsewhere.focus()
      wrapper.vm.answer()
      await nextTick()

      expect(document.activeElement).toBe(elsewhere)
    })

    // A mouse user would otherwise add the next item with Space, the key
    // that scrolls the page.
    it('stays out of the list after a click', async () => {
      const rows = mountList()

      rows[1].element.focus()
      await rows[1].trigger('click')
      await nextTick()

      expect([rows[0].element, rows[2].element]).not.toContain(
        document.activeElement
      )
    })
  })
})
