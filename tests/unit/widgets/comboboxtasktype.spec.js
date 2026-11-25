import { nextTick } from 'vue'
import { createStore } from 'vuex'

import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'

import { resetFullScreen, setFullScreenElement } from '../fixtures/full-screen'
import { shallowMountWithI18n } from '../fixtures/i18n'

describe('ComboboxTaskType', () => {
  let store, wrapper

  const taskTypeList = [
    { id: 'tt-1', name: 'Modeling', color: '#ECECEC' },
    { id: 'tt-2', name: 'Animation', color: '#22D160' },
    { id: 'tt-3', name: 'Rigging', color: '#4ABB56' }
  ]

  const makeStore = ({ isDarkTheme = false } = {}) =>
    createStore({
      strict: true,
      state: { isDarkTheme },
      getters: {
        isDarkTheme: state => state.isDarkTheme,
        taskTypeMap: () => new Map(taskTypeList.map(tt => [tt.id, tt]))
      },
      mutations: {
        setDarkTheme: (state, isDark) => {
          state.isDarkTheme = isDark
        }
      }
    })

  beforeEach(() => {
    store = makeStore()

    wrapper = shallowMountWithI18n(ComboboxTaskType, {
      props: {
        taskTypeList,
        modelValue: 'tt-2'
      },
      global: {
        plugins: [store],
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

  it('names the combobox by its label', () => {
    const labeled = shallowMountWithI18n(ComboboxTaskType, {
      props: { label: 'Task Type', taskTypeList, modelValue: 'tt-2' },
      global: { plugins: [store], stubs: { teleport: false } }
    })
    const labelId = labeled.find('label').attributes('id')
    expect(labelId).toBeTruthy()
    expect(
      labeled.find('[role="combobox"]').attributes('aria-labelledby')
    ).toBe(labelId)
    expect(
      wrapper.find('[role="combobox"]').attributes('aria-labelledby')
    ).toBeUndefined()
    labeled.unmount()
  })

  it('names the combobox without a label', () => {
    const named = shallowMountWithI18n(ComboboxTaskType, {
      props: { ariaLabel: 'Task type', taskTypeList, modelValue: 'tt-2' },
      global: { plugins: [store], stubs: { teleport: false } }
    })
    expect(named.find('[role="combobox"]').attributes('aria-label')).toBe(
      'Task type'
    )
    expect(
      wrapper.find('[role="combobox"]').attributes('aria-label')
    ).toBeUndefined()
    named.unmount()
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

  it('opens a light list in the light theme', async () => {
    await wrapper.find('.flexrow.selector').trigger('click')

    expect(findTeleportedList().classList.contains('dark')).toBe(false)
  })

  it('opens a dark list in the dark theme', async () => {
    wrapper.unmount()
    wrapper = shallowMountWithI18n(ComboboxTaskType, {
      props: { taskTypeList, modelValue: 'tt-2' },
      global: {
        plugins: [makeStore({ isDarkTheme: true })],
        stubs: { teleport: false }
      }
    })

    await wrapper.find('.flexrow.selector').trigger('click')

    expect(findTeleportedList().classList.contains('dark')).toBe(true)
  })

  // A page can stay dark in the light theme, such as the Playlists page.
  describe('in a dark area', () => {
    let area = null

    beforeEach(() => {
      area = document.body.appendChild(document.createElement('div'))
      area.classList.add('dark')
      wrapper.unmount()
      wrapper = shallowMountWithI18n(ComboboxTaskType, {
        props: { taskTypeList, modelValue: 'tt-2' },
        attachTo: area.appendChild(document.createElement('div')),
        global: { plugins: [store], stubs: { teleport: false } }
      })
    })

    afterEach(() => {
      area.remove()
    })

    it('opens a dark list in the light theme', async () => {
      await wrapper.find('.flexrow.selector').trigger('click')

      expect(findTeleportedList().classList.contains('dark')).toBe(true)
    })

    it('opens a dark list from the keyboard', async () => {
      await wrapper
        .find('.flexrow.selector')
        .trigger('keydown', { key: 'ArrowDown' })

      expect(findTeleportedList().classList.contains('dark')).toBe(true)
    })

    // The list takes the theme of its area as it opens. In the dark theme,
    // that area is the dark root of the app, which the light theme removes.
    it('closes its list as the theme changes', async () => {
      store.commit('setDarkTheme', true)
      await nextTick()
      await wrapper.find('.flexrow.selector').trigger('click')
      expect(findTeleportedList().classList.contains('dark')).toBe(true)

      store.commit('setDarkTheme', false)
      area.classList.remove('dark')
      await nextTick()

      expect(findTeleportedList()).toBeNull()
    })
  })

  // The browser shows the element in full screen alone, like a player
  // holding the move comment modal: the list opens inside it.
  describe('in full screen', () => {
    let player = null

    const openIn = async element => {
      wrapper.unmount()
      wrapper = shallowMountWithI18n(ComboboxTaskType, {
        props: { taskTypeList, modelValue: 'tt-2' },
        attachTo: element.appendChild(document.createElement('div')),
        global: { plugins: [store], stubs: { teleport: false } }
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
