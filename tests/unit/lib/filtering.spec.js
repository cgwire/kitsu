// @vitest-environment node

import {
  applyFilters,
  getKeyWords,
  getMultipleKeyWords,
  getExcludingKeyWords,
  getFilters,
  getTaskFilters
} from '@/lib/filtering'
import { buildTaskIndex } from '@/lib/indexing'

describe('lib/filtering', () => {
  describe('getKeyWords', () => {
    it('classic query', () => {
      const keyWords = getKeyWords(
        'chars bunny modeling=wip -bunnyfat [multiple]'
      )
      expect(keyWords).toEqual(['chars', 'bunny'])
    })

    it('hold space query', () => {
      const keyWords = getKeyWords(
        'chars "bunny fat" modeling=wip -bunnyfat [multiple]'
      )
      expect(keyWords).toEqual(['chars', 'bunny fat'])
    })

    it('no keyword query', () => {
      const keyWords = getKeyWords('modeling=wip -bunnyfat')
      expect(keyWords).toEqual([])
    })

    it('empty query', () => {
      const keyWords = getKeyWords('')
      expect(keyWords).toEqual([])
    })
  })

  describe('getMultipleKeyWords', () => {
    it('multiple query', () => {
      let keyWords = getMultipleKeyWords('[chars,bunny,with space]')
      expect(keyWords).toEqual(['chars', 'bunny', 'with space'])
      keyWords = getMultipleKeyWords('[chars]')
      expect(keyWords).toEqual(['chars'])
    })
  })

  describe('getExcludingKeyWords', () => {
    it('classic query', () => {
      const keyWords = getExcludingKeyWords(
        '-chars bunny modeling=wip -bunnyfat'
      )
      expect(keyWords).toEqual(['chars', 'bunnyfat'])
    })

    it('no excluding keyword query', () => {
      const keyWords = getExcludingKeyWords('chars bunny')
      expect(keyWords).toEqual([])
    })

    it('empty query', () => {
      const keyWords = getExcludingKeyWords('')
      expect(keyWords).toEqual([])
    })
  })

  describe('getFilters', () => {
    const entryIndex = {
      props: [
        { id: 'asset-1', data: { family: 'big' } },
        { id: 'asset-2', data: { family: 'small' } },
        { id: 'asset-3', data: { family: 'small' } }
      ]
    }
    const taskTypes = [
      {
        name: 'Animation',
        id: 'task-type-1'
      },
      {
        name: 'Modeling',
        id: 'task-type-2'
      },
      {
        name: 'Modeling facial',
        id: 'task-type-3'
      },
      {
        name: 'Anim',
        id: 'task-type-4'
      },
      {
        name: 'BG',
        id: 'task-type-5'
      }
    ]
    const descriptors = [
      {
        id: 'descriptor-1',
        name: 'Family',
        field_name: 'family'
      },
      {
        id: 'descriptor-1',
        name: 'Modeling infos',
        field_name: 'modeling_infos'
      }
    ]
    const persons = [
      {
        id: 'person-1',
        name: 'John Doe',
        active: true
      }
    ]
    const taskStatuses = [
      { id: 'task-status-1', short_name: 'wip' },
      { id: 'task-status-2', short_name: 'wfa' },
      { id: 'task-status-3', short_name: 'done' }
    ]
    const assetTypes = [
      { id: 'asset-type-1', name: 'chars' },
      { id: 'asset-type-2', name: 'sets' },
      { id: 'asset-type-3', name: 'props' }
    ]

    it('simple case', () => {
      const filters = getFilters({
        entryIndex,
        assetTypes,
        taskTypes,
        taskStatuses,
        descriptors,
        persons,
        query: 'modeling=wip'
      })
      expect(filters).toHaveLength(1)
      const filter = filters[0]
      expect(filter.taskType).toEqual(taskTypes[1])
      expect(filter.taskStatuses[0]).toEqual('task-status-1')
      expect(filter.assigned).toBeUndefined()
      expect(filter.type).toEqual('status')
    })

    it('status filter across all task types', () => {
      const filters = getFilters({
        entryIndex,
        assetTypes,
        taskTypes,
        taskStatuses,
        descriptors,
        persons,
        query: 'status=wip'
      })
      expect(filters).toHaveLength(1)
      const filter = filters[0]
      expect(filter.type).toEqual('statusAny')
      expect(filter.taskStatuses).toEqual(['task-status-1'])
      expect(filter.taskType).toBeUndefined()
      expect(filter.excluding).toBe(false)
    })

    it('status filter with multiple statuses', () => {
      const filters = getFilters({
        entryIndex,
        assetTypes,
        taskTypes,
        taskStatuses,
        descriptors,
        persons,
        query: 'status=wip,done'
      })
      expect(filters).toHaveLength(1)
      expect(filters[0].type).toEqual('statusAny')
      expect(filters[0].taskStatuses).toEqual(['task-status-1', 'task-status-3'])
    })

    it('partial task type name does not match (exact match only)', () => {
      const filters = getFilters({
        entryIndex,
        assetTypes,
        taskTypes,
        taskStatuses,
        descriptors,
        persons,
        query: 'mode=wip'
      })
      expect(filters.some(f => f.type === 'status')).toBe(false)
    })

    it('task types sharing a substring are not confused (cfx vs fx)', () => {
      const filters = getFilters({
        entryIndex,
        assetTypes,
        taskTypes: [
          { name: 'cfx', id: 'task-type-cfx' },
          { name: 'fx', id: 'task-type-fx' }
        ],
        taskStatuses,
        descriptors,
        persons,
        query: 'fx=wip'
      })
      const taskTypeFilters = filters.filter(f => f.type === 'status')
      expect(taskTypeFilters).toHaveLength(1)
      expect(taskTypeFilters[0].taskType.id).toEqual('task-type-fx')
    })

    // Zou's unique constraint is (name, for_entity, department_id), so two
    // live task types can carry the same name in two departments. Electing
    // one of them made the other column silently unfilterable.
    describe('two live task types sharing a name', () => {
      const twins = [
        { name: 'Compositing', id: 'task-type-render', department_id: 'dep-1' },
        { name: 'COMPOSITING', id: 'task-type-2d', department_id: 'dep-2' }
      ]
      const renderShot = {
        id: 'shot-render',
        validations: new Map([['task-type-render', 'task-render']]),
        tasks: ['task-render'],
        ready_for: 'task-type-render',
        nb_entities_out: 2
      }
      const twoDShot = {
        id: 'shot-2d',
        validations: new Map([['task-type-2d', 'task-2d']]),
        tasks: ['task-2d'],
        ready_for: 'task-type-2d',
        nb_entities_out: 2
      }
      const twinTaskMap = new Map([
        [
          'task-render',
          {
            id: 'task-render',
            task_type_id: 'task-type-render',
            task_status_id: 'task-status-1',
            assignees: [],
            nb_assets_ready: 2
          }
        ],
        [
          'task-2d',
          {
            id: 'task-2d',
            task_type_id: 'task-type-2d',
            task_status_id: 'task-status-1',
            assignees: ['person-1'],
            priority: 3,
            nb_assets_ready: 2
          }
        ]
      ])
      const keptBy = query =>
        applyFilters(
          [renderShot, twoDShot],
          getFilters({
            entryIndex,
            assetTypes,
            taskTypes: twins,
            taskStatuses,
            descriptors,
            persons,
            query
          }),
          twinTaskMap
        ).map(entry => entry.id)

      it('matches the status on either task type', () => {
        expect(keptBy('[COMPOSITING]=[wip]')).toEqual([
          'shot-render',
          'shot-2d'
        ])
      })

      it('excludes an entry as soon as one of them holds the status', () => {
        expect(keptBy('[COMPOSITING]=[-wip]')).toEqual([])
      })

      it('matches assigned and unassigned on either task type', () => {
        expect(keptBy('[COMPOSITING]=assigned')).toEqual(['shot-2d'])
        expect(keptBy('[COMPOSITING]=unassigned')).toEqual(['shot-render'])
      })

      it('matches assignedto on either task type', () => {
        expect(keptBy('assignedto[COMPOSITING]=[John Doe]')).toEqual([
          'shot-2d'
        ])
      })

      it('matches the priority on either task type', () => {
        expect(keptBy('priority-[COMPOSITING]=3')).toEqual(['shot-2d'])
      })

      it('matches readyfor on either task type', () => {
        expect(keptBy('readyfor=[COMPOSITING]')).toEqual([
          'shot-render',
          'shot-2d'
        ])
      })

      it('matches assetsready on either task type', () => {
        expect(keptBy('assetsready=[COMPOSITING]')).toEqual([
          'shot-render',
          'shot-2d'
        ])
      })

      it('still exposes the first match for the filter builder modal', () => {
        const filters = getFilters({
          entryIndex,
          assetTypes,
          taskTypes: twins,
          taskStatuses,
          descriptors,
          persons,
          query: '[COMPOSITING]=[wip]'
        })
        const statusFilter = filters.find(f => f.type === 'status')
        expect(statusFilter.taskType).toEqual(twins[0])
        expect(statusFilter.taskTypes).toHaveLength(2)
      })
    })

    describe('empty keyword on a task type', () => {
      const animTaskTypes = [{ name: 'Anim body', id: 'task-type-anim' }]
      const withTask = {
        id: 'shot-with-task',
        validations: new Map([['task-type-anim', 'task-anim']]),
        tasks: ['task-anim']
      }
      const withoutTask = {
        id: 'shot-without-task',
        validations: new Map(),
        tasks: []
      }
      const animTaskMap = new Map([
        ['task-anim', { id: 'task-anim', task_status_id: 'task-status-1' }]
      ])
      const keptBy = query =>
        applyFilters(
          [withTask, withoutTask],
          getFilters({
            entryIndex,
            assetTypes,
            taskTypes: animTaskTypes,
            taskStatuses,
            descriptors,
            persons,
            query
          }),
          animTaskMap
        ).map(entry => entry.id)

      it('keeps the entries without the task', () => {
        expect(keptBy('[anim body]=empty')).toEqual(['shot-without-task'])
      })

      it('keeps the entries with the task when negated', () => {
        expect(keptBy('[anim body]=-empty')).toEqual(['shot-with-task'])
        expect(keptBy('[anim body]=[-empty]')).toEqual(['shot-with-task'])
      })

      it('narrows a negated status to the entries with the task', () => {
        expect(keptBy('[anim body]=-done')).toEqual([
          'shot-with-task',
          'shot-without-task'
        ])
        expect(keptBy('[anim body]=-done [anim body]=-empty')).toEqual([
          'shot-with-task'
        ])
      })

      it('filters on a status named empty rather than the keyword', () => {
        const filters = getFilters({
          entryIndex,
          assetTypes,
          taskTypes: animTaskTypes,
          taskStatuses: [
            ...taskStatuses,
            { id: 'task-status-empty', short_name: 'empty' }
          ],
          descriptors,
          persons,
          query: '[anim body]=empty'
        })
        expect(filters).toHaveLength(1)
        expect(filters[0].type).toBe('status')
        expect(filters[0].taskStatuses).toEqual(['task-status-empty'])
      })
    })

    describe('archived task type sharing a live task type name', () => {
      // A studio archived an old COMPOSITING task type and kept a live one
      // with the same name. The archived twin used to win the name lookup,
      // which left that single column unfilterable.
      const compositingTaskTypes = [
        { name: 'COMPOSITING', id: 'task-type-archived', archived: true },
        { name: 'COMPOSITING', id: 'task-type-live' }
      ]
      const shot = {
        id: 'shot-1',
        validations: new Map([['task-type-live', 'task-1']]),
        tasks: ['task-1']
      }
      const taskMap = new Map([
        ['task-1', { id: 'task-1', task_status_id: 'task-status-1' }]
      ])
      const filtersFor = query =>
        getFilters({
          entryIndex,
          assetTypes,
          taskTypes: compositingTaskTypes,
          taskStatuses,
          descriptors,
          persons,
          query
        })

      it('resolves the filter to the live task type', () => {
        const statusFilters = filtersFor('[COMPOSITING]=[wip]').filter(
          f => f.type === 'status'
        )
        expect(statusFilters).toHaveLength(1)
        expect(statusFilters[0].taskType.id).toEqual('task-type-live')
      })

      it('keeps the matching shot instead of emptying the list', () => {
        const filters = filtersFor('[COMPOSITING]=[wip]')
        expect(applyFilters([shot], filters, taskMap)).toEqual([shot])
      })

      it('still excludes on a negated status instead of matching everything', () => {
        const filters = filtersFor('[COMPOSITING]=[-wip]')
        expect(applyFilters([shot], filters, taskMap)).toEqual([])
      })

      it('keeps a shot whose task is not in the excluded status', () => {
        const filters = filtersFor('[COMPOSITING]=[-done]')
        expect(applyFilters([shot], filters, taskMap)).toEqual([shot])
      })

      // Zou rejects an exact name duplicate but not a case differing one:
      // the guard at blueprints/crud/task_type.py:157 is a case sensitive
      // get_by(name=name), so this is the shape a studio can actually reach.
      // An archived task type that still carries tasks keeps a column, so a
      // filter aimed at it has to keep working.
      it('still filters on an archived task type that has no live twin', () => {
        const archivedOnly = [
          { name: 'COMPOSITING', id: 'task-type-archived', archived: true }
        ]
        const archivedShot = {
          id: 'shot-2',
          validations: new Map([['task-type-archived', 'task-1']]),
          tasks: ['task-1']
        }
        const filters = getFilters({
          entryIndex,
          assetTypes,
          taskTypes: archivedOnly,
          taskStatuses,
          descriptors,
          persons,
          query: '[COMPOSITING]=[wip]'
        })
        const statusFilters = filters.filter(f => f.type === 'status')
        expect(statusFilters).toHaveLength(1)
        expect(statusFilters[0].taskType.id).toEqual('task-type-archived')
        expect(applyFilters([archivedShot], filters, taskMap)).toEqual([
          archivedShot
        ])
      })

      it('puts the live task type ahead of an archived twin differing only by case', () => {
        const filters = getFilters({
          entryIndex,
          assetTypes,
          taskTypes: [
            { name: 'Compositing', id: 'task-type-archived', archived: true },
            { name: 'COMPOSITING', id: 'task-type-live' }
          ],
          taskStatuses,
          descriptors,
          persons,
          query: '[COMPOSITING]=[wip]'
        })
        const statusFilters = filters.filter(f => f.type === 'status')
        expect(statusFilters).toHaveLength(1)
        expect(statusFilters[0].taskType.id).toEqual('task-type-live')
        expect(applyFilters([shot], filters, taskMap)).toEqual([shot])
      })
    })

    it('several task types', () => {
      const filters = getFilters({
        entryIndex,
        assetTypes,
        taskTypes,
        taskStatuses,
        descriptors,
        persons,
        query: '[modeling]=[wip,wfa]'
      })
      expect(filters).toHaveLength(1)
      const filter = filters[0]
      expect(filter.taskType).toEqual(taskTypes[1])
      expect(filter.taskStatuses[0]).toEqual('task-status-1')
      expect(filter.taskStatuses[1]).toEqual('task-status-2')
    })

    it('task type with space case', () => {
      const filters = getFilters({
        entryIndex,
        assetTypes,
        taskTypes,
        taskStatuses,
        descriptors,
        persons,
        query: '[modeling facial]=wip'
      })
      expect(filters).toHaveLength(1)
      const filter = filters[0]
      expect(filter.taskType).toEqual(taskTypes[2])
      expect(filter.taskStatuses[0]).toEqual('task-status-1')
    })

    it('non existing task type case', () => {
      const filters = getFilters({
        entryIndex,
        assetTypes,
        taskTypes,
        taskStatuses,
        descriptors,
        persons,
        query: 'compo=wip'
      })
      expect(filters).toHaveLength(0)
    })

    it('no task type in query case', () => {
      const filters = getFilters({
        entryIndex,
        assetTypes,
        taskTypes,
        taskStatuses,
        descriptors,
        persons,
        query: 'empty'
      })
      expect(filters).toHaveLength(0)
    })

    it('empty query case', () => {
      const filters = getFilters({
        entryIndex,
        assetTypes,
        taskTypes,
        taskStatuses,
        descriptors,
        persons,
        query: ''
      })
      expect(filters).toHaveLength(0)
    })

    it('task type with same base name (shorter first)', () => {
      const filters = getFilters({
        entryIndex,
        assetTypes,
        taskTypes,
        taskStatuses,
        descriptors,
        persons,
        query: 'anim=wfa'
      })
      expect(filters).toHaveLength(1)
      const filter = filters[0]
      expect(filter.taskType).toEqual(taskTypes[3])
      expect(filter.taskStatuses[0]).toEqual('task-status-2')
    })

    it('task type with short name', () => {
      const filters = getFilters({
        entryIndex,
        assetTypes,
        taskTypes,
        taskStatuses,
        descriptors,
        persons,
        query: 'bg=wfa'
      })
      expect(filters).toHaveLength(1)
      const filter = filters[0]
      expect(filter.taskType).toEqual(taskTypes[4])
      expect(filter.taskStatuses[0]).toEqual('task-status-2')
    })

    it('multiple task type AND query case', () => {
      const filters = getFilters({
        entryIndex,
        assetTypes,
        taskTypes,
        taskStatuses,
        descriptors,
        persons,
        query: 'modeling=[wip] animation=[wfa] chars'
      })
      expect(filters).toHaveLength(2)
      let filter = filters[0]
      expect(filter.taskType).toEqual(taskTypes[1])
      expect(filter.taskStatuses[0]).toEqual('task-status-1')
      filter = filters[1]
      expect(filter.taskType).toEqual(taskTypes[0])
      expect(filter.taskStatuses[0]).toEqual('task-status-2')
      expect(filters.union).toBeFalsy()
    })

    it('multiple task type OR query case', () => {
      const filters = getFilters({
        entryIndex,
        assetTypes,
        taskTypes,
        taskStatuses,
        descriptors,
        persons,
        query: '+(modeling=[wip] animation=[wfa]) chars'
      })
      expect(filters).toHaveLength(2)
      let filter = filters[0]
      expect(filter.taskType).toEqual(taskTypes[1])
      expect(filter.taskStatuses[0]).toEqual('task-status-1')
      filter = filters[1]
      expect(filter.taskType).toEqual(taskTypes[0])
      expect(filter.taskStatuses[0]).toEqual('task-status-2')
      expect(filters.union).toBeTruthy()
    })

    it('assigned query case', () => {
      const filters = getFilters({
        entryIndex,
        assetTypes,
        taskTypes,
        taskStatuses,
        descriptors,
        persons,
        query: 'modeling=assigned'
      })
      expect(filters).toHaveLength(1)
      const filter = filters[0]
      expect(filter.taskType).toEqual(taskTypes[1])
      expect(filter.taskStatus).toBeUndefined()
      expect(filter.assigned).toEqual(true)
      expect(filter.type).toEqual('assignation')
    })

    it('unassigned query case', () => {
      const filters = getFilters({
        entryIndex,
        assetTypes,
        taskTypes,
        taskStatuses,
        descriptors,
        persons,
        query: 'modeling=unassigned'
      })
      expect(filters).toHaveLength(1)
      const filter = filters[0]
      expect(filter.taskType).toEqual(taskTypes[1])
      expect(filter.taskStatus).toBeUndefined()
      expect(filter.assigned).toEqual(false)
      expect(filter.type).toEqual('assignation')
    })

    it('exclusion query case', () => {
      const filters = getFilters({
        entryIndex,
        assetTypes,
        taskTypes,
        taskStatuses,
        descriptors,
        persons,
        query: '-props'
      })
      expect(filters).toHaveLength(1)
      const filter = filters[0]
      expect(filter.type).toEqual('exclusion')
      expect(filter.excludedIds['asset-1']).toBeTruthy()
    })

    it('descriptor query case', () => {
      const filters = getFilters({
        entryIndex,
        assetTypes,
        taskTypes,
        taskStatuses,
        descriptors,
        persons,
        query: 'family=big'
      })
      expect(filters).toHaveLength(1)
      const filter = filters[0]
      expect(filter.type).toEqual('descriptor')
      expect(filter.values).toEqual(['big'])
      expect(filter.descriptor.id).toEqual('descriptor-1')
    })

    it('filters empty and missing metadata strings', () => {
      const filters = getFilters({
        entryIndex,
        assetTypes,
        taskTypes,
        taskStatuses,
        descriptors,
        persons,
        query: '[Family]=[]'
      })
      const entries = [
        { id: 'asset-empty', data: { family: '' } },
        { id: 'asset-value', data: { family: 'big' } },
        { id: 'asset-missing', data: {} }
      ]

      expect(applyFilters(entries, filters, new Map())).toEqual([
        entries[0],
        entries[2]
      ])
    })

    it.each([
      ['string', '', 'text'],
      ['number', '', 0],
      ['list', '', 'Choice'],
      ['taglist', [], ['Tag']],
      ['boolean', '', false],
      ['checklist', '', JSON.stringify({ Item: false })],
      ['date', '', '2026-09-03'],
      ['url', '', 'https://example.com'],
      ['textarea', '', 'Long text'],
      ['person', '', 'person-1']
    ])('filters empty %s metadata', (dataType, emptyValue, populatedValue) => {
      const descriptor = {
        id: 'descriptor',
        name: 'Metadata',
        field_name: 'metadata',
        data_type: dataType
      }
      const filters = getFilters({
        entryIndex,
        assetTypes,
        taskTypes,
        taskStatuses,
        descriptors: [descriptor],
        persons,
        query: '[Metadata]=[]'
      })
      const entries = [
        { id: 'asset-empty', data: { metadata: emptyValue } },
        { id: 'asset-populated', data: { metadata: populatedValue } }
      ]

      expect(applyFilters(entries, filters, new Map())).toEqual([entries[0]])
    })

    it('withthumbnail in query case', () => {
      let filters = getFilters({
        entryIndex,
        assetTypes,
        taskTypes,
        taskStatuses,
        descriptors,
        persons,
        query: 'withthumbnail'
      })
      expect(filters).toHaveLength(1)
      expect(filters[0].type).toEqual('thumbnail')
      expect(filters[0].excluding).toEqual(false)

      filters = getFilters({
        entryIndex,
        assetTypes,
        taskTypes,
        taskStatuses,
        descriptors,
        persons,
        query: '-withthumbnail'
      })
      expect(filters).toHaveLength(1)
      expect(filters[0].type).toEqual('thumbnail')
      expect(filters[0].excluding).toEqual(true)
    })

    it('assignedto[Modeling]=[John Doe] in query case', () => {
      const filters = getFilters({
        entryIndex,
        assetTypes,
        taskTypes,
        taskStatuses,
        descriptors,
        persons,
        query: 'assignedto[Modeling]=[John Doe]'
      })
      expect(filters).toHaveLength(1)
      expect(filters[0].type).toEqual('assignedto')
      expect(filters[0].personIds[0]).toEqual('person-1')
      expect(filters[0].taskType.id).toEqual('task-type-2')
      expect(filters[0].excluding).toEqual(false)
    })

    it('type=[chars] in query case', () => {
      const filters = getFilters({
        entryIndex,
        assetTypes,
        taskTypes,
        taskStatuses,
        descriptors,
        persons,
        query: 'type=[chars]'
      })
      expect(filters).toHaveLength(1)
      expect(filters[0].type).toEqual('assettype')
      expect(filters[0].assetTypes.map(t => t.id)).toEqual(['asset-type-1'])
      expect(filters[0].excluding).toEqual(false)
    })

    it('type=[-chars,props] in query case', () => {
      const filters = getFilters({
        entryIndex,
        assetTypes,
        taskTypes,
        taskStatuses,
        descriptors,
        persons,
        query: 'type=[-chars,props]'
      })
      expect(filters).toHaveLength(1)
      expect(filters[0].assetTypes.map(t => t.id)).toEqual([
        'asset-type-1',
        'asset-type-3'
      ])
      expect(filters[0].excluding).toEqual(true)
      const entries = [
        { id: 'a1', asset_type_id: 'asset-type-1' },
        { id: 'a2', asset_type_id: 'asset-type-2' },
        { id: 'a3', asset_type_id: 'asset-type-3' }
      ]
      expect(applyFilters(entries, filters, new Map())).toEqual([entries[1]])
    })

    it('color=[blue,red] in query case', () => {
      const filters = getFilters({
        entryIndex,
        assetTypes,
        taskTypes,
        taskStatuses,
        descriptors,
        persons,
        query: 'family=[blue,red]'
      })
      expect(filters).toHaveLength(1)
      expect(filters[0].type).toEqual('descriptor')
      expect(filters[0].values).toEqual(['blue', 'red'])
      expect(filters[0].excluding).toEqual(false)
    })

    it('readyfor=[animation] in query case', () => {
      const filters = getFilters({
        entryIndex,
        assetTypes,
        taskTypes,
        taskStatuses,
        descriptors,
        persons,
        query: 'readyfor=[animation]'
      })
      expect(filters).toHaveLength(1)
      expect(filters[0].type).toEqual('readyfor')
      expect(filters[0].value).toEqual('task-type-1')
    })

    it('priority-animation=3 in query case', () => {
      const filters = getFilters({
        entryIndex,
        assetTypes,
        taskTypes,
        taskStatuses,
        descriptors,
        persons,
        query: 'priority-animation=3'
      })
      expect(filters).toHaveLength(1)
      expect(filters[0].type).toEqual('priority')
      expect(filters[0].taskTypeId).toEqual('task-type-1')
      expect(filters[0].value).toEqual(3)
    })

    describe('department filters', () => {
      const departments = [
        { id: 'department-1', name: 'Modeling' },
        { id: 'department-2', name: 'Animation' }
      ]

      it('keeps the departments the query names', () => {
        const filters = getFilters({
          entryIndex,
          departments,
          persons,
          query: 'department=[modeling,unknown]'
        })
        expect(filters).toHaveLength(1)
        expect(filters[0]).toEqual({
          values: [departments[0]],
          type: 'department',
          excluding: false
        })
      })

      it('reads a leading dash as an exclusion', () => {
        const filters = getFilters({
          entryIndex,
          departments,
          persons,
          query: 'department=-animation'
        })
        expect(filters[0]).toEqual({
          values: [departments[1]],
          type: 'department',
          excluding: true
        })
      })

      it('drops a filter naming no known department', () => {
        const filters = getFilters({
          entryIndex,
          departments,
          persons,
          query: 'department=lighting'
        })
        expect(filters).toHaveLength(0)
      })
    })
  })

  describe('getTaskFilters', () => {
    const tasks = ['SH010', 'SH020', 'SH030'].map((name, index) => ({
      id: `task-${index + 1}`,
      full_entity_name: name,
      task_type_name: 'Animation',
      task_status_short_name: 'wip',
      project_name: 'Agent 327'
    }))
    const taskIndex = buildTaskIndex(tasks)
    const filterTasks = query =>
      applyFilters(tasks, getTaskFilters(taskIndex, query), new Map()).map(
        task => task.id
      )

    it('keeps the tasks of the entities listed in brackets', () => {
      expect(getTaskFilters(taskIndex, '[sh010,sh030]')).toEqual([
        expect.objectContaining({ type: 'taskunion' })
      ])
      expect(filterTasks('[sh010,sh030]')).toEqual(['task-1', 'task-3'])
    })

    it('drops the tasks of an excluded entity', () => {
      expect(getTaskFilters(taskIndex, '-sh020')).toEqual([
        expect.objectContaining({ type: 'exclusion' })
      ])
      expect(filterTasks('-sh020')).toEqual(['task-1', 'task-3'])
    })

    it('builds no filter for plain keywords', () => {
      expect(getTaskFilters(taskIndex, 'sh010 animation')).toEqual([])
    })
  })

  describe('applyFilters', () => {
    const taskTypes = [
      {
        name: 'Animation',
        id: 'task-type-1'
      },
      {
        name: 'Modeling',
        id: 'task-type-2'
      },
      {
        name: 'Compositing',
        id: 'task-type-3'
      },
      {
        name: 'BG',
        id: 'task-type-4'
      }
    ]
    const entries = [
      {
        name: 'SH01',
        sequence_name: 'S01',
        episode_name: 'E01',
        id: 'shot-1',
        data: { color: 'blue' },
        validations: new Map([['task-type-1', 'task-1']]),
        tasks: ['task-1'],
        preview_file_id: 'preview-file-1'
      },
      {
        name: 'SH02',
        sequence_name: 'S01',
        episode_name: 'E01',
        id: 'shot-2',
        data: { color: 'blue' },
        validations: new Map([['task-type-1', 'task-2']]),
        tasks: ['task-2'],
        preview_file_id: 'preview-file-2'
      },
      {
        name: 'SH01',
        sequence_name: 'S02',
        episode_name: 'E01',
        id: 'shot-3',
        data: { color: 'blue' },
        validations: new Map([['task-type-1', 'task-3']]),
        tasks: ['task-3'],
        preview_file_id: ''
      },
      {
        name: 'SH01',
        sequence_name: 'S01',
        episode_name: 'E02',
        id: 'shot-4',
        data: { color: 'the space' },
        validations: new Map([['task-type-1', 'task-4']]),
        tasks: ['task-4']
      },
      {
        name: 'SH02',
        sequence_name: 'S01',
        episode_name: 'E02',
        id: 'shot-5',
        data: { color: 'red' },
        validations: new Map([
          ['task-type-1', 'task-5'],
          ['task-type-3', 'task-6'],
          ['task-type-4', 'task-7']
        ]),
        tasks: ['task-5', 'task-6']
      }
    ]
    const taskMap = new Map(
      Object.entries({
        'task-1': {
          id: 'task-1',
          assignees: [],
          task_status_id: 'task-status-1',
          priority: 0
        },
        'task-2': {
          id: 'task-2',
          assignees: ['person-1'],
          task_status_id: 'task-status-1',
          priority: 0
        },
        'task-3': {
          id: 'task-3',
          assignees: ['person-1', 'person-2'],
          task_status_id: 'task-status-1',
          priority: 3
        },
        'task-4': {
          id: 'task-4',
          assignees: [],
          task_status_id: 'task-status-2',
          priority: 0
        },
        'task-5': {
          id: 'task-5',
          assignees: [],
          task_status_id: 'task-status-2',
          priority: 0
        },
        'task-6': {
          id: 'task-6',
          assignees: [],
          task_status_id: 'task-status-1',
          priority: 0
        },
        'task-7': {
          id: 'task-7',
          assignees: [],
          task_status_id: 'task-status-2',
          priority: 0
        }
      })
    )
    const descriptors = [
      {
        id: 'descriptor-1',
        name: 'Color',
        field_name: 'color'
      }
    ]

    it('animation=wip', () => {
      const filters = [
        {
          taskType: taskTypes[0],
          taskStatuses: ['task-status-1'],
          type: 'status'
        }
      ]
      const results = applyFilters(entries, filters, taskMap)
      expect(results).toHaveLength(3)
    })

    it('bg=done', () => {
      const filters = [
        {
          taskType: taskTypes[3],
          taskStatuses: ['task-status-2'],
          type: 'status'
        }
      ]
      const results = applyFilters(entries, filters, taskMap)
      expect(results).toHaveLength(1)
    })

    it('empty filter', () => {
      const filters = []
      const results = applyFilters(entries, filters, taskMap)
      expect(results).toHaveLength(5)
    })

    it('multiple filters', () => {
      const filters = [
        {
          taskType: taskTypes[0],
          taskStatuses: ['task-status-2'],
          type: 'status'
        },
        {
          taskType: taskTypes[2],
          taskStatuses: ['task-status-1'],
          type: 'status'
        }
      ]
      const results = applyFilters(entries, filters, taskMap)
      expect(results).toHaveLength(1)
    })

    it('multiple or filters', () => {
      const filters = [
        {
          taskType: taskTypes[0],
          taskStatuses: ['task-status-2'],
          type: 'status'
        },
        {
          taskType: taskTypes[2],
          taskStatuses: ['task-status-1'],
          type: 'status'
        }
      ]
      filters.union = true
      const results = applyFilters(entries, filters, taskMap, true)
      expect(results).toHaveLength(2)
    })

    it('in filter', () => {
      const filters = [
        {
          taskType: taskTypes[0],
          taskStatuses: ['task-status-1', 'task-status-2'],
          type: 'status'
        }
      ]
      const results = applyFilters(entries, filters, taskMap)
      expect(results).toHaveLength(5)
    })

    it('animation=unassigned', () => {
      const filters = [
        {
          taskType: taskTypes[0],
          assigned: false,
          type: 'assignation'
        }
      ]
      const results = applyFilters(entries, filters, taskMap)
      expect(results).toHaveLength(3)
    })

    it('animation=assigned', () => {
      const filters = [
        {
          taskType: taskTypes[0],
          assigned: true,
          type: 'assignation'
        }
      ]
      const results = applyFilters(entries, filters, taskMap)
      expect(results).toHaveLength(2)
    })

    it('exclusion', () => {
      const filters = [
        {
          excludedIds: {
            'shot-2': true
          },
          type: 'exclusion'
        }
      ]
      const results = applyFilters(entries, filters, taskMap)
      expect(results).toHaveLength(4)
    })

    it('color=blue', () => {
      const filters = [
        {
          descriptor: descriptors[0],
          values: ['blue'],
          type: 'descriptor'
        }
      ]
      const results = applyFilters(entries, filters, taskMap)
      expect(results).toHaveLength(3)
    })

    it('color=[the space]', () => {
      const filters = [
        {
          descriptor: descriptors[0],
          values: ['the space'],
          type: 'descriptor'
        }
      ]
      const results = applyFilters(entries, filters, taskMap)
      expect(results).toHaveLength(1)
    })

    it('color=[blue,the space]', () => {
      const filters = [
        {
          descriptor: descriptors[0],
          values: ['blue', 'the space'],
          type: 'descriptor'
        }
      ]
      const results = applyFilters(entries, filters, taskMap)
      expect(results).toHaveLength(4)
    })

    it('withthumbnail', () => {
      const filters = [
        {
          excluding: false,
          type: 'thumbnail'
        }
      ]
      const results = applyFilters(entries, filters, taskMap)
      expect(results).toHaveLength(2)
    })

    it('-withthumbnail', () => {
      const filters = [
        {
          excluding: true,
          type: 'thumbnail'
        }
      ]
      const results = applyFilters(entries, filters, taskMap)
      expect(results).toHaveLength(3)
    })

    it('assignedto=[John Doe]', () => {
      const filters = [
        {
          type: 'assignedto',
          personIds: ['person-1'],
          excluding: false
        }
      ]
      const results = applyFilters(entries, filters, taskMap)
      expect(results).toHaveLength(2)
    })

    it('priority-animation=3', () => {
      const filters = [
        {
          type: 'priority',
          taskTypeId: 'task-type-1',
          value: 3
        }
      ]
      const results = applyFilters(entries, filters, taskMap)
      expect(results).toHaveLength(1)
    })

    it('readyfor=[Animation]', () => {
      const assetEntries = [
        {
          name: 'Bunny',
          id: 'asset-1',
          data: {},
          validations: new Map([['task-type-1', 'task-1']]),
          tasks: ['task-1'],
          ready_for: 'task-type-1'
        },
        {
          name: 'Lama',
          id: 'asset-1',
          data: {},
          validations: new Map([['task-type-1', 'task-1']]),
          tasks: ['task-1'],
          ready_for: 'task-type-2'
        }
      ]
      const filters = [
        {
          type: 'readyfor',
          value: 'task-type-1'
        }
      ]
      const results = applyFilters(assetEntries, filters, taskMap)
      expect(results).toHaveLength(1)
    })

    // The plain list of the episodes comes without their tasks.
    it.each([
      [
        'status',
        {
          taskType: taskTypes[0],
          taskStatuses: ['task-status-1'],
          type: 'status'
        }
      ],
      ['priority', { taskTypeId: 'task-type-1', type: 'priority', value: 3 }]
    ])('keeps no entry without tasks on a %s filter', (name, filter) => {
      const episodes = [{ id: 'episode-1', name: 'E01' }]
      expect(applyFilters(episodes, [filter], taskMap)).toEqual([])
    })

    it('status=wfa matches a task of any task type', () => {
      const filters = [
        { type: 'statusAny', taskStatuses: ['task-status-2'], excluding: false }
      ]
      const withoutTasks = { id: 'asset-1', name: 'Bunny' }
      const filterIds = () =>
        applyFilters([...entries, withoutTasks], filters, taskMap).map(
          entry => entry.id
        )

      expect(filterIds()).toEqual(['shot-4', 'shot-5'])
      filters[0].excluding = true
      expect(filterIds()).toEqual(['shot-1', 'shot-2', 'shot-3', 'asset-1'])
    })

    it('department=Modeling keeps the people of the department', () => {
      const people = [
        { id: 'person-1', departments: ['department-1', 'department-2'] },
        { id: 'person-2', departments: ['department-2'] },
        { id: 'person-3', departments: [] }
      ]
      const filters = [
        {
          type: 'department',
          values: [{ id: 'department-1' }],
          excluding: false
        }
      ]
      const filterIds = () =>
        applyFilters(people, filters, new Map()).map(person => person.id)

      expect(filterIds()).toEqual(['person-1'])
      filters[0].excluding = true
      expect(filterIds()).toEqual(['person-2', 'person-3'])
    })
  })
})
