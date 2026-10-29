vi.mock('@/store', () => ({ default: {} }))

import { flushPromises } from '@vue/test-utils'
import { reactive } from 'vue'

import assetStore from '@/store/modules/assets'
import assetTypeStore from '@/store/modules/assettypes'

import ValidationCell from '@/components/cells/ValidationCell.vue'
import ValidationHeader from '@/components/cells/ValidationHeader.vue'
import AssetList from '@/components/lists/AssetList.vue'
import TableHeaderMenu from '@/components/widgets/TableHeaderMenu.vue'

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

    // The asset creation only makes the tasks of the production task types
    // the workflow lists: the column follows the same rule, or a task type
    // removed from the production keeps a column the schedule no longer has.
    test('hides a workflow task type the production no longer has', async () => {
      const wrapper = await mountEntityList(AssetList, {
        getters: {
          currentProduction: production,
          displayedAssetsCount: 1,
          productionAssetTaskTypes: [{ id: riggingId }],
          taskMap: new Map(),
          taskTypeMap: new Map([
            [modelingId, { id: modelingId, color: '#000000' }],
            [riggingId, { id: riggingId, color: '#000000' }]
          ])
        },
        props: {
          displaySettings: { showInfos: true, showSharedAssets: true },
          validationColumns: [modelingId, riggingId],
          displayedAssets: [[character]]
        }
      })

      expect(
        wrapper
          .findAllComponents(ValidationHeader)
          .map(header => header.props('columnId'))
      ).toEqual([riggingId])
      wrapper.unmount()
    })
  })
})

