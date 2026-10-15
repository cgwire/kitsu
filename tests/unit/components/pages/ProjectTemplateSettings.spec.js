import { flushPromises } from '@vue/test-utils'

vi.mock('@/store', () => ({ default: {} }))
vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))

import { nextTick } from 'vue'

import RowActionsCell from '@/components/cells/RowActionsCell.vue'
import AddMetadataModal from '@/components/modals/AddMetadataModal.vue'
import ProjectTemplateSettings from '@/components/pages/ProjectTemplateSettings.vue'
import MovieBitrateField from '@/components/pages/production/MovieBitrateField.vue'
import TaskTypeSettings from '@/components/pages/production/TaskTypeSettings.vue'
import TextField from '@/components/widgets/TextField.vue'

import { mountEntityPage } from '../../fixtures/entity-page'

// An instance whose MOVIE_HIGHDEF_BITRATE is above the usual 28.
const movieBitrateDefaults = {
  hd_bitrate_compression: 40,
  ld_bitrate_compression: 8
}

const findTextField = (wrapper, label) =>
  wrapper
    .findAllComponents(TextField)
    .find(field => field.props('label') === label)

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
      isLowDefinition: false,
      max: 40,
      modelValue: 28
    })
    expect(ld.props()).toMatchObject({
      ceiling: 40,
      description: 'productions.video.ld_bitrate_description',
      defaultValue: 8,
      isLowDefinition: true,
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

    // A save of another field leaves the empty bitrates empty.
    await findTextField(wrapper, 'productions.fields.fps').vm.$emit(
      'update:modelValue',
      '24'
    )
    await nextTick()
    vi.advanceTimersByTime(800)
    await nextTick()
    expect(dispatched('editProjectTemplate').at(-1)[1]).toMatchObject({
      fps: '24',
      hd_bitrate_compression: null,
      ld_bitrate_compression: null
    })
    expect(hd.props('modelValue')).toBe('')
    expect(ld.props('modelValue')).toBe('')
    vi.clearAllTimers()
  })
})

// A bitrate field saves on its way out of the page, so the answer can come
// back once the route shows no template anymore.
describe('ProjectTemplateSettings page, task type bitrates', () => {
  const template = { id: 'template-1', name: 'Feature', metadata_descriptors: [] }

  const mountPage = async addTaskTypeToTemplate => {
    const page = await mountEntityPage(ProjectTemplateSettings, {
      query: { tab: 'taskTypes' },
      getters: { movieBitrateDefaults },
      actions: {
        loadProjectTemplate: () => template,
        loadTemplateTaskTypes: () => [],
        loadTemplateTaskStatuses: () => [],
        loadTemplateAssetTypes: () => [],
        loadTemplateStatusAutomations: () => [],
        loadTemplateBackgrounds: () => [],
        addTaskTypeToTemplate
      }
    })
    page.router.addRoute({
      path: '/project-templates/:template_id',
      component: { template: '<div />' }
    })
    await page.router.push('/project-templates/template-1')
    page.store.dispatch.mockClear()
    return page
  }

  const changeBitrate = wrapper =>
    wrapper.findComponent(TaskTypeSettings).vm.$emit('bitrates-changed', {
      taskTypeId: 'task-type-1',
      hd_bitrate_compression: 20
    })

  it('reloads the template once a bitrate is saved', async () => {
    const { wrapper, dispatched } = await mountPage(() => {})

    await changeBitrate(wrapper)
    await flushPromises()

    expect(dispatched('loadProjectTemplate')).toEqual([
      ['loadProjectTemplate', 'template-1']
    ])
  })

  it('reloads no template once the page is left', async () => {
    let answer
    const { wrapper, router, dispatched } = await mountPage(
      () => new Promise(resolve => (answer = resolve))
    )

    await changeBitrate(wrapper)
    await router.push('/')
    answer()
    await flushPromises()

    expect(dispatched('addTaskTypeToTemplate')[0][1]).toMatchObject({
      templateId: 'template-1'
    })
    expect(dispatched('loadProjectTemplate')).toEqual([])
  })
})

