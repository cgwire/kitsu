import { mount } from '@vue/test-utils'
import { createRouter, createWebHashHistory } from 'vue-router'
import { describe, expect, it } from 'vitest'

import SettingsLayout from '@/components/pages/production/SettingsLayout.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [{ path: '/settings', component: { template: '<div />' } }]
})

const menuGroups = [
  {
    label: 'group.one',
    items: [
      { id: 'parameters', label: 'item.parameters' },
      { id: 'video', label: 'item.video' }
    ]
  },
  { label: 'group.two', items: [{ id: 'board', label: 'item.board' }] }
]

const mountLayout = async () => {
  await router.push('/settings?tab=video')
  await router.isReady()
  return mount(SettingsLayout, {
    props: { menuGroups, activeTab: 'video' },
    slots: { default: '<div class="tab">Video content</div>' },
    global: { plugins: [router], mocks: { $t: key => key } }
  })
}

describe('SettingsLayout', () => {
  it('renders the groups and their labels', async () => {
    const wrapper = await mountLayout()
    expect(wrapper.classes()).toContain('settings-page')
    expect(
      wrapper.findAll('.settings-menu .menu-label').map(label => label.text())
    ).toEqual(['group.one', 'group.two'])
    expect(
      wrapper.findAll('.settings-menu li a').map(link => link.text())
    ).toEqual(['item.parameters', 'item.video', 'item.board'])
  })

  it('marks the active item', async () => {
    const wrapper = await mountLayout()
    const rows = wrapper.findAll('.settings-menu li')
    expect(rows.map(row => row.classes('is-active'))).toEqual([
      false,
      true,
      false
    ])
    const links = wrapper.findAll('.settings-menu li a')
    expect(links[1].attributes('aria-current')).toBe('page')
    expect(links[0].attributes('aria-current')).toBeUndefined()
  })

  it('links each item to its tab', async () => {
    const wrapper = await mountLayout()
    expect(
      wrapper.findAll('.settings-menu li a').map(link => link.attributes('href'))
    ).toEqual(['#/settings?tab=parameters', '#/settings?tab=video', '#/settings?tab=board'])
  })

  it('renders the tabs of the slot in the content', async () => {
    const wrapper = await mountLayout()
    expect(wrapper.find('.settings-content .tab').text()).toBe('Video content')
  })
})
