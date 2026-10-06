import { shallowMount } from '@vue/test-utils'
import { vi } from 'vitest'
import { markRaw } from 'vue'
import { createStore } from 'vuex'

vi.mock('@/store', () => ({ default: {} }))

import { ASSET_DRAG_TYPE } from '@/lib/casting'

import ShotLine from '@/components/pages/breakdown/ShotLine.vue'

import { useNumberField } from '../../../fixtures/number-input'

const link = assetId => ({ id: `link-${assetId}`, asset_id: assetId })
const assets = new Map([
  ['asset-1', { id: 'asset-1', project_id: 'p1', ready_for: 'animation' }],
  ['asset-2', { id: 'asset-2', project_id: 'p1', ready_for: 'layout' }],
  ['asset-3', { id: 'asset-3', project_id: 'p1', ready_for: null }]
])
const priorities = { layout: 1, animation: 2 }

const mountLine = (props, getters = {}) => {
  const store = createStore({
    getters: {
      assetMap: () => assets,
      castingByType: () => ({
        'shot-b': [[link('asset-1'), link('asset-2')], [link('asset-3')]]
      }),
      currentProduction: () => ({ id: 'p1' }),
      getTaskTypePriority: () => taskTypeId => priorities[taskTypeId],
      isCurrentUserProductionManager: () => true,
      isCurrentUserProductionSupervisor: () => false,
      isFrameIn: () => false,
      isFrameOut: () => false,
      isFrames: () => false,
      isShowInfosBreakdown: () => false,
      user: () => ({ departments: [] }),
      ...getters
    }
  })
  return shallowMount(ShotLine, {
    props: { entity: { id: 'shot-b', data: {} }, name: 'SH02', ...props },
    global: {
      plugins: [store],
      // Keys with their parameters: the counts show in the text.
      mocks: {
        $t: (key, params) =>
          params ? `${key} ${JSON.stringify(params)}` : key
      }
    }
  })
}

describe('ShotLine, copy of the casting', () => {
  test('asks to copy its casting without selecting the line', async () => {
    const wrapper = mountLine()

    await wrapper.find('.copy-casting').trigger('click')

    expect(wrapper.emitted('copy-casting')).toEqual([['shot-b']])
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  // Nothing can be pasted in read-only mode.
  test('has no copy in read-only mode', () => {
    const wrapper = mountLine({ readOnly: true })

    expect(wrapper.find('.copy-casting').exists()).toBe(false)
  })
})

describe('ShotLine, ready assets', () => {
  test('counts the cast assets ready for the chosen step', () => {
    const wrapper = mountLine({ readyTaskTypeId: 'animation' })

    expect(wrapper.find('.ready-assets').text()).toBe(
      'breakdown.nb_ready {"ready":1,"total":3}'
    )
    expect(wrapper.find('.ready-assets').classes()).not.toContain('is-ready')
  })

  test('counts the assets delivered for a later step as ready', () => {
    const wrapper = mountLine({
      entity: { id: 'shot-b', data: {} },
      readyTaskTypeId: 'layout'
    })

    // asset-3 is delivered for nothing: two out of three.
    expect(wrapper.find('.ready-assets').text()).toBe(
      'breakdown.nb_ready {"ready":2,"total":3}'
    )
  })

  test('shows nothing without a chosen step or without casting', () => {
    expect(mountLine().find('.ready-assets').exists()).toBe(false)
    expect(
      mountLine({
        entity: { id: 'shot-z', data: {} },
        readyTaskTypeId: 'layout'
      })
        .find('.ready-assets')
        .exists()
    ).toBe(false)
  })
})

describe('ShotLine, asset drop', () => {
  const dragged = assetId => ({
    dataTransfer: { types: [ASSET_DRAG_TYPE], getData: () => assetId }
  })

  test('asks to cast the asset dropped on it', async () => {
    const wrapper = mountLine()

    await wrapper.find('.shot').trigger('drop', dragged('asset-9'))

    expect(wrapper.emitted('drop-asset')).toEqual([['shot-b', 'asset-9']])
  })

  test('shows it as the target while an asset hovers it', async () => {
    const wrapper = mountLine()
    const line = wrapper.find('.shot')

    await line.trigger('dragenter', dragged('asset-9'))
    expect(line.classes()).toContain('is-drop-target')
    // Moving over a child of the line is not leaving it.
    await line.trigger('dragleave', { relatedTarget: line.element.firstChild })
    expect(line.classes()).toContain('is-drop-target')
    await line.trigger('dragleave', { relatedTarget: document.body })
    expect(line.classes()).not.toContain('is-drop-target')
  })

  test('accepts assets only: a dragged file or text is left to the browser', async () => {
    const wrapper = mountLine()
    const event = { dataTransfer: { types: ['Files'], getData: () => '' } }

    await wrapper.find('.shot').trigger('drop', event)

    expect(wrapper.emitted('drop-asset')).toBeUndefined()
  })

  test('accepts nothing in read-only mode', async () => {
    const wrapper = mountLine({ readOnly: true })

    await wrapper.find('.shot').trigger('drop', dragged('asset-9'))

    expect(wrapper.emitted('drop-asset')).toBeUndefined()
  })
})

describe('ShotLine, number cells', () => {
  // The breakdown saves each key into the shot of the line without rendering
  // it again: a click on the line, which selects it, does.
  const mountNumberLine = () =>
    mountLine(
      {
        entity: markRaw({ id: 'shot-b', nb_frames: null, data: {} }),
        metadataDisplayHeaders: { frames: true, frameIn: true, frameOut: true },
        onMetadataChanged: ({ entry, descriptor, value }) => {
          entry.data[descriptor.field_name] = value
        }
      },
      {
        isFrameIn: () => true,
        isFrameOut: () => true,
        isFrames: () => true,
        isShowInfosBreakdown: () => true,
        selectedAssets: () => new Map(),
        selectedEdits: () => new Map(),
        selectedShots: () => new Map()
      }
    )

  const savedValues = wrapper =>
    wrapper.emitted('metadata-changed').map(([{ value }]) => value)

  // Written back from the number saved, "12.0" turned into "12": typing
  // 12.05 with a click in between saved 125.
  test('keeps the zero typed after the decimal point of a frame in', async () => {
    const wrapper = mountNumberLine()
    const field = useNumberField(
      wrapper.findAll('.frames-column input')[1].element
    )
    await field.type('12.0')

    await wrapper.setProps({ selection: new Set(['shot-b']) })

    expect(await field.type('5')).toEqual(['12.05'])
    expect(savedValues(wrapper)).toEqual([1, 12, 12])
  })
})
