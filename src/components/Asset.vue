<template>
<div class="page fixed-page">
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

</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import PageTitle from './widgets/PageTitle'
import PageSubtitle from './widgets/PageSubtitle'
import EntityThumbnail from './widgets/EntityThumbnail'
import EntityTaskList from './lists/EntityTaskList'

export default {
  name: 'asset',
  components: {
    EntityThumbnail,
    EntityTaskList,
    PageSubtitle,
    PageTitle
  },

  data () {
    return {
      currentAsset: null
    }
  },

  created () {
    this.clearSelectedTasks()

    this.currentAsset = this.getCurrentAsset()
    if (!this.currentAsset) {
      this.loadAsset({
        assetId: this.route.params.asset_id,
        callback: (err) => {
          if (!err) this.currentAsset = this.getCurrentAsset()
          console.log(this.currentAsset.tasks)
        }
      })
    }
  },

  computed: {
    ...mapGetters([
      'assetMap',
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
</style>
