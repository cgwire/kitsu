<template>
<div class="page">
  <div class="page-header">
    <div class="level">
      <div class="level-left">
        <div class="level-item">
          <entity-thumbnail
            class="asset-thumbnail"
            :entity="currentAsset"
            v-if="currentAsset"
          >
          </entity-thumbnail>
        </div>
        <div class="level-item">
          <page-title :text="title"></page-title>
        </div>
      </div>
    </div>
  </div>

  <div>
    <page-subtitle :text="$t('assets.tasks')"></page-subtitle>
    <entity-task-list
      :entries="currentAsset ? currentAsset.tasks : []"
      :is-loading="!currentAsset"
      :is-error="false"
    ></entity-task-list>
  </div>

  <page-subtitle :text="$t('assets.cast_in')"></page-subtitle>
  <div v-if="currentAsset">
    <div
      class="sequence-shots"
        v-for="sequenceShots in currentAsset.castInShotsBySequence"
        v-if="currentAsset.castInShotsBySequence[0].length > 0"
    >
      <div class="shot-sequence">
        {{ sequenceShots[0] ? sequenceShots[0].sequence_name : '' }}
      </div>
      <div class="shot-list">
        <router-link
          class="shot-link"
          :key="shot.shot_id"
          :to="{
            name: 'shot',
            params: {
              production_id: currentProduction.id,
              shot_id: shot.shot_id
            }
          }"
          v-for="shot in sequenceShots"
        >
          <entity-thumbnail
            :entity="shot"
            :square="true"
          >
          </entity-thumbnail>
          <div>
            <span>{{ shot.name }}</span>
            <span v-if="shot.nb_occurences > 1">
              ({{ shot.nb_occurences }})
            </span>
          </div>
        </router-link>
      </div>
    </div>
    <div v-else>
      {{ $t('assets.no_cast_in') }}
    </div>
  </div>
  <table-info
    :is-loading="castIn.isLoadin"
    :is-error="castIn.isError"
    v-else
  >
  </table-info>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import PageTitle from './widgets/PageTitle'
import PageSubtitle from './widgets/PageSubtitle'
import EntityThumbnail from './widgets/EntityThumbnail'
import TableInfo from './widgets/TableInfo'
import EntityTaskList from './lists/EntityTaskList'

export default {
  name: 'asset',
  components: {
    EntityThumbnail,
    EntityTaskList,
    PageSubtitle,
    PageTitle,
    TableInfo
  },

  data () {
    return {
      currentAsset: null,
      castIn: {
        isLoading: false,
        isError: false
      }
    }
  },

  created () {
    this.clearSelectedTasks()
    this.currentAsset = this.getCurrentAsset()

    this.castIn.isLoading = true
    this.castIn.isError = false

    if (!this.currentAsset) {
      this.loadAsset({
        assetId: this.route.params.asset_id,
        callback: (err) => {
          if (!err) {
            this.currentAsset = this.getCurrentAsset()
            this.loadAssetCastIn({
              asset: this.currentAsset,
              callback: (err, castIn) => {
                if (err) {
                  this.castIn.isError = true
                } else {
                  this.castIn.isError = false
                }
                this.castIn.isLoading = true
              }
            })
          }
        }
      })
    } else {
      this.loadAssetCastIn({
        asset: this.currentAsset,
        callback: (err, castIn) => {
          if (err) {
            this.castIn.isError = true
          } else {
            this.castIn.isError = false
          }
          this.castIn.isLoading = true
        }
      })
    }
  },

  computed: {
    ...mapGetters([
      'assetMap',
      'currentProduction',
      'route'
    ]),

    title () {
      if (this.currentAsset) {
        return `${this.currentAsset.project_name} / ` +
               `${this.currentAsset.asset_type_name} / ` +
               `${this.currentAsset.name}`
      } else {
        return 'Loading...'
      }
    },

    assetThumbnailPath () {
      const previewId = this.currentAsset.preview_file_id
      return `/api/pictures/originals/preview-files/${previewId}.png`
    },

    isPreview () {
      return this.currentAsset &&
        this.currentAsset.preview_file_id &&
        this.currentAsset.preview_file_id.length > 0
    }
  },

  methods: {
    ...mapActions([
      'loadAsset',
      'loadAssetCastIn',
      'clearSelectedTasks'
    ]),
    changeTab (tab) {
      this.selectedTab = tab
    },
    getCurrentAsset () {
      return this.assetMap[this.route.params.asset_id] || null
    }
  },

  watch: {
    $route () { this.handleModalsDisplay() }
  },

  metaInfo () {
    return {
      title: `${this.title} - Kitsu`
    }
  }
}
</script>

<style scoped>
.asset-thumbnail {
  max-width: 100px;
}

.shot-sequence {
  text-transform: uppercase;
  font-size: 1.2em;
  color: #999;
  margin-top: 2em;
  margin-bottom: 0.4em;
}

.shot-list {
  display: flex;
}

.shot-link {
  color: inherit;
  margin-right: 1em;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
