vi.mock('@/store', () => ({ default: {} }))

import AssetList from '@/components/lists/AssetList.vue'

const isSelectable = AssetList.methods.isSelectable
const updateOffsets = AssetList.methods.updateOffsets

const modelingId = 'task-type-modeling'
const riggingId = 'task-type-rigging'
const assetTypeId = 'asset-type-props'

const buildContext = () => ({
  assetTypeMap: new Map([
    [assetTypeId, { id: assetTypeId, task_types: [riggingId] }]
  ]),
  taskTypeMap: new Map([
    [modelingId, { id: modelingId }],
    [riggingId, { id: riggingId }]
  ]),
  taskMap: new Map([['task-1', { id: 'task-1' }]]),
  productionAssetTaskTypes: [{ id: modelingId }, { id: riggingId }]
})

const buildAsset = validations => ({
  id: 'asset-1',
  asset_type_id: assetTypeId,
  validations
})

describe('lists/AssetList', () => {
  describe('isSelectable', () => {
    test('cell with an existing task stays selectable when its task type left the workflow', () => {
      const asset = buildAsset(new Map([[modelingId, 'task-1']]))
      expect(isSelectable.call(buildContext(), asset, modelingId)).toBe(true)
    })

    test('empty cell outside the workflow is not selectable', () => {
      const asset = buildAsset(new Map())
      expect(isSelectable.call(buildContext(), asset, modelingId)).toBe(false)
    })

    test('empty cell inside the workflow is selectable', () => {
      const asset = buildAsset(new Map())
      expect(isSelectable.call(buildContext(), asset, riggingId)).toBe(true)
    })

    test('empty workflow allows every production task type', () => {
      const context = buildContext()
      context.assetTypeMap.get(assetTypeId).task_types = []
      const asset = buildAsset(new Map())
      expect(isSelectable.call(context, asset, modelingId)).toBe(true)
    })

    test('shared asset cells are never selectable', () => {
      const asset = {
        ...buildAsset(new Map([[modelingId, 'task-1']])),
        shared: true
      }
      expect(isSelectable.call(buildContext(), asset, modelingId)).toBe(false)
    })

    test('stale validation entry pointing to a deleted task does not force selectability', () => {
      const asset = buildAsset(new Map([[modelingId, 'task-gone']]))
      expect(isSelectable.call(buildContext(), asset, modelingId)).toBe(false)
    })
  })
})

// Sticky offsets add up full header widths: clientWidth leaves out the
// border and rounds, so each sticky column overlapped the previous one.
const header = (width, clientWidth = Math.floor(width) - 1) => ({
  clientWidth,
  getBoundingClientRect: () => ({ width })
})

describe('lists/AssetList sticky offsets', () => {
  test('places the sticky columns after the full width of the previous ones', () => {
    const context = {
      isLoading: false,
      displaySettings: { showInfos: true },
      $refs: {
        'th-name': header(300.5),
        'th-episode': header(81),
        'editor-0': [{ $el: header(121) }],
        'validation-0': [{ $el: header(151) }]
      },
      stickedVisibleMetadataDescriptors: [{ id: 'descriptor-1' }],
      stickedDisplayedValidationColumns: ['task-type-1']
    }
    context.$nextTick = callback => callback.call(context)

    updateOffsets.call(context)

    expect(context.nameWidth).toBe(300.5)
    expect(context.offsets).toEqual({
      'editor-0': 381.5,
      'validation-0': 502.5
    })
  })
})
