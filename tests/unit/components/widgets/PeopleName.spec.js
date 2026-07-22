import { mount } from '@vue/test-utils'

import PeopleName from '@/components/widgets/PeopleName.vue'

// withLink is false in every case, so router-link never renders, yet Vue
// still resolves it at the top of the render fn, so stub it to avoid the warning.
const mountName = person =>
  mount(PeopleName, {
    props: { person, withLink: false },
    global: { stubs: { RouterLink: true } }
  })

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
