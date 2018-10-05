<template>
  <div class="breakdown page">
    <div class="breakdown-columns mt2">

      <div class="breakdown-column shot-column">
        <spinner v-if="isShotsLoading" />
        <div v-else>
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
        >
        </error-text>
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
    ]),

    availableAssetsByType () {
      const result = []
      this.assetsByType.forEach((typeGroup) => {
        const newGroup = typeGroup.filter((asset) => !asset.canceled)
        if (newGroup.length > 0) result.push(newGroup)
      })
      return result
    }
  },

  mounted () {
    this.reset()
    this.setLastProductionScreen('breakdown')
  },

  methods: {
    ...mapActions([
      'loadShots',
      'loadAssets',
      'saveCasting',
      'setAssetSearch',
      'setCastingEpisode',
      'setCastingSequence',
      'setCastingShot',
      'addAssetToCasting',
      'removeAssetFromCasting',
      'setLastProductionScreen'
    ]),

    reset () {
      this.reloadShots()
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
      this.addAssetToCasting({assetId, nbOccurences: 1})
      this.saveCasting()
    },

    addTenAssets (assetId) {
      this.addAssetToCasting({assetId, nbOccurences: 10})
      this.saveCasting()
    },

    removeOneAsset (assetId) {
      this.removeAssetFromCasting({assetId, nbOccurences: 1})
      this.saveCasting()
    },

    removeTenAssets (assetId) {
      this.removeAssetFromCasting({assetId, nbOccurences: 10})
      this.saveCasting()
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
  overflow-y: auto;
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
