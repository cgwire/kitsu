import { shallowMount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createStore } from 'vuex'

import i18n from '@/lib/i18n'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'

import { resetFullScreen, setFullScreenElement } from '../fixtures/full-screen'
import './setup'

describe('ComboboxTaskType', () => {
  let store, wrapper

  const taskTypeList = [
    { id: 'tt-1', name: 'Modeling', color: '#ECECEC' },
    { id: 'tt-2', name: 'Animation', color: '#22D160' },
    { id: 'tt-3', name: 'Rigging', color: '#4ABB56' }
  ]

  beforeEach(() => {
    store = createStore({
      strict: true,
      getters: {
        isDarkTheme: () => false,
        taskTypeMap: () => new Map(taskTypeList.map(tt => [tt.id, tt]))
      }
    })

    wrapper = shallowMount(ComboboxTaskType, {
      props: {
        taskTypeList,
        modelValue: 'tt-2'
      },
      global: {
        plugins: [i18n, store],
        // The option list renders through <teleport to="body">; shallowMount
        // stubs it out by default, so opt back into the real teleport.
        stubs: { teleport: false }
      }
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  // The option list renders through <teleport to="body">, so it lands
  // outside wrapper.element and has to be queried on the real document.
  const findTeleportedList = () => document.querySelector('.select-input')

  it('exposes combobox/listbox ARIA roles', async () => {
    const trigger = wrapper.find('.flexrow.selector')
    expect(trigger.attributes('role')).toBe('combobox')
    expect(trigger.attributes('tabindex')).toBe('0')
    await trigger.trigger('click')
    expect(trigger.attributes('aria-expanded')).toBe('true')
    expect(findTeleportedList().getAttribute('role')).toBe('listbox')
  })

  it('opens and selects a task type via keyboard', async () => {
    const trigger = wrapper.find('.flexrow.selector')
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:model-value')[0]).toEqual(['tt-3'])
  })

  it('closes on Escape', async () => {
    const trigger = wrapper.find('.flexrow.selector')
    await trigger.trigger('click')
    expect(findTeleportedList()).not.toBeNull()
    await trigger.trigger('keydown', { key: 'Escape' })
    expect(findTeleportedList()).toBeNull()
  })

  // The browser shows the element in full screen alone, like a player
  // holding the move comment modal: the list opens inside it.
  describe('in full screen', () => {
    let player = null

    const openIn = async element => {
      wrapper.unmount()
      wrapper = shallowMount(ComboboxTaskType, {
        props: { taskTypeList, modelValue: 'tt-2' },
        attachTo: element.appendChild(document.createElement('div')),
        global: { plugins: [i18n, store], stubs: { teleport: false } }
      })
      await nextTick()
      await wrapper.find('.flexrow.selector').trigger('click')
      return findTeleportedList()
    }

    beforeEach(() => {
      player = document.body.appendChild(document.createElement('div'))
      vi.spyOn(window, 'pageYOffset', 'get').mockReturnValue(300)
    })

    afterEach(() => {
      resetFullScreen()
      player.remove()
      vi.restoreAllMocks()
    })

    // The element starts at the top of the screen, whatever the scroll of
    // the page, and its modals are above the page's.
    it('opens its list inside it, over its modals', async () => {
      setFullScreenElement(player)

      const list = await openIn(player)

      expect(list.parentElement).toBe(player)
      expect(list.classList.contains('in-full-screen')).toBe(true)
      expect(list.style.top).toBe('35px')
    })

    it('opens its list in <body> out of it, below the page scroll', async () => {
      const list = await openIn(player)

      expect(list.parentElement).toBe(document.body)
      expect(list.classList.contains('in-full-screen')).toBe(false)
      expect(list.style.top).toBe('335px')
    })

    // The list would stay where the full screen put it.
    it('closes its list as the full screen ends', async () => {
      setFullScreenElement(player)
      await openIn(player)

      setFullScreenElement(null)
      await nextTick()

      expect(findTeleportedList()).toBeNull()
    })
  })

  it('removes the trigger from tab order when disabled', async () => {
    await wrapper.setProps({ disabled: true })
    const trigger = wrapper.find('.flexrow.selector')
    expect(trigger.attributes('tabindex')).toBe('-1')
  })

  it('does not open when disabled', async () => {
    await wrapper.setProps({ disabled: true })
    const trigger = wrapper.find('.flexrow.selector')
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    expect(findTeleportedList()).toBeNull()
  })
})
