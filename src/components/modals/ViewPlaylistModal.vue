<template>
<div id="temp-playlist-modal" :class="{
  'modal': true,
  'is-active': active
}">
  <div class="modal-background" @click="$emit('cancel')"></div>
  <div class="modal-content wide">
    <div class="box">
      <playlist-player
        ref="playlist-player"
        :playlist="currentPlaylist"
        :entities="currentEntities"
        :is-loading="isLoading"
        :temp-mode="true"
        :is-asset-playlist="isAssetPlaylist"
        @annotationchanged="onAnnotationChanged"
        v-if="!isPlaylistPage"
      />
    </div>
  </div>
</div>
</template>

<script>
/*
 * This component is aimed at displaying a temporary playlist from any view. It
 * is used in entity list to display playlists from the selection.
 */
import PlaylistPlayer from '../pages/playlists/PlaylistPlayer'

import { mapActions, mapGetters } from 'vuex'
import { modalMixin } from './base_modal'

export default {
  name: 'view-playlist-modal',
  mixins: [modalMixin],

  components: {
    PlaylistPlayer
  },

  props: {
    active: {
      default: false,
      type: Boolean
    }
  },

  data () {
    return {
      currentPlaylist: {
        id: 'temp',
        name: 'Temporary playlist',
        shots: [],
        for_entity: 'shot'
      },
      currentEntities: {},
      isLoading: false
    }
  },

  computed: {
    ...mapGetters([
      'taskMap',
      'selectedTasks',
      'shotMap'
    ]),

    isPlaylistPage () {
      return this.$route.path.indexOf('playlist') > 0
    },

    taskIds () {
      return Object.keys(this.selectedTasks)
    },

    playlistPlayer () {
      return this.$refs['playlist-player']
    },

    isAssetPlaylist () {
      if (this.currentPlaylist.shots.length > 0) {
        return this.currentPlaylist.shots.sequence_name === undefined
      }
      return false
    }
  },

  methods: {
    ...mapActions([
      'loadTempPlaylist',
      'updatePreviewAnnotation'
    ]),

    onAnnotationChanged ({ preview, annotations }) {
      const taskId = preview.task_id
      this.updatePreviewAnnotation({ taskId, preview, annotations })
    },

    setupEntities (entities) {
      const entityMap = {}
      entities.forEach((entity) => {
        entityMap[entity.id] = entity
      })
      this.currentPlaylist.shots = entityMap
      this.currentEntities = entityMap
    },

    initPlaylistPlayer () {
      this.playlistPlayer.setupFabricCanvas()
    }
  },

  watch: {
    active () {
      if (this.active) {
        this.currentEntities = {}
        this.initPlaylistPlayer()
        this.isLoading = true
        this.loadTempPlaylist(this.taskIds)
          .then((entities) => {
            this.setupEntities(entities)
            this.isLoading = false
            if (this.isAssetPlaylist) {
              this.currentPlaylist.for_entity = 'asset'
            } else {
              this.currentPlaylist.for_entity = 'shot'
            }
          })
          .catch(console.error)
      } else {
        this.playlistPlayer.pause()
        this.currentEntities = {}
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.modal-content.wide {
  margin: 1em;
  height: 100%;
  width: 100%;

  .box {
    background: #3D4048;
    height: calc(100vh - 40px);
  }
}
</style>
