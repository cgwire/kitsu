import {
  applyFilters,
  getKeyWords,
  getMultipleKeyWords,
  getExcludingKeyWords,
  getFilters
} from '@/lib/filtering'

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

    it('no keyword query', () => {
      const keyWords = getKeyWords('modeling=wip -bunnyfat')
      expect(keyWords).toEqual([])
    })

    it('empty query', () => {
      const keyWords = getKeyWords('')
      expect(keyWords).toEqual([])
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

    it('shortcut case', () => {
      const filters = getFilters({
        entryIndex,
        assetTypes,
        taskTypes,
        taskStatuses,
        descriptors,
        persons,
        query: 'mode=wip'
      })
      expect(filters).toHaveLength(2) // the descriptor is included too
      const filter = filters[0]
      expect(filter.taskType).toEqual(taskTypes[1])
      expect(filter.taskStatuses[0]).toEqual('task-status-1')
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
      expect(filters[0].personId).toEqual('person-1')
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
      expect(filters[0].assetType.id).toEqual('asset-type-1')
      expect(filters[0].excluding).toEqual(false)
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
          personId: 'person-1',
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
  })
})
