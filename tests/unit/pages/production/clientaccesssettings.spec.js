import { shallowMount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import ClientAccessSettings from '@/components/pages/production/ClientAccessSettings.vue'
import ValidationTag from '@/components/widgets/ValidationTag.vue'

const mountSettings = (props = {}) =>
  shallowMount(ClientAccessSettings, {
    props,
    global: { mocks: { $t: key => key } }
  })

describe('ClientAccessSettings', () => {
  it('emits update-setting for the isolation and the access flags', () => {
    const wrapper = mountSettings({ settings: { is_clients_isolated: true } })
    const isolation = wrapper.findComponent('.isolation')
    expect(isolation.props('modelValue')).toBe(true)
    isolation.vm.$emit('change', false)
    wrapper.findComponent('.access-task-panel').vm.$emit('change', false)
    expect(wrapper.emitted('update-setting')).toEqual([
      ['is_clients_isolated', false],
      ['is_client_task_panel_visible', false]
    ])
  })

  it('checks an access flag unless it is false', () => {
    const wrapper = mountSettings({
      settings: {
        is_client_stats_visible: null,
        is_client_task_list_visible: false
      }
    })
    const value = name =>
      wrapper.findComponent(`.access-${name}`).props('modelValue')
    expect(value('stats')).toBe(true)
    expect(value('task-list')).toBe(false)
    expect(value('task-panel')).toBe(true)
    expect(wrapper.find('.access-task-list-hint').exists()).toBe(true)
  })

  it('groups the task types by entity without the concept ones', () => {
    const wrapper = mountSettings({
      taskTypes: [
        { id: 't1', name: 'Modeling', for_entity: 'Asset' },
        { id: 't2', name: 'Layout', for_entity: 'Shot', is_client_visible: false },
        { id: 't3', name: 'Concept', for_entity: 'Concept' }
      ]
    })
    expect(
      wrapper.findAll('.task-type-group-title').map(title => title.text())
    ).toEqual(['assets.title', 'shots.title'])
    const boxes = wrapper.findAllComponents('.access-task-type')
    expect(boxes.map(box => box.props('modelValue'))).toEqual([true, false])
    boxes[1].vm.$emit('change', true)
    expect(wrapper.emitted('set-task-type-visible')).toEqual([['t2', true]])
  })

  it('sends null for a status brought back to its studio value', () => {
    const wrapper = mountSettings({
      taskStatuses: [
        { id: 's1', is_client_allowed: false, link_is_client_allowed: true },
        { id: 's2', is_client_allowed: true, link_is_client_allowed: null },
        { id: 's3', is_client_allowed: true, link_is_client_allowed: true }
      ]
    })
    const items = wrapper.findAll('.status-item')
    expect(items[0].findComponent(ValidationTag).props('task')).toEqual({
      task_status_id: 's1'
    })
    expect(items.map(item => item.classes('is-overridden'))).toEqual([
      true,
      false,
      false
    ])
    expect(
      items.map(item =>
        item.findComponent('.status-client-allowed').props('modelValue')
      )
    ).toEqual([true, true, true])

    items[0].findComponent('.status-client-allowed').vm.$emit('change', false)
    items[1].findComponent('.status-client-allowed').vm.$emit('change', false)
    expect(wrapper.emitted('set-status-client-allowed')).toEqual([
      ['s1', null],
      ['s2', false]
    ])
  })

  it('resets every overridden status, and only those', async () => {
    const wrapper = mountSettings({
      taskStatuses: [
        { id: 's1', is_client_allowed: false, link_is_client_allowed: true },
        { id: 's2', is_client_allowed: true }
      ]
    })
    await wrapper.find('.statuses-reset').trigger('click')
    expect(wrapper.emitted('set-status-client-allowed')).toEqual([['s1', null]])
  })

  it('hides the reset without an override and disables it while saving', async () => {
    const wrapper = mountSettings({
      taskStatuses: [{ id: 's1', is_client_allowed: true }]
    })
    expect(wrapper.find('.statuses-reset').exists()).toBe(false)
    expect(wrapper.find('.empty').exists()).toBe(false)
    await wrapper.setProps({
      isSaving: true,
      taskStatuses: [
        { id: 's1', is_client_allowed: true, link_is_client_allowed: false }
      ]
    })
    expect(wrapper.find('.statuses-reset').attributes('disabled')).toBe('')
  })

  it('says when there is no status', () => {
    const wrapper = mountSettings()
    expect(wrapper.find('.statuses .empty').exists()).toBe(true)
  })

  // The production wording reads wrong on a template page.
  it.each([
    [false, 'productions.clients'],
    [true, 'project_templates.clients']
  ])('words the template texts when isTemplate is %s', (isTemplate, prefix) => {
    const wrapper = mountSettings({ isTemplate })
    const overridden = mountSettings({
      isTemplate,
      taskStatuses: [{ id: 's1', link_is_client_allowed: true }]
    })

    expect(wrapper.find('.access-section .description').text()).toBe(
      `${prefix}.access_description`
    )
    expect(wrapper.findAll('.access-option .hint')[0].text()).toBe(
      `${prefix}.access_stats_description`
    )
    expect(wrapper.find('.statuses .empty').text()).toBe(
      `${prefix}.statuses_empty`
    )
    expect(overridden.find('.status-origin').text()).toBe(
      `${prefix}.statuses_overridden`
    )
  })
})
