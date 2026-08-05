import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'

import EmptyList from '@/components/widgets/EmptyList.vue'

describe('widgets/EmptyList', () => {
  const mountList = (isCurrentUserManager, props = {}) =>
    mount(EmptyList, {
      global: {
        plugins: [
          createStore({
            getters: { isCurrentUserManager: () => isCurrentUserManager }
          })
        ]
      },
      props: {
        text: 'There are no shots in the production. How about creating some?',
        readOnlyText: 'There are no shots in this production.',
        buttonText: 'Create shots',
        ...props
      }
    })

  test('a manager is invited to create entities', async () => {
    const wrapper = mountList(true)
    expect(wrapper.text()).toContain('How about creating some?')

    const button = wrapper.find('button')
    expect(button.text()).toBe('Create shots')

    await button.trigger('click')
    expect(wrapper.emitted().create).toHaveLength(1)
  })

  test('anyone else gets the plain statement and no way to create', () => {
    const wrapper = mountList(false)
    expect(wrapper.text()).toContain('There are no shots in this production.')
    expect(wrapper.text()).not.toContain('How about creating some?')
    expect(wrapper.find('button').exists()).toBe(false)
  })

  test('lists without creation show no button, even to a manager', () => {
    const wrapper = mountList(true, { buttonText: '' })
    expect(wrapper.find('button').exists()).toBe(false)
  })

  test('the illustration defaults to the shared one and can be overridden', () => {
    expect(mountList(true).find('img').attributes('src')).toBeTruthy()
    expect(
      mountList(true, { illustration: 'empty_asset.png' })
        .find('img')
        .attributes('src')
    ).toBe('empty_asset.png')
  })
})
