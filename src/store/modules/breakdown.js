import Vue from 'vue'
import breakdownApi from '../api/breakdown'
import { sortAssets } from '../../lib/sorting'
import { groupEntitiesByParents } from '../../lib/models'

import {
  CASTING_SET_SEQUENCE,
  CASTING_SET_EPISODE,
  CASTING_SET_CASTING,
  CASTING_SET_SHOTS,
  CASTING_SET_SEQUENCES,

  CASTING_ADD_TO_CASTING,
  CASTING_REMOVE_FROM_CASTING,

  LOAD_SHOT_CASTING_END,
  LOAD_ASSET_CAST_IN_END,

  RESET_ALL
} from '../mutation-types'

const initialState = {
  castingSequenceId: '',
  castingShotId: 0,
  castingSequenceShots: [],
  castingEpisodeSequences: [],
  castingSequenceOptions: [],

  castingCurrentShot: null,
  casting: {},
  castingByType: []
}
const state = { ...initialState }

const getters = {
  castingEpisodeSequences: state => state.castingEpisodeSequences,
  castingSequenceId: state => state.castingSequenceId,
  castingSequenceShots: state => state.castingSequenceShots,
  castingSequenceOptions: state => state.castingSequenceOptions,

  casting: state => state.casting,
  castingByType: state => state.castingByType,
  castingCurrentShot: state => state.castingCurrentShot
}

const actions = {

  setCastingSequence ({ commit, rootState }, sequenceId) {
    if (!sequenceId) {
      return console.error('SequenceId is undefined, no casting can be set.')
    }
    const assetMap = rootState.assets.assetMap
    const shots =
      Object.values(rootState.shots.shotMap)
        .filter((shot) => shot.sequence_id === sequenceId)
    commit(CASTING_SET_SEQUENCE, sequenceId)
    commit(CASTING_SET_SHOTS, shots)
    return breakdownApi.getSequenceCasting(sequenceId)
      .then((casting) => {
        commit(CASTING_SET_CASTING, { casting, assetMap })
      })
  },

  setCastingEpisode ({ commit, rootState }, episodeId) {
    if (!episodeId) {
      return console.error('EpisodeId is undefined, no casting can be set.')
    }
    let sequences = rootState.shots.sequences
    commit(CASTING_SET_SEQUENCES, sequences)
    commit(CASTING_SET_EPISODE, episodeId)
  },

  addAssetToCasting ({ commit, rootState }, { shotId, assetId, nbOccurences }) {
    const asset = rootState.assets.assetMap[assetId]
    commit(CASTING_ADD_TO_CASTING, { shotId, asset, nbOccurences })
  },

  removeAssetFromCasting (
    { commit, rootState }, { shotId, assetId, nbOccurences }
  ) {
    const asset = rootState.assets.assetMap[assetId]
    commit(CASTING_REMOVE_FROM_CASTING, { shotId, asset, nbOccurences })
  },

  saveCasting ({ commit }, shotId) {
    if (!shotId) {
      return console.error('ShotId is undefined, no casting can be saved.')
    }
    const casting = []
    Object.values(state.casting[shotId]).forEach((asset) => {
      casting.push({
        asset_id: asset.asset_id,
        nb_occurences: asset.nb_occurences || 1
      })
    })
    return breakdownApi.updateCasting(shotId, casting)
  },

  uploadCastingFile ({ commit, state, rootGetters }, formData) {
    const currentProduction = rootGetters.currentProduction
    return breakdownApi.postCastingCsv(currentProduction, formData)
  }
}

const mutations = {

  [CASTING_SET_SHOTS] (state, shots) {
    const casting = []
    const castingByType = []
    state.castingSequenceShots = shots
    shots.forEach((shot) => {
      casting[shot.id] = []
      castingByType[shot.id] = []
    })
    state.casting = casting
    state.castingByType = castingByType
  },

  [CASTING_SET_SEQUENCES] (state, sequences) {
    state.castingEpisodeSequences = sequences
    state.castingSequenceOptions = sequences.map((sequence) => {
      const route = {
        name: 'breakdown-sequence',
        params: {
          production_id: sequence.project_id,
          sequence_id: sequence.id
        }
      }
      if (sequence.episode_id) {
        route.name = `episode-${route.name}`
        route.params.episode_id = sequence.episode_id
      }
      return {
        label: sequence.name,
        value: sequence.id,
        route: route
      }
    })
  },

  [CASTING_SET_SEQUENCE] (state, sequenceId) {
    state.castingSequenceId = sequenceId
  },

  [CASTING_SET_EPISODE] (state, episodeId) {
    state.castingEpisodeId = episodeId
  },

  [CASTING_SET_CASTING] (state, { casting, assetMap }) {
    const shotCastingByType = {}
    const shotCastingKeys = Object.keys(casting)
    shotCastingKeys.forEach((shotId) => {
      const shotCasting = casting[shotId]
      shotCastingByType[shotId] =
        groupEntitiesByParents(shotCasting, 'asset_type_name')
    })
    Object.assign(state.casting, casting)
    state.casting = { ...state.casting }
    Object.assign(state.castingByType, shotCastingByType)
    state.castingByType = { ...state.castingByType }
  },

  [CASTING_ADD_TO_CASTING] (state, { shotId, asset, nbOccurences }) {
    if (!state.casting[shotId]) state.casting[shotId] = []
    const previousAsset = state.casting[shotId].find(
      a => a.asset_id === asset.id
    )
    if (previousAsset) {
      previousAsset.nb_occurences += nbOccurences
    } else {
      const newAsset = {
        asset_id: asset.id,
        name: asset.name,
        asset_name: asset.name,
        asset_type_name: asset.asset_type_name,
        nb_occurences: nbOccurences,
        preview_file_id: asset.preview_file_id
      }
      state.casting[shotId].push(newAsset)
    }
    state.casting[shotId] = sortAssets(state.casting[shotId])
    state.castingByType[shotId] =
      groupEntitiesByParents(state.casting[shotId], 'asset_type_name')
  },

  [CASTING_REMOVE_FROM_CASTING] (state, { shotId, asset, nbOccurences }) {
    const previousAsset = state.casting[shotId].find(
      a => a.asset_id === asset.id
    )
    if (previousAsset) {
      previousAsset.nb_occurences -= nbOccurences
      if (previousAsset.nb_occurences < 1) {
        delete state.casting[shotId][asset.id]
        state.casting[shotId] = state.casting[shotId].filter(
          a => a.asset_id !== asset.id
        )
      }
      state.castingByType[shotId] = groupEntitiesByParents(
        state.casting[shotId], 'asset_type_name'
      )
    }
  },

  [LOAD_SHOT_CASTING_END] ({ state, rootState }, { shot, casting }) {
    shot.casting = casting
    Vue.set(
      shot,
      'castingAssetsByType',
      groupEntitiesByParents(casting, 'asset_type_name')
    )
  },

  [LOAD_ASSET_CAST_IN_END] ({ state, rootState }, { asset, castIn }) {
    castIn.forEach((shot) => {
      if (shot.episode_name) {
        shot.sequence_name = `${shot.episode_name} / ${shot.sequence_name}`
      }
    })
    asset.castIn = castIn
    Vue.set(
      asset,
      'castInShotsBySequence',
      groupEntitiesByParents(castIn, 'sequence_name')
    )
  },

  [RESET_ALL] (state) {
    Object.assign(state, { ...initialState })
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
