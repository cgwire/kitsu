import { flushPromises } from '@vue/test-utils'

vi.mock('@/store', () => ({ default: {} }))
vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))

import { useHead } from '@unhead/vue'
import { nextTick } from 'vue'
import { RouterLink } from 'vue-router'

import RowActionsCell from '@/components/cells/RowActionsCell.vue'
import AddMetadataModal from '@/components/modals/AddMetadataModal.vue'
import ProjectTemplateSettings from '@/components/pages/ProjectTemplateSettings.vue'
import ClientAccessSettings from '@/components/pages/production/ClientAccessSettings.vue'
import MovieBitrateField from '@/components/pages/production/MovieBitrateField.vue'
import TaskStatusSettings from '@/components/pages/production/TaskStatusSettings.vue'
import TaskTypeSettings from '@/components/pages/production/TaskTypeSettings.vue'
import VideoSettingsForm from '@/components/pages/production/VideoSettingsForm.vue'
import Checkbox from '@/components/widgets/Checkbox.vue'
import TextareaField from '@/components/widgets/TextareaField.vue'
import TextField from '@/components/widgets/TextField.vue'

import { mountEntityPage } from '../../fixtures/entity-page'

// An instance whose MOVIE_HIGHDEF_BITRATE is above the usual 28.
const movieBitrateDefaults = {
  hd_bitrate_compression: 40,
  ld_bitrate_compression: 8
}

// The layout renders the tabs, the video form the fields the tests drive.
const stubs = { SettingsLayout: false, VideoSettingsForm: false }

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
      stubs,
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

