import { mount } from '@vue/test-utils'
import { FolderIcon, FolderOpenIcon } from 'lucide-vue-next'

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

  test('opens its icon while a drop hovers it', () => {
    const closed = mount(ConceptFolderTile, { props: { name: 'Sets' } })
    const open = mount(ConceptFolderTile, {
      props: { name: 'Sets', highlighted: true }
    })

    expect(closed.findComponent(FolderIcon).exists()).toBe(true)
    expect(closed.findComponent(FolderOpenIcon).exists()).toBe(false)
    expect(open.findComponent(FolderOpenIcon).exists()).toBe(true)
  })
})
