import { expect } from 'chai'
import helpers from './helpers'
import store from '../../src/store'
import episodesApi from '../../src/store/api/shots'
import episodesStore from '../../src/store/modules/shots'
import { reset, runAction } from './helpers'
import {
  LOAD_EPISODES_END,
  LOAD_SEQUENCES_END,
  LOAD_SHOTS_END,

  NEW_EPISODE_START,
  NEW_EPISODE_ERROR,
  NEW_EPISODE_END,

  EDIT_EPISODE_START,
  EDIT_EPISODE_ERROR,
  EDIT_EPISODE_END,

  DELETE_EPISODE_START,
  DELETE_EPISODE_ERROR,
  DELETE_EPISODE_END,

  SET_EPISODE_SEARCH,
  DISPLAY_MORE_EPISODES,
  SET_EPISODE_LIST_SCROLL_POSITION,
  COMPUTE_EPISODE_STATS,

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


episodesApi.getEpisodes = (callback) => {
  process.nextTick(() => {
    callback(null, episodes)
  })
}

episodesApi.newEpisode = (episode, callback) => {
  episode.id = 'episode-4'
  process.nextTick(() => {
    callback(null, episode)
  })
}

episodesApi.updateEpisode = (episode, callback) => {
  process.nextTick(() => {
    callback(null, episode)
  })
}

episodesApi.deleteEpisode = (episode, callback) => {
  process.nextTick(() => {
    callback(null, episode)
  })
}

const getters = episodesStore.getters
const state = store.state.shots

describe('episodes', () => {

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
      },
      {
        id: 'episode-3',
        name: 'E03'
      },
      {
        id: 'episode-2',
        name: 'E02'
      }
    ]

    shots = [
      {
        id: 'shot-1',
        name: 'S01',
        parent_id: 'sequence-1',
        sequence_id: 'sequence-1',
        episode_id: 'episode-1',
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
        episode_id: 'episode-1',
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
    it('displayMoreEpisodes', () => {
      for(let i = 0; i < 100; i++) {
        episodes.push({
          id: 'episode-x' + i,
          name: 'SE0x' + i,
          parent_id: 'episode-1'
        })
      }
      store.commit(LOAD_EPISODES_END, episodes)
      expect(state.episodes.length).to.equal(103)
      expect(state.displayedEpisodes.length).to.equal(60)
      store.commit(DISPLAY_MORE_EPISODES)
      expect(state.displayedEpisodes.length).to.equal(103)
    })

    it.skip('initEpisodes', () => {
    })

    it('newEpisode', (done) => {
      const episode = {
        id: 'episode-4',
        name: 'E01b',
        parent_id: 'episode-1'
      }
      store.commit(LOAD_EPISODES_END, episodes)
      helpers.runAction('newEpisode', {
        episode,
        callback: () => {
          expect(state.episodes[1].id).to.equal(episode.id)
          expect(state.episodes[1].name).to.equal('E01b')
          expect(state.episodeMap[episode.id].name).to.equal(episode.name)
          done()
        }
      })
    })

    it('editEpisode', () => {
      const episode = {
        id: 'episode-1',
        name: 'E01b'
      }
      store.commit(LOAD_EPISODES_END, episodes)
      return helpers
        .runAction('editEpisode', episode)
        .then(() => {
          expect(state.episodes[0].name).to.equal(episode.name)
          expect(state.episodeIndex['e01b'][0].name).to.equal(episode.name)
        })
    })

    it('deleteEpisode', () => {
      const episode = {
        id: 'episode-1',
        name: 'E01'
      }
      store.commit(LOAD_EPISODES_END, episodes)
      return helpers
        .runAction('deleteEpisode', episode)
        .then(() => {
          expect(state.episodes.length).to.equal(2)
          expect(state.displayedEpisodes.length).to.equal(2)
          expect(state.episodes[0].id).to.equal('episode-2')
        })
    })

    it('setEpisodeSearch', () => {
      const searchText = 'E02'
      store.commit(LOAD_EPISODES_END, episodes)
      helpers.runAction('setEpisodeSearch', searchText)

      expect(state.displayedEpisodes.length).to.equal(1)
      expect(state.displayedEpisodesLength).to.equal(1)
      expect(state.displayedEpisodes[0].id).to.equal('episode-2')
      expect(state.episodeSearchText).to.equal(searchText)
    })

    it('computeEpisodeStats', () => {
      store.commit(LOAD_TASK_STATUSES_END, taskStatuses)
      store.commit(LOAD_TASK_TYPES_END, taskTypes)
      store.commit(SET_CURRENT_PRODUCTION, production)
      store.commit(LOAD_EPISODES_END, episodes)
      store.commit(LOAD_SEQUENCES_END, sequences)
      store.commit(LOAD_SHOTS_END, { production, shots, userFilters })
      helpers.runAction('computeEpisodeStats')
      expect(
        state.episodeStats['episode-1']['task-type-1']['#333333'].value
      ).to.equal(2)
      expect(
        state.episodeStats['episode-1']['task-type-2']['#333333'].value
      ).to.equal(2)
    })
  })

  describe('mutations', () => {
    it(LOAD_EPISODES_END, () => {
      store.commit(LOAD_EPISODES_END, episodes)

      expect(state.episodes.length).to.equal(3)
      expect(state.episodes[1].name).to.equal('E02')
      expect(state.episodeMap['episode-1'].name).to.equal('E01')

      expect(state.displayedEpisodes.length).to.equal(3)
      expect(state.displayedEpisodesLength).to.equal(3)
      expect(state.episodeIndex['e0'].length).to.equal(3)
    })

    it(NEW_EPISODE_START, () => {})
    it(NEW_EPISODE_ERROR, () => {})
    it(NEW_EPISODE_END, () => {
      const episode = {
        id: 'episode-4',
        name: 'E01b'
      }
      store.commit(LOAD_EPISODES_END, episodes)
      store.commit(NEW_EPISODE_END, episode)

      expect(state.episodes[1].id).to.equal(episode.id)
      expect(state.episodes[1].name).to.equal('E01b')
      expect(state.episodeMap[episode.id].name).to.equal(episode.name)
    })

    it(EDIT_EPISODE_START, () => {})
    it(EDIT_EPISODE_ERROR, () => {})
    it(EDIT_EPISODE_END, () => {
      const episode = {
        id: 'episode-1',
        name: 'SE01b'
      }
      store.commit(LOAD_EPISODES_END, episodes)
      store.commit(EDIT_EPISODE_END, episode)

      expect(state.episodes[0].name).to.equal(episode.name)
      expect(state.episodeIndex['se01b'][0].name).to.equal(episode.name)
    })

    it(DELETE_EPISODE_START, () => {})
    it(DELETE_EPISODE_ERROR, () => {})
    it(DELETE_EPISODE_END, () => {
      const episode = {
        id: 'episode-1',
        name: 'E01'
      }
      store.commit(LOAD_EPISODES_END, episodes)
      store.commit(DELETE_EPISODE_END, episode)
      expect(state.episodes.length).to.equal(2)
      expect(state.displayedEpisodes.length).to.equal(2)
      expect(state.episodes[0].id).to.equal('episode-2')
    })

    it(SET_EPISODE_SEARCH, () => {
      const searchText = 'E02'
      store.commit(LOAD_EPISODES_END, episodes)
      store.commit(SET_EPISODE_SEARCH, searchText)

      expect(state.displayedEpisodes.length).to.equal(1)
      expect(state.displayedEpisodesLength).to.equal(1)
      expect(state.displayedEpisodes[0].id).to.equal('episode-2')
      expect(state.episodeSearchText).to.equal(searchText)
    })

    it(DISPLAY_MORE_EPISODES, () => {
      for(let i = 0; i < 100; i++) {
        episodes.push({
          id: 'episode-x' + i,
          name: 'SE0x' + i,
          parent_id: 'episode-1'
        })
      }
      store.commit(LOAD_EPISODES_END, episodes)
      store.commit(LOAD_SEQUENCES_END, sequences)
      expect(state.episodes.length).to.equal(103)
      expect(state.displayedEpisodes.length).to.equal(60)
      store.commit(DISPLAY_MORE_EPISODES)
      expect(state.displayedEpisodes.length).to.equal(103)
    })

    it(SET_EPISODE_LIST_SCROLL_POSITION, () => {
      const scrollPosition = 203
      store.commit(SET_EPISODE_LIST_SCROLL_POSITION, scrollPosition)
      expect(state.episodeListScrollPosition).to.equal(scrollPosition)
    })

    it(COMPUTE_EPISODE_STATS, () => {
      store.commit(LOAD_TASK_STATUSES_END, taskStatuses)
      store.commit(LOAD_TASK_TYPES_END, taskTypes)
      store.commit(SET_CURRENT_PRODUCTION, production)
      store.commit(LOAD_EPISODES_END, episodes)
      store.commit(LOAD_SEQUENCES_END, sequences)
      store.commit(LOAD_SHOTS_END, { production, shots, userFilters })
      store.commit(COMPUTE_EPISODE_STATS)
      expect(
        state.episodeStats['episode-1']['task-type-1']['#333333'].value
      ).to.equal(2)
      expect(
        state.episodeStats['episode-1']['task-type-2']['#333333'].value
      ).to.equal(2)
    })
  })
})
