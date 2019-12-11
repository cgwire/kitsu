import {
  applyFilters,
  getKeyWords,
  getExcludingKeyWords,
  getFilters,
  buildTaskTypeIndex
} from '../../../src/lib/filtering'


describe('lib/filtering', () => {

  describe('getKeyWords', () => {
    it('classic query', () => {
      const keyWords = getKeyWords(
        'chars bunny modeling=wip -bunnyfat'
      )
      expect(keyWords).toEqual(['chars', 'bunny'])
    })

    it('no keyword query', () => {
      const keyWords = getKeyWords(
        'modeling=wip -bunnyfat'
      )
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
      const keyWords = getExcludingKeyWords(
        'chars bunny'
      )
      expect(keyWords).toEqual([])
    })

    it('empty query', () => {
      const keyWords = getExcludingKeyWords('')
      expect(keyWords).toEqual([])
    })
  })

  describe('getFilters', () => {
    const entryIndex = {
      'props': [
        {id: 'asset-1', data: {family: 'big'}},
        {id: 'asset-2', data: {family: 'small'}},
        {id: 'asset-3', data: {family: 'small'}},
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
      }
    ]
    const descriptors = [
      {
        id: 'descriptor-1',
        name: 'Family',
        field_name: 'family'
      }
    ]
    const taskStatuses = [
      { id: '1', short_name: 'wip' },
      { id: '2', short_name: 'wfa' },
      { id: '3', short_name: 'done' }
    ]

    it('simple case', () => {
      const filters = getFilters(
        entryIndex,
        taskTypes,
        taskStatuses,
        descriptors,
        'modeling=wip'
      )
      expect(filters.length).toEqual(1)
      const filter = filters[0]
      expect(filter.taskType).toEqual(taskTypes[1])
      expect(filter.taskStatus.short_name).toEqual('wip')
      expect(filter.assigned).toBeUndefined()
      expect(filter.type).toEqual('status')
    })

    it('shortcut case', () => {
      const filters = getFilters(
        entryIndex,
        taskTypes,
        taskStatuses,
        descriptors,
        'mode=wip'
      )
      expect(filters.length).toEqual(1)
      const filter = filters[0]
      expect(filter.taskType).toEqual(taskTypes[1])
      expect(filter.taskStatus.short_name).toEqual('wip')
    })

    it('task type with space case', () => {
      const filters = getFilters(
        entryIndex,
        taskTypes,
        taskStatuses,
        descriptors,
        '[modeling facial]=wip'
      )
      expect(filters.length).toEqual(1)
      const filter = filters[0]
      expect(filter.taskType).toEqual(taskTypes[2])
      expect(filter.taskStatus.short_name).toEqual('wip')
    })

    it('non existing task type case', () => {
      const filters = getFilters(
        entryIndex,
        taskTypes,
        taskStatuses,
        descriptors,
        'compo=wip'
      )
      expect(filters.length).toEqual(0)
    })

    it('no task type in query case', () => {
      const filters = getFilters(
        entryIndex,
        taskTypes,
        taskStatuses,
        descriptors,
        'toto'
      )
      expect(filters.length).toEqual(0)
    })

    it('empty query case', () => {
      const filters = getFilters(
        entryIndex,
        taskTypes,
        taskStatuses,
        descriptors,
        ''
      )
      expect(filters.length).toEqual(0)
    })

    it('multiple task type query case', () => {
      const filters = getFilters(
        entryIndex,
        taskTypes,
        taskStatuses,
        descriptors,
        'mode=wip anim=wfa chars'
      )
      expect(filters.length).toEqual(2)
      let filter = filters[0]
      expect(filter.taskType).toEqual(taskTypes[1])
      expect(filter.taskStatus.short_name).toEqual('wip')
      filter = filters[1]
      expect(filter.taskType).toEqual(taskTypes[0])
      expect(filter.taskStatus.short_name).toEqual('wfa')
    })

    it('assigned query case', () => {
      const filters = getFilters(
        entryIndex,
        taskTypes,
        taskStatuses,
        descriptors,
        'mode=assigned'
      )
      expect(filters.length).toEqual(1)
      let filter = filters[0]
      expect(filter.taskType).toEqual(taskTypes[1])
      expect(filter.taskStatus).toBeUndefined()
      expect(filter.assigned).toEqual(true)
      expect(filter.type).toEqual('assignation')
    })

    it('unassigned query case', () => {
      const filters = getFilters(
        entryIndex,
        taskTypes,
        taskStatuses,
        descriptors,
        'mode=unassigned'
      )
      expect(filters.length).toEqual(1)
      let filter = filters[0]
      expect(filter.taskType).toEqual(taskTypes[1])
      expect(filter.taskStatus).toBeUndefined()
      expect(filter.assigned).toEqual(false)
      expect(filter.type).toEqual('assignation')
    })

    it('exclusion query case', () => {
      const filters = getFilters(
        entryIndex,
        taskTypes,
        taskStatuses,
        descriptors,
        '-props'
      )
      expect(filters.length).toEqual(1)
      let filter = filters[0]
      expect(filter.type).toEqual('exclusion')
      expect(filter.excludedIds['asset-1']).toBeTruthy()
    })

    it('descriptor query case', () => {
      const filters = getFilters(
        entryIndex,
        taskTypes,
        taskStatuses,
        descriptors,
        'family=big'
      )
      expect(filters.length).toEqual(1)
      let filter = filters[0]
      expect(filter.type).toEqual('descriptor')
      expect(filter.value).toEqual('big')
      expect(filter.descriptor.id).toEqual('descriptor-1')
    })

    it('withthumbnail in query case', () => {
      let filters = getFilters(
        entryIndex,
        taskTypes,
        taskStatuses,
        descriptors,
        'withthumbnail'
      )
      expect(filters.length).toEqual(1)
      expect(filters[0].type).toEqual('thumbnail')
      expect(filters[0].excluding).toEqual(false)

      filters = getFilters(
        entryIndex,
        taskTypes,
        taskStatuses,
        descriptors,
        '-withthumbnail'
      )
      expect(filters.length).toEqual(1)
      expect(filters[0].type).toEqual('thumbnail')
      expect(filters[0].excluding).toEqual(true)
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
        }
    ]
    const entries = [
      {
        name: 'SH01', sequence_name: 'S01', episode_name: 'E01', id: 'shot-1',
        data: {color: 'blue'},
        validations: {'task-type-1': 'task-1'},
        preview_file_id: 'preview-file-1'
      },
      {
        name: 'SH02', sequence_name: 'S01', episode_name: 'E01', id: 'shot-2',
        data: {color: 'blue'},
        validations: {'task-type-1': 'task-2'},
        preview_file_id: 'preview-file-2'
      },
      {
        name: 'SH01', sequence_name: 'S02', episode_name: 'E01', id: 'shot-3',
        data: {color: 'blue'},
        validations: {'task-type-1': 'task-3'},
        preview_file_id: ''
      },
      {
        name: 'SH01', sequence_name: 'S01', episode_name: 'E02', id: 'shot-4',
        data: {color: 'blue'},
        validations: {'task-type-1': 'task-4'}
      },
      {
        name: 'SH02', sequence_name: 'S01', episode_name: 'E02', id: 'shot-5',
        data: {color: 'red'},
        validations: {
          'task-type-1': 'task-5',
          'task-type-3': 'task-6'
        }
      }
    ]
    const taskMap = {
      'task-1': {
        id: 'task-1',
        assignees: [],
        task_status_id: 'task-status-1'
      },
      'task-2': {
        id: 'task-2',
        assignees: ['person-1'],
        task_status_id: 'task-status-1'
      },
      'task-3': {
        id: 'task-3',
        assignees: ['person-1', 'person-2'],
        task_status_id: 'task-status-1'
      },
      'task-4': {
        id: 'task-4',
        assignees: [],
        task_status_id: 'task-status-2'
      },
      'task-5': {
        id: 'task-5',
        assignees: [],
        task_status_id: 'task-status-2'
      },
      'task-6': {
        id: 'task-6',
        assignees: [],
        task_status_id: 'task-status-1'
      }
    }
    const taskStatusMap = {
      'task-status-1': { id: 'task-status-1', short_name: 'wip' },
      'task-status-2': { id: 'task-status-2', short_name: 'done' }
    }
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
          taskStatus: taskStatusMap['task-status-1'],
          type: 'status'
        }
      ]
      let results = applyFilters(
        entries,
        filters,
        taskMap
      )
      expect(results.length).toEqual(3)
    })

    it('empty filter', () => {
      const filters = []
      let results = applyFilters(
        entries,
        filters,
        taskMap
      )
      expect(results.length).toEqual(5)
    })

    it('multiple filters', () => {
      const filters = [
        {
          taskType: taskTypes[0],
          taskStatus: taskStatusMap['task-status-2'],
          type: 'status'
        },
        {
          taskType: taskTypes[2],
          taskStatus: taskStatusMap['task-status-1'],
          type: 'status'
        }
      ]
      let results = applyFilters(
        entries,
        filters,
        taskMap
      )
      expect(results.length).toEqual(1)
    })

    it('animation=unassigned', () => {
      const filters = [
        {
          taskType: taskTypes[0],
          assigned: false,
          type: 'assignation'
        }
      ]
      let results = applyFilters(
        entries,
        filters,
        taskMap
      )
      expect(results.length).toEqual(3)
    })

    it('animation=assigned', () => {
      const filters = [
        {
          taskType: taskTypes[0],
          assigned: true,
          type: 'assignation'
        }
      ]
      let results = applyFilters(
        entries,
        filters,
        taskMap
      )
      expect(results.length).toEqual(2)
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
      let results = applyFilters(
        entries,
        filters,
        taskMap
      )
      expect(results.length).toEqual(4)
    })

    it('color=blue', () => {
      const filters = [
        {
          descriptor: descriptors[0],
          value: 'blue',
          type: 'descriptor'
        }
      ]
      let results = applyFilters(
        entries,
        filters,
        taskMap
      )
      expect(results.length).toEqual(4)
    })

    it('withthumbnail', () => {
      const filters = [
        {
          excluding: false,
          type: 'thumbnail'
        }
      ]
      let results = applyFilters(
        entries,
        filters,
        taskMap
      )
      expect(results.length).toEqual(2)
    })

    it('-withthumbnail', () => {
      const filters = [
        {
          excluding: true,
          type: 'thumbnail'
        }
      ]
      let results = applyFilters(
        entries,
        filters,
        taskMap
      )
      expect(results.length).toEqual(3)
    })
  })
})
