import { shallowMount } from '@vue/test-utils'
import { describe, expect, test, vi } from 'vitest'
import { createStore } from 'vuex'

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: key => key }) }))

import AssetTypeSettings from '@/components/pages/production/AssetTypeSettings.vue'
import ComboboxTaskTypeOptions from '@/components/widgets/ComboboxTaskTypeOptions.vue'
import TaskTypeName from '@/components/widgets/TaskTypeName.vue'

const modeling = { id: 'modeling', name: 'Modeling', for_entity: 'Asset' }
const rigging = { id: 'rigging', name: 'Rigging', for_entity: 'Asset' }

const mountSettings = workflow => {
  const setAssetTypeWorkflow = vi.fn().mockResolvedValue()
  const store = createStore({
    getters: {
      currentProduction: () => ({ id: 'production-1' }),
      productionAssetTaskTypes: () => [modeling, rigging],
      getAssetTypeWorkflow: () => () => workflow
    },
    actions: { setAssetTypeWorkflow }
  })
  const wrapper = shallowMount(AssetTypeSettings, {
    props: { assetTypes: [{ id: 'character', name: 'Character' }] },
    global: { plugins: [store], mocks: { $t: key => key } }
  })
  return { wrapper, setAssetTypeWorkflow }
}

describe('AssetTypeSettings workflow', () => {
  test('names the columns of the list', () => {
    const { wrapper } = mountSettings([])
    const headers = wrapper.findAll('thead th').map(th => th.text())
    expect(headers.slice(0, 2)).toEqual([
      'asset_types.fields.name',
      'asset_types.fields.task_types'
    ])
  })

  test('hides studio task types that are not in the production', () => {
    const { wrapper } = mountSettings(['modeling', 'not-in-production'])
    const names = wrapper.findAllComponents(TaskTypeName)
    expect(names.map(name => name.props('taskType').id)).toEqual(['modeling'])
  })

  test('lists only the task types of the workflow as visible', () => {
    const { wrapper } = mountSettings(['modeling'])
    const combobox = wrapper.findComponent(ComboboxTaskTypeOptions)
    expect(combobox.props('taskTypes')).toEqual([modeling, rigging])
    expect(combobox.props('hidden')).toEqual(['rigging'])
  })

  test('an empty workflow hides nothing', () => {
    const { wrapper } = mountSettings([])
    const combobox = wrapper.findComponent(ComboboxTaskTypeOptions)
    expect(combobox.props('hidden')).toEqual([])
  })

  test('saves the visible task types of the production', () => {
    const { wrapper, setAssetTypeWorkflow } = mountSettings([
      'modeling',
      'not-in-production'
    ])
    wrapper.findComponent(ComboboxTaskTypeOptions).vm.$emit('update:hidden', [])
    expect(setAssetTypeWorkflow.mock.calls[0][1]).toEqual({
      assetTypeId: 'character',
      taskTypeIds: ['modeling', 'rigging']
    })
  })

  test('hiding every task type goes back to the studio workflow', () => {
    const { wrapper, setAssetTypeWorkflow } = mountSettings(['modeling'])
    wrapper
      .findComponent(ComboboxTaskTypeOptions)
      .vm.$emit('update:hidden', ['modeling', 'rigging'])
    expect(setAssetTypeWorkflow.mock.calls[0][1].taskTypeIds).toEqual([])
  })
})
