import { expect } from 'chai'
import {
  sortAssets,
  sortByName,
  sortProductions,
  sortShots,
  sortTaskTypes,
  sortTasks,
  sortValidationColumns
} from '../../../src/lib/sorting'


describe('lib/sorting', () => {

  beforeEach(() => {
  })

  it('sortByName', () => {
    const entries = [
      {name: 'Zou', id: 3},
      {name: 'Kitsu', id: 2},
      {name: 'Gazu', id: 1},
    ]
    let results = sortByName(entries)
    expect(results.length).to.equal(3)
    expect(results[0].id).to.equal(1)
    expect(results[1].id).to.equal(2)
    expect(results[2].id).to.equal(3)

    results = sortByName([])
    expect(results.length).to.equal(0)
  })

  it('sortAssets', () => {
    const entries = [
      {
        canceled: false,
        project_name: 'Big Buck Bunny',
        asset_type_name: 'Props',
        name: 'Tree',
        id: 4
      },
      {
        canceled: false,
        project_name: 'Big Buck Bunny',
        asset_type_name: 'Props',
        name: 'Table',
        id: 3
      },
      {
        canceled: false,
        project_name: 'Big Buck Bunny',
        asset_type_name: 'Props',
        name: 'Chair',
        id: 2
      },
      {
        canceled: false,
        project_name: 'Big Buck Bunny',
        asset_type_name: 'Characters',
        name: 'Bunny',
        id: 1
      }
    ]
    let results = sortAssets(entries)
    expect(results.length).to.equal(4)
    expect(results[0].id).to.equal(1)
    expect(results[1].id).to.equal(2)
    expect(results[2].id).to.equal(3)
    expect(results[3].id).to.equal(4)

    results = sortAssets([])
    expect(results.length).to.equal(0)
  })

  it('sortShots', () => {
    const entries = [
      {
        canceled: false,
        episode_name: 'E01',
        sequence_name: 'SE02',
        name: 'SH03',
        id: 4
      },
      {
        canceled: false,
        episode_name: 'E01',
        sequence_name: 'SE02',
        name: 'SH02',
        id: 3
      },
      {
        canceled: false,
        episode_name: 'E01',
        sequence_name: 'SE02',
        name: 'SH01',
        id: 2
      },
      {
        canceled: true,
        episode_name: 'E01',
        sequence_name: 'SE03',
        name: 'SH01',
        id: 6
      },
      {
        canceled: false,
        episode_name: 'E01',
        sequence_name: 'SE01',
        name: 'SH01',
        id: 1
      },
      {
        canceled: false,
        episode_name: 'E02',
        sequence_name: 'SE01',
        name: 'SH01',
        id: 5
      }
    ]
    let results = sortShots(entries)

    expect(results.length).to.equal(6)
    expect(results[0].id).to.equal(1)
    expect(results[1].id).to.equal(2)
    expect(results[2].id).to.equal(3)
    expect(results[3].id).to.equal(4)
    expect(results[4].id).to.equal(5)
    expect(results[5].id).to.equal(6)

    results = sortShots([])
    expect(results.length).to.equal(0)
  })

  it('sortProductions', () => {
    const entries = [
      {project_status_name: 'closed', name: 'Big Buck Bunny', id: 3},
      {project_status_name: 'open', name: 'Cosmos Landromat', id: 2},
      {project_status_name: 'open', name: 'Agent 327', id: 1},
    ]
    let results = sortProductions(entries)
    expect(results.length).to.equal(3)
    expect(results[0].id).to.equal(1)
    expect(results[1].id).to.equal(2)
    expect(results[2].id).to.equal(3)

    results = sortProductions([])
    expect(results.length).to.equal(0)
  })

  it('sortTaskTypes', () => {
    const entries = [
      {for_shots: false, priority: 1, name: 'Modeling', id: 2},
      {for_shots: false, priority: 2, name: 'Setup', id: 5},
      {for_shots: false, priority: 1, name: 'Modeling Low', id: 4},
      {for_shots: false, priority: 1, name: 'Modeling Hi', id: 3},
      {for_shots: true, priority: 1, name: 'Animation', id: 1}
    ]
    let results = sortProductions(entries)
    expect(results.length).to.equal(5)
    expect(results[0].id).to.equal(1)
    expect(results[1].id).to.equal(2)
    expect(results[2].id).to.equal(3)
    expect(results[3].id).to.equal(4)
    expect(results[4].id).to.equal(5)

    results = sortProductions([])
    expect(results.length).to.equal(0)
  })

  it('sortTasks', () => {
    const entries = [
      {
        project_name: 'Big Buck Bunny',
        task_type_name: 'Modeling',
        entity_name: 'Props / Tree',
        id: 4
      },
      {
        project_name: 'Agent 327',
        task_type_name: 'Modeling',
        entity_name: 'Characters / Agent327',
        id: 1
      },
      {
        project_name: 'Agent 327',
        task_type_name: 'Setup',
        entity_name: 'Characters / Agent327',
        id: 3
      },
      {
        project_name: 'Agent 327',
        task_type_name: 'Modeling',
        entity_name: 'Characters / SuperVilain',
        id: 2
      }
    ]
    let results = sortTasks(entries)
    expect(results.length).to.equal(4)
    expect(results[0].id).to.equal(1)
    expect(results[1].id).to.equal(2)
    expect(results[2].id).to.equal(3)
    expect(results[3].id).to.equal(4)

    results = sortProductions([])
    expect(results.length).to.equal(0)
  })

  it('sortTaskTypes', () => {
    const entries = [
      {for_shots: false, priority: 1, name: 'Modeling', id: 2},
      {for_shots: false, priority: 2, name: 'Setup', id: 5},
      {for_shots: false, priority: 1, name: 'Modeling Low', id: 4},
      {for_shots: false, priority: 1, name: 'Modeling Hi', id: 3},
      {for_shots: true, priority: 1, name: 'Animation', id: 1}
    ]
    let results = sortProductions(entries)
    expect(results.length).to.equal(5)
    expect(results[0].id).to.equal(1)
    expect(results[1].id).to.equal(2)
    expect(results[2].id).to.equal(3)
    expect(results[3].id).to.equal(4)
    expect(results[4].id).to.equal(5)

    results = sortProductions([])
    expect(results.length).to.equal(0)
  })

  it('sortValidationColumns', () => {
    const entries = [
      {priority: 2, name: 'Big Buck Bunny', id: 3},
      {priority: 1, name: 'Cosmos Landromat', id: 2},
      {priority: 1, name: 'Agent 327', id: 1},
    ]
    let results = sortValidationColumns(entries)
    expect(results.length).to.equal(3)
    expect(results[0].id).to.equal(1)
    expect(results[1].id).to.equal(2)
    expect(results[2].id).to.equal(3)

    results = sortValidationColumns([])
    expect(results.length).to.equal(0)
  })
})
