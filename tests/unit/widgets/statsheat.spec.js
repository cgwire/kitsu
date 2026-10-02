import { shallowMount } from '@vue/test-utils'

import StatsHeat from '@/components/widgets/StatsHeat.vue'

const mountHeat = data => shallowMount(StatsHeat, { props: { data } })

const heat = wrapper =>
  Number(wrapper.find('.stats-heat').element.style.getPropertyValue('--heat'))

describe('StatsHeat', () => {
  it('writes the share of done statuses', () => {
    const wrapper = mountHeat([
      ['done', 3, 'green', true],
      ['wip', 1, 'blue', false]
    ])
    expect(wrapper.find('.stats-heat').text()).toBe('75%')
  })

  it('gets more intense as the done share grows', () => {
    const none = heat(mountHeat([['wip', 4, 'blue', false]]))
    const half = heat(
      mountHeat([
        ['done', 2, 'green', true],
        ['wip', 2, 'blue', false]
      ])
    )
    const full = heat(mountHeat([['done', 4, 'green', true]]))
    expect(none).toBeGreaterThan(0)
    expect(half).toBeGreaterThan(none)
    expect(full).toBeGreaterThan(half)
    expect(full).toBeLessThanOrEqual(1)
  })

  it('details the done value on hover', () => {
    const wrapper = mountHeat([
      ['done', 3, 'green', true],
      ['wip', 1, 'blue', false]
    ])
    expect(wrapper.find('.stats-heat').attributes('title')).toBe('3 / 4')
  })

  it('draws nothing when there is no value', () => {
    expect(mountHeat([]).find('.stats-heat').exists()).toBe(false)
  })
})
