import { shallowMount } from '@vue/test-utils'
import { vi } from 'vitest'
import { createStore } from 'vuex'

vi.mock('@/store', () => ({ default: {} }))

import ShotLine from '@/components/pages/breakdown/ShotLine.vue'

const link = assetId => ({ id: `link-${assetId}`, asset_id: assetId })
const assets = new Map([
  ['asset-1', { id: 'asset-1', project_id: 'p1', ready_for: 'animation' }],
  ['asset-2', { id: 'asset-2', project_id: 'p1', ready_for: 'layout' }],
  ['asset-3', { id: 'asset-3', project_id: 'p1', ready_for: null }]
])
const priorities = { layout: 1, animation: 2 }

const mountLine = props => {
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
      user: () => ({ departments: [] })
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
  test('counts the casted assets ready for the chosen step', () => {
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
