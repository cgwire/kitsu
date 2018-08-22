import { expect } from 'chai'
import test from '../../../src/lib/string'
import {
  applyFilters,
  buildIndex,
  findFilter
} from '../../../src/lib/filtering'

describe('lib/filtering', () => {

  it('findFilter', () => {
    let taskTypeNameIndex = buildIndex(
      ["Modeling", "Animation", "Modeling facial"]
    )
    let filter = findFilter(taskTypeNameIndex, "modeling=wip")
    expect(filter.taskType).to.equal('Modeling')
    expect(filter.taskStatus).to.equal('wip')

    filter = findFilter(taskTypeNameIndex, "ep01 mode=wip")
    expect(filter.taskType).to.equal('Modeling')
    expect(filter.taskStatus).to.equal('wip')

    filter = findFilter(taskTypeNameIndex, "compo=wip")
    expect(filter.taskType).to.be.undefined

    filter = findFilter(taskTypeNameIndex, "[modeling facial]=wip")
    expect(filter.taskType).to.equal('Modeling facial')
    expect(filter.taskStatus).to.equal('wip')
  })

  it('applyFilters', () => {
    const entries = [
      {
        name: 'SH01', sequence_name: 'S01', episode_name: 'E01', id: 1,
        validations: {'Animation': '1'}
      },
      {
        name: 'SH02', sequence_name: 'S01', episode_name: 'E01', id: 2,
        validations: {'Animation': '2'}
      },
      {
        name: 'SH01', sequence_name: 'S02', episode_name: 'E01', id: 3,
        validations: {'Animation': '3'}
      },
      {
        name: 'SH01', sequence_name: 'S01', episode_name: 'E02', id: 4,
        validations: {'Animation': '4'}
      },
      {
        name: 'SH02', sequence_name: 'S01', episode_name: 'E02', id: 5,
        validations: {
          'Animation': '5',
          'Animation Facial': '6'
        }
      }
    ]
    const taskTypes = [
      'Animation',
      'Modeling',
      'Animation Facial'
    ]
    const taskMap = {
      '1': { id: '1', task_status_id: '1' },
      '2': { id: '2', task_status_id: '1' },
      '3': { id: '3', task_status_id: '1' },
      '4': { id: '4', task_status_id: '2' },
      '5': { id: '5', task_status_id: '2' },
      '6': { id: '6', task_status_id: '1' },
    }
    const taskStatusMap = {
      '1': { id: '1', short_name: 'wip' },
      '2': { id: '2', short_name: 'done' }
    }
    let results = applyFilters(
      taskTypes,
      entries,
      'anim=wip',
      taskStatusMap,
      taskMap
    )
    expect(results.length).to.equal(3)

    results = applyFilters(
      taskTypes,
      entries,
      '[Animation Facial]=wip',
      taskStatusMap,
      taskMap
    )
    expect(results.length).to.equal(1)
  })
})
