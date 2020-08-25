<template>
<div id="temp-playlist-modal" :class="{
  dark: true,
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
        @save-clicked="onSaveClicked"
        @annotationchanged="onAnnotationChanged"
        v-if="!isPlaylistPage"
      />
    </div>
  </div>

  <edit-playlist-modal
    :active="modals.edit"
    :is-loading="loading.edit"
    :is-error="errors.edit"
    :playlist-to-edit="playlistToEdit"
    :type-disabled="true"
    @confirm="savePlaylist"
    @cancel="modals.edit = false"
  />

</div>
</template>

<script>
/*
 * This component is aimed at displaying a temporary playlist from any view. It
 * is used in entity list to display playlists from the selection.
 */
import EditPlaylistModal from '@/components/modals/EditPlaylistModal'
import PlaylistPlayer from '@/components/pages/playlists/PlaylistPlayer'

import { mapActions, mapGetters } from 'vuex'
import { modalMixin } from './base_modal'

export default {
  name: 'view-playlist-modal',
  mixins: [modalMixin],

  components: {
    EditPlaylistModal,
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
      currentEntities: {},
      currentPlaylist: {
        id: 'temp',
        name: 'Temporary playlist',
        shots: [],
        for_entity: 'shot'
      },
      errors: {
        edit: false
      },
      loading: {
        edit: false
      },
      modals: {
        edit: false
      },
      playlistToEdit: {},
      isLoading: false
    }
  },

  computed: {
    ...mapGetters([
      'currentEpisode',
      'currentProduction',
      'isTVShow',
      'selectedTasks',
      'shotMap',
      'taskMap'
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
        return this.currentPlaylist.shots[0].sequence_name === undefined
      }
      return false
    }
  },

  methods: {
    ...mapActions([
      'editPlaylist',
      'loadTempPlaylist',
      'newPlaylist',
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
      this.currentPlaylist.shots = Object.values(entityMap)
      this.currentEntities = entityMap
    },

    initPlaylistPlayer () {
      this.playlistPlayer.setupFabricCanvas()
    },

    onSaveClicked () {
      this.errors.editPlaylist = false
      this.playlistToEdit = {
        for_entity: this.isAssetPlaylist ? 'asset' : 'shot'
      }
      this.modals.edit = true
    },

    savePlaylist (form) {
      const newPlaylist = {
        name: form.name,
        production_id: this.currentProduction.id,
        for_client: form.for_client,
        for_entity: form.for_entity,
        is_for_all: form.is_for_all
      }
      if (this.isTVShow && this.currentEpisode) {
        newPlaylist.episode_id = this.currentEpisode.id
      }
      this.errors.edit = false
      this.loading.edit = true
      this.newPlaylist(newPlaylist)
        .then((playlist) => {
          Object.assign(this.currentPlaylist, {
            id: playlist.id,
            name: playlist.name,
            for_client: playlist.for_client,
            for_entity: playlist.for_entity,
            is_for_all: playlist.is_for_all
          })
          this.editPlaylist({
            data: this.currentPlaylist,
            callback: (err) => {
              if (err) {
                this.errors.edit = true
              } else {
                this.modals.edit = false
              }
              this.loading.edit = false
            }
          })
        })
        .catch((err) => {
          console.error(err)
          this.errors.edit = true
        })
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
