vi.mock('@/store', () => ({ default: {} }))

import { flushPromises } from '@vue/test-utils'

import AssetList from '@/components/lists/AssetList.vue'
import assetTypeStore from '@/store/modules/assettypes'

import {
  descriptor,
  mountEntityList,
  production,
  setHeaderWidth,
  stickColumns,
  stickyLeft,
  stubHeaderWidths,
  stubResizeObserver,
  taskTypeId
} from '../../fixtures/entity-list'

const modelingId = 'task-type-modeling'
const riggingId = 'task-type-rigging'
const propsTypeId = 'asset-type-props'
const charactersTypeId = 'asset-type-characters'

const buildAsset = (validations, fields = {}) => ({
  id: 'asset-1',
  name: 'Asset 1',
  data: {},
  asset_type_id: propsTypeId,
  validations,
  ...fields
})

// The character accepts both task types, so both columns show: the
// selectability of the props cells is read on the first row.
const character = buildAsset(
  new Map([
    [modelingId, 'task-2'],
    [riggingId, 'task-3']
  ]),
  { id: 'asset-2', name: 'Asset 2', asset_type_id: charactersTypeId }
)

const selectableCells = async asset => {
  const wrapper = await mountEntityList(AssetList, {
    getters: {
      currentProduction: production,
      displayedAssetsCount: 2,
      productionAssetTaskTypes: [{ id: modelingId }, { id: riggingId }],
      taskMap: new Map([['task-1', { id: 'task-1' }]]),
      taskTypeMap: new Map([
        [modelingId, { id: modelingId, color: '#000000' }],
        [riggingId, { id: riggingId, color: '#000000' }]
      ])
    },
    props: {
      displaySettings: { showInfos: true, showSharedAssets: true },
      validationColumns: [modelingId, riggingId],
      displayedAssets: [[asset], [character]]
    }
  })
  const [modeling, rigging] = wrapper
    .findAll('tbody validation-cell-stub')
    .slice(0, 2)
    .map(cell => cell.attributes('selectable') === 'true')
  wrapper.unmount()
  return { modeling, rigging }
}

describe('lists/AssetList', () => {
  describe('selectable cells', () => {
    beforeEach(() => {
      assetTypeStore.cache.assetTypeMap.set(propsTypeId, {
        id: propsTypeId,
        task_types: [riggingId]
      })
      assetTypeStore.cache.assetTypeMap.set(charactersTypeId, {
        id: charactersTypeId,
        task_types: [modelingId, riggingId]
      })
    })

    afterEach(() => {
      assetTypeStore.cache.assetTypeMap.delete(propsTypeId)
      assetTypeStore.cache.assetTypeMap.delete(charactersTypeId)
    })

    test('cell with an existing task stays selectable when its task type left the workflow', async () => {
      const asset = buildAsset(new Map([[modelingId, 'task-1']]))
      expect((await selectableCells(asset)).modeling).toBe(true)
    })

    test('empty cell outside the workflow is not selectable', async () => {
      expect((await selectableCells(buildAsset(new Map()))).modeling).toBe(false)
    })

    test('empty cell inside the workflow is selectable', async () => {
      expect((await selectableCells(buildAsset(new Map()))).rigging).toBe(true)
    })

    test('empty workflow allows every production task type', async () => {
      assetTypeStore.cache.assetTypeMap.get(propsTypeId).task_types = []
      expect((await selectableCells(buildAsset(new Map()))).modeling).toBe(true)
    })

    test('shared asset cells are never selectable', async () => {
      const asset = buildAsset(new Map([[modelingId, 'task-1']]), {
        shared: true
      })
      expect((await selectableCells(asset)).modeling).toBe(false)
    })

    test('stale validation entry pointing to a deleted task does not force selectability', async () => {
      const asset = buildAsset(new Map([[modelingId, 'task-gone']]))
      expect((await selectableCells(asset)).modeling).toBe(false)
    })
  })
})

describe('lists/AssetList sticky columns', () => {
  const mountList = displaySettings =>
    mountEntityList(AssetList, {
      getters: {
        assetMetadataDescriptors: [descriptor],
        currentProduction: production,
        displayedAssetsCount: 1,
        productionAssetTaskTypes: [{ id: taskTypeId }]
      },
      props: {
        displaySettings,
        displayedAssets: [
          [
            {
              id: 'asset-1',
              asset_type_id: propsTypeId,
              name: 'Asset 1',
              data: {},
              validations: new Map([[taskTypeId, 'task-1']])
            }
          ]
        ]
      }
    })

  beforeEach(() => {
    stubHeaderWidths()
    stickColumns('asset')
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  test('hides the sticky metadata columns along with the other infos', async () => {
    const wrapper = await mountList({ showInfos: false })

    expect(wrapper.find('tbody th.name').exists()).toBe(true)
    expect(wrapper.find('thead metadata-header-stub').exists()).toBe(false)
    expect(wrapper.findAll('tbody td.metadata-descriptor')).toHaveLength(0)
    expect(stickyLeft(wrapper, 'validation-header-stub')).toBe('200px')

    wrapper.unmount()
  })

  test('moves the sticky task types next to the names once the infos hide', async () => {
    const wrapper = await mountList({ showInfos: true })
    expect(stickyLeft(wrapper, 'validation-header-stub')).toBe('320px')

    await wrapper.setProps({ displaySettings: { showInfos: false } })
    await flushPromises()

    expect(stickyLeft(wrapper, 'validation-header-stub')).toBe('200px')

    wrapper.unmount()
  })

  test('moves the next sticky columns along with a resized one', async () => {
    const resize = stubResizeObserver()
    const wrapper = await mountList({ showInfos: true })

    setHeaderWidth('metadata-header-stub', 90)
    resize(wrapper.find('thead metadata-header-stub').element)
    await flushPromises()

    expect(stickyLeft(wrapper, 'validation-header-stub')).toBe('290px')

    wrapper.unmount()
  })
})
