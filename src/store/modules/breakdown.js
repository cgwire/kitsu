import Vue from 'vue'
import shotsApi from '../api/shots'
import {
  sortAssets
} from '../../lib/sorting'

import {
  CASTING_SET_SHOT,
  CASTING_SET_SEQUENCE,
  CASTING_SET_EPISODE,
  CASTING_SET_CASTING,
  CASTING_SET_SHOTS,
  CASTING_SET_SEQUENCES,
  CASTING_SET_ISDIRTY,

  CASTING_ADD_TO_CASTING,
  CASTING_REMOVE_FROM_CASTING,

  LOAD_SHOT_CASTING_END,
  LOAD_ASSET_CAST_IN_END,

  RESET_ALL
} from '../mutation-types'

const helpers = {
  buildCastingAssetsByType (casting) {
    const assetsByType = []

    let assetTypeAssets = []
    let previousAsset = casting.length > 0 ? casting[0] : null

    for (let asset of casting) {
      const isChange = asset.asset_type_name !== previousAsset.asset_type_name
      if (!asset.name) asset.name = asset.asset_name
      if (previousAsset && isChange) {
        assetsByType.push(assetTypeAssets.slice(0))
        assetTypeAssets = []
      }
      if (!asset.nb_occurences) asset.nb_occurences = 1
      assetTypeAssets.push(asset)
      previousAsset = asset
    }
    assetsByType.push(assetTypeAssets)

    return assetsByType
  },

  buildCastInShotsBySequence (castIn) {
    const shotsBySequence = []

    let sequenceShots = []
    let previousShot = castIn.length > 0 ? castIn[0] : null

    for (let shot of castIn) {
      const isChange = shot.sequence_name !== previousShot.sequence_name
      if (!shot.name) shot.name = shot.shot_name
      if (previousShot && isChange) {
        shotsBySequence.push(sequenceShots.slice(0))
        sequenceShots = []
      }
      if (!shot.nb_occurences) shot.nb_occurences = 1
      sequenceShots.push(shot)
      previousShot = shot
    }
    shotsBySequence.push(sequenceShots)

    return shotsBySequence
  }
}

const state = {
  castingSequenceId: '',
  castingShotId: 0,
  castingSequenceShots: [],
  castingEpisodeSequences: [],
  castingSequenceOptions: [],

  castingCurrentShot: null,
  casting: {},
  castingAssetsByType: [],
  isCastingDirty: false
}

const getters = {
  castingSequenceId: state => state.castingSequenceId,
  castingShotId: state => state.castingShotId,
  castingSequenceShots: state => state.castingSequenceShots,
  castingEpisodeSequences: state => state.castingEpisodeSequences,
  castingSequenceOptions: state => state.castingSequenceOptions,

  castingCurrentShot: state => state.castingCurrentShot,
  casting: state => state.casting,
  castingAssetsByType: state => state.castingAssetsByType,
  isCastingDirty: state => state.isCastingDirty,

  isCastingSaveActive: (state) => {
    return state.castingCurrentShot !== null && state.isCastingDirty
  },

  getCastingAssetsByType (state) {
    const casting = sortAssets(Object.values(state.casting))
    return helpers.buildCastingAssetsByType(casting)
  }
}

const actions = {

  setCastingShot ({commit, state, rootState}, {shotId, callback}) {
    if (shotId) {
      const shot = rootState.shots.shotMap[shotId]
      const assetMap = rootState.assets.assetMap

      commit(CASTING_SET_CASTING, [])
      commit(CASTING_SET_SHOT, shot)
      shotsApi.getCasting(state.castingCurrentShot, (err, casting) => {
        if (!err) {
          const castingMap = {}
          casting.forEach((cast) => {
            castingMap[cast.asset_id] = assetMap[cast.asset_id]
            castingMap[cast.asset_id].nb_occurences = cast.nb_occurences
          })
          commit(CASTING_SET_CASTING, castingMap)
        }

        if (callback) callback(err)
      })
    } else {
      commit(CASTING_SET_CASTING, [])
      commit(CASTING_SET_SHOT, null)
      if (callback) callback()
    }
  },

  setCastingSequence ({commit, state, rootState, rootGetters}, sequenceId) {
    if (!sequenceId) {
      if (state.castingCurrentShot) {
        sequenceId = state.castingCurrentShot.sequence_id
      } else {
        const sequence = rootGetters.getSequenceOptions[0]
        if (sequence) sequenceId = sequence.value
      }
    }

    const castingSequenceShots = rootState.shots.shots.filter((shot) => {
      return shot.sequence_id === sequenceId
    })
    commit(CASTING_SET_SEQUENCE, sequenceId)
    commit(CASTING_SET_SHOTS, castingSequenceShots)
  },

  setCastingEpisode ({commit, state, rootState, rootGetters}, episodeId) {
    if (!episodeId) {
      if (state.castingCurrentShot) {
        episodeId = state.castingCurrentShot.episode_id
      } else {
        const episodeOption = rootGetters.getEpisodeOptions[0]
        if (episodeOption) episodeId = episodeOption.value
      }
    }

    const castingSequenceShots = rootState.shots.sequences.filter((sequence) => {
      return sequence.parent_id === episodeId
    })

    commit(CASTING_SET_SEQUENCES, castingSequenceShots)
    commit(CASTING_SET_EPISODE, episodeId)
  },

  addAssetToCasting ({commit, state, rootState}, {assetId, nbOccurences}) {
    if (state.castingCurrentShot) {
      const asset = rootState.assets.assetMap[assetId]
      commit(CASTING_ADD_TO_CASTING, {asset, nbOccurences})
    }
  },

  removeAssetFromCasting (
    {commit, state, rootState}, {assetId, nbOccurences}
  ) {
    if (state.castingCurrentShot && state.casting[assetId]) {
      const asset = rootState.assets.assetMap[assetId]
      commit(CASTING_REMOVE_FROM_CASTING, {asset, nbOccurences})
    }
  },

  saveCasting ({commit, state, rootState}, callback) {
    const casting = []
    Object.values(state.casting).forEach((asset) => {
      casting.push({
        asset_id: asset.id,
        nb_occurences: asset.nb_occurences || 1
      })
    })
    shotsApi.updateCasting(state.castingCurrentShot, casting, (err) => {
      if (err) {
        console.log(err)
      } else {
        commit(CASTING_SET_ISDIRTY, false)
      }

      if (callback) callback(err)
    })
  }
}

