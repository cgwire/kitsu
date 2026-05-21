import { mount } from '@vue/test-utils'

import PeopleName from '@/components/widgets/PeopleName.vue'

const mountName = person =>
  mount(PeopleName, { props: { person, withLink: false } })

describe('widgets/PeopleName', () => {
  test('renders the embedded full_name', () => {
    const wrapper = mountName({ id: 'person-guest', full_name: 'Guest Author' })
    expect(wrapper.find('.person-name').text()).toEqual('Guest Author')
  })

  test('falls back to the client-computed name when full_name is missing', () => {
    const wrapper = mountName({ id: 'person-guest', name: 'Guest Author' })
    expect(wrapper.find('.person-name').text()).toEqual('Guest Author')
  })

  test('renders empty when neither full_name nor name is set', () => {
    const wrapper = mountName({ id: 'person-guest' })
    expect(wrapper.find('.person-name').text()).toEqual('')
  })
})
