<template>
  <div class="breakdown page">
    <page-title :text="$t('breakdown.title')" class="page-header">
    </page-title>
    <div class="breakdown-columns">

      <div class="breakdown-column shot-column">
        <spinner v-if="isShotsLoading"></spinner>
        <div v-else>
          <combobox
            :label="$t('shots.fields.episode')"
            :options="getEpisodeOptions"
            v-model="episodeId"
          ></combobox>
          <combobox
            :label="$t('shots.fields.sequence')"
            :options="castingSequenceOptions"
            v-model="sequenceId"
          ></combobox>
          <p class="shots-title">{{ $t('shots.title')}}</p>
          <shot-line
            :key="shot.id"
            :shot-id="shot.id"
            :selected="castingCurrentShot && castingCurrentShot.id === shot.id"
            :name="shot.name"
            @click="selectShot"
            v-for="shot in castingSequenceShots">
          </shot-line>
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
          <div class="level-right" v-if="isCurrentUserManager">
            <button
              :class="{
                button: true,
                'save-button': true,
                'is-success': true,
                'is-loading': isSaving
              }"
              :disabled="!isCastingDirty"
              @click="onSaveClicked"
            >
              {{ $t('main.save') }}
            </button>
          </div>
        </div>
        <error-text
          :align-right="true"
          :hidden="!isSavingError"
          :text="$t('breakdown.save_error')"
        >
        </error-text>
        <spinner v-if="isLoading"></spinner>
        <div
          class="type-assets"
          v-for="typeAssets in castingAssetsByType"
          v-else
        >
          <div class="asset-type">
            {{ typeAssets[0] ? typeAssets[0].asset_type_name : '' }}
          </div>
          <div class="asset-list">
            <asset-block
              :key="asset.id"
              :asset="asset"
              :nb-occurences="asset.nb_occurences"
              @remove-one="removeOneAsset"
              @remove-ten="removeTenAssets"
              v-for="asset in typeAssets"
            >
            </asset-block>
          </div>
        </div>
      </div>

      <div class="breakdown-column assets-column" v-if="isCurrentUserManager">
        <h2 class="subtitle">
          {{ $t('breakdown.all_assets') }}
        </h2>

        <div class="filters-area">
          <div class="level">
            <search-field
              @change="onSearchChange"
            >
            </search-field>
          </div>
        </div>

        <spinner v-if="isAssetsLoading"></spinner>
        <div class="type-assets" v-for="typeAssets in assetsByType" v-else>
          <div class="asset-type">
            {{ typeAssets[0] ? typeAssets[0].asset_type_name : '' }}
          </div>
          <div class="asset-list">
            <available-asset-block
              :key="asset.id"
              :asset="asset"
              :casted="casting[asset.id] !== undefined"
              :active="castingCurrentShot ? true :  false"
              @add-one="addOneAsset"
              @add-ten="addTenAssets"
              v-for="asset in typeAssets"
            >
            </available-asset-block>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import PageTitle from './widgets/PageTitle'
import Spinner from './widgets/Spinner'
import Combobox from './widgets/Combobox'
import SearchField from './widgets/SearchField.vue'
import ErrorText from './widgets/ErrorText'
import ShotLine from './breakdown/ShotLine'
import AssetBlock from './breakdown/AssetBlock'
import AvailableAssetBlock from './breakdown/AvailableAssetBlock'
import { SaveIcon, SearchIcon } from 'vue-feather-icons'

export default {
  name: 'asset-types',

  components: {
    AssetBlock,
    AvailableAssetBlock,
    Combobox,
    ErrorText,
    PageTitle,
    SaveIcon,
    SearchIcon,
    SearchField,
    ShotLine,
    Spinner
  },

  data () {
    return {
      isLoading: false,
      isSaving: false,
      isSavingError: false,
      sequenceId: '',
      episodeId: '',
      shotId: ''
    }
  },

  computed: {
    ...mapGetters([
      'assets',
      'assetMap',
      'assetsByType',
      'currentProduction',
      'displayedShots',

      'getEpisodeOptions',
      'castingSequenceOptions',
      'isAssetsLoading',
      'isShotsLoading',
      'shots',
      'sequences',
      'shotMap',
      'shotsBySequence',

      'castingSequenceId',
      'castingCurrentShot',
      'castingSequenceShots',
      'isCastingSaveActive',
      'casting',
      'castingAssetsByType',
      'isCastingDirty',
      'isCastingSaveActive',

      'isCurrentUserManager'
    ])
  },

  created () {
    this.reset()
  },

  methods: {
    ...mapActions([
      'loadShots',
      'loadAssets',
      'saveCasting',
      'setAssetSearch',
      'setProduction',
      'setCastingEpisode',
      'setCastingSequence',
      'setCastingShot',
      'addAssetToCasting',
      'removeAssetFromCasting'
    ]),

    reset () {
      const productionId = this.$store.state.route.params.production_id
      this.shotId = this.$route.params.shot_id

      this.setProduction(productionId)
      this.loadShots(() => {
        this.loadAssets(() => {
          this.isLoading = true
          this.setCastingShot({
            shotId: this.shotId,
            callback: () => {
              this.isLoading = false
              if (this.getEpisodeOptions.length > 0) {
                const shot = this.shotMap[this.shotId]
                if (this.shotId && shot) {
                  this.episodeId = shot.episode_id
                } else {
                  this.episodeId = this.getEpisodeOptions[0].value
                }
              }
            }
          })
        })
      })
    },

    onSearchChange (searchQuery) {
      this.setAssetSearch(searchQuery)
    },

    selectShot (shotId) {
      this.$router.push({
        name: 'breakdown-shot',
        params: {
          production_id: this.currentProduction.id,
          shot_id: shotId
        }
      })
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
      this.addAssetToCasting({assetId, nbOccurences: 1})
    },

    addTenAssets (assetId) {
      this.addAssetToCasting({assetId, nbOccurences: 10})
    },

    removeOneAsset (assetId) {
      this.removeAssetFromCasting({assetId, nbOccurences: 1})
    },

    removeTenAssets (assetId) {
      this.removeAssetFromCasting({assetId, nbOccurences: 10})
    }
  },

  watch: {
    $route () {
      const shotId = this.$route.params.shot_id
      if (shotId) {
        this.isLoading = true
        this.setCastingShot({
          shotId,
          callback: () => {
            this.isLoading = false
          }
        })
      }
    },

    episodeId () {
      this.setCastingEpisode(this.episodeId)
    },

    sequenceId () {
      this.setCastingSequence(this.sequenceId)
    },

    castingSequenceOptions () {
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
      const newPath = {
        name: 'breakdown',
        params: {production_id: this.currentProduction.id}
      }
      if (this.currentProduction.id !== this.$route.params.production_id) {
        this.$router.push(newPath)
        this.reset()
      }
    }
  },

  metaInfo () {
    return {
      title: `${this.currentProduction.name} ${this.$t('breakdown.title')} - Kitsu`
    }
  }
}
</script>

<style scoped>
.breakdown {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
}

.title {
  margin-top: 1em;
}

.breakdown-columns {
  flex: 1;
  display: flex;
  flex-direction: row;
}

.breakdown-column {
  flex: 1;
  overflow-y: auto;
}

.breakdown-column:first-child {
  max-width: 250px;
}

.shot-column {
  padding: 0 1em 0 0;
}

.casting-column {
  padding: 0 1em;
}

.assets-column {
  border-left: 4px solid #EEE;
  padding-left: 1em;
}

.asset-type,
.sequence {
  text-transform: uppercase;
  color: #999;
  border-bottom: 1px solid #CCC;
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