const mutations = {

  [CASTING_SET_SHOT] (state, shot) {
    if (shot) {
      state.castingCurrentShot = shot
      state.castingShotId = shot.id
      state.castingEpisodeId = shot.episode_id
      state.castingSequenceId = shot.sequence_id
    } else {
      state.castingCurrentShot = null
      state.castingShotId = null
      state.castingSequenceId = null
      state.episodeSequenceId = null
    }
  },

  [CASTING_SET_SHOTS] (state, shots) {
    state.castingSequenceShots = shots
  },

  [CASTING_SET_SEQUENCES] (state, sequences) {
    state.castingEpisodeSequences = sequences
    state.castingSequenceOptions = sequences.map((sequence) => {
      return {
        label: sequence.name,
        value: sequence.id
      }
    })
  },

  [CASTING_SET_SEQUENCE] (state, sequenceId) {
    state.castingSequenceId = sequenceId
  },

  [CASTING_SET_EPISODE] (state, episodeId) {
    state.castingEpisodeId = episodeId
  },

  [CASTING_SET_CASTING] (state, casting) {
    state.casting = casting
    state.castingAssetsByType = getters.getCastingAssetsByType(state)
    state.isCastingDirty = false
  },

  [CASTING_SET_ISDIRTY] (state, isDirty) {
    state.isCastingDirty = isDirty
  },

  [CASTING_ADD_TO_CASTING] (state, {asset, nbOccurences}) {
    if (state.casting[asset.id]) {
      state.casting[asset.id].nb_occurences += nbOccurences
    } else {
      state.casting[asset.id] = asset
      state.casting[asset.id].nb_occurences = nbOccurences
    }
    state.castingAssetsByType = getters.getCastingAssetsByType(state)
    state.isCastingDirty = true
  },

  [CASTING_REMOVE_FROM_CASTING] (state, {asset, nbOccurences}) {
    const cast = state.casting[asset.id]
    if (cast) {
      cast.nb_occurences -= nbOccurences
      if (cast.nb_occurences < 1) {
        delete state.casting[asset.id]
      }
    }
    state.castingAssetsByType = getters.getCastingAssetsByType(state)
    state.isCastingDirty = true
  },

  [LOAD_SHOT_CASTING_END] ({state, rootState}, {shot, casting}) {
    shot.casting = casting
    Vue.set(
      shot,
      'castingAssetsByType',
      helpers.buildCastingAssetsByType(casting)
    )
  },

  [LOAD_ASSET_CAST_IN_END] ({state, rootState}, {asset, castIn}) {
    castIn.forEach((shot) => {
      if (shot.episode_name) {
        shot.sequence_name = `${shot.episode_name} / ${shot.sequence_name}`
      }
    })
    asset.castIn = castIn
    Vue.set(
      asset,
      'castInShotsBySequence',
      helpers.buildCastInShotsBySequence(castIn)
    )
  },

  [RESET_ALL] (state) {
    state.castingSequenceId = ''
    state.castingShotId = ''
    state.castingSequenceShots = []
    state.castingEpisodeSequences = []
    state.castingEpisodeOptions = []
    state.castingSequenceOptions = []

    state.castingCurrentShot = null
    state.casting = {}
    state.castingAssetsByType = []
    state.isCastingDirty = false
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
