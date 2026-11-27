import { afterEach, describe, expect, it } from 'vitest'
import { nextTick, reactive } from 'vue'
import { createStore } from 'vuex'

import i18n, { loadLocaleMessages } from '@/lib/i18n'
import taskStatusStore from '@/store/modules/taskstatus'
import taskTypeStore from '@/store/modules/tasktypes'
import {
  EDIT_TASK_STATUS_END,
  EDIT_TASK_TYPE_END,
  LOAD_TASK_STATUSES_END,
  LOAD_TASK_TYPES_END
} from '@/store/mutation-types'
import { shallowMountWithI18n } from '../../fixtures/i18n'

import ProductionStats from '@/components/pages/production/ProductionStats.vue'
import TaskTypeName from '@/components/widgets/TaskTypeName.vue'

const status = (id, name, priority, archived = false) => ({
  id,
  name,
  priority,
  archived,
  color: '#000000',
  is_artist_allowed: true,
  is_client_allowed: false
})
const statuses = [
  status('todo', 'Todo', 1),
  status('wip', 'WIP', 2),
  status('wfa', 'WFA', 3),
  status('done', 'Done', 4),
  status('old', 'Old', 5, true)
]
const taskType = (id, name, forEntity, priority, archived = false) => ({
  id,
  name,
  for_entity: forEntity,
  priority,
  archived
})
const taskTypes = [
  taskType('modeling', 'Modeling', 'Asset', 1),
  taskType('rigging', 'Rigging', 'Asset', 2),
  taskType('storyboard', 'Storyboard', 'Sequence', 1, true),
  taskType('layout', 'Layout', 'Shot', 1),
  taskType('animation', 'Animation', 'Shot', 2),
  taskType('script', 'Script', 'Episode', 1),
  taskType('editing', 'Editing', 'Edit', 1),
  taskType('concept', 'Concept art', 'Concept', 1),
  taskType('untyped', 'Untyped', null, 3),
  taskType('blocking', 'Blocking', 'Scene', 1)
]

// One entry per task type and status, in the order Zou happens to send them.
const stat = (taskTypeId, taskStatusId) => ({
  task_type_id: taskTypeId,
  task_status_id: taskStatusId,
  amount: 2,
  amount_done: taskStatusId === 'done' ? 2 : 0,
  total_duration: 0,
  total_estimation: 0
})
const stats = {
  amount: 18,
  amount_done: 4,
  total_duration: 0,
  total_estimation: 0,
  task_types: [
    stat('animation', 'done'),
    stat('animation', 'todo'),
    stat('rigging', 'wip'),
    stat('layout', 'old'),
    stat('layout', 'wfa'),
    stat('storyboard', 'todo'),
    stat('modeling', 'done'),
    stat('modeling', 'wip'),
    stat('modeling', 'wfa')
  ]
}

// One task of a status, two of another
const fewTasks = {
  ...stats,
  amount: 3,
  amount_done: 2,
  task_types: [{ ...stat('modeling', 'wip'), amount: 1 }, stat('modeling', 'done')]
}

// The real status and task type modules: their maps are caches Vue does not
// watch.
const mountStats = (production, productionStats = stats) => {
  const store = createStore({
    modules: {
      taskStatus: {
        state: () => ({ taskStatuses: [] }),
        getters: taskStatusStore.getters,
        mutations: taskStatusStore.mutations
      },
      taskTypes: {
        state: () => ({ taskTypes: [], sequenceSubscriptions: {} }),
        getters: taskTypeStore.getters,
        mutations: taskTypeStore.mutations
      }
    },
    getters: {
      organisation: () => ({
        hours_by_day: 8,
        format_duration_in_hours: false
      })
    }
  })
  store.commit(
    LOAD_TASK_STATUSES_END,
    statuses.map(item => ({ ...item }))
  )
  store.commit(
    LOAD_TASK_TYPES_END,
    taskTypes.map(item => ({ ...item }))
  )
  const wrapper = shallowMountWithI18n(ProductionStats, {
    props: { production, stats: productionStats },
    global: { plugins: [store] }
  })
  return { store, wrapper }
}

// The status names in the titles of the parts of a bar
const barStatuses = bar =>
  bar.findAll('.stat').map(part => part.attributes('title').split(' - ')[0])
// The tooltips of the parts of a bar
const barTitles = bar =>
  bar.findAll('.stat').map(part => part.attributes('title'))
const mainBar = wrapper =>
  barStatuses(wrapper.find('.project-stats > .color-wrapper'))
const taskTypeBars = wrapper =>
  wrapper.findAll('.task-type-stat .color-wrapper').map(barStatuses)
const taskTypeNames = wrapper =>
  wrapper
    .findAllComponents(TaskTypeName)
    .map(name => name.props('taskType').name)
