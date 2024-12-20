import breakdownApi from '@/store/api/breakdown'
import peopleApi from '@/store/api/people'

import { sortAssets, sortByName, sortShots } from '@/lib/sorting'
import { groupEntitiesByParents } from '@/lib/models'

import assetStore from '@/store/modules/assets'
import shotStore from '@/store/modules/shots'
import episodeStore from '@/store/modules/episodes'

import {
  CASTING_SET_ASSET_TYPES,
  CASTING_SET_ASSET_TYPE,
  CASTING_SET_ASSETS,
  CASTING_SET_EPISODE,
  CASTING_SET_CASTING,
  CASTING_SET_EPISODES,
  CASTING_SET_ENTITY_CASTING,
  CASTING_SET_FOR_EPISODES,
  CASTING_SET_LINK_LABEL,
  CASTING_SET_SHOTS,
  CASTING_SET_SEQUENCE,
  CASTING_SET_SEQUENCES,
  CASTING_ADD_TO_CASTING,
  CASTING_REMOVE_FROM_CASTING,
  LOAD_ASSETS_END,
  LOAD_EPISODES_START,
  LOAD_SHOTS_START,
  LOAD_EPISODE_CASTING_END,
  LOAD_SHOT_CASTING_END,
  LOAD_SEQUENCE_CASTING_END,
  LOAD_ASSET_CASTING_END,
  LOAD_ASSET_CAST_IN_END,
  REMOVE_BREAKDOWN_SEARCH_END,
  REMOVE_BREAKDOWN_SEARCH_FILTER_GROUP_END,
  SAVE_BREAKDOWN_SEARCH_END,
  SAVE_BREAKDOWN_SEARCH_FILTER_GROUP_END,
  SET_IS_SHOW_INFOS_BREAKDOWN,
  RESET_ALL
} from '@/store/mutation-types'

const initialState = {
  breakdownSearchFilterGroups: [],
  breakdownSearchQueries: [],

  casting: {},
  castingAssetTypeAssets: [],
  castingAssetTypesOptions: [],
  castingByType: [],
  castingCurrentShot: null,
  castingEpisodes: [],
  castingEpisodeSequences: [],
  castingSequencesOptions: [],
  castingSequenceId: '',
  castingSequenceShots: [],
  castingShotId: 0,

  isShowInfosBreakdown: false
}
const state = { ...initialState }

const getters = {
  breakdownSearchFilterGroups: state => state.breakdownSearchFilterGroups,
  breakdownSearchQueries: state => state.breakdownSearchQueries,

  casting: state => state.casting,
  castingAssetTypeAssets: state => state.castingAssetTypeAssets,
  castingAssetTypesOptions: state => state.castingAssetTypesOptions,
  castingByType: state => state.castingByType,
  castingCurrentShot: state => state.castingCurrentShot,
  castingEpisodes: state => state.castingEpisodes,
  castingEpisodeSequences: state => state.castingEpisodeSequences,
  castingSequenceId: state => state.castingSequenceId,
  castingSequenceShots: state => state.castingSequenceShots,
  castingSequencesOptions: state => state.castingSequencesOptions,

  isShowInfosBreakdown: state => state.isShowInfosBreakdown
}

