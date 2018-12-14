import { expect } from 'chai'
import test from '../../../src/lib/string'
import {
  applyFilters,
  getKeyWords,
  getExcludingKeyWords,
  getFilters,
  buildTaskTypeIndex
} from '../../../src/lib/filtering'


describe('lib/filtering', () => {

  describe('getExcludingKeyWords', () => {
    it('classic query', () => {
      const keyWords = getKeyWords(
        'chars bunny modeling=wip -bunnyfat'
      )
      expect(keyWords).to.deep.equal(['chars', 'bunny'])
    })

    it('no keyword query', () => {
      const keyWords = getKeyWords(
        'modeling=wip -bunnyfat'
      )
      expect(keyWords).to.deep.equal([])
    })

    it('empty query', () => {
      const keyWords = getKeyWords('')
      expect(keyWords).to.deep.equal([])
    })
  })

  describe('getExcludingKeyWords', () => {
    it('classic query', () => {
      const keyWords = getExcludingKeyWords(
        '-chars bunny modeling=wip -bunnyfat'
      )
      expect(keyWords).to.deep.equal(['chars', 'bunnyfat'])
    })

    it('no excluding keyword query', () => {
      const keyWords = getExcludingKeyWords(
        'chars bunny'
      )
      expect(keyWords).to.deep.equal([])
    })

    it('empty query', () => {
      const keyWords = getExcludingKeyWords('')
      expect(keyWords).to.deep.equal([])
    })
  })

  describe('getFilters', () => {
    const entryIndex = {
      'props': [{id: 'asset-1'}]
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
        'modeling=wip'
      )
      expect(filters.length).to.equal(1)
      const filter = filters[0]
      expect(filter.taskType).to.deep.equal(taskTypes[1])
      expect(filter.taskStatus.short_name).to.equal('wip')
      expect(filter.assigned).to.be.undefined
      expect(filter.type).to.equal('status')
    })

    it('shortcut case', () => {
      const filters = getFilters(
        entryIndex,
        taskTypes,
        taskStatuses,
        'mode=wip'
      )
      expect(filters.length).to.equal(1)
      const filter = filters[0]
      expect(filter.taskType).to.deep.equal(taskTypes[1])
      expect(filter.taskStatus.short_name).to.equal('wip')
    })

    it('task type with space case', () => {
      const filters = getFilters(
        entryIndex,
        taskTypes,
        taskStatuses,
        '[modeling facial]=wip'
      )
      expect(filters.length).to.equal(1)
      const filter = filters[0]
      expect(filter.taskType).to.deep.equal(taskTypes[2])
      expect(filter.taskStatus.short_name).to.equal('wip')
    })

    it('non existing task type case', () => {
      const filters = getFilters(
        entryIndex,
        taskTypes,
        taskStatuses,
        'compo=wip'
      )
      expect(filters.length).to.equal(0)
    })

    it('no task type in query case', () => {
      const filters = getFilters(
        entryIndex,
        taskTypes,
        taskStatuses,
        'toto'
      )
      expect(filters.length).to.equal(0)
    })

    it('empty query case', () => {
      const filters = getFilters(
        entryIndex,
        taskTypes,
        taskStatuses,
        ''
      )
      expect(filters.length).to.equal(0)
    })

    it('multiple task type query case', () => {
      const filters = getFilters(
        entryIndex,
        taskTypes,
        taskStatuses,
        'mode=wip anim=wfa chars'
      )
      expect(filters.length).to.equal(2)
      let filter = filters[0]
      expect(filter.taskType).to.deep.equal(taskTypes[1])
      expect(filter.taskStatus.short_name).to.equal('wip')
      filter = filters[1]
      expect(filter.taskType).to.deep.equal(taskTypes[0])
      expect(filter.taskStatus.short_name).to.equal('wfa')
    })

    it('assigned query case', () => {
      const filters = getFilters(
        entryIndex,
        taskTypes,
        taskStatuses,
        'mode=assigned'
      )
      expect(filters.length).to.equal(1)
      let filter = filters[0]
      expect(filter.taskType).to.deep.equal(taskTypes[1])
      expect(filter.taskStatus).to.be.undefined
      expect(filter.assigned).to.equal(true)
      expect(filter.type).to.equal('assignation')
    })

    it('unassigned query case', () => {
      const filters = getFilters(
        entryIndex,
        taskTypes,
        taskStatuses,
        'mode=unassigned'
      )
      expect(filters.length).to.equal(1)
      let filter = filters[0]
      expect(filter.taskType).to.deep.equal(taskTypes[1])
      expect(filter.taskStatus).to.be.undefined
      expect(filter.assigned).to.equal(false)
      expect(filter.type).to.equal('assignation')
    })

    it('exclusion query case', () => {
      const filters = getFilters(
        entryIndex,
        taskTypes,
        taskStatuses,
        '-props'
      )
      expect(filters.length).to.equal(1)
      let filter = filters[0]
      expect(filter.type).to.equal('exclusion')
      expect(filter.excludedIds['asset-1']).to.be.ok
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
        validations: {'task-type-1': 'task-1'}
      },
      {
        name: 'SH02', sequence_name: 'S01', episode_name: 'E01', id: 'shot-2',
        validations: {'task-type-1': 'task-2'}
      },
      {
        name: 'SH01', sequence_name: 'S02', episode_name: 'E01', id: 'shot-3',
        validations: {'task-type-1': 'task-3'}
      },
      {
        name: 'SH01', sequence_name: 'S01', episode_name: 'E02', id: 'shot-4',
        validations: {'task-type-1': 'task-4'}
      },
      {
        name: 'SH02', sequence_name: 'S01', episode_name: 'E02', id: 'shot-5',
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
      expect(results.length).to.equal(3)
    })

    it('empty filter', () => {
      const filters = []
      let results = applyFilters(
        entries,
        filters,
        taskMap
      )
      expect(results.length).to.equal(5)
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
      expect(results.length).to.equal(1)
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
      expect(results.length).to.equal(3)
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
      expect(results.length).to.equal(2)
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
      expect(results.length).to.equal(4)
    })
  })
})
