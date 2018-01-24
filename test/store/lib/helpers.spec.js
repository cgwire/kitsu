import { expect } from 'chai'
import test from '../../../src/lib/string'
import { populateTask } from '../../../src/lib/helpers'

describe('lib/helpers', () => {

  it('populateTask', () => {
    let task = {
      'entity_name': 'Agent 327',
      'entity_type_name': 'Characters'
    }
    populateTask(task)
    expect(task.full_entity_name).to.equal('Characters / Agent 327')

    task = {
      'entity_name': 'SH01',
      'entity_type_name': 'Shot',
      'sequence_name': 'SQ01',
      'episode_name': 'E01'
    }
    populateTask(task)
    expect(task.full_entity_name).to.equal('E01 / SQ01 / SH01')

    task = {
      'entity_name': 'SH01',
      'entity_type_name': 'Shot',
      'sequence_name': 'SQ01'
    }
    populateTask(task)
    expect(task.full_entity_name).to.equal('SQ01 / SH01')
  })
})
