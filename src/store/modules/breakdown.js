import Vue from 'vue'
import breakdownApi from '@/store/api/breakdown'
import { sortAssets, sortShots } from '@/lib/sorting'
import { groupEntitiesByParents } from '@/lib/models'

import {
  CASTING_SET_ASSET_TYPES,
  CASTING_SET_ASSET_TYPE,
  CASTING_SET_ASSETS,
  CASTING_SET_EPISODE,
  CASTING_SET_CASTING,
  CASTING_SET_EPISODES,
  CASTING_SET_ENTITY_CASTING,
  CASTING_SET_FOR_EPISODES,
  CASTING_SET_SHOTS,
  CASTING_SET_SEQUENCE,
  CASTING_SET_SEQUENCES,

  CASTING_ADD_TO_CASTING,
  CASTING_REMOVE_FROM_CASTING,

  LOAD_EPISODES_START,
  LOAD_SHOTS_START,
  LOAD_EPISODE_CASTING_END,
  LOAD_SHOT_CASTING_END,
  LOAD_ASSET_CASTING_END,
  LOAD_ASSET_CAST_IN_END,

  CASTING_SET_LINK_LABEL,

  RESET_ALL
} from '@/store/mutation-types'

const initialState = {
  currentProduction: null,
  castingSequenceId: '',
  castingShotId: 0,
  castingEpisodes: [],
  castingSequenceShots: [],
  castingAssetTypeAssets: [],
  castingEpisodeSequences: [],
  castingSequencesOptions: [],
  castingAssetTypesOptions: [],

  castingCurrentShot: null,
  casting: {},
  castingByType: []
}
const state = { ...initialState }

const getters = {
  castingEpisodes: state => state.castingEpisodes,
  castingEpisodeSequences: state => state.castingEpisodeSequences,
  castingSequenceId: state => state.castingSequenceId,
  castingSequenceShots: state => state.castingSequenceShots,
  castingAssetTypeAssets: state => state.castingAssetTypeAssets,
  castingSequencesOptions: state => state.castingSequencesOptions,
  castingAssetTypesOptions: state => state.castingAssetTypesOptions,

  casting: state => state.casting,
  castingByType: state => state.castingByType,
  castingCurrentShot: state => state.castingCurrentShot
}

