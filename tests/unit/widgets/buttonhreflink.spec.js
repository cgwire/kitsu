import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import ButtonHrefLink from '@/components/widgets/ButtonHrefLink.vue'

describe('ButtonHrefLink', () => {
  // Every caller links to a CSV export that Zou serves as an attachment.
  it('downloads its file without leaving the page', () => {
    const wrapper = mount(ButtonHrefLink, {
      props: { path: '/api/export/csv/persons.csv', icon: 'download' }
    })
    // The link is the only root, so the classes of the caller land on it.
    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('href')).toBe('/api/export/csv/persons.csv')
    expect(wrapper.attributes('download')).toBe('')
  })
})