const actions = {
  setCastingForProductionEpisodes({ commit, rootState }, episodeId) {
    const production = rootState.productions.currentProduction
    if (!production) return Promise.resolve()

    const episodes = Array.from(episodeStore.cache.episodeMap.values()).sort(
      (a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })
    )
    commit(CASTING_SET_FOR_EPISODES, episodes)
    return breakdownApi
      .getProductionEpisodesCasting(production.id, episodeId)
      .then(casting => {
        commit(CASTING_SET_CASTING, { casting, production })
      })
  },

  setCastingSequence({ commit, rootGetters }, sequenceId) {
    if (!sequenceId) {
      return console.error('SequenceId is undefined, no casting can be set.')
    }
    const production = rootGetters.currentProduction
    const episode = rootGetters.currentEpisode
    const episodeId = episode ? episode.id : null
    const shots = sortShots(
      Array.from(shotStore.cache.shotMap.values()).filter(
        shot => shot.sequence_id === sequenceId || sequenceId === 'all'
      )
    )
    commit(CASTING_SET_SEQUENCE, sequenceId)
    commit(CASTING_SET_SHOTS, shots)
    return breakdownApi
      .getSequenceCasting(production.id, sequenceId, episodeId)
      .then(casting => {
        commit(CASTING_SET_CASTING, { casting, production })
      })
  },

  setCastingAssetType({ commit, rootState }, assetTypeId) {
    if (!assetTypeId) {
      return console.error('assetTypeId is undefined, no casting can be set.')
    }
    const production = rootState.productions.currentProduction
    const assets = Array.from(assetStore.cache.assetMap.values())
      .filter(asset => {
        return (
          asset.asset_type_id === assetTypeId ||
          asset.entity_type_id === assetTypeId
        )
      })
      .sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { numeric: true })
      )
    commit(CASTING_SET_ASSET_TYPE, assetTypeId)
    commit(CASTING_SET_ASSETS, assets)
    return breakdownApi
      .getAssetTypeCasting(production.id, assetTypeId)
      .then(casting => {
        commit(CASTING_SET_CASTING, { casting, production })
      })
  },

  setCastingEpisode({ commit, rootGetters }, episodeId) {
    const sequences = rootGetters.displayedSequences
    commit(CASTING_SET_SEQUENCES, sequences)
    commit(CASTING_SET_EPISODE, episodeId)
  },

  setCastingEpisodes({ commit, rootState }) {
    const episodes = Array.from(episodeStore.cache.episodeMap.values())
    const production = rootState.productions.currentProduction
    commit(CASTING_SET_EPISODES, { production, episodes })
  },

  setCastingAssetTypes({ commit, rootState }) {
    const assetTypes = rootState.assets.assetTypes
    commit(CASTING_SET_ASSET_TYPES, assetTypes)
  },

  addAssetToCasting(
    { commit, rootState },
    { entityId, assetId, nbOccurences, label }
  ) {
    const asset = assetStore.cache.assetMap.get(assetId)
    commit(CASTING_ADD_TO_CASTING, { entityId, asset, nbOccurences, label })
  },

  removeAssetFromCasting(
    { commit, rootState },
    { entityId, assetId, nbOccurences }
  ) {
    const asset = assetStore.cache.assetMap.get(assetId)
    commit(CASTING_REMOVE_FROM_CASTING, { entityId, asset, nbOccurences })
  },

  setEntityCasting({ commit, rootState }, { entityId, casting }) {
    commit(CASTING_SET_ENTITY_CASTING, { entityId, casting })
  },

  saveCasting({ commit, rootGetters }, entityId) {
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

  uploadCastingFile({ commit, state, rootGetters }, formData) {
    const currentProduction = rootGetters.currentProduction
    return breakdownApi.postCastingCsv(currentProduction, formData)
  },

  setAssetLinkLabel(
    { commit, dispatch, state, rootGetters },
    { label, asset, targetEntityId }
  ) {
    commit(CASTING_SET_LINK_LABEL, { label, asset, targetEntityId })
    return dispatch('saveCasting', targetEntityId)
  },

  loadEpisodeCasting({ commit, rootGetters }, episode) {
    if (!episode) return Promise.resolve({})
    const episodeMap = rootGetters.episodeMap
    return breakdownApi.getEpisodeCasting(episode).then(casting => {
      commit(LOAD_EPISODE_CASTING_END, { episode, casting, episodeMap })
      return Promise.resolve(casting)
    })
  },

  loadAssetCasting({ commit, rootGetters }, asset) {
    if (!asset) return Promise.resolve({})
    const assetMap = assetStore.cache.assetMap
    return breakdownApi.getAssetCasting(asset).then(casting => {
      commit(LOAD_ASSET_CASTING_END, { asset, casting, assetMap })
      return Promise.resolve(casting)
    })
  },

  loadShotCasting({ commit, rootGetters }, shot) {
    if (!shot) return Promise.resolve({})
    return breakdownApi.getShotCasting(shot).then(casting => {
      commit(LOAD_SHOT_CASTING_END, { shot, casting })
      return Promise.resolve(casting)
    })
  },

  loadSequenceCasting({ commit, rootGetters }, sequence) {
    if (!sequence) return Promise.resolve({})
    const assetMap = assetStore.cache.assetMap
    return breakdownApi
      .getSequenceCasting(sequence.production_id, sequence.id)
      .then(casting => {
        commit(LOAD_SEQUENCE_CASTING_END, { sequence, casting, assetMap })
        return Promise.resolve(casting)
      })
  },

  loadAssetCastIn({ commit, state, rootState }, asset) {
    if (!asset) return Promise.resolve({})
    const shotMap = shotStore.cache.shotMap
    return breakdownApi.getAssetCastIn(asset).then(castIn => {
      commit(LOAD_ASSET_CAST_IN_END, { asset, castIn, shotMap })
      return Promise.resolve(castIn)
    })
  },

  saveBreakdownSearch({ commit, rootGetters }, searchQuery) {
    if (
      state.breakdownSearchQueries.some(query => query.name === searchQuery)
    ) {
      return
    }
    const production = rootGetters.currentProduction
    return peopleApi
      .createFilter('breakdown', searchQuery, searchQuery, production.id, null)
      .then(searchQuery => {
        commit(SAVE_BREAKDOWN_SEARCH_END, { searchQuery, production })
        return searchQuery
      })
  },

  saveBreakdownSearchFilterGroup({ commit, state, rootGetters }, filterGroup) {
    const groupExist = state.breakdownSearchFilterGroups.some(
      query => query.name === filterGroup.name
    )
    if (groupExist) {
      return
    }

    const production = rootGetters.currentProduction
    return peopleApi
      .createFilterGroup(
        'breakdown',
        filterGroup.name,
        filterGroup.color,
        production.id,
        filterGroup.is_shared,
        filterGroup.department_id
      )
      .then(filterGroup => {
        commit(SAVE_BREAKDOWN_SEARCH_FILTER_GROUP_END, {
          filterGroup,
          production
        })
        return filterGroup
      })
  },

  removeBreakdownSearch({ commit, rootGetters }, searchQuery) {
    const production = rootGetters.currentProduction
    return peopleApi.removeFilter(searchQuery).then(() => {
      commit(REMOVE_BREAKDOWN_SEARCH_END, { searchQuery, production })
    })
  },

  removeBreakdownSearchFilterGroup({ commit, rootGetters }, filterGroup) {
    const production = rootGetters.currentProduction
    return peopleApi.removeFilterGroup(filterGroup).then(() => {
      commit(REMOVE_BREAKDOWN_SEARCH_FILTER_GROUP_END, {
        filterGroup,
        production
      })
    })
  }
}

