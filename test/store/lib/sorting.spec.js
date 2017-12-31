import { expect } from 'chai'
import {
  sortAssets,
  sortByName,
  sortProductions,
  sortShots,
  sortValidationColumns
} from '../../../src/lib/sorting'


describe('sorting', () => {

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
        project_name: 'Big Buck Bunny',
        sequence_name: 'SE02',
        name: 'SH03',
        id: 5
      },
      {
        canceled: false,
        project_name: 'Big Buck Bunny',
        sequence_name: 'SE02',
        name: 'SH02',
        id: 4
      },
      {
        canceled: false,
        project_name: 'Big Buck Bunny',
        sequence_name: 'SE02',
        name: 'SH01',
        id: 3
      },
      {
        canceled: true,
        project_name: 'Agent 327',
        sequence_name: 'SE01',
        name: 'SH01',
        id: 6
      },
      {
        canceled: false,
        project_name: 'Big Buck Bunny',
        sequence_name: 'SE01',
        name: 'SH01',
        id: 2
      },
      {
        canceled: false,
        project_name: 'Agent 327',
        sequence_name: 'SE01',
        name: 'SH02',
        id: 1
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
