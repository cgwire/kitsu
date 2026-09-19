import { shallowMount } from '@vue/test-utils'
import { vi } from 'vitest'
import { createStore } from 'vuex'

vi.mock('@/store', () => ({ default: {} }))

import ShotLine from '@/components/pages/breakdown/ShotLine.vue'

const mountLine = props => {
  const store = createStore({
    getters: {
      castingByType: () => ({}),
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
    global: { plugins: [store], mocks: { $t: key => key } }
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
