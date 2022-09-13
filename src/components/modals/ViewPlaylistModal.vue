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
        @annotation-changed="onAnnotationChanged"
        @annotations-refreshed="onAnnotationsRefreshed"
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
import { modalMixin } from '@/components/modals/base_modal'

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
      previewFileMap: new Map(),
      previewFileEntityMap: new Map(),
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
      'taskMap'
    ]),

    isPlaylistPage () {
      return this.$route.path.indexOf('playlist') > 0
    },

    taskIds () {
      return Array.from(this.selectedTasks.keys())
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
      'loadPlaylists',
      'loadTempPlaylist',
      'newPlaylist',
      'updatePreviewAnnotation'
    ]),

    onAnnotationChanged ({ preview, additions, deletions, updates }) {
      const taskId = preview.task_id
      this.updatePreviewAnnotation({
        taskId, preview, additions, deletions, updates
      })
    },

    onAnnotationsRefreshed (preview) {
      const entity = this.previewFileEntityMap.get(preview.id)
      const localPreview = this.previewFileMap.get(preview.id)
      if (entity) {
        entity.preview_file_annotations = preview.annotations
      }
      if (localPreview) {
        localPreview.annotations = preview.annotations
      }
    },

    setupEntities (entities) {
      const entityMap = {}
      entities.forEach(entity => {
        this.previewFileEntityMap.set(entity.preview_file_id, entity)
        const previewFileGroups = Object.values(entity.preview_files)
        previewFileGroups.forEach(previewFiles => {
          previewFiles.forEach(previewFile => {
            this.previewFileMap.set(previewFile.id, previewFile)
          })
        })
        entityMap[entity.id] = entity
      })
      this.currentPlaylist.shots = Object.values(entityMap)
      this.currentEntities = entityMap
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
        is_for_all: form.is_for_all,
        task_type_id: form.task_type_id
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
              this.loadPlaylists()
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
        this.previewFileMap = new Map()
        this.previewFileEntityMap = new Map()
        this.isLoading = true
        this.loadTempPlaylist(Array.from(this.selectedTasks.keys()))
          .then(entities => {
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
        this.playlistPlayer.clearCanvas()
        this.currentEntities = {}
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.modal-content {
  max-height: calc(100vh - 20px);
}
.modal-content .box {
  padding: 1em;
}

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
