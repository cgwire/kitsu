<template>
  <div
    id="temp-playlist-modal"
    :class="{
      dark: true,
      modal: true,
      'is-active': active
    }"
  >
    <div class="modal-background" @click="$emit('cancel')"></div>
    <div class="modal-content wide xyz-in" xyz="fade">
      <div class="box">
        <playlist-player
          ref="playlist-player"
          :playlist="currentPlaylist"
          :entities="currentEntities"
          :is-loading="isLoading"
          :temp-mode="true"
          :current-entity-type="currentEntityType"
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

import { mapActions, mapGetters } from 'vuex'
import { DEFAULT_NB_FRAMES_PICTURE } from '@/lib/playlist'

import { modalMixin } from '@/components/modals/base_modal'

import EditPlaylistModal from '@/components/modals/EditPlaylistModal.vue'
import PlaylistPlayer from '@/components/pages/playlists/PlaylistPlayer.vue'

import assetStore from '@/store/modules/assets'
import shotStore from '@/store/modules/shots'
import sequenceStore from '@/store/modules/sequences'

export default {
  name: 'view-playlist-modal',

  mixins: [modalMixin],

  components: {
    EditPlaylistModal,
    PlaylistPlayer
  },

  props: {
    active: {
      type: Boolean,
      default: false
    },
    taskIds: {
      type: Array
    },
    sort: {
      type: Boolean,
      default: false
    }
  },

  emits: ['cancel'],

  data() {
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

    currentTaskIds() {
      return this.taskIds || Array.from(this.selectedTasks.keys())
    },

    isPlaylistPage() {
      return this.$route.path.indexOf('playlist') > 0
    },

    playlistPlayer() {
      return this.$refs['playlist-player']
    },

    isAssetPlaylist() {
      return this.currentEntityType === 'asset'
    },

    isSequencePlaylist() {
      return this.currentEntityType === 'sequence'
    },

    isShotPlaylist() {
      return this.currentEntityType === 'shot'
    },

    currentEntityType() {
      let type = 'shot'
      if (this.$route.path.indexOf('asset') > 0) type = 'asset'
      if (this.$route.path.indexOf('sequence') > 0) type = 'sequence'
      return type
    },

    assetMap() {
      return assetStore.cache.assetMap
    },

    shotMap() {
      return shotStore.cache.shotMap
    },

    sequenceMap() {
      return sequenceStore.cache.sequenceMap
    },

    frameDuration() {
      return Math.round((1 / this.fps) * 10000) / 10000
    },

    fps() {
      return parseFloat(this.currentProduction?.fps) || 25
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

    onAnnotationChanged({ preview, additions, deletions, updates }) {
      const taskId = preview.task_id
      this.updatePreviewAnnotation({
        taskId,
        preview,
        additions,
        deletions,
        updates
      })
    },

    onAnnotationsRefreshed(preview) {
      const entity = this.previewFileEntityMap.get(preview.id)
      const localPreview = this.previewFileMap.get(preview.id)
      if (entity) {
        entity.preview_file_annotations = preview.annotations
      }
      if (localPreview) {
        localPreview.annotations = preview.annotations
      }
    },

    setupEntities(entities) {
      const entityMap = {}
      entities.forEach(entity => {
        this.previewFileEntityMap.set(entity.preview_file_id, entity)
        const previewFileGroups = Object.values(entity.preview_files)
        this.convertEntityToPlaylistFormat(entity)
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

    convertEntityToPlaylistFormat(entityInfo) {
      let entity
      if (this.isAssetPlaylist) {
        entity = this.assetMap.get(entityInfo.id)
      } else if (this.isSequencePlaylist) {
        entity = this.sequenceMap.get(entityInfo.id)
        if (this.currentEpisode) {
          entity.episode_name = this.currentEpisode.name
        }
      } else {
        entity = this.shotMap.get(entityInfo.id)
      }
      if (entity) {
        const playlistEntity = {
          id: entityInfo.id,
          name: entity.name,
          nb_frames:
            entityInfo.nb_frames ||
            entity.nb_frames ||
            DEFAULT_NB_FRAMES_PICTURE,
          parent_name:
            entity.sequence_name ||
            entity.episode_name ||
            entity.asset_type_name,
          preview_files: entityInfo.preview_files,
          preview_file_id: entityInfo.preview_file_id || entity.preview_file_id,
          preview_file_extension:
            entityInfo.preview_file_extension || entity.preview_file_extension,
          preview_file_revision:
            entityInfo.preview_file_revision || entity.preview_file_revision,
          preview_file_width:
            entityInfo.preview_file_width || entity.preview_file_width,
          preview_file_height:
            entityInfo.preview_file_height || entity.preview_file_height,
          preview_file_duration:
            entityInfo.preview_file_duration || entity.preview_file_duration,
          preview_file_task_id:
            entityInfo.task_id ||
            entityInfo.preview_file_task_id ||
            entity.preview_file_task_id,
          preview_file_annotations:
            entityInfo.preview_file_annotations ||
            entity.preview_file_annotations,
          preview_file_previews:
            entityInfo.preview_file_previews || entity.preview_file_previews,
          preview_nb_frames:
            entityInfo.nb_frames ||
            entity.nb_frames ||
            DEFAULT_NB_FRAMES_PICTURE
        }
        Object.assign(entityInfo, playlistEntity)
        this.previewFileEntityMap.set(
          playlistEntity.preview_file_id,
          playlistEntity
        )
        const previews = playlistEntity.preview_file_previews || []
        previews.forEach(preview => {
          preview.duration = entity.preview_file_duration
          this.previewFileMap.set(preview.id, preview)
        })
        return playlistEntity
      } else {
        return entityInfo
      }
    },

    onSaveClicked() {
      this.errors.editPlaylist = false
      this.playlistToEdit = {
        for_entity: this.currentEntityType
      }
      this.modals.edit = true
    },

    savePlaylist(form) {
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
        .then(playlist => {
          Object.assign(this.currentPlaylist, {
            id: playlist.id,
            name: playlist.name,
            for_client: playlist.for_client,
            for_entity: playlist.for_entity,
            is_for_all: playlist.is_for_all
          })
          this.editPlaylist({
            data: this.currentPlaylist,
            callback: err => {
              if (err) {
                this.errors.edit = true
              } else {
                this.modals.edit = false
              }
              this.loading.edit = false
              this.loadPlaylists({})
            }
          })
        })
        .catch(err => {
          console.error(err)
          this.errors.edit = true
        })
    }
  },

  watch: {
    active() {
      if (this.active) {
        this.currentEntities = {}
        this.previewFileMap = new Map()
        this.previewFileEntityMap = new Map()
        this.isLoading = true
        this.loadTempPlaylist({ taskIds: this.currentTaskIds, sort: this.sort })
          .then(entities => {
            this.currentPlaylist.for_entity = this.currentEntityType
            this.setupEntities(entities)
            this.isLoading = false
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
  max-height: calc(100vh - 75px);
  top: 28px;
  overflow-x: hidden;
}
.modal-content .box {
  padding: 1em;
}

.modal-content.wide {
  overflow: hidden;
  height: 100%;
  margin: 1em;
  width: 100%;

  .box {
    background: #3d4048;
    padding-bottom: 0;
  }
}
</style>
