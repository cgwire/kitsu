import { mount } from '@vue/test-utils'
import { computed, defineComponent, nextTick, ref } from 'vue'

import { useComboboxKeyboard } from '@/composables/comboboxKeyboard'

const createWrapper = (optionCount = 3) => {
  const options = Array.from({ length: optionCount }, (_, i) => `option-${i}`)

  const TestComponent = defineComponent({
    setup() {
      const isOpen = ref(false)
      const selected = ref(null)
      const listRef = ref(null)
      const optionsLength = computed(() => options.length)

      const toggle = () => {
        isOpen.value = !isOpen.value
      }

      const onSelect = index => {
        selected.value = options[index]
        isOpen.value = false
      }

      const { activeIndex, onKeydown, optionId } = useComboboxKeyboard({
        isOpen,
        toggle,
        optionsLength,
        onSelect,
        listRef
      })

      return {
        isOpen,
        selected,
        options,
        toggle,
        activeIndex,
        onKeydown,
        optionId,
        listRef
      }
    },
    template: `
      <div>
        <div
          class="trigger"
          role="combobox"
          tabindex="0"
          :aria-expanded="isOpen"
          @click="toggle"
          @keydown="onKeydown"
        ></div>
        <ul class="list" ref="listRef" v-if="isOpen">
          <li
            v-for="(option, index) in options"
            :id="optionId(index)"
            :key="option"
          >{{ option }}</li>
        </ul>
      </div>
    `
  })

  return mount(TestComponent)
}

describe('composables/comboboxKeyboard', () => {
  it('opens the list on ArrowDown when closed', async () => {
    const wrapper = createWrapper()
    await wrapper.find('.trigger').trigger('keydown', { key: 'ArrowDown' })
    expect(wrapper.vm.isOpen).toBe(true)
  })

  it('opens the list on Enter when closed', async () => {
    const wrapper = createWrapper()
    await wrapper.find('.trigger').trigger('keydown', { key: 'Enter' })
    expect(wrapper.vm.isOpen).toBe(true)
  })

  it('clamps the active option at the last one on ArrowDown', async () => {
    const wrapper = createWrapper(2)
    // Opens, lands on the first option, moves to the last, then presses past it.
    await wrapper.find('.trigger').trigger('keydown', { key: 'ArrowDown' })
    await wrapper.find('.trigger').trigger('keydown', { key: 'ArrowDown' })
    await wrapper.find('.trigger').trigger('keydown', { key: 'ArrowDown' })
    await wrapper.find('.trigger').trigger('keydown', { key: 'ArrowDown' })
    expect(wrapper.vm.activeIndex).toBe(1)
  })

  it('clamps the active option at the first one on ArrowUp', async () => {
    const wrapper = createWrapper()
    await wrapper.find('.trigger').trigger('keydown', { key: 'ArrowDown' }) // opens, lands on none
    await wrapper.find('.trigger').trigger('keydown', { key: 'ArrowUp' }) // wraps to the last option
    await wrapper.find('.trigger').trigger('keydown', { key: 'ArrowUp' })
    await wrapper.find('.trigger').trigger('keydown', { key: 'ArrowUp' })
    await wrapper.find('.trigger').trigger('keydown', { key: 'ArrowUp' }) // clamps at 0
    expect(wrapper.vm.activeIndex).toBe(0)
  })

  it('selects the active option on Enter and closes the list', async () => {
    const wrapper = createWrapper()
    await wrapper.find('.trigger').trigger('keydown', { key: 'ArrowDown' })
    await wrapper.find('.trigger').trigger('keydown', { key: 'ArrowDown' })
    await wrapper.find('.trigger').trigger('keydown', { key: 'ArrowDown' })
    await wrapper.find('.trigger').trigger('keydown', { key: 'Enter' })
    expect(wrapper.vm.selected).toBe('option-1')
    expect(wrapper.vm.isOpen).toBe(false)
  })

  it('closes the list on Escape and resets the active option', async () => {
    const wrapper = createWrapper()
    await wrapper.find('.trigger').trigger('keydown', { key: 'ArrowDown' })
    await wrapper.find('.trigger').trigger('keydown', { key: 'Escape' })
    expect(wrapper.vm.isOpen).toBe(false)
    expect(wrapper.vm.activeIndex).toBe(-1)
  })

  it('closes the list on Tab', async () => {
    const wrapper = createWrapper()
    await wrapper.find('.trigger').trigger('keydown', { key: 'ArrowDown' })
    await wrapper.find('.trigger').trigger('keydown', { key: 'Tab' })
    expect(wrapper.vm.isOpen).toBe(false)
  })

  it('prevents Space from scrolling the page', async () => {
    const wrapper = createWrapper()
    const event = new KeyboardEvent('keydown', { key: ' ', cancelable: true })
    wrapper.find('.trigger').element.dispatchEvent(event)
    await nextTick()
    expect(event.defaultPrevented).toBe(true)
  })

  it('ignores unrelated keys', async () => {
    const wrapper = createWrapper()
    await wrapper.find('.trigger').trigger('keydown', { key: 'a' })
    expect(wrapper.vm.isOpen).toBe(false)
  })

  it('assigns each option a unique, stable id', () => {
    const wrapper = createWrapper()
    expect(wrapper.vm.optionId(0)).toBe(wrapper.vm.optionId(0))
    expect(wrapper.vm.optionId(0)).not.toBe(wrapper.vm.optionId(1))
  })
})
