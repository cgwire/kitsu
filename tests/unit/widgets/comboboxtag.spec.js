import { flushPromises, mount, shallowMount } from '@vue/test-utils'
import { h, ref } from 'vue'

import i18n from '@/lib/i18n'
import BaseModal from '@/components/modals/BaseModal.vue'
import ComboboxTag from '@/components/widgets/ComboboxTag.vue'

import './setup'

describe('ComboboxTag', () => {
  const options = [
    { id: '1', label: 'Banana', value: 'banana' },
    { id: '2', label: 'Apple', value: 'apple' },
    { id: '3', label: 'Cherry', value: 'cherry' }
  ]

  // The list teleports to the app root: render it in place instead.
  const inPlace = { plugins: [i18n], stubs: { teleport: true } }

  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(ComboboxTag, {
      props: { options, modelValue: 'apple,cherry' },
      global: inPlace
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('displays selected values as comma-separated sorted text', () => {
    const selectedLine = wrapper.find('.selected-line')
    expect(selectedLine.text()).toBe('apple, cherry')
  })

  it('does not show the dropdown initially', () => {
    expect(wrapper.find('.select-input').exists()).toBe(false)
  })

  it('renders checkboxes for all options', async () => {
    await wrapper.find('.flexrow').trigger('click')
    const checkboxes = wrapper.findAll('input[type="checkbox"]')
    expect(checkboxes).toHaveLength(3)
  })

  it('checks boxes matching selected values', async () => {
    await wrapper.find('.flexrow').trigger('click')
    const checkboxes = wrapper.findAll('input[type="checkbox"]')
    const checked = checkboxes.filter(cb => cb.element.checked)
    expect(checked).toHaveLength(2)
  })

  it('emits update:model-value when an unchecked option is clicked', async () => {
    await wrapper.find('.flexrow').trigger('click')
    const optionLines = wrapper.findAll('.option-line')
    // options are sorted by value: apple, banana, cherry
    const bananaOption = optionLines.find(
      o => o.text().trim().includes('Banana')
    )
    await bananaOption.trigger('click')
    expect(wrapper.emitted('update:model-value')).toBeTruthy()
    const emittedValue = wrapper.emitted('update:model-value')[0][0]
    expect(emittedValue).toContain('banana')
    expect(emittedValue).toContain('apple')
    expect(emittedValue).toContain('cherry')
  })

  it('emits update:model-value removing a checked option on click', async () => {
    await wrapper.find('.flexrow').trigger('click')
    const optionLines = wrapper.findAll('.option-line')
    const appleOption = optionLines.find(
      o => o.text().trim().includes('Apple')
    )
    await appleOption.trigger('click')
    expect(wrapper.emitted('update:model-value')).toBeTruthy()
    const emittedValue = wrapper.emitted('update:model-value')[0][0]
    expect(emittedValue).not.toContain('apple')
    expect(emittedValue).toContain('cherry')
  })

  it('also emits change event on selection', async () => {
    await wrapper.find('.flexrow').trigger('click')
    const optionLines = wrapper.findAll('.option-line')
    await optionLines[0].trigger('click')
    expect(wrapper.emitted('change')).toBeTruthy()
  })

  it('does not select when disabled', async () => {
    await wrapper.setProps({ disabled: true })
    await wrapper.find('.flexrow').trigger('click')
    const optionLines = wrapper.findAll('.option-line')
    await optionLines[0].trigger('click')
    expect(wrapper.emitted('update:model-value')).toBeFalsy()
  })

  it('renders label when provided', async () => {
    await wrapper.setProps({ label: 'Tags' })
    expect(wrapper.find('label').text()).toBe('Tags')
  })

  it('hides label when empty', () => {
    expect(wrapper.find('label').exists()).toBe(false)
  })

  it('shows empty text when no values selected', () => {
    const w = shallowMount(ComboboxTag, {
      props: { options, modelValue: '' },
      global: inPlace
    })
    expect(w.find('.selected-line').text()).toBe('')
  })

  it('exposes combobox/listbox ARIA roles with multiselectable', async () => {
    const trigger = wrapper.find('.flexrow')
    expect(trigger.attributes('role')).toBe('combobox')
    expect(trigger.attributes('tabindex')).toBe('0')
    await trigger.trigger('click')
    const list = wrapper.find('.select-input')
    expect(list.attributes('role')).toBe('listbox')
    expect(list.attributes('aria-multiselectable')).toBe('true')
    const optionLines = wrapper.findAll('.option-line')
    expect(optionLines[0].attributes('role')).toBe('option')
  })

  it('toggles the active option on Enter via keyboard', async () => {
    const trigger = wrapper.find('.flexrow')
    // options sorted by value: apple, banana, cherry — 1st ArrowDown opens,
    // the next two move the cursor to index 1 (banana).
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key: 'Enter' })
    const emittedValue = wrapper.emitted('update:model-value')[0][0]
    expect(emittedValue).toContain('banana')
  })

  it('keeps the list open after selecting via keyboard', async () => {
    const trigger = wrapper.find('.flexrow')
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key: 'Enter' })
    expect(wrapper.find('.select-input').exists()).toBe(true)
  })

  it('closes the dropdown on Escape', async () => {
    const trigger = wrapper.find('.flexrow')
    await trigger.trigger('click')
    expect(wrapper.find('.select-input').exists()).toBe(true)
    await trigger.trigger('keydown', { key: 'Escape' })
    expect(wrapper.find('.select-input').exists()).toBe(false)
  })

  describe('scroll on open', () => {
    beforeEach(() => {
      // jsdom does not scroll elements: scrollTo only records the position.
      HTMLElement.prototype.scrollTo = function ({ top }) {
        this.scrollTop = top
      }
    })

    afterEach(() => {
      delete HTMLElement.prototype.scrollTo
    })

    it('opens the list at its first option', async () => {
      const tags = ['anim', 'cloth', 'crowd', 'fx', 'hair', 'layout', 'rig']
      const w = shallowMount(ComboboxTag, {
        props: {
          options: tags.map(tag => ({ label: tag, value: tag })),
          modelValue: 'fx'
        },
        global: inPlace
      })
      await w.find('.flexrow').trigger('click')
      await flushPromises()
      expect(w.find('.select-input').element.scrollTop).toBe(0)
      w.unmount()
    })
  })

  describe('list over the page', () => {
    let theme, w

    beforeEach(() => {
      // The list teleports to the app root that App.vue renders.
      theme = document.createElement('div')
      theme.className = 'theme'
      document.body.appendChild(theme)
      vi.stubGlobal('innerWidth', 1912)
      vi.stubGlobal('innerHeight', 962)
    })

    afterEach(() => {
      w.unmount()
      theme.remove()
      vi.unstubAllGlobals()
      vi.restoreAllMocks()
    })

    const list = () => document.querySelector('.theme .select-input')

    // jsdom lays nothing out: the combo gets the rect of a laid out one, the
    // list the size of ten tags.
    const mockRects = comboRect => {
      vi.spyOn(
        HTMLElement.prototype,
        'getBoundingClientRect'
      ).mockImplementation(function () {
        return this.classList.contains('select-input')
          ? { width: 172, height: 180 }
          : comboRect
      })
    }

    const mountAt = (comboRect, mountOptions = {}) => {
      mockRects(comboRect)
      w = mount(ComboboxTag, {
        props: { options, modelValue: 'apple', shy: true, withMargin: false },
        global: { plugins: [i18n] },
        ...mountOptions
      })
    }

    const openAt = async (comboRect, mountOptions) => {
      mountAt(comboRect, mountOptions)
      await w.find('[role="combobox"]').trigger('click')
      await flushPromises()
    }

    const roomBelow = { top: 300, bottom: 340, left: 573, right: 683 }

    // A page element in the document, for the events that reach the window.
    const addPage = () => {
      const page = document.createElement('div')
      theme.appendChild(page)
      return page
    }

    it('opens the list above a combo at the bottom of the window', async () => {
      // Last row of a list scrolled to its end: 43 px left under the combo.
      await openAt({ top: 872, bottom: 912, left: 573, right: 683 })
      expect(list()).not.toBeNull()
      expect(list().style.top).toBe('')
      expect(list().style.bottom).toBe('89px')
      expect(list().style.left).toBe('573px')
      expect(list().style.maxHeight).toBe('180px')
      expect(list().classList.contains('above')).toBe(true)
      expect(w.find('.combo').classes()).toContain('above')
    })

    it('opens the list below a combo with room under it', async () => {
      await openAt(roomBelow)
      expect(list().style.top).toBe('339px')
      expect(list().style.bottom).toBe('')
      expect(list().style.maxHeight).toBe('180px')
      expect(list().classList.contains('above')).toBe(false)
    })

    it('bounds the list to the larger side when no side holds it', async () => {
      vi.stubGlobal('innerHeight', 300)
      await openAt({ top: 100, bottom: 140, left: 573, right: 683 })
      expect(list().style.top).toBe('139px')
      expect(list().style.maxHeight).toBe('153px')
    })

    it('places the list opened from the keyboard', async () => {
      mountAt({ top: 872, bottom: 912, left: 573, right: 683 })
      await w.find('[role="combobox"]').trigger('keydown', { key: 'ArrowDown' })
      await flushPromises()
      expect(list().style.bottom).toBe('89px')
    })

    it('closes the list on a click outside of it', async () => {
      await openAt(roomBelow)
      document.querySelector('.theme .c-mask').click()
      await flushPromises()
      expect(list()).toBeNull()
    })

    it('closes the list when an Escape closes the modal around it', async () => {
      const ModalHost = {
        setup() {
          const active = ref(true)
          return () =>
            h(
              BaseModal,
              {
                active: active.value,
                onCancel: () => {
                  active.value = false
                }
              },
              () => h(ComboboxTag, { options, modelValue: 'apple' })
            )
        }
      }
      mockRects(roomBelow)
      w = mount(ModalHost, { global: { plugins: [i18n] } })
      await w.find('[role="combobox"]').trigger('click')
      await flushPromises()
      list().querySelector('.option-line').click()
      // With the focus off the combo, the Escape only reaches the window.
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
      await flushPromises()
      expect(w.find('.modal').classes()).not.toContain('is-active')
      expect(list()).toBeNull()
      expect(document.querySelector('.theme > .c-mask')).toBeNull()
    })

    it('closes the list on an Escape from the combo', async () => {
      await openAt(roomBelow, { attachTo: addPage() })
      await w.find('[role="combobox"]').trigger('keydown', { key: 'Escape' })
      await flushPromises()
      expect(list()).toBeNull()
    })

    it('closes the list when the page under it scrolls', async () => {
      const page = addPage()
      await openAt(roomBelow, { attachTo: page })
      page.dispatchEvent(new Event('scroll'))
      await flushPromises()
      expect(list()).toBeNull()
    })

    it('keeps the list open when the list itself scrolls', async () => {
      await openAt(roomBelow, { attachTo: addPage() })
      list().dispatchEvent(new Event('scroll'))
      await flushPromises()
      expect(list()).not.toBeNull()
    })

    it('closes the list when the window resizes', async () => {
      await openAt(roomBelow)
      window.dispatchEvent(new Event('resize'))
      await flushPromises()
      expect(list()).toBeNull()
    })

    it('links the combo to its open list', async () => {
      mountAt(roomBelow)
      const trigger = w.find('[role="combobox"]')
      expect(trigger.attributes('aria-controls')).toBeUndefined()
      await trigger.trigger('click')
      await flushPromises()
      expect(list().id).not.toBe('')
      expect(trigger.attributes('aria-controls')).toBe(list().id)
    })

    it('leaves the focus on the combo on a mouse press on an option', async () => {
      await openAt(roomBelow)
      const press = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true
      })
      list().querySelector('.option-line').dispatchEvent(press)
      expect(press.defaultPrevented).toBe(true)
    })
  })
})
