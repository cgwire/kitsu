import { shallowMount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createStore } from 'vuex'

import TimeSliderCell from '@/components/cells/TimeSliderCell.vue'

describe('TimeSliderCell', () => {
  const mountCell = props =>
    shallowMount(TimeSliderCell, {
      global: {
        plugins: [createStore({ getters: { organisation: () => ({}) } })]
      },
      props: { taskId: 'task-1', ...props }
    })

  test('shows the new duration when the day changes', async () => {
    const wrapper = mountCell({ duration: 4 })
    await wrapper.setProps({ duration: 0 })
    expect(wrapper.find('.value').text()).toBe('0')
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
})
