import { flushPromises } from '@vue/test-utils'

vi.mock('@/store', () => ({ default: {} }))
vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))

import { nextTick } from 'vue'

import RowActionsCell from '@/components/cells/RowActionsCell.vue'
import AddMetadataModal from '@/components/modals/AddMetadataModal.vue'
import ProjectTemplateSettings from '@/components/pages/ProjectTemplateSettings.vue'
import MovieBitrateField from '@/components/pages/production/MovieBitrateField.vue'

import { mountEntityPage } from '../../fixtures/entity-page'

// An instance whose MOVIE_HIGHDEF_BITRATE is above the usual 28.
const movieBitrateDefaults = {
  hd_bitrate_compression: 40,
  ld_bitrate_compression: 8
}

// A close keeps the error of a refused save: the next opening drops it.
describe('ProjectTemplateSettings page, metadata column modal', () => {
  afterEach(() => vi.restoreAllMocks())

  const template = {
    id: 'template-1',
    name: 'Feature',
    metadata_descriptors: [
      { name: 'Difficulty', data_type: 'string', entity_type: 'Asset' }
    ]
  }

  const mountPage = () =>
    mountEntityPage(ProjectTemplateSettings, {
      query: { tab: 'metadataDescriptors' },
      getters: { movieBitrateDefaults },
      actions: {
        loadProjectTemplate: () => template,
        loadTemplateTaskTypes: () => [],
        loadTemplateTaskStatuses: () => [],
        loadTemplateAssetTypes: () => [],
        loadTemplateStatusAutomations: () => [],
        loadTemplateBackgrounds: () => [],
        setTemplateMetadataDescriptors: () => Promise.reject(new Error('taken'))
      }
    })

  test.each([
    [
      'a new column',
      wrapper =>
        wrapper
          .findAll('button')
          .find(button => button.text() === 'project_templates.add_metadata')
          .trigger('click')
    ],
    [
      'a column edit',
      wrapper => wrapper.findComponent(RowActionsCell).vm.$emit('edit-clicked')
    ]
  ])('opens %s without the error of a refused column', async (_, open) => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { wrapper } = await mountPage()
    const modal = () => wrapper.findComponent(AddMetadataModal)

    await open(wrapper)
    await modal().vm.$emit('confirm', { name: 'Complexity' })
    await flushPromises()
    expect(modal().props('isError')).toBe(true)

    await modal().vm.$emit('cancel')
    await open(wrapper)

    expect(modal().props('active')).toBe(true)
    expect(modal().props('isError')).toBe(false)
  })
})

describe('ProjectTemplateSettings page, video tab', () => {
  afterEach(() => vi.useRealTimers())

  const template = {
    id: 'template-1',
    name: 'Feature',
    hd_bitrate_compression: 28,
    ld_bitrate_compression: 6,
    metadata_descriptors: []
  }

  const mountPage = (loadedTemplate = template) =>
    mountEntityPage(ProjectTemplateSettings, {
      query: { tab: 'video' },
      getters: { movieBitrateDefaults },
      actions: {
        loadProjectTemplate: () => loadedTemplate,
        loadTemplateTaskTypes: () => [],
        loadTemplateTaskStatuses: () => [],
        loadTemplateAssetTypes: () => [],
        loadTemplateStatusAutomations: () => [],
        loadTemplateBackgrounds: () => [],
        editProjectTemplate: () => template
      }
    })

  const bitrateFields = wrapper => {
    const [hd, ld] = wrapper.findAllComponents(MovieBitrateField)
    return { hd, ld }
  }

  it('describes each bitrate and reminds the instance default', async () => {
    const { wrapper } = await mountPage()
    const { hd, ld } = bitrateFields(wrapper)

    expect(hd.props()).toMatchObject({
      description: 'productions.video.hd_bitrate_description',
      defaultValue: 40,
      max: 40,
      modelValue: 28
    })
    expect(ld.props()).toMatchObject({
      description: 'productions.video.ld_bitrate_description',
      defaultValue: 8,
      max: 28,
      modelValue: 6
    })
    const title = wrapper
      .findAll('h3.section-title')
      .find(item => item.text() === 'productions.video.bitrates')
    expect(title.element.nextElementSibling.textContent.trim()).toBe(
      'productions.video.bitrate_explanation'
    )
    // A template has no preview: its settings reach the productions created
    // from it.
    expect(wrapper.text()).not.toContain('productions.video.next_uploads_only')
  })

  // No form submit here: the browser never checks the bounds of the fields.
  it('saves whole bitrates up to the instance ceiling and shows them', async () => {
    const { wrapper, dispatched } = await mountPage()
    const { hd, ld } = bitrateFields(wrapper)
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })

    await hd.vm.$emit('update:modelValue', 35)
    await ld.vm.$emit('update:modelValue', 12.5)
    await nextTick()
    vi.advanceTimersByTime(800)
    await nextTick()

    expect(dispatched('editProjectTemplate').at(-1)[1]).toMatchObject({
      hd_bitrate_compression: 35,
      ld_bitrate_compression: 13
    })
    expect(ld.props('modelValue')).toBe(13)
    vi.clearAllTimers()
  })

  // The autosave can catch the high definition bitrate halfway through its
  // typing, 2 on the way to 20.
  it('keeps the low definition typed when a save catches a partial high definition', async () => {
    const { wrapper, dispatched } = await mountPage()
    const { hd, ld } = bitrateFields(wrapper)
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })

    await hd.vm.$emit('update:modelValue', 2)
    await nextTick()
    vi.advanceTimersByTime(800)
    await nextTick()
    await hd.vm.$emit('update:modelValue', 20)
    await nextTick()
    vi.advanceTimersByTime(800)
    await nextTick()

    expect(dispatched('editProjectTemplate').at(-1)[1]).toMatchObject({
      hd_bitrate_compression: 20,
      ld_bitrate_compression: 6
    })
    expect(ld.props('modelValue')).toBe(6)
    vi.clearAllTimers()
  })

  it('caps the low definition at the instance ceiling while no HD is set', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    const { wrapper, dispatched } = await mountPage({
      ...template,
      hd_bitrate_compression: null,
      ld_bitrate_compression: null
    })
    const { hd, ld } = bitrateFields(wrapper)
    expect(ld.props('max')).toBe(40)

    // The page saves itself once loaded: empty fields stay empty.
    vi.advanceTimersByTime(800)
    await nextTick()
    expect(dispatched('editProjectTemplate').at(-1)[1]).toMatchObject({
      hd_bitrate_compression: null,
      ld_bitrate_compression: null
    })
    expect(hd.props('modelValue')).toBe('')
    expect(ld.props('modelValue')).toBe('')
    vi.clearAllTimers()
  })
})
