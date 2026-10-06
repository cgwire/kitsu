import { flushPromises, mount } from '@vue/test-utils'

import PeopleField from '@/components/widgets/PeopleField.vue'

describe('PeopleField', () => {
  const mountField = async props => {
    const wrapper = mount(PeopleField, {
      props,
      global: { stubs: { PeopleAvatar: true } }
    })
    await flushPromises()
    await wrapper.find('.multiselect').trigger('focus')
    return wrapper
  }

  it('tells two people of the same name apart', async () => {
    const people = [
      { id: 'person-1', name: 'Alex Martin' },
      { id: 'person-2', name: 'Alex Martin' }
    ]
    const wrapper = await mountField({ people, modelValue: people[1] })

    expect(wrapper.findAll('.multiselect__option--selected')).toHaveLength(1)
  })

  describe('people list', () => {
    const people = [{ id: 'person-1', name: 'Alex Martin' }]
    const list = wrapper => wrapper.find('.multiselect__content-wrapper')

    // jsdom lays nothing out: the field sits at the top of a 768 px window.
    it('opens on the side with room by default', async () => {
      const wrapper = await mountField({ people })

      expect(wrapper.find('.multiselect').classes()).not.toContain(
        'multiselect--above'
      )
      expect(list(wrapper).element.style.maxHeight).toBe('300px')
    })

    it('opens on the given side, at most at the given height', async () => {
      const wrapper = await mountField({
        people,
        openDirection: 'above',
        listMaxHeight: 120
      })

      expect(wrapper.find('.multiselect').classes()).toContain(
        'multiselect--above'
      )
      expect(list(wrapper).element.style.maxHeight).toBe('120px')
    })
  })
})
