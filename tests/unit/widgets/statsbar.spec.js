import { shallowMount } from '@vue/test-utils'

import StatsBar from '@/components/widgets/StatsBar.vue'

const data = [
  ['done', 3, 'green', true],
  ['todo', 0, 'grey', false],
  ['wip', 1, 'blue', false]
]

const mountBar = (props = {}) => shallowMount(StatsBar, { props: { data, ...props } })

describe('StatsBar', () => {
  it('draws one segment per status holding a value, sized by that value', () => {
    const segments = mountBar().findAll('.segment')
    expect(segments.map(segment => segment.element.style.flexGrow)).toEqual([
      '3',
      '1'
    ])
    expect(
      segments.map(segment => segment.element.style.backgroundColor)
    ).toEqual(['green', 'blue'])
  })

  it('details each segment on hover', () => {
    const segments = mountBar().findAll('.segment')
    expect(segments.map(segment => segment.attributes('title'))).toEqual([
      'done: 3 (75%)',
      'wip: 1 (25%)'
    ])
  })

  it('describes the whole split to assistive technologies', () => {
    expect(mountBar().find('[role="img"]').attributes('aria-label')).toBe(
      'done: 3 (75%), wip: 1 (25%)'
    )
  })

  it('writes the share of done statuses next to the bar', () => {
    expect(mountBar().find('.done-share').text()).toBe('75%')
  })

  it('reads 100% and 0% only for a full and an empty share', () => {
    const wrapper = mountBar({
      data: [
        ['done', 249, 'green', true],
        ['retake', 1, 'red', false]
      ]
    })
    expect(wrapper.find('.done-share').text()).toBe('99%')
    expect(
      wrapper.findAll('.segment').map(segment => segment.attributes('title'))
    ).toEqual(['done: 249 (99%)', 'retake: 1 (1%)'])
  })

  it('draws nothing when there is no value', () => {
    const wrapper = mountBar({ data: [['todo', 0, 'grey', false]] })
    expect(wrapper.find('.bar').exists()).toBe(false)
  })
})
