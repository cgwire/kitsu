// @vitest-environment node

import { vi } from 'vitest'

// Some module imports transitively pull the root store; stub it so no
// Vuex store is built.
vi.mock('@/store', () => ({ default: {} }))

import assetsStore from '@/store/modules/assets'
import departmentsStore from '@/store/modules/departments'
import editsStore from '@/store/modules/edits'
import episodesStore from '@/store/modules/episodes'
import sequencesStore from '@/store/modules/sequences'
import shotsStore from '@/store/modules/shots'
import taskStatusStore from '@/store/modules/taskstatus'
import taskTypesStore from '@/store/modules/tasktypes'

// The preview-file:set-main socket event commits SET_PREVIEW to every module
// at once, whatever the open page, so each entity module gets a payload built
// for another one.
const entityModules = [
  ['assets', assetsStore, 'displayedAssets'],
  ['edits', editsStore, 'displayedEdits'],
  ['episodes', episodesStore, 'displayedEpisodes'],
  ['sequences', sequencesStore, 'displayedSequences'],
  ['shots', shotsStore, 'displayedShots']
]

describe('store module hygiene', () => {
  describe('RESET_ALL clears the module caches (ARCH-9)', () => {
    test.each([
      ['tasktypes', taskTypesStore, 'taskTypeMap'],
      ['taskstatus', taskStatusStore, 'taskStatusMap'],
      ['departments', departmentsStore, 'departmentMap']
    ])('%s', (name, module, mapName) => {
      module.cache[mapName].set('x1', { id: 'x1', name: 'Leftover' })
      const state = {}
      module.mutations.RESET_ALL(state)
      // A leftover entry here leaks data from the previous session.
      expect(module.cache[mapName].size).toBe(0)
    })
  })

  describe('edit mutations keep lists sorted (ARCH-21)', () => {
    test('EDIT_DEPARTMENTS_END re-sorts after a rename', () => {
      const alpha = { id: 'd1', name: 'Alpha' }
      const zeta = { id: 'd2', name: 'Zeta' }
      const state = { departments: [alpha, zeta] }
      departmentsStore.cache.departmentMap = new Map([
        ['d1', alpha],
        ['d2', zeta]
      ])

      departmentsStore.mutations.EDIT_DEPARTMENTS_END(state, {
        id: 'd1',
        name: 'Zzz'
      })

      expect(state.departments.map(d => d.name)).toEqual(['Zeta', 'Zzz'])
    })

    test('EDIT_TASK_STATUS_END re-sorts after a rename', () => {
      const done = { id: 's1', name: 'Done' }
      const wip = { id: 's2', name: 'WIP' }
      const state = { taskStatuses: [done, wip] }
      taskStatusStore.cache.taskStatusMap = new Map([
        ['s1', done],
        ['s2', wip]
      ])

      taskStatusStore.mutations.EDIT_TASK_STATUS_END(state, {
        id: 's1',
        name: 'Zzz'
      })

      expect(state.taskStatuses.map(s => s.name)).toEqual(['WIP', 'Zzz'])
    })
  })

  describe('SET_PREVIEW tolerates a task-less entity', () => {
    test.each(entityModules)(
      '%s propagates the preview to every task it can resolve',
      (name, module, listKey) => {
        const entity = { id: 'e1', tasks: ['t1', 't2', 't3', 't4'] }
        const state = { [listKey]: [entity] }
        const taskMap = new Map([
          ['t1', { id: 't1', entity: { id: 'e1', preview_file_id: 'old' } }],
          ['t2', { id: 't2', entity: { id: 'e1', preview_file_id: 'old' } }],
          // Task known but not populated by the entity loader: no entity key.
          ['t3', { id: 't3' }]
          // t4 is missing from the map entirely.
        ])

        module.mutations.SET_PREVIEW(state, {
          entityId: 'e1',
          previewId: 'pf1',
          taskMap
        })

        expect(entity.preview_file_id).toEqual('pf1')
        expect(taskMap.get('t1').entity.preview_file_id).toEqual('pf1')
        expect(taskMap.get('t2').entity.preview_file_id).toEqual('pf1')
        expect(taskMap.get('t3').entity).toBeUndefined()
      }
    )

    test.each(entityModules)(
      '%s sets the preview of an entity loaded without tasks',
      (name, module, listKey) => {
        // Shape produced by the plain loaders: every page but the entity list
        // fills the displayed list with raw entities, with no tasks key.
        const entity = { id: 'e1' }
        const state = { [listKey]: [entity] }

        module.mutations.SET_PREVIEW(state, {
          entityId: 'e1',
          previewId: 'pf1',
          taskMap: new Map()
        })

        expect(entity.preview_file_id).toEqual('pf1')
      }
    )

    test.each(entityModules)(
      '%s ignores an entity of another module',
      (name, module, listKey) => {
        const entity = { id: 'e1', tasks: [] }
        const state = { [listKey]: [entity] }

        module.mutations.SET_PREVIEW(state, {
          entityId: 'other-entity',
          previewId: 'pf1',
          taskMap: new Map()
        })

        expect(entity.preview_file_id).toBeUndefined()
      }
    )
  })
})
