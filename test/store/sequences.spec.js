import { expect } from 'chai'
import helpers from './helpers'
import store from '../../src/store'
import sequencesApi from '../../src/store/api/shots'
import sequencesStore from '../../src/store/modules/shots'
import { reset, runAction } from './helpers'
import {
  LOAD_EPISODES_END,
  LOAD_SEQUENCES_END,
  LOAD_SHOTS_END,

  NEW_SEQUENCE_START,
  NEW_SEQUENCE_ERROR,
  NEW_SEQUENCE_END,

  EDIT_SEQUENCE_START,
  EDIT_SEQUENCE_ERROR,
  EDIT_SEQUENCE_END,

  DELETE_SEQUENCE_START,
  DELETE_SEQUENCE_ERROR,
  DELETE_SEQUENCE_END,

  SET_SEQUENCE_SEARCH,
  DISPLAY_MORE_SEQUENCES,
  SET_SEQUENCE_LIST_SCROLL_POSITION,
  COMPUTE_SEQUENCE_STATS,

  SET_CURRENT_PRODUCTION,
  LOAD_TASK_STATUSES_END,
  LOAD_TASK_TYPES_END
} from '../../src/store/mutation-types'


let episodes = []
let sequences = []
let shots = []

let production = {}
let taskStatuses = []
let taskTypes = []
let userFilters = []


sequencesApi.getSequences = (callback) => {
  process.nextTick(() => {
    callback(null, sequences)
  })
}

sequencesApi.newSequence = (sequence, callback) => {
  sequence.id = 'sequence-4'
  process.nextTick(() => {
    callback(null, sequence)
  })
}

sequencesApi.updateSequence = (sequence, callback) => {
  process.nextTick(() => {
    callback(null, sequence)
  })
}

sequencesApi.deleteSequence = (sequence, callback) => {
  process.nextTick(() => {
    callback(null, sequence)
  })
}

const getters = sequencesStore.getters
const state = store.state.shots