const actions = {

  setCastingForProductionEpisodes ({ commit, rootState }, episodeId) {
    const production = rootState.productions.currentProduction
    const assetMap = rootState.assets.assetMap
    const episodes =
     Array.from(rootState.episodes.episodeMap.values())
       .sort((a, b) => a.name.localeCompare(b.name))
    commit(CASTING_SET_FOR_EPISODES, episodes)
    return breakdownApi.getProductionEpisodesCasting(production.id, episodeId)
      .then((casting) => {
        commit(CASTING_SET_CASTING, { casting, assetMap })
      })
  },

  setCastingSequence ({ commit, rootGetters }, sequenceId) {
    if (!sequenceId) {
      return console.error('SequenceId is undefined, no casting can be set.')
    }
    const production = rootGetters.currentProduction
    const episode = rootGetters.currentEpisode
    console.log(episode)
    const episodeId = episode ? episode.id : null
    const assetMap = rootGetters.assetMap
    const shots =
    sortShots(
      Array.from(rootGetters.shotMap.values())
        .filter(shot => shot.sequence_id === sequenceId || sequenceId === 'all')
    )
    commit(CASTING_SET_SEQUENCE, sequenceId)
    commit(CASTING_SET_SHOTS, shots)
    return breakdownApi
      .getSequenceCasting(production.id, sequenceId, episodeId)
      .then(casting => {
        commit(CASTING_SET_CASTING, { casting, assetMap })
        return Promise.resolve()
      })
  },

  setCastingAssetType ({ commit, rootState }, assetTypeId) {
    if (!assetTypeId) {
      return console.error('assetTypeId is undefined, no casting can be set.')
    }
    const production = rootState.productions.currentProduction
    const assetMap = rootState.assets.assetMap
    const assets =
      Array.from(rootState.assets.assetMap.values())
        .filter((asset) => asset.asset_type_id === assetTypeId)
        .sort((a, b) => a.name.localeCompare(b.name))
    commit(CASTING_SET_ASSET_TYPE, assetTypeId)
    commit(CASTING_SET_ASSETS, assets)
    return breakdownApi.getAssetTypeCasting(production.id, assetTypeId)
      .then((casting) => {
        commit(CASTING_SET_CASTING, { casting, assetMap })
      })
  },

  setCastingEpisode ({ commit, rootState }, episodeId) {
    const sequences = rootState.shots.sequences
    commit(CASTING_SET_SEQUENCES, sequences)
    commit(CASTING_SET_EPISODE, episodeId)
  },

  setCastingEpisodes ({ commit, rootState }) {
    const episodes = Array.from(rootState.episodes.episodeMap.values())
    const production = rootState.productions.currentProduction
    commit(CASTING_SET_EPISODES, { production, episodes })
  },

  setCastingAssetTypes ({ commit, rootState }) {
    const assetTypes = rootState.assets.assetTypes
    commit(CASTING_SET_ASSET_TYPES, assetTypes)
  },

  addAssetToCasting (
    { commit, rootState },
    { entityId, assetId, nbOccurences, label }
  ) {
    const asset = rootState.assets.assetMap.get(assetId)
    commit(CASTING_ADD_TO_CASTING, { entityId, asset, nbOccurences, label })
  },

  removeAssetFromCasting (
    { commit, rootState },
    { entityId, assetId, nbOccurences }
  ) {
    const asset = rootState.assets.assetMap.get(assetId)
    commit(CASTING_REMOVE_FROM_CASTING, { entityId, asset, nbOccurences })
  },

  setEntityCasting ({ commit, rootState }, { entityId, casting }) {
    commit(CASTING_SET_ENTITY_CASTING, { entityId, casting })
  },

  saveCasting ({ commit, rootGetters }, entityId) {
    if (!entityId) {
      return console.error('ShotId is undefined, no casting can be saved.')
    }
    const production = rootGetters.currentProduction
    const casting = []
    Object.values(state.casting[entityId]).forEach(asset => {
      casting.push({
        asset_id: asset.asset_id,
        nb_occurences: asset.nb_occurences || 1,
        label: asset.label
      })
    })
    return breakdownApi.updateCasting(production.id, entityId, casting)
  },

  uploadCastingFile ({ commit, state, rootGetters }, formData) {
    const currentProduction = rootGetters.currentProduction
    return breakdownApi.postCastingCsv(currentProduction, formData)
  },

  setAssetLinkLabel (
    { commit, dispatch, state, rootGetters },
    { label, asset, targetEntityId }
  ) {
    commit(CASTING_SET_LINK_LABEL, { label, asset, targetEntityId })
    return dispatch('saveCasting', targetEntityId)
  },

  loadEpisodeCasting ({ commit, rootGetters }, episode) {
    if (!episode) return Promise.resolve({})
    const episodeMap = rootGetters.episodeMap
    return breakdownApi.getEpisodeCasting(episode)
      .then((casting) => {
        commit(LOAD_EPISODE_CASTING_END, { episode, casting, episodeMap })
        return Promise.resolve(casting)
      })
  },

  loadAssetCasting ({ commit, rootGetters }, asset) {
    if (!asset) return Promise.resolve({})
    const assetMap = rootGetters.assetMap
    return breakdownApi.getAssetCasting(asset)
      .then(casting => {
        commit(LOAD_ASSET_CASTING_END, { asset, casting, assetMap })
        return Promise.resolve(casting)
      })
  },

  loadShotCasting ({ commit, rootGetters }, shot) {
    if (!shot) return Promise.resolve({})
    const assetMap = rootGetters.assetMap
    return breakdownApi.getShotCasting(shot)
      .then(casting => {
        commit(LOAD_SHOT_CASTING_END, { shot, casting, assetMap })
        return Promise.resolve(casting)
      })
  },

  loadAssetCastIn ({ commit, state, rootState }, asset) {
    if (!asset) return Promise.resolve({})
    const shotMap = rootState.shots.shotMap
    return breakdownApi.getAssetCastIn(asset)
      .then(castIn => {
        commit(LOAD_ASSET_CAST_IN_END, { asset, castIn, shotMap })
        return Promise.resolve(castIn)
      })
  }
}

