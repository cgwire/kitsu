import { flushPromises, mount } from '@vue/test-utils'

import PeopleField from '@/components/widgets/PeopleField.vue'

describe('PeopleField', () => {
  it('tells two people of the same name apart', async () => {
    const people = [
      { id: 'person-1', name: 'Alex Martin' },
      { id: 'person-2', name: 'Alex Martin' }
    ]
    const wrapper = mount(PeopleField, {
      props: { people, modelValue: people[1] },
      global: { stubs: { PeopleAvatar: true } }
    })
    await flushPromises()
    await wrapper.find('.multiselect').trigger('focus')

    expect(wrapper.findAll('.multiselect__option--selected')).toHaveLength(1)
  })
})
