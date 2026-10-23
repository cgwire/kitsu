vi.mock('@/store', () => ({ default: {} }))

import { flushPromises } from '@vue/test-utils'

import SequenceList from '@/components/lists/SequenceList.vue'

import {
  descriptor,
  filledColumns,
  mountEntityList,
  production,
  stickColumns,
  stickyLeft,
  stubHeaderWidths
} from '../../fixtures/entity-list'

const mountList = props =>
  mountEntityList(SequenceList, {
    getters: {
      currentProduction: production,
      sequenceFilledColumns: filledColumns,
      sequenceMetadataDescriptors: [descriptor]
    },
    props
  })

describe('lists/SequenceList sticky columns', () => {
  beforeEach(() => {
    stubHeaderWidths()
    stickColumns('sequence')
  })

  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  test('places the sticky columns right after the sequence names', async () => {
    const wrapper = await mountList()

    expect(stickyLeft(wrapper, 'metadata-header-stub')).toBe('200px')
    expect(stickyLeft(wrapper, 'validation-header-stub')).toBe('320px')

    wrapper.unmount()
  })

  test('places the sticky metadata columns once the infos show', async () => {
    const wrapper = await mountList({ displaySettings: { showInfos: false } })

    await wrapper.setProps({ displaySettings: { showInfos: true } })
    await flushPromises()

    expect(stickyLeft(wrapper, 'metadata-header-stub')).toBe('200px')
    expect(stickyLeft(wrapper, 'validation-header-stub')).toBe('320px')

    wrapper.unmount()
  })
})