describe('lists/AssetList task selection', () => {
  const backgroundsTypeId = 'asset-type-backgrounds'
  const layout = { id: 'task-type-layout', name: 'Layout', color: '#000' }
  const color = { id: 'task-type-color', name: 'Color', color: '#000' }

  const buildEpisodeAsset = (
    name,
    episodeId,
    assetTypeId,
    taskTypes = [layout, color]
  ) => ({
    id: `asset-${name}`,
    name,
    full_name: name,
    data: {},
    asset_type_id: assetTypeId,
    episode_id: episodeId,
    validations: new Map(
      taskTypes.map(taskType => [
        taskType.id,
        `task-${name}-${taskType.name.toLowerCase()}`
      ])
    )
  })

  // Assets of the first episode cast in the second one sort before its own
  // assets, and the breakdown assets display option hides them.
  const castBackgrounds = ['E01_BG_01', 'E01_BG_02', 'E01_BG_03'].map(name =>
    buildEpisodeAsset(name, 'episode-1', backgroundsTypeId)
  )
  const ownBackgrounds = [
    'E02_BG_20',
    'E02_BG_21',
    'E02_BG_22',
    'E02_BG_23',
    'E02_BG_24'
  ].map(name => buildEpisodeAsset(name, 'episode-2', backgroundsTypeId))

  let listedAssets = []

  // The store result holds every listed asset, the hidden ones included.
  const mountList = async (displayedAssets, query = {}, displaySettings = {}) => {
    listedAssets = displayedAssets.flat()
    listedAssets.forEach(asset => assetStore.cache.assetMap.set(asset.id, asset))
    assetStore.cache.result = listedAssets
    const selectionState = { assetSelectionGrid: reactive(new Set()) }
    const wrapper = await mountEntityList(AssetList, {
      getters: {
        assetSelectionGrid: selectionState.assetSelectionGrid,
        currentEpisode: { id: 'episode-2' },
        currentProduction: production,
        displayedAssetsCount: listedAssets.length,
        isTVShow: true,
        productionAssetTaskTypes: [layout, color],
        taskMap: new Map(
          listedAssets.flatMap(asset =>
            Array.from(asset.validations, ([taskTypeId, taskId]) => [
              taskId,
              { id: taskId, entity_id: asset.id, task_type_id: taskTypeId }
            ])
          )
        ),
        taskTypeMap: new Map([
          [layout.id, layout],
          [color.id, color]
        ])
      },
      props: {
        displaySettings: {
          showInfos: true,
          showLinkedAssets: false,
          showSharedAssets: true,
          ...displaySettings
        },
        displayedAssets,
        validationColumns: [layout.id, color.id]
      },
      query
    })
    // The real mutations fill the grid the cells read their state from.
    wrapper.vm.$store.commit.mockImplementation((type, payload) =>
      assetStore.mutations[type]?.(selectionState, payload)
    )
    return wrapper
  }

  // Opens the header menu of the column, then picks Select column.
  const selectColumn = async (wrapper, taskType) => {
    wrapper
      .findAllComponents(ValidationHeader)
      .find(header => header.props('columnId') === taskType.id)
      .vm.$emit('show-header-menu', {
        target: wrapper.find('thead th').element
      })
    wrapper.findComponent(TableHeaderMenu).vm.$emit('select-column')
    await flushPromises()
  }

  const selectedCells = wrapper =>
    wrapper
      .findAllComponents(ValidationCell)
      .filter(cell => cell.props('selected'))
      .map(cell => `${cell.props('entity').name} ${cell.props('column').name}`)

  // The tasks the action panel changes.
  const committedSelection = wrapper =>
    wrapper.vm.$store.commit.mock.calls
      .filter(([type]) => type === 'ADD_SELECTED_TASKS')
      .flatMap(([, selection]) =>
        selection.map(({ entity, column }) => `${entity.name} ${column.name}`)
      )

  afterEach(() => {
    listedAssets.forEach(asset => assetStore.cache.assetMap.delete(asset.id))
    assetStore.cache.result = []
    assetTypeStore.cache.assetTypeMap.delete(charactersTypeId)
    localStorage.clear()
  })

  test('selects the cell of the task in the url below hidden cast assets', async () => {
    const wrapper = await mountList([[...castBackgrounds, ...ownBackgrounds]], {
      task_id: 'task-E02_BG_21-layout'
    })

    wrapper.vm.selectTaskFromQuery()
    await flushPromises()

    expect(wrapper.findAll('tbody tr.datatable-row')).toHaveLength(5)
    expect(selectedCells(wrapper)).toEqual(['E02_BG_21 Layout'])

    wrapper.unmount()
  })

  test('selects the cell of the task in the url after an asset type with hidden cast assets', async () => {
    const characters = [
      buildEpisodeAsset('E01_CH_01', 'episode-1', charactersTypeId),
      buildEpisodeAsset('E02_CH_01', 'episode-2', charactersTypeId)
    ]
    const wrapper = await mountList(
      [characters, [...castBackgrounds, ...ownBackgrounds]],
      { task_id: 'task-E02_BG_21-layout' }
    )

    wrapper.vm.selectTaskFromQuery()
    await flushPromises()

    expect(wrapper.findAll('tbody tr.datatable-row')).toHaveLength(6)
    expect(selectedCells(wrapper)).toEqual(['E02_BG_21 Layout'])

    wrapper.unmount()
  })

  test('Select column leaves the hidden cast assets out', async () => {
    const wrapper = await mountList([[...castBackgrounds, ...ownBackgrounds]])

    await selectColumn(wrapper, layout)

    const ownCells = ownBackgrounds.map(({ name }) => `${name} Layout`)
    expect(selectedCells(wrapper)).toEqual(ownCells)
    expect(committedSelection(wrapper)).toEqual(ownCells)

    wrapper.unmount()
  })

  test('Select column leaves the grayed cells out', async () => {
    // Color is outside the workflow of the characters, and a library cell
    // is never selectable. The characters come first: the next rows keep
    // their place.
    assetTypeStore.cache.assetTypeMap.set(charactersTypeId, {
      id: charactersTypeId,
      task_types: [layout.id]
    })
    const characters = ['E02_CH_01', 'E02_CH_02'].map(name =>
      buildEpisodeAsset(name, 'episode-2', charactersTypeId, [layout])
    )
    const library = {
      ...buildEpisodeAsset('LIB_BG_01', null, backgroundsTypeId, []),
      shared: true
    }
    const wrapper = await mountList(
      [characters, [...ownBackgrounds, library]],
      {},
      { showLinkedAssets: true }
    )

    await selectColumn(wrapper, color)

    const backgroundCells = ownBackgrounds.map(({ name }) => `${name} Color`)
    expect(selectedCells(wrapper)).toEqual(backgroundCells)
    expect(committedSelection(wrapper)).toEqual(backgroundCells)

    wrapper.unmount()
  })

  test('grays the stuck cells outside the workflow like the others', async () => {
    localStorage.setItem(
      `stick-assets-${production.id}`,
      JSON.stringify({ [color.id]: true })
    )
    assetTypeStore.cache.assetTypeMap.set(charactersTypeId, {
      id: charactersTypeId,
      task_types: [layout.id]
    })
    const character = buildEpisodeAsset(
      'E02_CH_01',
      'episode-2',
      charactersTypeId,
      [layout]
    )
    const library = {
      ...buildEpisodeAsset('LIB_BG_01', null, backgroundsTypeId, []),
      shared: true
    }
    const wrapper = await mountList(
      [[character], [ownBackgrounds[0], library]],
      {},
      { showLinkedAssets: true }
    )

    const grayedCells = wrapper
      .findAllComponents(ValidationCell)
      .filter(cell => cell.props('disabled') && !cell.props('selectable'))
      .map(cell => `${cell.props('entity').name} ${cell.props('column').name}`)
    expect(grayedCells).toEqual([
      'E02_CH_01 Color',
      'LIB_BG_01 Color',
      'LIB_BG_01 Layout'
    ])

    wrapper.unmount()
  })

  test('Select column highlights its own column after a stuck one', async () => {
    localStorage.setItem(
      `stick-assets-${production.id}`,
      JSON.stringify({ [layout.id]: true })
    )
    const wrapper = await mountList([ownBackgrounds])

    await selectColumn(wrapper, color)

    const colorCells = ownBackgrounds.map(({ name }) => `${name} Color`)
    expect(selectedCells(wrapper)).toEqual(colorCells)
    expect(committedSelection(wrapper)).toEqual(colorCells)

    wrapper.unmount()
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
