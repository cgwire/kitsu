<template>
  <div class="breakdown page">
    <page-title :text="$t('breakdown.title')"></page-title>
    <div class="breakdown-columns">

      <div class="breakdown-column shot-column">
        <spinner v-if="isShotsLoading"></spinner>
        <div v-else>
          <combobox
            :label="$t('shots.fields.sequence')"
            :options="getSequenceOptions"
            v-model="selectedSequenceId"
          ></combobox>
          <div
            :id="shot.id"
            :class="{
              shot: true,
              selected: selectedShotId && shot.id === selectedShotId
            }"
            @click="selectShot"
            v-for="shot in sequenceShots">
            {{ shot.name }}
          </div>
        </div>
      </div>

      <div class="breakdown-column casting-column">
        <div class="level">
          <div class="level-left">
            <h2 class="subtitle" v-if="currentShot">
              {{
                $t('breakdown.selected_shot', {
                  sequence_name: currentShot.sequence_name,
                  name: currentShot.name
                })
              }}
            </h2>
            <em v-else>
              {{ $t('breakdown.select_shot') }}
            </em>
          </div>
          <div class="level-right">
            <button
              :class="{
                button: true,
                'save-button': true,
                'is-success': true,
                'is-loading': isSaving
              }"
              :disabled="!isCastingDirty"
              @click="saveCasting"
            >
              {{ $t('main.save') }}
            </button>
          </div>
        </div>
        <p :class="{
          'error':true,
          'has-text-right': true,
          'is-hidden': !isSavingError
        }">
          {{ $t('breakdown.save_error') }}
        </p>
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
            <div
              :id="'casting-' + asset.id"
              class="asset big casted active"
              @click="removeAsset"
              v-for="asset in typeAssets"
            >
              <div
                class="asset-add"
                @click="removeOneAsset"
              >
              - 1
              </div>
              <div
                class="asset-add-10"
                @click="removeTenAssets"
                >
              - 10
              </div>
              <div class="asset-name">
                <p>
                {{ asset.name }}
                <span v-if="asset.nb_occurences > 1">
                ({{ asset.nb_occurences }})
                </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="breakdown-column assets-column">
        <h2 class="subtitle">
          {{ $t('breakdown.all_assets') }}
        </h2>

        <div class="filters-area">
          <div class="level">
            <div class="level-right">
              <div class="level-item">
                <search-icon></search-icon>
              </div>
              <div class="level-item">
                <input
                  class="input search-input"
                  type="text"
                  @input="onSearchChange"
                  v-focus
                />
              </div>
            </div>
          </div>
        </div>

        <spinner v-if="isAssetsLoading"></spinner>
        <div class="type-assets" v-for="typeAssets in assetsByType" v-else>
          <div class="asset-type">
            {{ typeAssets[0] ? typeAssets[0].asset_type_name : '' }}
          </div>
          <div class="asset-list">
            <div
              :id="asset.id"
              :class="{
                asset: true,
                casted: casting[asset.id] !== undefined,
                active: currentShot ? true :  false
              }"
              v-for="asset in typeAssets"
            >
              <div
                class="asset-add"
                @click="addOneAsset"
              >
              + 1
              </div>
              <div
                class="asset-add-10"
                @click="addTenAssets"
                >
              + 10
              </div>
              <div class="asset-name">
              {{ asset.name }}
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { sortAssets } from '../lib/sorting'
import shotsApi from '../store/api/shots'
import PageTitle from './widgets/PageTitle'
import Spinner from './widgets/Spinner'
import Combobox from './widgets/Combobox'
import { SaveIcon, SearchIcon } from 'vue-feather-icons'

