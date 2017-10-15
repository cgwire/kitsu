<template>
  <div class="breakdown page">
    <page-title :text="$t('breakdown.title')"></page-title>
    <div class="breakdown-columns">

      <div class="breakdown-column shot-column">
        <div class="sequence-shots" v-for="sequenceShots in shotsBySequence">
          <div class="sequence">
            {{ sequenceShots[0] ? sequenceShots[0].sequence_name : '' }}
          </div>
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
              class="button save-button is-success"
              :disabled="!isCastingDirty"
              @click="saveCasting"
            >
              {{ $t('main.save') }}
            </button>
          </div>
        </div>
        <div class="type-assets" v-for="typeAssets in castingAssetsByType">
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
              {{ asset.name }}
            </div>
          </div>
        </div>
      </div>

      <div class="breakdown-column assets-column">
        <h2 class="subtitle">
          {{ $t('breakdown.all_assets') }}
        </h2>
        <div class="type-assets" v-for="typeAssets in assetsByType">
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
              @click="addAsset"
              v-for="asset in typeAssets"
            >
              {{ asset.name }}
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
import ShotList from './lists/ShotList'
import PageTitle from './widgets/PageTitle'
import { SaveIcon } from 'vue-feather-icons'

export default {
  name: 'menu',

  components: {
    ShotList,
    PageTitle,
    SaveIcon
  },

  data () {
    return {
      selectedShotId: 0,
      currentShot: null,
      casting: {},
      castingAssetsByType: [],
      isCastingDirty: false,
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
      'sequences',
      'shots',
      'shotMap',
      'shotsBySequence'
    ])
  },

  created () {
    const productionId = this.$store.state.route.params.production_id
    this.$store.commit('SET_CURRENT_PRODUCTION', productionId)

    if (this.shots.length === 0) this.loadShots()
    if (this.assets.length === 0) this.loadAssets()
  },

  methods: {
    ...mapActions([
      'loadShots',
      'loadAssets'
    ]),

    isSaveActive: () => {
      return this.currentShot && this.isCastingDirty
    },

    selectShot (event) {
      this.selectedShotId = event.target.id
      shotsApi.getShot(this.selectedShotId, (err, shot) => {
        if (err) console.log(err)
        this.currentShot = this.shotMap[this.selectedShotId]
        this.casting = {}
        if (!this.currentShot.entities_out) {
          this.currentShot.entities_out = shot.entities_out
        }
        this.currentShot.entities_out.forEach((assetId) => {
          this.casting[assetId] = this.assetMap[assetId]
        })
        this.castingAssetsByType = this.getCastingAssetsByType()
        this.isCastingDirty = false
      })
    },

    saveCasting () {
      shotsApi.updateCasting(this.currentShot, (err) => {
        if (err) console.log(err)
        this.isCastingDirty = false
      })
    },

    addAsset (event) {
      if (this.currentShot) {
        const assetId = event.target.id
        const asset = this.assetMap[assetId]
        this.casting[asset.id] = asset
        this.castingAssetsByType = this.getCastingAssetsByType()
        this.currentShot.entities_out = Object.values(this.casting).map(
          (asset) => asset.id
        )
        this.isCastingDirty = true
      }
    },

    removeAsset (event) {
      if (this.currentShot) {
        const assetId = event.target.id.substring('casting-'.length)
        delete this.casting[assetId]
        this.castingAssetsByType = this.getCastingAssetsByType()
        this.currentShot.entities_out = Object.values(this.casting).map(
          (asset) => asset.id
        )
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
        assetTypeAssets.push(asset)
        previousAsset = asset
      }
      assetsByType.push(assetTypeAssets)

      return assetsByType
    }
  },

  watch: {
    currentProduction () {
      const oldPath = `${this.$route.path}`
      const newPath = {
        name: 'breakdown',
        params: {production_id: this.currentProduction.id}
      }
      if (this.$route.path.length === 59) this.$router.push(newPath)
      const path = this.$route.path
      if (oldPath !== path) {
        this.loadAssets()
        this.loadShots()
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
}

.asset {
  width: 60px;
  height: 60px;
  margin-right: 1em;
  display: flex;
  text-align: center;
  font-size: 0.8em;
  align-items: center;
  justify-content: center;
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
</style>