// The title of each group of task types, with the names of its task types
const taskTypeGroups = wrapper =>
  wrapper
    .findAll('.task-type-group')
    .map(group => [
      group.find('.task-type-group-title').text(),
      taskTypeNames(group)
    ])
// The group titles of the stats of a task type of each tab of the settings
const titlesOf = async production => {
  const { wrapper } = mountStats(production, {
    ...stats,
    amount: 10,
    amount_done: 0,
    task_types: ['editing', 'script', 'storyboard', 'layout', 'modeling'].map(
      id => stat(id, 'todo')
    )
  })
  await wrapper.trigger('click')
  const titles = taskTypeGroups(wrapper).map(([title]) => title)
  wrapper.unmount()
  return titles
}

describe('ProductionStats', () => {
  afterEach(() => {
    i18n.global.locale.value = 'en'
    i18n.global.missingWarn = true
    i18n.global.fallbackWarn = true
  })

  // The comparisons returned booleans, which leave an array as it is in
  // Chrome: the bars and the task types kept the order of Zou's answer. Old
  // and Storyboard, both archived, still show.
  it('orders its bars and task types by the priorities of the production', async () => {
    const production = {
      id: 'production-1',
      task_statuses_link: { wfa: { priority: 2 }, wip: { priority: 3 } },
      task_types_priority: { rigging: 1, modeling: 2 }
    }
    const { wrapper } = mountStats(production)

    expect(mainBar(wrapper)).toEqual(['Todo', 'WFA', 'WIP', 'Done', 'Old'])

    await wrapper.trigger('click')

    expect(taskTypeNames(wrapper)).toEqual([
      'Rigging',
      'Modeling',
      'Layout',
      'Animation',
      'Storyboard'
    ])
    expect(taskTypeBars(wrapper)).toEqual([
      ['WIP'],
      ['WFA', 'WIP', 'Done'],
      ['WFA', 'Old'],
      ['Todo', 'Done'],
      ['Todo']
    ])
    wrapper.unmount()
  })

  // Zou announces a status change with task-status:update, and the store
  // takes the new status. The status map is a cache Vue does not watch: an
  // order built from it would not move. Old, archived, keeps its place by
  // priority: before WIP once WIP moves to 6.
  it('orders its bars again once the priority of a status changes', async () => {
    const { store, wrapper } = mountStats({ id: 'production-1' })
    await wrapper.trigger('click')

    store.commit(EDIT_TASK_STATUS_END, { ...statuses[1], priority: 6 })
    await nextTick()

    expect(mainBar(wrapper)).toEqual(['Todo', 'WFA', 'Done', 'Old', 'WIP'])
    expect(taskTypeBars(wrapper)[0]).toEqual(['WFA', 'Done', 'WIP'])
    wrapper.unmount()
  })

  // The task types come from the store lists for the same reason: the task
  // type map is a cache too.
  it('orders its task types again once the priority of a task type changes', async () => {
    const { store, wrapper } = mountStats({ id: 'production-1' })
    await wrapper.trigger('click')
    expect(taskTypeNames(wrapper)).toEqual([
      'Modeling',
      'Rigging',
      'Layout',
      'Animation',
      'Storyboard'
    ])

    store.commit(EDIT_TASK_TYPE_END, { ...taskTypes[0], priority: 3 })
    await nextTick()

    expect(taskTypeNames(wrapper)).toEqual([
      'Rigging',
      'Modeling',
      'Layout',
      'Animation',
      'Storyboard'
    ])
    expect(taskTypeBars(wrapper)[0]).toEqual(['WIP'])
    wrapper.unmount()
  })

  // Zou announces a change of the production priorities with project:update:
  // the store assigns the new priorities to its copies of the production,
  // the one the list hands to the stats included.
  it('orders its bars and task types again once the production priorities change', async () => {
    const production = reactive({ id: 'production-1' })
    const { wrapper } = mountStats(production)
    await wrapper.trigger('click')
    expect(mainBar(wrapper)).toEqual(['Todo', 'WIP', 'WFA', 'Done', 'Old'])
    expect(taskTypeNames(wrapper)).toEqual([
      'Modeling',
      'Rigging',
      'Layout',
      'Animation',
      'Storyboard'
    ])

    Object.assign(production, {
      task_statuses_link: { wfa: { priority: 2 }, wip: { priority: 3 } },
      task_types_priority: { rigging: 1, modeling: 2 }
    })
    await nextTick()

    expect(mainBar(wrapper)).toEqual(['Todo', 'WFA', 'WIP', 'Done', 'Old'])
    expect(taskTypeNames(wrapper)).toEqual([
      'Rigging',
      'Modeling',
      'Layout',
      'Animation',
      'Storyboard'
    ])
    wrapper.unmount()
  })

  // The task types of every entity type came in one list. They now come in
  // groups titled like the tabs of the production settings, and in the same
  // order. A concept task type, which has no tab there, comes last.
  it('groups its task types by entity type like the production settings', async () => {
    const { wrapper } = mountStats(
      { id: 'production-1' },
      {
        ...stats,
        amount: 14,
        amount_done: 2,
        task_types: [
          stat('concept', 'wip'),
          stat('editing', 'todo'),
          stat('script', 'done'),
          stat('storyboard', 'wfa'),
          stat('animation', 'todo'),
          stat('layout', 'wip'),
          stat('modeling', 'todo')
        ]
      }
    )
    await wrapper.trigger('click')

    expect(taskTypeGroups(wrapper)).toEqual([
      ['Assets', ['Modeling']],
      ['Shots', ['Layout', 'Animation']],
      ['Sequences', ['Storyboard']],
      ['Episodes', ['Script']],
      ['Edits', ['Editing']],
      ['Concepts', ['Concept art']]
    ])
    wrapper.unmount()
  })

  // In English, the UI takes the words of the current production. A row
  // takes those of its own production: a video game says Maps, Levels, and
  // Chapters, an NFT production says NFT Collection, and the others keep
  // Shots, whatever production is current.
  it('titles its groups with the words of its own production', async () => {
    expect(
      await titlesOf({ id: 'production-2', production_style: 'video-game' })
    ).toEqual(['Assets', 'Maps', 'Levels', 'Chapters', 'Edits'])
    expect(
      await titlesOf({ id: 'production-3', production_style: 'nft' })
    ).toEqual(['Assets', 'NFT Collection', 'Sequences', 'Episodes', 'Edits'])

    // An NFT production is current. The other strings of the stats fall back
    // to English: their warnings would only be noise here.
    i18n.global.missingWarn = false
    i18n.global.fallbackWarn = false
    i18n.global.locale.value = 'en_nft'

    expect(
      await titlesOf({ id: 'production-1', production_style: '2d3d' })
    ).toEqual(['Assets', 'Shots', 'Sequences', 'Episodes', 'Edits'])
  })

  // The overlays are English only: in another language, every row takes the
  // words of that language, a video game production included.
  it('titles its groups in the language of the user', async () => {
    await loadLocaleMessages('fr')
    i18n.global.locale.value = 'fr'

    expect(
      await titlesOf({ id: 'production-2', production_style: 'video-game' })
    ).toEqual(['Assets', 'Plans', 'Séquences', 'Épisodes', 'Montages'])
  })

  // A part of a bar names its status and counts its tasks, with the plural
  // of the count.
  it('counts the tasks of each status in the tooltips of its bars', async () => {
    const { wrapper } = mountStats({ id: 'production-1' }, fewTasks)
    await wrapper.trigger('click')

    expect(
      barTitles(wrapper.find('.project-stats > .color-wrapper'))
    ).toEqual(['WIP - 1 task', 'Done - 2 tasks'])
    expect(
      wrapper.findAll('.task-type-stat .color-wrapper').map(barTitles)
    ).toEqual([['WIP - 1 task', 'Done - 2 tasks']])
    wrapper.unmount()
  })

  it('counts the tasks of its tooltips in the language of the user', async () => {
    await loadLocaleMessages('fr')
    i18n.global.locale.value = 'fr'
    const { wrapper } = mountStats({ id: 'production-1' }, fewTasks)
    await wrapper.trigger('click')

    expect(
      barTitles(wrapper.find('.project-stats > .color-wrapper'))
    ).toEqual(['WIP - 1 tâche', 'Done - 2 tâches'])
    expect(
      wrapper.findAll('.task-type-stat .color-wrapper').map(barTitles)
    ).toEqual([['WIP - 1 tâche', 'Done - 2 tâches']])
    wrapper.unmount()
  })

  // A task type with no entity counts as an asset one, the entity Zou gives
  // by default. One for an entity Kitsu has no words for keeps that name,
  // after the concepts.
  it('keeps the task types with no entity or an unknown one', async () => {
    const { wrapper } = mountStats(
      { id: 'production-1' },
      {
        ...stats,
        amount: 10,
        amount_done: 0,
        task_types: [
          'blocking',
          'concept',
          'untyped',
          'layout',
          'modeling'
        ].map(id => stat(id, 'todo'))
      }
    )
    await wrapper.trigger('click')

    expect(taskTypeGroups(wrapper)).toEqual([
      ['Assets', ['Modeling', 'Untyped']],
      ['Shots', ['Layout']],
      ['Concepts', ['Concept art']],
      ['Scene', ['Blocking']]
    ])
    wrapper.unmount()
  })
})
