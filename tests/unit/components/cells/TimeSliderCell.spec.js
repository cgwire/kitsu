import { shallowMount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createStore } from 'vuex'

import TimeSliderCell from '@/components/cells/TimeSliderCell.vue'

describe('TimeSliderCell', () => {
  const mountCell = (props, options = {}) =>
    shallowMount(TimeSliderCell, {
      ...options,
      global: {
        plugins: [createStore({ getters: { organisation: () => ({}) } })]
      },
      props: { taskId: 'task-1', ...props }
    })

  test('shows the new duration when the day changes', async () => {
    const wrapper = mountCell({ duration: 4 })
    await wrapper.setProps({ duration: 0 })
    expect(wrapper.find('input.value').element.value).toBe('0')
    expect(wrapper.emitted('change')).toBeUndefined()
  })

  test('emits a change when the user picks a value', async () => {
    const wrapper = mountCell({ duration: 4 })
    await wrapper.findComponent({ name: 'ButtonSimple' }).trigger('click')
    await nextTick()
    expect(wrapper.emitted('change')).toEqual([
      [{ taskId: 'task-1', duration: 1 }]
    ])
  })

  test('saves a duration typed by hand', async () => {
    const wrapper = mountCell({ duration: 4 })
    await wrapper.find('input.value').setValue('2.5')
    expect(wrapper.emitted('change')).toEqual([
      [{ taskId: 'task-1', duration: 2.5 }]
    ])
  })

  test('keeps a typed duration within the slider range', async () => {
    const wrapper = mountCell({ duration: 4 })
    await wrapper.find('input.value').setValue('15')
    expect(wrapper.emitted('change')).toEqual([
      [{ taskId: 'task-1', duration: 12 }]
    ])
    expect(wrapper.find('input.value').element.value).toBe('12')
  })

  // Firefox steps a focused number field on each wheel notch
  test('keeps the wheel from changing the typed duration', () => {
    const wrapper = mountCell({ duration: 4 }, { attachTo: document.body })
    const input = wrapper.find('input.value').element
    const wheel = () => {
      const event = new WheelEvent('wheel', { deltaY: -100, cancelable: true })
      input.dispatchEvent(event)
      return event
    }
    expect(wheel().defaultPrevented).toBe(false)
    input.focus()
    expect(wheel().defaultPrevented).toBe(true)
    wrapper.unmount()
  })
})
