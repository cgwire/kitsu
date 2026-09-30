import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import DayOffList from '@/components/lists/DayOffList.vue'

const mountList = props =>
  mount(DayOffList, {
    props,
    global: { stubs: { DayOffModal: true, DeleteModal: true } }
  })

describe('DayOffList', () => {
  it('says there is no day off when the list loaded empty', () => {
    const wrapper = mountList({ daysOff: [] })

    expect(wrapper.text()).toContain('days_off.no_days_off')
    expect(wrapper.find('.footer-info').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('main.loading_error')
  })

  it('shows the loading error instead of an empty list', () => {
    const wrapper = mountList({ daysOff: [], isError: true })

    expect(wrapper.text()).toContain('main.loading_error')
    expect(wrapper.text()).not.toContain('days_off.no_days_off')
    expect(wrapper.find('.footer-info').exists()).toBe(false)
  })
})
