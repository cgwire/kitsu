<template>
  <div class="breakdown page">
    <div class="breakdown-columns mt1">

      <div class="breakdown-column casting-column">
        <div class="flexrow mb1">
          <combobox-styled
            :label="$t('shots.fields.sequence')"
            :options="castingSequenceOptions"
            v-model="sequenceId"
          />
          <span class="filler"></span>
          <button-simple
            class="flexrow-item"
            :title="$t('main.csv.import_file')"
            icon="upload"
            :is-responsive="true"
            @click="showImportModal"
          />
          <button-href-link
            class="flexrow-item"
            :title="$t('main.csv.export_file')"
            icon="download"
            :is-responsive="true"
            :path="exportUrlPath"
          />
        </div>
        <spinner class="mt1" v-if="isShotsLoading" />
        <div class="mt1" v-else>
          <shot-line
            :key="shot.id"
            :shot-id="shot.id"
            :selected="selection[shot.id]"
            :name="shot.name"
            :assets="castingByType[shot.id] || []"
            @remove-one="removeOneAsset"
            @remove-ten="removeTenAssets"
            @click="selectShot"
            v-for="shot in castingSequenceShots"
          />
        </div>
      </div>

      <div
        ref="asset-list"
        v-scroll="onAssetListScroll"
        class="breakdown-column assets-column"
        v-if="isCurrentUserManager"
      >
        <h2 class="subtitle">
          {{ $t('breakdown.all_assets') }}
        </h2>

        <div class="filters-area flexrow">
          <search-field
            class="flexrow-item"
            @change="onSearchChange"
          />
        </div>

        <spinner v-if="isAssetsLoading" />
        <div
          class="type-assets"
          :key="typeAssets.length > 0 ? typeAssets[0].asset_type_name : ''"
          v-for="typeAssets in availableAssetsByType"
          v-else
        >
          <div class="asset-type">
            {{ typeAssets.length > 0 ? typeAssets[0].asset_type_name : '' }}
          </div>
          <div class="asset-list">
            <available-asset-block
              :key="asset.id"
              :asset="asset"
              :casted="casting[asset.id] !== undefined"
              :active="Object.keys(selection).length > 0"
              @add-one="addOneAsset"
              @add-ten="addTenAssets"
              v-for="asset in typeAssets"
            />
          </div>
        </div>
      </div>
    </div>

    <import-modal
      :active="modals.importing"
      :is-loading="loading.importing"
      :is-error="errors.importing"
      :form-data="importCsvFormData"
      :columns="csvColumns"
      @fileselected="selectFile"
      @confirm="uploadImportFile"
      @cancel="hideImportModal"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { range } from '../../lib/time'

import AvailableAssetBlock from './breakdown/AvailableAssetBlock'
import ButtonHrefLink from '../widgets/ButtonHrefLink.vue'
import ButtonSimple from '../widgets/ButtonSimple'
import ComboboxStyled from '../widgets/ComboboxStyled'
import ImportModal from '../modals/ImportModal'
import SearchField from '../widgets/SearchField.vue'
import ShotLine from './breakdown/ShotLine'
import Spinner from '../widgets/Spinner'

