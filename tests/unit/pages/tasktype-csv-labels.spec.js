import { flushPromises, shallowMount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createI18n } from 'vue-i18n'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createStore } from 'vuex'

vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))

// Pre-load the real store to avoid circular-import race from child components.
import '@/lib/auth'
import csv from '@/lib/csv'
import en from '@/locales/en'
import enVideoGame from '@/locales/en_video-game'
import fr from '@/locales/fr.json'

import ImportModal from '@/components/modals/ImportModal.vue'
import ImportRenderModal from '@/components/modals/ImportRenderModal.vue'
import TaskType from '@/components/pages/TaskType.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'

// The task type page with the real messages and its real task list: the
// other task type specs mock vue-i18n for the whole file.
const mountPage = async ({
  descriptors = [],
  forEntity,
  isPaperProduction = false,
  isTVShow = false,
  locale,
  type
}) => {
  const store = createStore({
    getters: {
      currentEpisode: () => null,
      currentProduction: () => ({ id: 'production-1', name: 'Production' }),
      currentTaskType: () => ({
        id: 'task-type-1',
        name: 'Layout',
        for_entity: forEntity
      }),
      dateFormat: () => 'YYYY-MM-DD',
      isCurrentUserProductionManager: () => true,
      isCurrentUserProductionSupervisor: () => false,
      isPaperProduction: () => isPaperProduction,
      isTVShow: () => isTVShow,
      nbSelectedTasks: () => 0,
      organisation: () => ({ hours_by_day: 8 }),
      personMap: () => new Map(),
      productionAssetTypes: () => [],
      productionTaskStatuses: () => [],
      selectedTasks: () => new Map(),
      taskMap: () => new Map(),
      taskMetadataDescriptors: () => descriptors,
      taskSearchQueries: () => [],
      currentTaskTypeEpisode: () => null,
      taskTypeMap: () => new Map(),
      use12HourClock: () => false,
      user: () => ({ id: 'manager-1', departments: [] })
    },
    actions: {
      clearSelectedTasks: vi.fn(),
      initTaskType: vi.fn(() => Promise.resolve())
    }
  })
  const router = createRouter({
    history: createWebHashHistory(),
    routes: [
      {
        path: '/productions/:production_id/:type/task-types/:task_type_id/:section',
        component: { template: '<div />' }
      }
    ]
  })
  await router.push(
    `/productions/production-1/${type}/task-types/task-type-1/tasks`
  )
  const i18n = createI18n({
    legacy: false,
    locale,
    fallbackLocale: 'en',
    // the overlay holds only the words that differ from en.js
    fallbackWarn: false,
    missingWarn: false,
    messages: { en, 'en_video-game': enVideoGame, fr: fr.default }
  })
  // the data load the page starts 100 ms after mounting is not under test
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
  const wrapper = shallowMount(TaskType, {
    global: {
      plugins: [
        store,
        router,
        i18n,
        {
          install: app => {
            app.config.globalProperties.$socket = { on: vi.fn(), off: vi.fn() }
          }
        }
      ],
      stubs: {
        Schedule: { template: '<div />' },
        SearchField: {
          template: '<div />',
          methods: { focus: () => {}, getValue: () => '', setValue: () => {} }
        },
        TaskList: false
      }
    }
  })
  await flushPromises()
  return wrapper
}

// Exports the task list, then imports the exported file back as is: returns
// the headers of the file and the ones the import preview gets.
const reimportExport = async options => {
  const wrapper = await mountPage(options)
  const buildCsvFile = vi.spyOn(csv, 'buildCsvFile').mockReturnValue('')
  await wrapper
    .findAllComponents(ButtonSimple)
    .find(button => button.props('icon') === 'export')
    .vm.$emit('click')
  const [, entries] = buildCsvFile.mock.calls[0]
  await wrapper
    .findComponent(ImportModal)
    .vm.$emit('confirm', csv.turnEntriesToCsvString(entries), 'text')
  await flushPromises()
  const imported = wrapper.findComponent(ImportRenderModal).props('parsedCsv')
  wrapper.unmount()
  return { exported: entries[0], imported: imported[0] }
}

// What the Zou estimations import reads, among the other columns, in the
// order of the export
const zouColumns = ['Difficulty', 'Estimation', 'Start date', 'Due date']
const readByZou = headers =>
  headers.filter(header =>
    ['Parent', 'Entity', 'Drawings', ...zouColumns].includes(header)
  )

describe('TaskType page, estimations export labels', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('imports back a file exported in French', async () => {
    const { exported, imported } = await reimportExport({
      forEntity: 'Asset',
      locale: 'fr',
      type: 'assets'
    })

    expect(exported.slice(0, 2)).toEqual(["Type d'asset", 'Nom'])
    expect(readByZou(imported)).toEqual(['Parent', 'Entity', ...zouColumns])
  })

  it('imports back the drawings of a paper production', async () => {
    const { exported, imported } = await reimportExport({
      forEntity: 'Shot',
      isPaperProduction: true,
      locale: 'fr',
      type: 'shots'
    })

    expect(exported).toContain('Dessins')
    expect(readByZou(imported)).toEqual([
      'Parent',
      'Entity',
      'Drawings',
      ...zouColumns
    ])
  })

  it('imports back a file exported in a video game production', async () => {
    // An English user of a video game production gets the overlay over en.js.
    const { exported, imported } = await reimportExport({
      forEntity: 'Shot',
      locale: 'en_video-game',
      type: 'shots'
    })

    expect(exported.slice(0, 2)).toEqual(['Level', 'Name'])
    expect(readByZou(imported)).toEqual(['Parent', 'Entity', ...zouColumns])
  })

  it('imports back the chapter of the levels of a video game', async () => {
    const { exported, imported } = await reimportExport({
      forEntity: 'Sequence',
      isTVShow: true,
      locale: 'en_video-game',
      type: 'sequences'
    })

    expect(exported.slice(0, 2)).toEqual(['Chapter', 'Name'])
    expect(readByZou(imported)).toEqual(['Parent', 'Entity', ...zouColumns])
  })

  it('imports back the episode of the edits in French', async () => {
    const { exported, imported } = await reimportExport({
      forEntity: 'Edit',
      isTVShow: true,
      locale: 'fr',
      type: 'edits'
    })

    expect(exported.slice(0, 2)).toEqual(['Épisode', 'Nom'])
    expect(readByZou(imported)).toEqual(['Parent', 'Entity', ...zouColumns])
  })

  it('keeps the column of a descriptor named like a label', async () => {
    const descriptor = {
      id: 'descriptor-1',
      task_type_id: 'task-type-1',
      name: 'Nom',
      field_name: 'nom',
      data_type: 'string',
      departments: []
    }

    const { imported } = await reimportExport({
      descriptors: [descriptor],
      forEntity: 'Asset',
      locale: 'fr',
      type: 'assets'
    })

    expect(imported.filter(header => header === 'Nom')).toHaveLength(2)
    expect(readByZou(imported)).toEqual(['Parent', ...zouColumns])
  })
})
