<template>
  <div class="breakdown page">
    <div class="breakdown-columns mt1">

      <div class="breakdown-column shot-column">
        <div class="flexrow mb1">
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
          <combobox
            :label="$t('shots.fields.sequence')"
            :options="castingSequenceOptions"
            v-model="sequenceId"
          />
          <p class="shots-title">{{ $t('shots.title')}}</p>
          <shot-line
            :key="shot.id"
            :shot-id="shot.id"
            :selected="castingCurrentShot && castingCurrentShot.id === shot.id"
            :name="shot.name"
            @click="selectShot"
            v-for="shot in castingSequenceShots"
          />
        </div>
      </div>

      <div class="breakdown-column casting-column">
        <div class="level">
          <div class="level-left">
            <h2 class="subtitle" v-if="castingCurrentShot">
              {{
                $t('breakdown.selected_shot', {
                  sequence_name: castingCurrentShot.sequence_name,
                  name: castingCurrentShot.name
                })
              }}
            </h2>
            <em v-else>
              {{ $t('breakdown.select_shot') }}
            </em>
          </div>
        </div>
        <error-text
          :align-right="true"
          :hidden="!isSavingError"
          :text="$t('breakdown.save_error')"
        />
        <spinner v-if="isLoading" />
        <div
          class="type-assets"
          :key="typeAssets.length > 0 ? typeAssets[0].asset_type_name : ''"
          v-for="typeAssets in castingAssetsByType"
          v-else
        >
          <div class="asset-type">
            {{ typeAssets.length > 0 ? typeAssets[0].asset_type_name : '' }}
          </div>
          <div class="asset-list">
            <asset-block
              :key="asset.id"
              :asset="asset"
              :nb-occurences="asset.nb_occurences"
              @remove-one="removeOneAsset"
              @remove-ten="removeTenAssets"
              v-for="asset in typeAssets"
            />
          </div>
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
              :active="castingCurrentShot ? true : false"
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

import AssetBlock from './breakdown/AssetBlock'
import AvailableAssetBlock from './breakdown/AvailableAssetBlock'
import ButtonHrefLink from '../widgets/ButtonHrefLink.vue'
import ButtonSimple from '../widgets/ButtonSimple'
import Combobox from '../widgets/Combobox'
import ErrorText from '../widgets/ErrorText'
import ImportModal from '../modals/ImportModal'
import SearchField from '../widgets/SearchField.vue'
import ShotLine from './breakdown/ShotLine'
import Spinner from '../widgets/Spinner'

export default {
  name: 'asset-types',

  components: {
    AssetBlock,
    AvailableAssetBlock,
    ButtonHrefLink,
    ButtonSimple,
    Combobox,
    ErrorText,
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
      isSaving: false,
      isSavingError: false,
      sequenceId: '',
      episodeId: '',
      shotId: '',
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
    this.reset()
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
      'shots',
      'sequences',
      'shotMap',

      'castingSequenceId',
      'castingCurrentShot',
      'castingSequenceShots',
      'isCastingSaveActive',
      'casting',
      'castingAssetsByType',
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
      setTimeout(() => {
        this.reloadShots()
      }, 100)
    },

    reloadShots () {
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
          this.isLoading = true
          this.shotId = this.$route.params.shot_id
          this.setCastingShot({
            shotId: this.shotId,
            callback: () => {
              this.isLoading = false
            }
          })
          this.displayMoreAssets()
        })
      })
    },

    onSearchChange (searchQuery) {
      this.setAssetSearch(searchQuery)
    },

    selectShot (shotId) {
      let route = {
        name: 'breakdown-shot',
        params: {
          production_id: this.currentProduction.id,
          shot_id: shotId
        }
      }

      if (this.currentEpisode) {
        route.name = 'episode-breakdown-shot'
        route.params.episode_id = this.currentEpisode.id
      }
      this.$router.push(route)
    },

    onSaveClicked () {
      this.isSaving = true
      this.isSavingError = false
      this.saveCasting((err) => {
        if (err) this.isSavingError = true
        this.isSaving = false
      })
    },

    addOneAsset (assetId) {
      this.addAssetToCasting({ assetId, nbOccurences: 1 })
      this.saveCasting()
    },

    addTenAssets (assetId) {
      this.addAssetToCasting({ assetId, nbOccurences: 10 })
      this.saveCasting()
    },

    removeOneAsset (assetId) {
      this.removeAssetFromCasting({ assetId, nbOccurences: 1 })
      this.saveCasting()
    },

    removeTenAssets (assetId) {
      this.removeAssetFromCasting({ assetId, nbOccurences: 10 })
      this.saveCasting()
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
          console.log('bad 2')
          this.loading.importing = false
          this.errors.importing = true
        })
    }
  },

  watch: {
    $route () {
      const shotId = this.$route.params.shot_id
      if (shotId && this.shotId !== shotId) {
        this.shotId = shotId
      }
    },

    shotId () {
      if (this.shotId) {
        this.isLoading = true
        this.setCastingShot({
          shotId: this.shotId,
          callback: () => {
            this.isLoading = false
          }
        })
      }
    },

    sequenceId () {
      this.setCastingSequence(this.sequenceId)
    },

    episodeId () {
      if (this.episodeId !== this.$route.params.episode_id) {
        // this.reloadShots()
      }
    },

    castingSequenceOptions () {
      console.log('options changed', this.castingSequenceOptions)
      if (this.castingSequenceOptions.length > 0) {
        const shot = this.shotMap[this.shotId]
        if (this.shotId && shot) {
          this.sequenceId = shot.sequence_id
        } else {
          this.sequenceId = this.castingSequenceOptions[0].value
        }
      } else {
        this.sequenceId = ''
      }
    },

    currentProduction () {
      this.reset()
    },

    currentEpisode () {
      if (this.currentEpisode && this.episodeId !== this.currentEpisode.id) {
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

.breakdown-column:first-child {
  max-width: 250px;
  margin-left: 0;
}

.shot-column {
}

.casting-column {
}

.assets-column {
}

.asset-type,
.sequence {
  text-transform: uppercase;
  color: $grey;
  border-bottom: 1px solid $light-grey;
  font-size: 1.2em;
  margin-bottom: 1em;
}

.type-assets:not(:first-child),
.sequence-shots:not(:first-child) {
  margin-top: 2em;
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
</style>