const mutations = {
  [LOAD_EPISODES_START] (state) {
    Object.assign(state, initialState)
  },

  [LOAD_SHOTS_START] (state) {
    Object.assign(state, initialState)
  },

  [CASTING_SET_FOR_EPISODES] (state, episodes) {
    const casting = {}
    const castingByType = []
    state.castingEpisodes = episodes
    episodes.forEach(episode => {
      casting[episode.id] = []
      castingByType[episode.id] = []
    })
    state.casting = casting
    state.castingByType = castingByType
  },

  [CASTING_SET_SHOTS] (state, shots) {
    const casting = {}
    const castingByType = []
    state.castingSequenceShots = shots
    shots.forEach(shot => {
      casting[shot.id] = []
      castingByType[shot.id] = []
    })
    state.casting = casting
    state.castingByType = castingByType
  },

  [CASTING_SET_ASSETS] (state, assets) {
    const casting = {}
    const castingByType = []
    state.castingAssetTypeAssets = assets
    assets.forEach(asset => {
      casting[asset.id] = []
      castingByType[asset.id] = []
    })
    state.casting = casting
    state.castingByType = castingByType
  },

  [CASTING_SET_EPISODES] (state, { production, episodes }) { // TODO CASTING must be renamed to BREAKDOWN when used for namespacing, and CASTING must be kept for meaningful mutations
    state.castingEpisodes = episodes
    state.castingEpisodeOptions = episodes.map(production => {
      const route = {
        name: 'breakdown-episode',
        params: {
          production_id: production.id,
          episode_id: 'all'
        }
      }
      return {
        label: 'All',
        value: production.id,
        route: route
      }
    })
  },

  [CASTING_SET_SEQUENCES] (state, sequences) {
    state.castingEpisodeSequences = sequences
    state.castingSequencesOptions = sequences.map(sequence => {
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
    if (state.castingEpisodeSequences.length > 0) {
      state.castingSequencesOptions.unshift(
        {
          label: 'All',
          value: 'all',
          route: {
            name: 'breakdown-sequence',
            params: {
              production_id: state.castingEpisodeSequences[0].project_id,
              sequence_id: 'all'
            }
          }
        }
      )
    }
  },

  [CASTING_SET_ASSET_TYPES] (state, assetTypes) {
    state.castingAssetTypesOptions = assetTypes.map((assetType) => {
      const route = {
        name: 'breakdown-asset-type',
        params: {
          production_id: assetType.project_id,
          asset_type_id: assetType.id
        }
      }
      if (assetType.episode_id) {
        route.name = `episode-${route.name}`
        route.params.episode_id = assetType.episode_id
      }
      return {
        label: assetType.name,
        value: assetType.id,
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

  [CASTING_SET_ASSET_TYPE] (state, assetTypeId) {
    state.castingAssetTypeId = assetTypeId
  },

  [CASTING_SET_CASTING] (state, { casting, assetMap }) {
    const entityCastingByType = {}
    const entityCastingKeys = Object.keys(casting)
    entityCastingKeys.forEach(entityId => {
      const entityCasting = casting[entityId]
      entityCastingByType[entityId] =
        groupEntitiesByParents(entityCasting, 'asset_type_name')
    })
    Object.assign(state.casting, casting)
    state.casting = { ...state.casting }
    Object.assign(state.castingByType, entityCastingByType)
    state.castingByType = { ...state.castingByType }
  },

  [CASTING_ADD_TO_CASTING] (state, { entityId, asset, nbOccurences, label }) {
    if (!state.casting[entityId]) Vue.set(state.casting, entityId, [])
    const previousAsset = state.casting[entityId].find(
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
        preview_file_id: asset.preview_file_id,
        label
      }
      state.casting[entityId].push(newAsset)
    }
    Vue.set(state.casting, entityId, sortAssets(state.casting[entityId]))
    Vue.set(
      state.castingByType,
      entityId,
      groupEntitiesByParents(state.casting[entityId], 'asset_type_name')
    )
  },

  [CASTING_REMOVE_FROM_CASTING] (state, { entityId, asset, nbOccurences }) {
    const previousAsset = state.casting[entityId].find(
      a => a.asset_id === asset.id
    )
    if (previousAsset) {
      previousAsset.nb_occurences -= nbOccurences
      if (previousAsset.nb_occurences < 1) {
        delete state.casting[entityId][asset.id]
        state.casting[entityId] = state.casting[entityId].filter(
          a => a.asset_id !== asset.id
        )
      }
      state.castingByType[entityId] = groupEntitiesByParents(
        state.casting[entityId], 'asset_type_name'
      )
    }
  },

  [CASTING_SET_ENTITY_CASTING] (state, { entityId, casting }) {
    state.casting[entityId] = casting
    state.castingByType[entityId] = groupEntitiesByParents(
      state.casting[entityId], 'asset_type_name'
    )
  },

  [LOAD_EPISODE_CASTING_END] (state, { episode, casting }) {
    casting.forEach(a => { a.name = a.asset_name || a.name })
    const castingByType = groupEntitiesByParents(casting, 'asset_type_name')
    episode.casting = casting
    Vue.set(state.casting, episode.id, casting)
    Vue.set(state.castingByType, episode.id, castingByType)
    Vue.set(
      episode,
      'castingAssetsByType',
      castingByType
    )
  },

  [LOAD_ASSET_CASTING_END] (state, { asset, casting }) {
    casting.forEach(a => { a.name = a.asset_name })
    const castingByType = groupEntitiesByParents(casting, 'asset_type_name')
    asset.casting = casting
    Vue.set(state.casting, asset.id, casting)
    Vue.set(state.castingByType, asset.id, castingByType)
    Vue.set(
      asset,
      'castingAssetsByType',
      castingByType
    )
  },

  [LOAD_SHOT_CASTING_END] (state, { shot, casting }) {
    casting.forEach(a => { a.name = a.asset_name || a.name })
    const castingByType = groupEntitiesByParents(casting, 'asset_type_name')
    shot.casting = casting
    Vue.set(state.casting, shot.id, casting)
    Vue.set(state.castingByType, shot.id, castingByType)
    Vue.set(
      shot,
      'castingAssetsByType',
      castingByType
    )
  },

  [LOAD_ASSET_CAST_IN_END] (state, { asset, castIn }) {
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

  [CASTING_SET_LINK_LABEL] (state, { label, asset, targetEntityId }) {
    const link = state.casting[targetEntityId]
      .find(link => link.asset_id === asset.asset_id)
    link.label = label
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