const mutations = {
  [LOAD_EPISODES_START](state) {
    Object.assign(state, {
      casting: {},
      castingAssetTypeAssets: [],
      castingAssetTypesOptions: [],
      castingByType: [],
      castingCurrentShot: null,
      castingEpisodes: [],
      castingEpisodeSequences: [],
      castingSequencesOptions: [],
      castingSequenceId: '',
      castingSequenceShots: [],
      castingShotId: 0
    })
  },

  [LOAD_SHOTS_START](state) {
    Object.assign(state, {
      casting: {},
      castingAssetTypeAssets: [],
      castingAssetTypesOptions: [],
      castingByType: [],
      castingCurrentShot: null,
      castingEpisodes: [],
      castingEpisodeSequences: [],
      castingSequencesOptions: [],
      castingSequenceId: '',
      castingSequenceShots: [],
      castingShotId: 0
    })
  },

  [CASTING_SET_FOR_EPISODES](state, episodes) {
    const casting = {}
    const castingByType = {}
    state.castingEpisodes = episodes
    episodes.forEach(episode => {
      casting[episode.id] = []
      castingByType[episode.id] = []
    })
    state.casting = casting
    state.castingByType = castingByType
  },

  [CASTING_SET_SHOTS](state, shots) {
    const casting = {}
    const castingByType = {}
    state.castingSequenceShots = shots
    shots.forEach(shot => {
      casting[shot.id] = []
      castingByType[shot.id] = []
    })
    state.casting = casting
    state.castingByType = castingByType
  },

  [CASTING_SET_ASSETS](state, assets) {
    const casting = {}
    const castingByType = {}
    state.castingAssetTypeAssets = assets
    assets.forEach(asset => {
      casting[asset.id] = []
      castingByType[asset.id] = []
    })
    state.casting = casting
    state.castingByType = castingByType
  },

  [CASTING_SET_EPISODES](state, { production, episodes }) {
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
        route
      }
    })
  },

  [CASTING_SET_SEQUENCES](state, sequences) {
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
        route
      }
    })
    if (state.castingEpisodeSequences.length > 0) {
      state.castingSequencesOptions.unshift({
        label: 'All',
        value: 'all',
        route: {
          name: 'breakdown-sequence',
          params: {
            production_id: state.castingEpisodeSequences[0].project_id,
            sequence_id: 'all'
          }
        }
      })
    }
  },

  [CASTING_SET_ASSET_TYPES](state, assetTypes) {
    state.castingAssetTypesOptions = assetTypes.map(assetType => {
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
        route
      }
    })
  },

  [CASTING_SET_SEQUENCE](state, sequenceId) {
    state.castingSequenceId = sequenceId
  },

  [CASTING_SET_EPISODE](state, episodeId) {
    state.castingEpisodeId = episodeId
  },

  [CASTING_SET_ASSET_TYPE](state, assetTypeId) {
    state.castingAssetTypeId = assetTypeId
  },

  [CASTING_SET_CASTING](state, { casting, production }) {
    const entityCastingByType = {}
    const entityCastingKeys = Object.keys(casting)
    entityCastingKeys.forEach(entityId => {
      const entityCasting = casting[entityId]
      entityCasting.forEach(entity => {
        entity.shared = entity.project_id !== production.id
      })
      entityCastingByType[entityId] = groupEntitiesByParents(
        entityCasting,
        'asset_type_name'
      )
    })
    state.casting = casting
    state.castingByType = entityCastingByType
  },

  [CASTING_ADD_TO_CASTING](state, { entityId, asset, nbOccurences, label }) {
    if (!state.casting[entityId]) {
      state.casting[entityId] = []
    }
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
        label,
        shared: asset.shared
      }
      state.casting[entityId].push(newAsset)
    }
    state.casting[entityId] = sortAssets(state.casting[entityId])
    state.castingByType[entityId] = groupEntitiesByParents(
      state.casting[entityId],
      'asset_type_name'
    )
  },

  [CASTING_REMOVE_FROM_CASTING](state, { entityId, asset, nbOccurences }) {
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
        state.casting[entityId],
        'asset_type_name'
      )
    }
  },

  [CASTING_SET_ENTITY_CASTING](state, { entityId, casting }) {
    state.casting[entityId] = casting
    state.castingByType[entityId] = groupEntitiesByParents(
      state.casting[entityId],
      'asset_type_name'
    )
  },

  [LOAD_EPISODE_CASTING_END](state, { episode, casting }) {
    casting.forEach(a => {
      a.name = a.asset_name || a.name
    })
    const castingByType = groupEntitiesByParents(casting, 'asset_type_name')
    episode.casting = casting
    state.casting[episode.id] = casting
    state.castingByType[episode.id] = castingByType
    episode.castingAssetsByType = castingByType
  },

  [LOAD_ASSET_CASTING_END](state, { asset, casting }) {
    casting.forEach(a => {
      a.name = a.asset_name
    })
    const castingByType = groupEntitiesByParents(casting, 'asset_type_name')
    asset.casting = casting
    state.casting[asset.id] = casting
    state.castingByType[asset.id] = castingByType
    asset.castingAssetsByType = castingByType
  },

  [LOAD_SHOT_CASTING_END](state, { shot, casting }) {
    casting.forEach(asset => {
      asset.name = asset.asset_name || asset.name
      asset.shared = asset.is_shared && shot.project_id !== asset.project_id
    })
    const castingByType = groupEntitiesByParents(casting, 'asset_type_name')
    shot.casting = casting
    state.casting[shot.id] = casting
    state.castingByType[shot.id] = castingByType
    shot.castingAssetsByType = castingByType
  },

  [LOAD_SEQUENCE_CASTING_END](state, { sequence, casting }) {
    const presenceMap = {}
    let sequenceCasting = []
    Object.keys(casting).forEach(shotId => {
      casting[shotId].forEach(asset => {
        if (!presenceMap[asset.asset_id]) {
          presenceMap[asset.asset_id] = true
          asset.name = asset.asset_name || asset.name
          asset.shared =
            asset.is_shared && asset.project_id !== sequence.production_id
          sequenceCasting.push(asset)
        }
      })
    })
    sequenceCasting = sortAssets(sequenceCasting)
    const castingByType = groupEntitiesByParents(
      sequenceCasting,
      'asset_type_name'
    )
    sequence.casting = sequenceCasting
    state.casting[sequence.id] = sequenceCasting
    state.castingByType[sequence.id] = castingByType
    sequence.castingAssetsByType = castingByType
  },

  [LOAD_ASSET_CAST_IN_END](state, { asset, castIn }) {
    castIn.forEach(shot => {
      if (shot.episode_name) {
        shot.sequence_name = `${shot.episode_name} / ${shot.sequence_name}`
      }
    })
    asset.castIn = castIn
    asset.castInShotsBySequence = groupEntitiesByParents(
      castIn,
      'sequence_name'
    )
  },

  [CASTING_SET_LINK_LABEL](state, { label, asset, targetEntityId }) {
    const link = state.casting[targetEntityId].find(
      link => link.asset_id === asset.asset_id
    )
    link.label = label
  },

  [SAVE_BREAKDOWN_SEARCH_END](state, { searchQuery }) {
    state.breakdownSearchQueries.push(searchQuery)
    state.breakdownSearchQueries = sortByName(state.breakdownSearchQueries)
  },

  [SAVE_BREAKDOWN_SEARCH_FILTER_GROUP_END](state, { filterGroup }) {
    if (!state.breakdownSearchFilterGroups.includes(filterGroup)) {
      state.breakdownSearchFilterGroups.push(filterGroup)
      state.breakdownSearchFilterGroups = sortByName(
        state.breakdownSearchFilterGroups
      )
    }
  },

  [REMOVE_BREAKDOWN_SEARCH_END](state, { searchQuery }) {
    const queryIndex = state.breakdownSearchQueries.findIndex(
      query => query.name === searchQuery.name
    )
    if (queryIndex >= 0) {
      state.breakdownSearchQueries.splice(queryIndex, 1)
    }
  },

  [REMOVE_BREAKDOWN_SEARCH_FILTER_GROUP_END](state, { filterGroup }) {
    const groupIndex = state.breakdownSearchFilterGroups.findIndex(
      query => query.name === filterGroup.name
    )
    if (groupIndex >= 0) {
      state.breakdownSearchFilterGroups.splice(groupIndex, 1)
    }
  },

  [LOAD_ASSETS_END](state, { userFilters, userFilterGroups, production }) {
    state.breakdownSearchQueries = userFilters.breakdown?.[production.id] || []
    state.breakdownSearchFilterGroups =
      userFilterGroups?.breakdown?.[production.id] || []
  },

  [SET_IS_SHOW_INFOS_BREAKDOWN](state, isShowInfosBreakdown) {
    state.isShowInfosBreakdown = isShowInfosBreakdown
  },

  [RESET_ALL](state) {
    Object.assign(state, { ...initialState })
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