// The parameters save 800 ms after their last change, and the page can be
// left in between.
describe('ProjectTemplateSettings page, parameters autosave', () => {
  afterEach(() => vi.useRealTimers())

  const mountOnTemplate = async (tab, actions = {}) => {
    const page = await mountEntityPage(ProjectTemplateSettings, {
      query: { tab },
      getters: { movieBitrateDefaults },
      actions: {
        loadProjectTemplate: () => ({
          id: 'template-1',
          name: 'Feature',
          metadata_descriptors: []
        }),
        loadTemplateTaskTypes: () => [],
        loadTemplateTaskStatuses: () => [],
        loadTemplateAssetTypes: () => [],
        loadTemplateStatusAutomations: () => [],
        loadTemplateBackgrounds: () => [],
        ...actions
      }
    })
    page.router.addRoute({
      path: '/project-templates/:template_id',
      component: { template: '<div />' }
    })
    await page.router.push('/project-templates/template-1')
    return page
  }

  it('saves on the template typed in once the page is left', async () => {
    const { wrapper, router, store, dispatched } =
      await mountOnTemplate('video')
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    store.dispatch.mockClear()

    await wrapper
      .findComponent(MovieBitrateField)
      .vm.$emit('update:modelValue', 20)
    await nextTick()
    await router.push('/')
    vi.advanceTimersByTime(800)
    await nextTick()

    expect(dispatched('editProjectTemplate')[0][1]).toMatchObject({
      id: 'template-1',
      hd_bitrate_compression: 20
    })
  })

  // A load gives the parameters their stored values: nothing to save.
  it('saves nothing once loaded', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    const { dispatched } = await mountOnTemplate('video')

    vi.advanceTimersByTime(800)
    await nextTick()

    expect(dispatched('editProjectTemplate')).toEqual([])
  })

  // The changes made in the other tabs reload the template.
  it('saves nothing after a reload of the template', async () => {
    const { wrapper, dispatched } = await mountOnTemplate('taskTypes', {
      addTaskTypeToTemplate: () => {}
    })
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })

    await wrapper.findComponent(TaskTypeSettings).vm.$emit('bitrates-changed', {
      taskTypeId: 'task-type-1',
      hd_bitrate_compression: 20
    })
    await flushPromises()
    vi.advanceTimersByTime(800)
    await nextTick()

    expect(dispatched('loadProjectTemplate')).toHaveLength(2)
    expect(dispatched('editProjectTemplate')).toEqual([])
  })

  it('saves a field brought back to its loaded value', async () => {
    const { wrapper, dispatched } = await mountOnTemplate('video')
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    const fps = findTextField(wrapper, 'productions.fields.fps')

    await fps.vm.$emit('update:modelValue', '24')
    await nextTick()
    vi.advanceTimersByTime(800)
    await flushPromises()
    await fps.vm.$emit('update:modelValue', '25')
    await nextTick()
    vi.advanceTimersByTime(800)
    await nextTick()

    expect(
      dispatched('editProjectTemplate').map(([, data]) => data.fps)
    ).toEqual(['24', '25'])
  })

  // The values of a refused save are no stored ones: a field changed, then
  // brought back, still sends them.
  it('sends the values of a refused save with the next change', async () => {
    let isRefused = true
    const { wrapper, dispatched } = await mountOnTemplate('video', {
      editProjectTemplate: () => {
        const answer = isRefused ? Promise.reject(new Error()) : undefined
        isRefused = false
        return answer
      }
    })
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    const fps = findTextField(wrapper, 'productions.fields.fps')

    await fps.vm.$emit('update:modelValue', '24')
    await nextTick()
    vi.advanceTimersByTime(800)
    await flushPromises()
    const ratio = findTextField(wrapper, 'productions.fields.ratio')
    await ratio.vm.$emit('update:modelValue', '4:3')
    await ratio.vm.$emit('update:modelValue', '16:9')
    await nextTick()
    vi.advanceTimersByTime(800)
    await nextTick()

    expect(dispatched('editProjectTemplate')).toHaveLength(2)
    expect(dispatched('editProjectTemplate')[1][1]).toMatchObject({
      fps: '24',
      ratio: '16:9'
    })
  })
})
