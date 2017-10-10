<template>
  <div class="breakdown page">
    <page-title :text="$t('breakdown.title')"></page-title>
    <div class="breakdown-columns">

      <div class="breakdown-column" style="{background: blue}">
        <div v-for="sequenceShots in shotsBySequence">
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

      <div class="breakdown-column" style="{background: green}">
        <h2 class="subtitle">
          Asset in {{ selectedShotId }}
        </h2>
      </div>

      <div class="breakdown-column" style="{background: red}">
        <h2 class="subtitle">
          All assets
        </h2>
        <div v-for="typeAssets in assetsByType">
          <div class="asset-type">
            {{ typeAssets[0] ? typeAssets[0].asset_type_name : '' }}
          </div>
          <div class="asset-list">
            <div
              :id="asset.id"
              class="asset"
              draggable="true"
              @click="selectAsset"
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
import ShotList from './lists/ShotList'
import PageTitle from './widgets/PageTitle'

export default {
  name: 'menu',

  components: {
    ShotList,
    PageTitle
  },

  data () {
    return {
      selectedShotId: 0,
      casting: {}
    }
  },

  computed: {
    ...mapGetters([
      'displayedShots',
      'shots',
      'shotsBySequence',
      'assets',
      'assetsByType',
      'sequences',
      'isShotsLoading',
      'isShotsLoadingError',
      'currentProduction',
      'currentProduction'
    ])
  },

  created () {
    const productionId = this.$store.state.route.params.production_id
    this.$store.commit(
      'SET_CURRENT_PRODUCTION',
      productionId
    )

    if (this.shots.length === 0) this.loadShots()
    if (this.assets.length === 0) this.loadAssets()
  },

  methods: {
    ...mapActions([
      'loadShots'
    ]),
    selectShot (event) {
      this.selectedShotId = event.target.id
      this.casting = {}
    },
    selectAsset (event) {
      this.selectedShotId = event.target.id
    },
    loadAssets () {
      this.$store.dispatch('loadAssets')
    },
    loadShots () {
      this.$store.dispatch('loadShots')
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

.asset-type,
.sequence {
  text-transform: uppercase;
  color: #999;
  border-bottom: 1px solid #CCC;
  font-size: 1.2em;
  margin-bottom: 1em;
}

.asset-type:not(first-child),
.sequence:not(first-child) {
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
  background: #c1f0c1;
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
  cursor: pointer;
  background: #EEE;
}

.asset.casted {
  background: #c1f0c1;
}
</style>