// A failed save reloads the template: the list shows the saved columns.
describe('ProjectTemplateSettings page, failed column saves', () => {
  afterEach(() => vi.restoreAllMocks())

  const template = {
    id: 'template-1',
    name: 'Feature',
    metadata_descriptors: [
      { name: 'Difficulty', data_type: 'string', entity_type: 'Asset' }
    ]
  }
  const error = new Error('Bad Gateway')

  const mountPage = (setTemplateMetadataDescriptors, config) =>
    mountEntityPage(ProjectTemplateSettings, {
      config,
      stubs,
      query: { tab: 'metadataDescriptors' },
      getters: { movieBitrateDefaults },
      actions: {
        loadProjectTemplate: () => template,
        loadTemplateTaskTypes: () => [],
        loadTemplateTaskStatuses: () => [],
        loadTemplateAssetTypes: () => [],
        loadTemplateStatusAutomations: () => [],
        loadTemplateBackgrounds: () => [],
        setTemplateMetadataDescriptors
      }
    })

  const columnCount = wrapper =>
    wrapper.findAllComponents(RowActionsCell).length

  it('sends a new column once when it is saved again', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    let saves = 0
    const { wrapper, dispatched } = await mountPage(() =>
      ++saves === 1 ? Promise.reject(error) : undefined
    )
    const modal = () => wrapper.findComponent(AddMetadataModal)

    await wrapper
      .findAll('button')
      .find(button => button.text() === 'project_templates.add_metadata')
      .trigger('click')
    await modal().vm.$emit('confirm', { name: 'Complexity' })
    await flushPromises()

    expect(consoleError).toHaveBeenCalledWith(error)
    expect(columnCount(wrapper)).toBe(1)

    await modal().vm.$emit('confirm', { name: 'Complexity' })
    await flushPromises()

    expect(
      dispatched('setTemplateMetadataDescriptors').map(([, { descriptors }]) =>
        descriptors.map(descriptor => descriptor.name)
      )
    ).toEqual([
      ['Difficulty', 'Complexity'],
      ['Difficulty', 'Complexity']
    ])
  })

  it('shows a column again when its removal fails', async () => {
    const errorHandler = vi.fn()
    const { wrapper } = await mountPage(() => Promise.reject(error), {
      errorHandler
    })

    await wrapper.findComponent(RowActionsCell).vm.$emit('delete-clicked')
    await flushPromises()

    expect(errorHandler.mock.calls[0][0]).toBe(error)
    expect(columnCount(wrapper)).toBe(1)
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
      stubs,
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
      .findAll('.tab h2.subtitle')
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
      stubs,
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

// After a drop, the task type and status lists wait for the reload that
// follows their save to rebuild.
describe('ProjectTemplateSettings page, reorders', () => {
  const template = { id: 'template-1', name: 'Feature', metadata_descriptors: [] }

  test.each([
    ['task types', TaskTypeSettings, 'reorderTemplateTaskTypes'],
    ['task statuses', TaskStatusSettings, 'reorderTemplateTaskStatuses']
  ])(
    'reloads the template when a reorder of the %s fails',
    async (name, list, reorder) => {
      const error = new Error('Bad Gateway')
      const errorHandler = vi.fn()
      const { wrapper, router, store, dispatched } = await mountEntityPage(
        ProjectTemplateSettings,
        {
          config: { errorHandler },
          stubs,
          getters: { movieBitrateDefaults },
          actions: {
            loadProjectTemplate: () => template,
            loadTemplateTaskTypes: () => [],
            loadTemplateTaskStatuses: () => [],
            loadTemplateAssetTypes: () => [],
            loadTemplateStatusAutomations: () => [],
            loadTemplateBackgrounds: () => [],
            [reorder]: () => Promise.reject(error)
          }
        }
      )
      router.addRoute({
        path: '/project-templates/:template_id',
        component: { template: '<div />' }
      })
      await router.push('/project-templates/template-1')
      await flushPromises()
      store.dispatch.mockClear()

      await wrapper.findComponent(list).vm.$emit('reorder', [])
      await flushPromises()

      expect(dispatched(reorder)).toHaveLength(1)
      expect(dispatched('loadProjectTemplate')).toEqual([
        ['loadProjectTemplate', 'template-1']
      ])
      expect(errorHandler.mock.calls[0][0]).toBe(error)
    }
  )
})

// The parameters save 800 ms after their last change, and the page can be
// left in between.
describe('ProjectTemplateSettings page, parameters autosave', () => {
  afterEach(() => vi.useRealTimers())

  const mountOnTemplate = async (tab, actions = {}) => {
    const page = await mountEntityPage(ProjectTemplateSettings, {
      stubs,
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

describe('ProjectTemplateSettings page, clients tab', () => {
  afterEach(() => vi.useRealTimers())

  const template = {
    id: 'template-1',
    name: 'Feature',
    is_clients_isolated: true,
    is_client_stats_visible: null,
    is_client_task_list_visible: false,
    metadata_descriptors: []
  }
  const taskTypes = [{ id: 't1', for_entity: 'Shot', is_client_visible: true }]
  const taskStatuses = [
    { id: 's1', is_client_allowed: true, link_is_client_allowed: false }
  ]

  const mountPage = (actions = {}) =>
    mountEntityPage(ProjectTemplateSettings, {
      stubs,
      query: { tab: 'clients' },
      getters: { movieBitrateDefaults },
      actions: {
        loadProjectTemplate: () => template,
        loadTemplateTaskTypes: () => taskTypes,
        loadTemplateTaskStatuses: () => taskStatuses,
        loadTemplateAssetTypes: () => [],
        loadTemplateStatusAutomations: () => [],
        loadTemplateBackgrounds: () => [],
        ...actions
      }
    })

  const settings = wrapper => wrapper.findComponent(ClientAccessSettings)

  it('hands the template client settings to the clients tab', async () => {
    const { wrapper } = await mountPage()

    expect(settings(wrapper).props()).toMatchObject({
      settings: {
        is_clients_isolated: true,
        is_client_stats_visible: true,
        is_client_task_list_visible: false,
        is_client_task_panel_visible: true
      },
      taskTypes,
      taskStatuses
    })
    // The isolation moved from the parameters to the clients tab
    expect(
      wrapper
        .findAllComponents(Checkbox)
        .map(checkbox => checkbox.props('label'))
    ).not.toContain('productions.fields.is_clients_isolated')
  })

  it('saves a client setting with the template parameters', async () => {
    const { wrapper, dispatched } = await mountPage({
      editProjectTemplate: () => template
    })
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })

    await settings(wrapper).vm.$emit(
      'update-setting',
      'is_client_task_panel_visible',
      false
    )
    vi.advanceTimersByTime(800)
    await nextTick()

    expect(dispatched('editProjectTemplate').at(-1)[1]).toMatchObject({
      id: 'template-1',
      is_clients_isolated: true,
      is_client_stats_visible: true,
      is_client_task_list_visible: false,
      is_client_task_panel_visible: false
    })
    vi.clearAllTimers()
  })

  it('saves a task type visibility and shows it without a reload', async () => {
    const { wrapper, store, dispatched } = await mountPage({
      addTaskTypeToTemplate: () => ({})
    })
    store.dispatch.mockClear()

    await settings(wrapper).vm.$emit('set-task-type-visible', 't1', false)
    await flushPromises()

    expect(dispatched('addTaskTypeToTemplate').at(-1)[1]).toMatchObject({
      taskTypeId: 't1',
      is_client_visible: false
    })
    expect(settings(wrapper).props('taskTypes')[0].is_client_visible).toBe(
      false
    )
    expect(dispatched('loadProjectTemplate')).toEqual([])
  })

  it('saves a status override, null included', async () => {
    const { wrapper, dispatched } = await mountPage({
      addTaskStatusToTemplate: () => ({})
    })

    await settings(wrapper).vm.$emit('set-status-client-allowed', 's1', null)
    await flushPromises()

    expect(dispatched('addTaskStatusToTemplate').at(-1)[1]).toMatchObject({
      taskStatusId: 's1',
      isClientAllowed: null
    })
    expect(
      settings(wrapper).props('taskStatuses')[0].link_is_client_allowed
    ).toBeNull()
  })

  it('shows the error and resets the toggles on a refused save', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { wrapper } = await mountPage({
      addTaskStatusToTemplate: () => Promise.reject(new Error('boom'))
    })
    const before = settings(wrapper)

    await before.vm.$emit('set-status-client-allowed', 's1', true)
    await flushPromises()

    expect(wrapper.text()).toContain('productions.clients.save_error')
    expect(before.exists()).toBe(false)
    expect(
      settings(wrapper).props('taskStatuses')[0].link_is_client_allowed
    ).toBe(false)
  })
})

describe('ProjectTemplateSettings page, settings layout', () => {
  afterEach(() => vi.useRealTimers())

  const template = {
    id: 'template-1',
    name: 'Feature',
    description: 'Long form',
    max_retakes: 3,
    metadata_descriptors: []
  }

  const mountPage = (tab, actions = {}) =>
    mountEntityPage(ProjectTemplateSettings, {
      stubs,
      query: tab ? { tab } : {},
      getters: { movieBitrateDefaults },
      actions: {
        loadProjectTemplate: () => template,
        loadTemplateTaskTypes: () => [],
        loadTemplateTaskStatuses: () => [],
        loadTemplateAssetTypes: () => [],
        loadTemplateStatusAutomations: () => [],
        loadTemplateBackgrounds: () => [],
        ...actions
      }
    })

  const menuTab = link => link.props('to').query.tab
  const activeItem = wrapper =>
    menuTab(
      wrapper.find('.settings-menu li.is-active').findComponent(RouterLink)
    )

  it('lists the tabs in the template and workflow groups', async () => {
    const { wrapper } = await mountPage()

    expect(
      wrapper.findAll('.settings-menu .menu-label').map(label => label.text())
    ).toEqual([
      'project_templates.settings_menu.template',
      'productions.settings_menu.workflow'
    ])
    expect(
      wrapper
        .findAll('.settings-menu .menu-group')
        .flatMap(group => group.findAllComponents(RouterLink))
        .map(menuTab)
    ).toEqual([
        'parameters',
        'clients',
        'video',
        'metadataDescriptors',
        'backgrounds',
        'assetTypes',
        'taskTypes',
        'taskStatuses',
        'board',
        'statusAutomations'
    ])
    expect(wrapper.find('.tabs:not(.section-tabs)').exists()).toBe(false)
  })

  it('opens the video tab of the URL on its form', async () => {
    const { wrapper } = await mountPage('video')

    expect(activeItem(wrapper)).toBe('video')
    const form = wrapper.findComponent(VideoSettingsForm)
    expect(form.props('modelValue')).toMatchObject({ fps: '25' })
    expect(form.props('defaultBitrates')).toEqual(movieBitrateDefaults)
    expect(form.element.closest('.tab').style.display).toBe('')
  })

  it('falls back to the parameters on an unknown tab', async () => {
    const { wrapper } = await mountPage('foo')

    expect(activeItem(wrapper)).toBe('parameters')
  })

  it('saves the name and description of the general section', async () => {
    const { wrapper, dispatched } = await mountPage('parameters', {
      editProjectTemplate: () => template
    })
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    const general = wrapper.find('.box.section.general')
    const field = label =>
      general
        .findAllComponents(TextField)
        .find(item => item.props('label') === label)

    expect(general.find('h2.subtitle').text()).toBe(
      'productions.parameters.general_title'
    )
    expect(field('project_templates.fields.name').props('modelValue')).toBe(
      'Feature'
    )
    const description = general.findComponent(TextareaField)
    expect(description.props()).toMatchObject({
      label: 'project_templates.fields.description',
      modelValue: 'Long form'
    })

    await field('project_templates.fields.name').vm.$emit(
      'update:modelValue',
      'Series'
    )
    await description.vm.$emit('update:modelValue', 'Episodic')
    await nextTick()
    vi.advanceTimersByTime(800)
    await nextTick()

    expect(dispatched('editProjectTemplate').at(-1)[1]).toMatchObject({
      id: 'template-1',
      name: 'Series',
      description: 'Episodic'
    })
    vi.clearAllTimers()
  })

  it('saves no empty name', async () => {
    const { wrapper, dispatched } = await mountPage('parameters')
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })

    await findTextField(wrapper, 'project_templates.fields.name').vm.$emit(
      'update:modelValue',
      ' '
    )
    await nextTick()
    vi.advanceTimersByTime(800)
    await nextTick()

    expect(dispatched('editProjectTemplate')).toEqual([])
    expect(wrapper.text()).toContain('project_templates.name_required')
    vi.clearAllTimers()
  })

  it('shows the duplicate name error on a taken name', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { wrapper } = await mountPage('parameters', {
      editProjectTemplate: () =>
        Promise.reject(
          Object.assign(new Error(), {
            body: { message: 'A project template with this name already exists' }
          })
        )
    })
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })

    await findTextField(wrapper, 'project_templates.fields.name').vm.$emit(
      'update:modelValue',
      'Series'
    )
    await nextTick()
    vi.advanceTimersByTime(800)
    await flushPromises()

    expect(wrapper.find('.general').text()).toContain(
      'project_templates.duplicate_name'
    )
    expect(wrapper.text()).not.toContain('productions.edit_error')
    vi.clearAllTimers()
  })

  it('titles the browser tab with the name typed in', async () => {
    useHead.mockClear()
    const { wrapper } = await mountPage('parameters')
    const title = useHead.mock.calls.at(-1)[0].title

    await findTextField(wrapper, 'project_templates.fields.name').vm.$emit(
      'update:modelValue',
      'Series'
    )

    expect(title.value).toBe('Series - project_templates.title - Kitsu')
  })

  it('passes the template wording to the clients tab', async () => {
    const { wrapper } = await mountPage('clients')

    expect(
      wrapper.findComponent(ClientAccessSettings).props('isTemplate')
    ).toBe(true)
  })

  it('explains the backgrounds of a template', async () => {
    const { wrapper } = await mountPage('backgrounds')

    expect(wrapper.text()).toContain('project_templates.backgrounds_explanation')
    expect(wrapper.text()).not.toContain('backgrounds.production_description')
  })

  it('holds the retakes and the publish default in the comments section', async () => {
    const { wrapper } = await mountPage('parameters')
    const comments = wrapper.find('.box.section.comments')
    const retakes = comments.findComponent(TextField)

    expect(comments.find('h2.subtitle').text()).toBe(
      'productions.parameters.comments_and_retakes'
    )
    expect(retakes.props()).toMatchObject({
      description: 'productions.parameters.max_retakes_description',
      label: 'productions.fields.max_retakes',
      modelValue: 3
    })
    expect(
      comments.findAllComponents(Checkbox).map(box => box.props('label'))
    ).toEqual(['productions.fields.is_publish_default'])
    expect(comments.text()).toContain(
      'productions.parameters.publish_default_description'
    )
  })

  it('leaves the preview toggles to the video tab', async () => {
    const { wrapper } = await mountPage('parameters')
    const parameters = wrapper.find('.box.section.general').element.closest(
      '.tab'
    )
    const labels = wrapper
      .findAllComponents(Checkbox)
      .filter(box => parameters.contains(box.element))
      .map(box => box.props('label'))

    expect(labels).toEqual(['productions.fields.is_publish_default'])
  })

  it('wraps the workflow, metadata and backgrounds tabs in titled sections', async () => {
    const { wrapper } = await mountPage()
    const titles = wrapper
      .findAll('.tab > .box.section > h2.subtitle')
      .map(title => title.text())

    expect(titles).toEqual(
      expect.arrayContaining([
        'asset_types.title',
        'task_types.title',
        'task_status.title',
        'board.settings.title',
        'status_automations.title',
        'project_templates.tabs.metadata_descriptors',
        'backgrounds.title'
      ])
    )
    expect(wrapper.findAll('.tab.is-wide')).toHaveLength(6)
  })
})