export default {
  name: 'breakdown',

  components: {
    AvailableAssetBlock,
    ButtonHrefLink,
    ButtonSimple,
    ComboboxStyled,
    ImportModal,
    SearchField,
    ShotLine,
    Spinner
  },

  data () {
    return {
      csvColumns: [
        'Episode',
        'Parent',
        'Name',
        'Asset Type',
        'Asset',
        'Occurences',
        'Label'
      ],
      importCsvFormData: {},
      isLoading: false,
      sequenceId: '',
      episodeId: '',
      selection: {},
      modals: {
        importing: false
      },
      loading: {
        importing: false
      },
      errors: {
        importing: false
      }
    }
  },

  mounted () {
    if (!this.isLoading) {
      this.reset()
    }
    this.setLastProductionScreen('breakdown')
  },

  computed: {
    ...mapGetters([
      'assetMap',
      'assetsByType',
      'currentEpisode',
      'currentProduction',
      'displayedShots',
      'isTVShow',

      'getEpisodeOptions',
      'castingSequenceOptions',
      'isAssetsLoading',
      'isShotsLoading',
      'sequenceMap',
      'shots',
      'sequences',
      'shotMap',

      'castingSequenceId',
      'castingCurrentShot',
      'castingSequenceShots',
      'isCastingSaveActive',
      'casting',
      'castingByType',
      'isCastingDirty',
      'isCastingSaveActive',

      'isCurrentUserManager'
    ]),

    availableAssetsByType () {
      const result = []
      this.assetsByType.forEach((typeGroup) => {
        const newGroup = typeGroup.filter((asset) => !asset.canceled)
        if (newGroup.length > 0) result.push(newGroup)
      })
      return result
    },

    exportUrlPath () {
      return (
        `/api/export/csv/projects/${this.currentProduction.id}/casting.csv`
      )
    }
  },

  methods: {
    ...mapActions([
      'addAssetToCasting',
      'displayMoreAssets',
      'loadShots',
      'loadAssets',
      'removeAssetFromCasting',
      'saveCasting',
      'setAssetSearch',
      'setCastingEpisode',
      'setCastingSequence',
      'setCastingShot',
      'setLastProductionScreen',
      'uploadCastingFile'
    ]),

    reset () {
      this.isLoading = true
      setTimeout(() => {
        this.reloadShots()
      }, 100)
    },

    reloadShots () {
      this.isLoading = true
      this.loadShots(() => {
        if (this.isTVShow) {
          if (this.currentEpisode) {
            this.episodeId = this.currentEpisode.id
          }
          this.setCastingEpisode(this.episodeId)
        } else {
          this.setCastingEpisode(null)
        }
        this.loadAssets(() => {
          this.isLoading = false
          this.displayMoreAssets()
          this.resetSelection()
        })
      })
    },

    resetSelection () {
      const selection = {}
      this.castingSequenceShots.forEach((shot) => {
        selection[shot.id] = false
      })
      this.selection = selection
    },

    onSearchChange (searchQuery) {
      this.setAssetSearch(searchQuery)
    },

    selectShot (shotId, event) {
      if (!event.ctrlKey && !event.shitKey) {
        this.clearSelection()
      }

      if (this.previousShotId && event.shiftKey) {
        this.selectRange(this.previousShotId, shotId)
      }

      if (!this.previousShotId || !event.shiftKey) this.previousShotId = shotId
      this.selection[shotId] = true
    },

    clearSelection () {
      Object.keys(this.selection)
        .filter(k => this.selection[k])
        .forEach((shotId) => {
          this.selection[shotId] = false
        })
    },

    selectRange (previousShotId, shotId) {
      const keys = Object.keys(this.selection)
      const previousIndex = keys.findIndex(k => k === previousShotId)
      const index = keys.findIndex(k => k === shotId)

      let indexRange = []
      if (previousIndex < index) indexRange = range(previousIndex, index)
      else indexRange = range(index, previousIndex)

      console.log(indexRange)
      indexRange.forEach((i) => {
        if (i >= 0) this.selection[keys[i]] = true
      })
    },

    addOneAsset (assetId) {
      Object.keys(this.selection)
        .filter(key => this.selection[key])
        .forEach((shotId) => {
          this.addAssetToCasting({ shotId, assetId, nbOccurences: 1 })
          this.saveCasting(shotId)
            .catch(console.error)
        })
    },

    addTenAssets (assetId) {
      Object.keys(this.selection)
        .filter(key => this.selection[key])
        .forEach((shotId) => {
          this.addAssetToCasting({ shotId, assetId, nbOccurences: 10 })
          this.saveCasting(shotId)
            .catch(console.error)
        })
    },

    removeOneAsset (assetId, shotId) {
      this.removeAssetFromCasting({ shotId, assetId, nbOccurences: 1 })
      this.saveCasting(shotId)
        .catch(console.error)
    },

    removeTenAssets (assetId, shotId) {
      this.removeAssetFromCasting({ shotId, assetId, nbOccurences: 10 })
      this.saveCasting(shotId)
        .catch(console.error)
    },

    onAssetListScroll (event, position) {
      const assetList = this.$refs['asset-list']
      const maxHeight = assetList.scrollHeight - assetList.offsetHeight
      if (maxHeight < (position.scrollTop + 100)) {
        this.displayMoreAssets()
      }
    },

    showImportModal () {
      this.modals.importing = true
    },

    hideImportModal () {
      this.modals.importing = false
    },

    selectFile (formData) {
      this.importCsvFormData = formData
    },

    uploadImportFile () {
      this.loading.importing = true
      this.errors.importing = false
      this.uploadCastingFile(this.importCsvFormData)
        .then(() => {
          this.loading.importing = false
          this.hideImportModal()
          this.reloadShots()
        })
        .catch(() => {
          this.loading.importing = false
          this.errors.importing = true
        })
    },

    updateUrl () {
      const sequenceId = this.$route.params.sequence_id
      if (sequenceId !== this.sequenceId) {
        const route = {
          name: 'breakdown-sequence',
          params: {
            production_id: this.currentProduction.id,
            sequence_id: this.sequenceId
          }
        }
        if (this.currentEpisode) {
          route.name = `episode-${route.name}`
          route.params.episode_id = this.currentEpisode.id
        }
        this.$router.push(route)
      }
    }
  },

  watch: {
    $route () {},

    sequenceId () {
      if (this.sequences && this.sequences.length > 0) {
        this.setCastingSequence(this.sequenceId)
        this.updateUrl()
        this.resetSelection()
      }
    },

    episodeId () {},

    castingSequenceOptions () {
      const sequenceId = this.$route.params.sequence_id
      if (
        sequenceId &&
        this.sequenceMap[sequenceId]
      ) {
        this.sequenceId = sequenceId
      } else if (this.castingSequenceOptions.length > 0) {
        this.sequenceId = this.castingSequenceOptions[0].value
      } else {
        this.sequenceId = ''
      }
    },

    currentProduction () {
      this.reset()
    },

    currentEpisode () {
      if (
        this.currentEpisode &&
        this.episodeId !== this.currentEpisode.id &&
        !this.isLoading
      ) {
        this.reset()
      }
    },

    sequences () {
      this.$store.commit('CASTING_SET_SEQUENCES', this.sequences)
    }
  },

  metaInfo () {
    return {
      title: `${this.currentProduction.name} ${this.$t('breakdown.title')} - Kitsu`
    }
  }
}
</script>

<style lang="scss" scoped>
.dark {
  .breakdown {
    background: $dark-grey-2;
  }
  .breakdown-column {
    background: $dark-grey-light;
    border: 1px solid #222;
    box-shadow: 0px 0px 6px #222;
  }
}

.breakdown {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  background: #FAFAFA;
  padding-left: 1em;
  padding-right: 1em;
  padding-bottom: 1em;
}

.breakdown-columns {
  flex: 1;
  display: flex;
  flex-direction: row;
  overflow-y: auto;
}

.breakdown-column {
  flex: 1;
  overflow-y: auto;
  padding: 1em;
  background: white;
  border: 1px solid #EEE;
  box-shadow: 0px 0px 6px #E0E0E0;
  border-radius: 1em;
  margin-left: 0.5em;
}

.shot-column {
}

.casting-column {
  flex: 1;
}

.assets-column {
  max-width: 460px;
}

.asset-type,
.sequence {
  text-transform: uppercase;
  color: $grey;
  border-bottom: 1px solid $light-grey;
  font-size: 1.2em;
  margin-bottom: 1em;
}

.asset-list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}

.level-right {
  display-flex: row;
}

.shots-title {
  font-weight: bold;
}

.filters-area {
  margin-bottom: 2em;
}
</style>
