import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import { describe, expect, it } from 'vitest'

import ProductionTaskType from '@/components/pages/production/ProductionTaskType.vue'

const taskType = {
  id: 'shot-1',
  name: 'Animation',
  short_name: 'ANIM',
  for_entity: 'Shot'
}

const mountRow = ({ production = {}, link = {} } = {}) => {
  const store = createStore({
    getters: {
      currentProduction: () => ({
        id: 'production-1',
        hd_bitrate_compression: null,
        ld_bitrate_compression: null,
        task_type_links: { [taskType.id]: link },
        ...production
      }),
      // An instance whose MOVIE_HIGHDEF_BITRATE is above the usual 28.
      movieBitrateDefaults: () => ({
        hd_bitrate_compression: 40,
        ld_bitrate_compression: 8
      })
    }
  })
  return mount(ProductionTaskType, {
    props: {
      taskType,
      scheduleItem: {
        id: 'item-1',
        start_date: '2026-10-01',
        end_date: '2026-10-31'
      }
    },
    global: {
      plugins: [store],
      mocks: { $t: key => key },
      stubs: { GripVerticalIcon: true, TaskTypeCell: true }
    }
  })
}

const bitrateInputs = wrapper => {
  const [hd, ld] = wrapper.findAll('td.bitrate input')
  return { hd, ld }
}

describe('ProductionTaskType', () => {
  it('shows the bitrates a task type inherits, down to the instance ones', () => {
    const inheriting = bitrateInputs(mountRow())
    expect(inheriting.hd.attributes('placeholder')).toBe('40')
    expect(inheriting.ld.attributes('placeholder')).toBe('8')

    const fromProduction = bitrateInputs(
      mountRow({
        production: { hd_bitrate_compression: 20, ld_bitrate_compression: 5 }
      })
    )
    expect(fromProduction.hd.attributes('placeholder')).toBe('20')
    expect(fromProduction.ld.attributes('placeholder')).toBe('5')
  })

  it('caps the bitrates at the instance ceiling', () => {
    const { hd, ld } = bitrateInputs(mountRow())
    expect(hd.attributes('max')).toBe('40')
    expect(ld.attributes('max')).toBe('40')

    const fromProduction = bitrateInputs(
      mountRow({ production: { hd_bitrate_compression: 20 } })
    )
    expect(fromProduction.ld.attributes('max')).toBe('20')

    const fromLink = bitrateInputs(
      mountRow({
        production: { hd_bitrate_compression: 20 },
        link: { hd_bitrate_compression: 12 }
      })
    )
    expect(fromLink.ld.attributes('max')).toBe('12')
  })

  // A change event skips the checks of the browser.
  it('saves whole bitrates up to the instance ceiling and shows them', async () => {
    const wrapper = mountRow()
    const { hd, ld } = bitrateInputs(wrapper)

    await hd.setValue('45')
    await ld.setValue('6.4')

    expect(wrapper.emitted('bitrates-changed')).toEqual([
      [{ taskType, hd_bitrate_compression: 40, ld_bitrate_compression: null }],
      [{ taskType, hd_bitrate_compression: null, ld_bitrate_compression: 6 }]
    ])
    expect(hd.element.value).toBe('40')
    expect(ld.element.value).toBe('6')
  })

  it('caps the low definition at the production high definition', async () => {
    const wrapper = mountRow({ production: { hd_bitrate_compression: 10 } })
    const { ld } = bitrateInputs(wrapper)

    await ld.setValue('20')

    expect(wrapper.emitted('bitrates-changed')).toEqual([
      [{ taskType, hd_bitrate_compression: null, ld_bitrate_compression: 10 }]
    ])
    expect(ld.element.value).toBe('10')
  })

  // Zou encodes an inherited low definition bitrate at the high definition
  // one of the task type when that one is lower.
  it('shows the inherited low definition within the high definition of the row', () => {
    const { ld } = bitrateInputs(
      mountRow({ link: { hd_bitrate_compression: 3 } })
    )

    expect(ld.attributes('placeholder')).toBe('3')
  })
})