describe('sequences', () => {

  beforeEach(helpers.reset)
  afterEach(helpers.reset)

  beforeEach(() => {
    sequences = [
      {
        id: 'sequence-1',
        name: 'SE01',
        parent_id: 'episode-1'
      },
      {
        id: 'sequence-3',
        name: 'SE03',
        parent_id: 'episode-1'
      },
      {
        id: 'sequence-2',
        name: 'SE02',
        parent_id: 'episode-1'
      }
    ]

    episodes = [
      {
        id: 'episode-1',
        name: 'E01'
      }
    ]

    shots = [
      {
        id: 1,
        name: 'S01',
        parent_id: 'sequence-1',
        sequence_id: 'sequence-1',
        sequence_name: 'SE01',
        episode_name: 'E01',
        canceled: false,
        data: {},
        tasks: [
          {
            id: 'task-1',
            entity_name: 'BBB / Bunny',
            task_type_name: 'Animation',
            task_type_color: '#0000FF',
            task_type_priority: 1,
            task_type_id: 'task-type-1',
            task_status_id: 'task-status-3',
            taskStatus: {
              name: 'Waiting For Approval',
              short_name: 'wfa'
            },
            assignees: []
          },
          {
            id: 'task-2',
            entity_name: 'BBB / Bunny',
            project_name: 'BBB',
            task_type_name: 'Compositing',
            task_type_color: '#00FF00',
            task_type_id: 'task-type-2',
            task_status_id: 'task-status-3',
            task_type_priority: 2,
            taskStatus: {
              name: 'Waiting For Approval',
              short_name: 'wfa'
            },
            assignees: []
          }
        ]
      }
    ]

    shots = [
      {
        id: 'shot-1',
        name: 'S01',
        parent_id: 'sequence-1',
        sequence_id: 'sequence-1',
        sequence_name: 'SE01',
        episode_name: 'E01',
        canceled: false,
        data: {},
        tasks: [
          {
            id: 'task-1',
            entity_name: 'BBB / Bunny',
            task_type_name: 'Animation',
            task_type_color: '#0000FF',
            task_type_priority: 1,
            task_type_id: 'task-type-1',
            task_status_id: 'task-status-3',
            taskStatus: {
              name: 'Waiting For Approval',
              short_name: 'wfa'
            },
            assignees: []
          },
          {
            id: 'task-2',
            entity_name: 'BBB / Bunny',
            project_name: 'BBB',
            task_type_name: 'Compositing',
            task_type_color: '#00FF00',
            task_type_id: 'task-type-2',
            task_status_id: 'task-status-3',
            task_type_priority: 2,
            taskStatus: {
              name: 'Waiting For Approval',
              short_name: 'wfa'
            },
            assignees: []
          }
        ]
      },
      {
        id: 'shot-2',
        name: 'S02',
        parent_id: 'sequence-1',
        sequence_id: 'sequence-1',
        sequence_name: 'SE01',
        episode_name: 'E01',
        canceled: false,
        data: {},
        tasks: [
          {
            id: 'task-1',
            entity_name: 'BBB / Bunny',
            task_type_name: 'Animation',
            task_type_color: '#0000FF',
            task_type_priority: 1,
            task_type_id: 'task-type-1',
            task_status_id: 'task-status-3',
            taskStatus: {
              name: 'Waiting For Approval',
              short_name: 'wfa'
            },
            assignees: []
          },
          {
            id: 'task-2',
            entity_name: 'BBB / Bunny',
            project_name: 'BBB',
            task_type_name: 'Compositing',
            task_type_color: '#00FF00',
            task_type_id: 'task-type-2',
            task_status_id: 'task-status-3',
            task_type_priority: 2,
            taskStatus: {
              name: 'Waiting For Approval',
              short_name: 'wfa'
            },
            assignees: []
          }
        ]
      },
      {
        id: 'shot-3',
        name: 'S01',
        parent_id: 'sequence-2',
        sequence_id: 'sequence-2',
        sequence_name: 'SE02',
        episode_name: 'E01',
        canceled: false,
        data: {},
        tasks: [
          {
            id: 'task-1',
            entity_name: 'BBB / Bunny',
            task_type_name: 'Animation',
            task_type_color: '#0000FF',
            task_type_priority: 1,
            task_type_id: 'task-type-1',
            task_status_id: 'task-status-3',
            taskStatus: {
              name: 'Waiting For Approval',
              short_name: 'wfa'
            },
            assignees: []
          },
          {
            id: 'task-2',
            entity_name: 'BBB / Bunny',
            project_name: 'BBB',
            task_type_name: 'Compositing',
            task_type_color: '#00FF00',
            task_type_id: 'task-type-2',
            task_status_id: 'task-status-3',
            task_type_priority: 2,
            taskStatus: {
              name: 'Waiting For Approval',
              short_name: 'wfa'
            },
            assignees: []
          }
        ]
      }

    ]

    production = {
      name: 'Big Buck Bunny',
      id: 'production-1'
    }

    taskStatuses = [
      {
        id: 'task-status-1',
        name: 'Todo',
        short_name: 'todo',
        color: '#FFFFFF',
        is_reviewable: false
      },
      {
        id: 'task-status-2',
        name: 'Retake',
        short_name: 'rtk',
        color: '#000000',
        is_reviewable: false
      },
      {
        id: 'task-status-3',
        name: 'Waiting For Approval',
        short_name: 'wfa',
        color: '#333333',
        is_reviewable: false
      }
    ]

    taskTypes = [
      {
        id: 'task-type-1',
        name: 'Animation',
        priority: 1
      },
      {
        id: 'task-type-2',
        name: 'Compositing',
        priority: 2
      },
      {
        id: 'task-type-3',
        name: 'FX',
        priority: 3

      }
    ]

    userFilters = {
      shot: {}
    }
  })

  describe('getters', () => {
  })

  describe('actions', () => {
    it('displayMoreSequences', () => {
      for(let i = 0; i < 100; i++) {
        sequences.push({
          id: 'sequence-x' + i,
          name: 'SE0x' + i,
          parent_id: 'episode-1'
        })
      }
      store.commit(LOAD_EPISODES_END, episodes)
      store.commit(LOAD_SEQUENCES_END, sequences)
      expect(state.sequences.length).to.equal(103)
      expect(state.displayedSequences.length).to.equal(60)
      store.commit(DISPLAY_MORE_SEQUENCES)
      expect(state.displayedSequences.length).to.equal(103)
    })

    it.skip('initSequences', (done) => {
      done()
    })

    it('newSequence', (done) => {
      const sequence = {
        id: 'sequence-4',
        name: 'SE01b',
        parent_id: 'episode-1'
      }
      store.commit(LOAD_EPISODES_END, episodes)
      store.commit(LOAD_SEQUENCES_END, sequences)
      helpers.runAction('newSequence', {
        sequence,
        callback: () => {
          expect(state.sequences[1].id).to.equal(sequence.id)
          expect(state.sequences[1].episode_name).to.equal('E01')
          expect(state.sequenceMap[sequence.id].name).to.equal(sequence.name)
          done()
        }
      })
    })

    it('editSequence', () => {
      const sequence = {
        id: 'sequence-1',
        name: 'SE01b'
      }
      store.commit(LOAD_EPISODES_END, episodes)
      store.commit(LOAD_SEQUENCES_END, sequences)
      return helpers
        .runAction('editSequence', sequence)
        .then(() => {
          expect(state.sequences[0].name).to.equal(sequence.name)
          expect(state.sequenceIndex['se01b'][0].name).to.equal(sequence.name)
        })
    })

    it('deleteSequence', () => {
      const sequence = {
        id: 'sequence-1',
        name: 'SE01'
      }
      store.commit(LOAD_EPISODES_END, episodes)
      store.commit(LOAD_SEQUENCES_END, sequences)
      return helpers
        .runAction('deleteSequence', sequence)
        .then(() => {
          expect(state.sequences.length).to.equal(2)
          expect(state.displayedSequences.length).to.equal(2)
          expect(state.sequences[0].id).to.equal('sequence-2')
        })
    })

    it('setSequenceSearch', () => {
      const searchText = 'SE02'
      store.commit(LOAD_EPISODES_END, episodes)
      store.commit(LOAD_SEQUENCES_END, sequences)
      helpers.runAction('setSequenceSearch', searchText)

      expect(state.displayedSequences.length).to.equal(1)
      expect(state.displayedSequencesLength).to.equal(1)
      expect(state.displayedSequences[0].id).to.equal('sequence-2')
      expect(state.sequenceSearchText).to.equal(searchText)
    })

    it('computeSequenceStats', () => {
      store.commit(LOAD_TASK_STATUSES_END, taskStatuses)
      store.commit(LOAD_TASK_TYPES_END, taskTypes)
      store.commit(SET_CURRENT_PRODUCTION, production)
      store.commit(LOAD_EPISODES_END, episodes)
      store.commit(LOAD_SEQUENCES_END, sequences)
      store.commit(LOAD_SHOTS_END, { production, shots, userFilters })
      helpers.runAction('computeSequenceStats')
      expect(
        state.sequenceStats['sequence-1']['task-type-1']['#333333'].value
      ).to.equal(2)
      expect(
        state.sequenceStats['sequence-1']['task-type-2']['#333333'].value
      ).to.equal(2)
      expect(
        state.sequenceStats['sequence-2']['task-type-1']['#333333'].value
      ).to.equal(1)

    })
  })

  describe('mutations', () => {
    it(LOAD_SEQUENCES_END, () => {
      store.commit(LOAD_EPISODES_END, episodes)
      store.commit(LOAD_SEQUENCES_END, sequences)

      expect(state.sequences.length).to.equal(3)
      expect(state.sequences[1].name).to.equal('SE02')
      expect(state.sequenceMap['sequence-1'].name).to.equal('SE01')
      expect(state.sequenceMap['sequence-1'].episode_id).to.equal('episode-1')
      expect(state.sequenceMap['sequence-1'].episode_name).to.equal('E01')

      expect(state.displayedSequences.length).to.equal(3)
      expect(state.displayedSequencesLength).to.equal(3)
      expect(state.sequenceIndex['se0'].length).to.equal(3)
    })

    it(NEW_SEQUENCE_START, () => {})
    it(NEW_SEQUENCE_ERROR, () => {})
    it(NEW_SEQUENCE_END, () => {
      const sequence = {
        id: 'sequence-4',
        name: 'SE01b',
        parent_id: 'episode-1'
      }
      store.commit(LOAD_EPISODES_END, episodes)
      store.commit(LOAD_SEQUENCES_END, sequences)
      store.commit(NEW_SEQUENCE_END, sequence)

      expect(state.sequences[1].id).to.equal(sequence.id)
      expect(state.sequences[1].episode_name).to.equal('E01')
      expect(state.sequenceMap[sequence.id].name).to.equal(sequence.name)
    })

    it(EDIT_SEQUENCE_START, () => {})
    it(EDIT_SEQUENCE_ERROR, () => {})
    it(EDIT_SEQUENCE_END, () => {
      const sequence = {
        id: 'sequence-1',
        name: 'SE01b'
      }
      store.commit(LOAD_EPISODES_END, episodes)
      store.commit(LOAD_SEQUENCES_END, sequences)
      store.commit(EDIT_SEQUENCE_END, sequence)

      expect(state.sequences[0].name).to.equal(sequence.name)
      expect(state.sequenceIndex['se01b'][0].name).to.equal(sequence.name)
    })

    it(DELETE_SEQUENCE_START, () => {})
    it(DELETE_SEQUENCE_ERROR, () => {})
    it(DELETE_SEQUENCE_END, () => {
      const sequence = {
        id: 'sequence-1',
        name: 'SE01'
      }
      store.commit(LOAD_EPISODES_END, episodes)
      store.commit(LOAD_SEQUENCES_END, sequences)
      store.commit(DELETE_SEQUENCE_END, sequence)
      expect(state.sequences.length).to.equal(2)
      expect(state.displayedSequences.length).to.equal(2)
      expect(state.sequences[0].id).to.equal('sequence-2')
    })

    it(SET_SEQUENCE_SEARCH, () => {
      const searchText = 'SE02'
      store.commit(LOAD_EPISODES_END, episodes)
      store.commit(LOAD_SEQUENCES_END, sequences)
      store.commit(SET_SEQUENCE_SEARCH, searchText)

      expect(state.displayedSequences.length).to.equal(1)
      expect(state.displayedSequencesLength).to.equal(1)
      expect(state.displayedSequences[0].id).to.equal('sequence-2')
      expect(state.sequenceSearchText).to.equal(searchText)
    })

    it(DISPLAY_MORE_SEQUENCES, () => {
      for(let i = 0; i < 100; i++) {
        sequences.push({
          id: 'sequence-x' + i,
          name: 'SE0x' + i,
          parent_id: 'episode-1'
        })
      }
      store.commit(LOAD_EPISODES_END, episodes)
      store.commit(LOAD_SEQUENCES_END, sequences)
      expect(state.sequences.length).to.equal(103)
      expect(state.displayedSequences.length).to.equal(60)
      store.commit(DISPLAY_MORE_SEQUENCES)
      expect(state.displayedSequences.length).to.equal(103)
    })

    it(SET_SEQUENCE_LIST_SCROLL_POSITION, () => {
      const scrollPosition = 203
      store.commit(SET_SEQUENCE_LIST_SCROLL_POSITION, scrollPosition)
      expect(state.sequenceListScrollPosition).to.equal(scrollPosition)
    })

    it(COMPUTE_SEQUENCE_STATS, () => {
      store.commit(LOAD_TASK_STATUSES_END, taskStatuses)
      store.commit(LOAD_TASK_TYPES_END, taskTypes)
      store.commit(SET_CURRENT_PRODUCTION, production)
      store.commit(LOAD_EPISODES_END, episodes)
      store.commit(LOAD_SEQUENCES_END, sequences)
      store.commit(LOAD_SHOTS_END, { production, shots, userFilters })
      store.commit(COMPUTE_SEQUENCE_STATS)
      expect(
        state.sequenceStats['sequence-1']['task-type-1']['#333333'].value
      ).to.equal(2)
      expect(
        state.sequenceStats['sequence-1']['task-type-2']['#333333'].value
      ).to.equal(2)
      expect(
        state.sequenceStats['sequence-2']['task-type-1']['#333333'].value
      ).to.equal(1)
    })
  })
})