export default {
  name: 'menu',

  components: {
    Combobox,
    PageTitle,
    SaveIcon,
    SearchIcon,
    Spinner
  },

  data () {
    return {
      selectedSequenceId: '',
      selectedShotId: 0,
      sequenceShots: [],
      currentShot: null,
      casting: {},
      castingAssetsByType: [],
      isCastingDirty: false,
      isLoading: false,
      isSaving: false,
      isSavingError: false
    }
  },

  computed: {
    ...mapGetters([
      'assets',
      'assetMap',
      'assetsByType',
      'currentProduction',
      'displayedShots',
      'getSequenceOptions',
      'isAssetsLoading',
      'isShotsLoading',
      'shots',
      'shotMap',
      'shotsBySequence'
    ])
  },

  created () {
    const productionId = this.$store.state.route.params.production_id
    this.$store.commit('SET_CURRENT_PRODUCTION', productionId)

    this.loadShots(() => {
      this.loadAssets(() => {
        const shotId = this.$route.params.shot_id
        if (shotId) {
          this.setShot(shotId)
        } else {
          this.selectedSequenceId = this.getSequenceOptions[0].value
        }
        this.sequenceShots = this.shots.filter((shot) => {
          return shot.sequence_id === this.selectedSequenceId
        })
      })
    })
  },

  methods: {
    ...mapActions([
      'loadShots',
      'loadAssets'
    ]),

    isSaveActive: () => {
      return this.currentShot && this.isCastingDirty
    },

    onSearchChange (event) {
      const searchQuery = event.target.value
      this.$store.commit('SET_ASSET_SEARCH', searchQuery)
    },

    selectShot (event) {
      this.$router.push({
        name: 'breakdown-shot',
        params: {
          production_id: this.currentProduction.id,
          shot_id: event.target.id
        }
      })
    },

    setShot (shotId) {
      this.selectedShotId = shotId
      this.currentShot = this.shotMap[this.selectedShotId]
      this.isLoading = true
      this.selectedSequenceId = this.currentShot.sequence_id
      shotsApi.getCasting(this.currentShot, (err, casting) => {
        if (err) console.log(err)
        this.isLoading = false
        this.casting = {}
        casting.forEach((cast) => {
          this.casting[cast.asset_id] = this.assetMap[cast.asset_id]
          this.casting[cast.asset_id].nb_occurences = cast.nb_occurences
        })
        this.castingAssetsByType = this.getCastingAssetsByType()
        this.isCastingDirty = false
      })
    },

    saveCasting () {
      const casting = []
      Object.values(this.casting).forEach((asset) => {
        casting.push({
          asset_id: asset.id,
          nb_occurences: asset.nb_occurences || 1
        })
      })

      this.isSaving = true
      this.isSavingError = false

      shotsApi.updateCasting(this.currentShot, casting, (err) => {
        if (err) {
          console.log(err)
          this.isSavingError = true
        } else {
          this.isCastingDirty = false
        }
        this.isSaving = false
      })
    },

    addOneAsset (event) {
      const assetId = event.target.parentElement.id
      this.addAsset(assetId, 1)
    },

    addTenAssets (event) {
      const assetId = event.target.parentElement.id
      this.addAsset(assetId, 10)
    },

    addAsset (assetId, number) {
      if (this.currentShot) {
        const asset = this.assetMap[assetId]
        if (this.casting[asset.id]) {
          this.casting[asset.id].nb_occurences += number
        } else {
          this.casting[asset.id] = asset
          this.casting[asset.id].nb_occurences = number
        }
        this.castingAssetsByType = this.getCastingAssetsByType()
        this.isCastingDirty = true
      }
    },

    removeOneAsset (event) {
      let assetId = event.target.parentElement.id
      assetId = assetId.substring('casting-'.length)
      this.removeAsset(assetId, 1)
    },

    removeTenAssets (event) {
      let assetId = event.target.parentElement.id
      assetId = assetId.substring('casting-'.length)
      this.removeAsset(assetId, 10)
    },

    removeAsset (assetId, number) {
      if (this.currentShot && this.casting[assetId]) {
        this.casting[assetId].nb_occurences -= number
        if (this.casting[assetId].nb_occurences < 1) {
          delete this.casting[assetId]
        }
        this.castingAssetsByType = this.getCastingAssetsByType()
        this.isCastingDirty = true
      }
    },

    getCastingAssetsByType () {
      const assetsByType = []
      const casting = sortAssets(Object.values(this.casting))
      let assetTypeAssets = []
      let previousAsset = casting.length > 0 ? casting[0] : null

      for (let asset of casting) {
        const isChange =
          asset.asset_type_name !== previousAsset.asset_type_name
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
    }
  },

  watch: {
    $route () {
      const shotId = this.$route.params.shot_id
      if (shotId) this.setShot(shotId)
    },
    selectedSequenceId () {
      if (this.selectedSequenceId) {
        this.sequenceShots = this.shots.filter((shot) => {
          return shot.sequence_id === this.selectedSequenceId
        })
      }
    },
    currentProduction () {
      const oldPath = `${this.$route.path}`
      const newPath = {
        name: 'breakdown',
        params: {production_id: this.currentProduction.id}
      }
      if (this.currentProduction.id !== this.$route.params.production_id) {
        this.$router.push(newPath)
        const path = this.$route.path
        if (oldPath !== path) {
          this.selectedShotId = null
          this.currentShot = null
          this.casting = {}
          this.castingAssetsByType = this.getCastingAssetsByType()
          this.loadShots(() => {
            if (this.getSequenceOptions.length > 0) {
              this.selectedSequenceId = this.getSequenceOptions[0].id
            }
            this.loadAssets()
          })
        }
      }
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

.shot {
  font-size: 1.1em;
  padding: 0.5em 0 0.2em 0.2em;
  margin-left: 1em;
  border-bottom: 1px solid #CCC;
  cursor: pointer;
}

.shot:hover {
  background: #ecfaec;
}

.shot.selected {
  background: #D1C4E9;
}

.asset-list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}

.level-right {
  display-flex: row;
}

.asset {
  width: 60px;
  height: 60px;
  margin-right: 1em;
  margin-bottom: 1em;
  font-size: 0.8em;
  cursor: default;
  background: #EEE;
}

.asset.big {
  width: 80px;
  height: 80px;
}

.asset.casted {
  background: #D1C4E9;
}

.active {
  cursor: pointer;
}

.asset-add {
  position: relative;
  top: 0;
  left: 0;
  width: 60px;
  height: 30px;
  background: #F1E4FF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2em;
  opacity: 0;
  z-index: 3;
}

.asset-add-10 {
  position: relative;
  top: 0;
  left: 0;
  margin-top: 0px;
  width: 60px;
  height: 30px;
  background: #E1D4F9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2em;
  opacity: 0;
  z-index: 3;
}

.big .asset-add {
  width: 80px;
  height: 40px;
}

.big .asset-add-10 {
  width: 80px;
  height: 40px;
}

.asset.active:hover .asset-add,
.asset.active:hover .asset-add-10 {
  opacity: 1;
}

.asset-name {
  position: relative;
  top: -60px;
  left: 0;
  display: flex;
  text-align: center;
  justify-content: center;
  align-items: center;
  width: 60px;
  height: 60px;
  z-index: 2;
}

.big .asset-name {
  top: -80px;
  width: 80px;
  height: 80px;
}

.nb-occurences {
  margin-left: 0.4em;
}
</style>
