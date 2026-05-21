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
          ref="playlistPlayer"
          :playlist="currentPlaylist"
          :entities="currentEntities"
          :is-loading="isLoading"
          :temp-mode="true"
          :current-entity-type="currentEntityType"
          @save-clicked="onSaveClicked"
          @annotation-changed="onAnnotationChanged"
          @annotations-refreshed="onAnnotationsRefreshed"
          @preview-changed="onPreviewChanged"
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

<script setup>
/*
 * This component is aimed at displaying a temporary playlist from any view. It
 * is used in entity list to display playlists from the selection.
 */

import { computed, ref, toRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

import { useModal } from '@/composables/modal'
import { DEFAULT_NB_FRAMES_PICTURE } from '@/lib/playlist'

import EditPlaylistModal from '@/components/modals/EditPlaylistModal.vue'
// eslint-disable-next-line no-unused-vars
import PlaylistPlayer from '@/components/players/players/PlaylistPlayer.vue'

import assetStore from '@/store/modules/assets'
import shotStore from '@/store/modules/shots'
import sequenceStore from '@/store/modules/sequences'

const route = useRoute()
const store = useStore()

const props = defineProps({
  active: { type: Boolean, default: false },
  sort: { type: Boolean, default: false },
  taskIds: { type: Array, default: null }
})

const emit = defineEmits(['cancel'])

useModal(toRef(props, 'active'), emit)

const currentEntities = ref([])
const currentPlaylist = ref({
  id: 'temp',
  name: 'Temporary playlist',
  shots: [],
  for_entity: 'shot'
})
const errors = ref({ edit: false })
const isLoading = ref(false)
const loading = ref({ edit: false })
const modals = ref({ edit: false })
const playlistPlayer = ref(null)
const playlistToEdit = ref({})
let previewFileMap = new Map()
let previewFileEntityMap = new Map()

const currentEpisode = computed(() => store.getters.currentEpisode)
const currentProduction = computed(() => store.getters.currentProduction)
const isTVShow = computed(() => store.getters.isTVShow)
const selectedTasks = computed(() => store.getters.selectedTasks)

const currentTaskIds = computed(
  () => props.taskIds || Array.from(selectedTasks.value.keys())
)

const isPlaylistPage = computed(() => route.path.indexOf('playlist') > 0)

const currentEntityType = computed(() => {
  if (route.path.indexOf('asset') > 0) return 'asset'
  if (route.path.indexOf('sequence') > 0) return 'sequence'
  if (route.path.indexOf('edit') > 0) return 'edit'
  if (route.path.indexOf('episode') > 0) return 'episode'
  return 'shot'
})

const isAssetPlaylist = computed(() => currentEntityType.value === 'asset')
const isSequencePlaylist = computed(
  () => currentEntityType.value === 'sequence'
)

const onPreviewChanged = async ({
  entity,
  previewFileId,
  previousPreviewFileId
}) => {
  await store.dispatch('changePlaylistPreview', {
    playlist: currentPlaylist.value,
    entity,
    previewFileId,
    previousPreviewFileId,
    remote: false
  })
}

const onAnnotationChanged = async ({
  preview,
  additions,
  deletions,
  updates
}) => {
  try {
    await store.dispatch('updatePreviewAnnotation', {
      taskId: preview.task_id,
      preview,
      additions,
      deletions,
      updates
    })
    playlistPlayer.value?.confirmAnnotationsSaved()
  } catch {
    playlistPlayer.value?.restoreFailedAnnotations()
  }
}

const onAnnotationsRefreshed = preview => {
  const entity = previewFileEntityMap.get(preview.id)
  const localPreview = previewFileMap.get(preview.id)
  if (entity) entity.preview_file_annotations = preview.annotations
  if (localPreview) localPreview.annotations = preview.annotations
}

const lookupEntity = entityInfo => {
  if (isAssetPlaylist.value) return assetStore.cache.assetMap.get(entityInfo.id)
  if (isSequencePlaylist.value) {
    const entity = sequenceStore.cache.sequenceMap.get(entityInfo.id)
    if (entity && currentEpisode.value) {
      entity.episode_name = currentEpisode.value.name
    }
    return entity
  }
  return shotStore.cache.shotMap.get(entityInfo.id)
}

const convertEntityToPlaylistFormat = entityInfo => {
  const entity = lookupEntity(entityInfo)
  if (!entity) return entityInfo
  const playlistEntity = {
    id: entityInfo.id,
    name: entity.name,
    nb_frames:
      entityInfo.nb_frames || entity.nb_frames || DEFAULT_NB_FRAMES_PICTURE,
    parent_name:
      entity.sequence_name || entity.episode_name || entity.asset_type_name,
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
      entityInfo.preview_file_annotations || entity.preview_file_annotations,
    preview_file_previews:
      entityInfo.preview_file_previews || entity.preview_file_previews,
    preview_nb_frames:
      entityInfo.nb_frames || entity.nb_frames || DEFAULT_NB_FRAMES_PICTURE
  }
  Object.assign(entityInfo, playlistEntity)
  previewFileEntityMap.set(playlistEntity.preview_file_id, playlistEntity)
  const previews = playlistEntity.preview_file_previews || []
  previews.forEach(preview => {
    preview.duration = entity.preview_file_duration
    previewFileMap.set(preview.id, preview)
  })
  return playlistEntity
}

const setupEntities = entities => {
  const entityMap = {}
  entities.forEach(entity => {
    previewFileEntityMap.set(entity.preview_file_id, entity)
    const previewFileGroups = Object.values(entity.preview_files)
    convertEntityToPlaylistFormat(entity)
    previewFileGroups.forEach(previewFiles => {
      previewFiles.forEach(previewFile => {
        previewFileMap.set(previewFile.id, previewFile)
      })
    })
    entityMap[entity.id + '-' + entity.preview_file_id] = entity
  })
  store.commit('SET_PLAYLIST_ENTRY_MAP', entityMap)
  currentPlaylist.value.shots = Object.values(entityMap)
  currentEntities.value = Object.values(entityMap)
}

const onSaveClicked = () => {
  playlistToEdit.value = { for_entity: currentEntityType.value }
  modals.value.edit = true
}

const savePlaylist = async form => {
  const newPlaylist = {
    name: form.name,
    production_id: currentProduction.value.id,
    for_client: form.for_client,
    for_entity: form.for_entity,
    is_for_all: form.is_for_all,
    task_type_id: form.task_type_id
  }
  if (isTVShow.value && currentEpisode.value) {
    newPlaylist.episode_id = currentEpisode.value.id
  }
  errors.value.edit = false
  loading.value.edit = true
  try {
    const playlist = await store.dispatch('newPlaylist', newPlaylist)
    Object.assign(currentPlaylist.value, {
      id: playlist.id,
      name: playlist.name,
      for_client: playlist.for_client,
      for_entity: playlist.for_entity,
      is_for_all: playlist.is_for_all
    })
    const playlistToSave = { ...currentPlaylist.value }
    playlistToSave.shots = currentPlaylist.value.shots.map(shot => ({
      entity_id: shot.id,
      preview_file_id: shot.preview_file_id
    }))
    await store.dispatch('editPlaylist', { data: playlistToSave })
    modals.value.edit = false
    store.dispatch('loadPlaylists', {})
  } catch (err) {
    console.error(err)
    errors.value.edit = true
    loading.value.edit = false
  }
}

watch(
  () => props.active,
  active => {
    if (active) {
      currentEntities.value = []
      previewFileMap = new Map()
      previewFileEntityMap = new Map()
      isLoading.value = true
      store
        .dispatch('loadTempPlaylist', {
          taskIds: currentTaskIds.value,
          sort: props.sort
        })
        .then(entities => {
          currentPlaylist.value.for_entity = currentEntityType.value
          setupEntities(entities)
          isLoading.value = false
        })
        .catch(console.error)
    } else {
      playlistPlayer.value?.pause()
      playlistPlayer.value?.clearCanvas()
      currentEntities.value = []
    }
  }
)
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
