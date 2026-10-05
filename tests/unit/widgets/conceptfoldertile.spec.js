import { mount } from '@vue/test-utils'

import ConceptFolderTile from '@/components/widgets/ConceptFolderTile.vue'

describe('ConceptFolderTile', () => {
  test('shows the name and the count of the folder', () => {
    const wrapper = mount(ConceptFolderTile, {
      props: { name: 'Sets', count: 0 }
    })

    expect(wrapper.find('.folder-name').text()).toBe('Sets')
    expect(wrapper.find('.folder-count').text()).toBe('0')
  })

  test('shows no count when none is given', () => {
    const wrapper = mount(ConceptFolderTile, { props: { name: 'Sets' } })

    expect(wrapper.find('.folder-count').exists()).toBe(false)
  })
})
