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
        :shots="currentShots"
        :is-loading="isLoading"
        :temp-mode="true"
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
        name: 'Temporary playlist'
      },
      currentShots: {},
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

    setupShots (shots) {
      const shotMap = {}
      shots.forEach((shot) => {
        shotMap[shot.id] = shot
      })
      this.currentShots = shotMap
      this.currentPlaylist.shots = this.currentShots
    },

    initPlaylistPlayer () {
      this.playlistPlayer.setupFabricCanvas()
    }
  },

  watch: {
    active () {
      if (this.active) {
        this.currentShots = {}
        this.initPlaylistPlayer()
        this.isLoading = true
        this.loadTempPlaylist(this.taskIds)
          .then((shots) => {
            this.setupShots(shots)
            this.isLoading = false
          })
          .catch(console.error)
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

  .modal-box {
    height: 100vh;
  }
}
</style>
