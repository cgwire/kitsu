import { shallowMount } from '@vue/test-utils'
import { vi } from 'vitest'

import { ASSET_DRAG_TYPE } from '@/lib/casting'

import AvailableAssetBlock from '@/components/pages/breakdown/AvailableAssetBlock.vue'

const asset = { id: 'asset-1', name: 'Hero' }

describe('AvailableAssetBlock, drag', () => {
  // No selection is needed to drag: the line it is dropped on is the target.
  test.each([
    ['tile', false, '.asset'],
    ['text line', true, '.asset-text']
  ])('carries its asset when its %s is dragged', async (_, textMode, selector) => {
    const wrapper = shallowMount(AvailableAssetBlock, {
      props: { asset, active: false, textMode }
    })
    const dataTransfer = { setData: vi.fn() }

    await wrapper.find(selector).trigger('dragstart', { dataTransfer })

    expect(wrapper.find(selector).attributes('draggable')).toBe('true')
    expect(dataTransfer.setData).toHaveBeenCalledWith(ASSET_DRAG_TYPE, 'asset-1')
    expect(dataTransfer.effectAllowed).toBe('copy')
  })
})
