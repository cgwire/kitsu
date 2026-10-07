import { shallowMount } from '@vue/test-utils'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createStore } from 'vuex'
import { describe, expect, it, vi } from 'vitest'

// Shows the interpolated values next to the key.
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key, params) => (params ? `${key} ${JSON.stringify(params)}` : key)
  })
}))

import TaskTypeSettings from '@/components/pages/production/TaskTypeSettings.vue'
import InfoQuestionMark from '@/components/widgets/InfoQuestionMark.vue'

const taskType = { id: 'asset-1', name: 'Modeling', for_entity: 'Asset' }

// Renders the rows the shallow mount would otherwise drop with the list.
const DraggableStub = {
  props: { modelValue: { type: Array, default: () => [] } },
  template: `<div>
    <slot
      name="item"
      :element="element"
      :key="index"
      v-for="(element, index) in modelValue"
    />
  </div>`
}

const router = createRouter({
  history: createWebHashHistory(),
  routes: [{ path: '/', component: { template: '<div />' } }]
})

// The template task type carries its own bitrates, defaultBitrates are the
// ones of the template.
const mountSettings = async ({ defaultBitrates = {}, own = {} } = {}) => {
  const store = createStore({
    getters: {
      // An instance whose MOVIE_HIGHDEF_BITRATE is above the usual 28.
      movieBitrateDefaults: () => ({
        hd_bitrate_compression: 40,
        ld_bitrate_compression: 8
      })
    }
  })
  await router.push('/')
  await router.isReady()
  return shallowMount(TaskTypeSettings, {
    props: {
      taskTypes: [{ ...taskType, ...own }],
      allTaskTypes: [taskType],
      defaultBitrates
    },
    global: {
      plugins: [store, router],
      mocks: { $t: key => key },
      stubs: { draggable: DraggableStub }
    }
  })
}

const bitrateInputs = wrapper => {
  const [hd, ld] = wrapper.findAll('td.bitrate input')
  return { hd, ld }
}

describe('TaskTypeSettings', () => {
  it('explains the bitrate columns and gives their maximum', async () => {
    const wrapper = await mountSettings()

    expect(
      wrapper.findAllComponents(InfoQuestionMark).map(help => help.props('text'))
    ).toEqual([
      'productions.video.task_type_bitrates\n\n' +
        'productions.video.bitrate_max {"value":40}',
      'productions.video.task_type_bitrates\n\n' +
        'productions.video.task_type_ld_bitrate_max'
    ])
  })

  it('shows the bitrates a task type inherits, down to the instance ones', async () => {
    const inheriting = bitrateInputs(
      await mountSettings({
        defaultBitrates: { hd_bitrate_compression: '', ld_bitrate_compression: '' }
      })
    )
    expect(inheriting.hd.attributes('placeholder')).toBe('40')
    expect(inheriting.ld.attributes('placeholder')).toBe('8')

    const fromTemplate = bitrateInputs(
      await mountSettings({
        defaultBitrates: { hd_bitrate_compression: 20, ld_bitrate_compression: 5 }
      })
    )
    expect(fromTemplate.hd.attributes('placeholder')).toBe('20')
    expect(fromTemplate.ld.attributes('placeholder')).toBe('5')
  })

  it('caps the bitrates at the instance ceiling', async () => {
    const { hd, ld } = bitrateInputs(await mountSettings())
    expect(hd.attributes('max')).toBe('40')
    expect(ld.attributes('max')).toBe('40')

    const fromTemplate = bitrateInputs(
      await mountSettings({ defaultBitrates: { hd_bitrate_compression: 20 } })
    )
    expect(fromTemplate.ld.attributes('max')).toBe('20')

    const fromOwn = bitrateInputs(
      await mountSettings({
        defaultBitrates: { hd_bitrate_compression: 20 },
        own: { hd_bitrate_compression: 12 }
      })
    )
    expect(fromOwn.ld.attributes('max')).toBe('12')
  })

  // A change event skips the checks of the browser.
  it('saves whole bitrates up to the instance ceiling and shows them', async () => {
    const wrapper = await mountSettings({
      defaultBitrates: { hd_bitrate_compression: '', ld_bitrate_compression: '' }
    })
    const { hd, ld } = bitrateInputs(wrapper)

    await hd.setValue('45')
    await ld.setValue('6.4')

    expect(wrapper.emitted('bitrates-changed')).toEqual([
      [
        {
          taskTypeId: 'asset-1',
          hd_bitrate_compression: 40,
          ld_bitrate_compression: null
        }
      ],
      [
        {
          taskTypeId: 'asset-1',
          hd_bitrate_compression: null,
          ld_bitrate_compression: 6
        }
      ]
    ])
    expect(hd.element.value).toBe('40')
    expect(ld.element.value).toBe('6')
  })

  it('caps the low definition at the template high definition', async () => {
    const wrapper = await mountSettings({
      defaultBitrates: { hd_bitrate_compression: 10 }
    })
    const { ld } = bitrateInputs(wrapper)

    await ld.setValue('20')

    expect(wrapper.emitted('bitrates-changed')).toEqual([
      [
        {
          taskTypeId: 'asset-1',
          hd_bitrate_compression: null,
          ld_bitrate_compression: 10
        }
      ]
    ])
    expect(ld.element.value).toBe('10')
  })

  // Zou encodes an inherited low definition bitrate at the high definition
  // one of the task type when that one is lower.
  it('shows the inherited low definition within the high definition of the task type', async () => {
    const { ld } = bitrateInputs(
      await mountSettings({ own: { hd_bitrate_compression: 3 } })
    )

    expect(ld.attributes('placeholder')).toBe('3')
  })
})
