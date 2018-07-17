import { expect } from 'chai'
import test from '../../../src/lib/string'
import {
  applyFilters,
  buildIndex,
  findFilter
} from '../../../src/lib/filtering'

describe('lib/indexing', () => {

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
        validations: {'Animation': { task_status_short_name: 'wip'}}
      },
      {
        name: 'SH02', sequence_name: 'S01', episode_name: 'E01', id: 2,
        validations: {'Animation': { task_status_short_name: 'wip'}}
      },
      {
        name: 'SH01', sequence_name: 'S02', episode_name: 'E01', id: 3,
        validations: {'Animation': { task_status_short_name: 'wip'}}
      },
      {
        name: 'SH01', sequence_name: 'S01', episode_name: 'E02', id: 4,
        validations: {'Animation': { task_status_short_name: 'done'}}
      },
      {
        name: 'SH02', sequence_name: 'S01', episode_name: 'E02', id: 5,
        validations: {
          'Animation': { task_status_short_name: 'done'},
          'Animation Facial': { task_status_short_name: 'wip'}
        }
      }
    ]
    const taskTypes = [
      'Animation',
      'Modeling',
      'Animation Facial'
    ]
    let results = applyFilters(taskTypes, entries, 'anim=wip')
    expect(results.length).to.equal(3)
    results = applyFilters(taskTypes, entries, '[Animation Facial]=wip')
    expect(results.length).to.equal(1)
  })
})
