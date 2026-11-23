import { mount, RouterLinkStub } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import ButtonLink from '@/components/widgets/ButtonLink.vue'

const mountLink = props =>
  mount(ButtonLink, {
    props: { icon: 'plus', path: '/people', text: 'New person', ...props },
    global: { stubs: { RouterLink: RouterLinkStub } }
  })

describe('ButtonLink', () => {
  // Touch screens show the icon alone: the text, hidden from sight only,
  // stays the name of the link.
  it('keeps a responsive text for screen readers on touch screens', () => {
    const text = mountLink({ isResponsive: true }).find('span')

    expect(text.text()).toBe('New person')
    expect(text.classes()).toEqual(['visuallyhidden-touch'])
  })

  it('shows its text on every screen by default', () => {
    expect(mountLink().find('span').classes()).toEqual([])
  })
})
