<template>
  <!-- the fixed page container traps the z-index of what it holds under the
       topbar: on phones the modal leaves it to cover the whole screen -->
  <teleport to="body" :disabled="!isPhone">
    <div
      id="temp-playlist-modal"
      ref="modal"
      :class="{
        dark: true,
        modal: true,
        'is-active': active,
        phone: isPhone
      }"
    >
      <div class="modal-background" @click="$emit('cancel')"></div>
      <div class="modal-content wide xyz-in" xyz="fade">
        <div class="box">
          <button-simple
            class="close-button"
            icon="remove"
            :title="$t('main.close')"
            @click="$emit('cancel')"
          />
          <playlist-player
            ref="playlistPlayer"
            :playlist="currentPlaylist"
            :entities="currentEntities"
            :is-loading="isLoading"
            :temp-mode="true"
            :can-save="isSaveAllowed"
            :current-entity-type="currentEntityType"
            @save-clicked="onSaveClicked"
            @annotation-changed="onAnnotationChanged"
            @annotations-refreshed="onAnnotationsRefreshed"
            @preview-changed="onPreviewChanged"
            v-if="!isPlaylistPage"
          />
        </div>
      </div>

      <!-- The browser shows a player in full screen alone: the save form
           of its Save button goes into it. -->
      <teleport :to="fullScreenPlayer" :disabled="!fullScreenPlayer">
        <edit-playlist-modal
          :active="modals.edit"
          :is-loading="loading.edit"
          :is-error="errors.edit"
          :is-success="editSuccess"
          :success-text="successText"
          :playlist-to-edit="playlistToEdit"
          :type-disabled="true"
          @confirm="savePlaylist"
          @view="onViewCreatedPlaylist"
          @cancel="closeEditModal"
        />
      </teleport>
    </div>
  </teleport>
</template>

<script setup>
/*
 * This component is aimed at displaying a temporary playlist from any view. It
 * is used in entity list to display playlists from the selection.
 */

import {
  computed,
  onBeforeUnmount,
  ref,
  toRef,
  useTemplateRef,
  watch
} from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

import { useFullScreenTarget } from '@/composables/fullScreen'
import { useModal } from '@/composables/modal'
import { usePhoneLayout } from '@/composables/phoneLayout'
import crisp from '@/lib/crisp'
import { getPlaylistPath } from '@/lib/path'
import { DEFAULT_NB_FRAMES_PICTURE } from '@/lib/playlist'

import EditPlaylistModal from '@/components/modals/EditPlaylistModal.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
// eslint-disable-next-line no-unused-vars
import PlaylistPlayer from '@/components/players/players/PlaylistPlayer.vue'

import assetStore from '@/store/modules/assets'
import shotStore from '@/store/modules/shots'
import sequenceStore from '@/store/modules/sequences'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore()

const props = defineProps({
  active: { type: Boolean, default: false },
  sort: { type: Boolean, default: false },
  taskIds: { type: Array, default: null },
  // one entry per entity instead of one per task
  entityIds: { type: Array, default: null },
  // the entities' type when it is not the one of the current page, as for
  // the assets cast in a shot
  entityType: { type: String, default: null }
})

const emit = defineEmits(['cancel'])

const { isPhone } = usePhoneLayout()

// the teleport makes the root a fragment: the dialog is passed explicitly
const modalRef = useTemplateRef('modal')
useModal(toRef(props, 'active'), emit, modalRef)

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
const editSuccess = ref(false)
const createdPlaylist = ref(null)
const playlistPlayer = ref(null)
const fullScreenPlayer = useFullScreenTarget(() => playlistPlayer.value?.$el)
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

// Saving turns the temporary playlist into a playlist of currentProduction,
// so it requires a production context in the route. Cross-production views
// like My Checks can mix tasks from several productions: no save there.
const isSaveAllowed = computed(() => Boolean(route.params.production_id))

const successText = computed(() =>
  createdPlaylist.value
    ? t('playlists.created', { name: createdPlaylist.value.name })
    : ''
)

const currentEntityType = computed(() => {
  if (props.entityType) return props.entityType
  if (route.path.includes('asset')) return 'asset'
  if (route.path.includes('shot')) return 'shot'
  if (route.path.includes('sequence')) return 'sequence'
  if (route.path.includes('edit')) return 'edit'
  if (route.path.includes('episode')) return 'episode'
  return 'shot'
})

const isAssetPlaylist = computed(() => currentEntityType.value === 'asset')
const isSequencePlaylist = computed(
  () => currentEntityType.value === 'sequence'
)
const isAllShots = computed(
  () => currentEpisode.value?.id === 'all' && currentEntityType.value === 'shot'
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

// Sequence names repeat across episodes: All shots says which one.
const getSequenceName = entity =>
  isAllShots.value && entity.episode_name && entity.sequence_name
    ? `${entity.episode_name} / ${entity.sequence_name}`
    : entity.sequence_name

const convertEntityToPlaylistFormat = entityInfo => {
  const entity = lookupEntity(entityInfo)
  if (!entity) return entityInfo
  const playlistEntity = {
    id: entityInfo.id,
    name: entity.name,
    nb_frames:
      entityInfo.nb_frames || entity.nb_frames || DEFAULT_NB_FRAMES_PICTURE,
    // Per-entity fps: an entity can override the production fps via
    // data.fps. Carried here so the player uses the right rate (same
    // enrichment as the Playlist page).
    fps:
      parseFloat(entity.data?.fps) ||
      parseFloat(currentProduction.value?.fps) ||
      25,
    parent_name:
      getSequenceName(entity) || entity.episode_name || entity.asset_type_name,
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
  editSuccess.value = false
  errors.value.edit = false
  createdPlaylist.value = null
  modals.value.edit = true
}

// Each entity carries its preview files grouped by task type. When a task type
// is chosen for the playlist, save that task type's preview for every entity so
// the playlist shows the right revisions, not the temp playlist's default ones.
const pickPreviewFileId = (shot, taskTypeId) => {
  const previews = taskTypeId && shot.preview_files?.[taskTypeId]
  return previews?.length ? previews[0].id : shot.preview_file_id
}

const closeEditModal = () => {
  modals.value.edit = false
  editSuccess.value = false
}

const onViewCreatedPlaylist = () => {
  if (!createdPlaylist.value) return
  modals.value.edit = false
  emit('cancel')
  const route = getPlaylistPath(
    currentProduction.value.id,
    currentEpisode.value?.id,
    createdPlaylist.value.id
  )
  if (isAllShots.value) {
    // The playlists page splits the all pseudo-episode by entity type.
    route.query = { for_entity: 'shot' }
  }
  router.push(route)
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
      is_for_all: playlist.is_for_all,
      task_type_id: form.task_type_id
    })
    const playlistToSave = { ...currentPlaylist.value }
    playlistToSave.shots = currentPlaylist.value.shots.map(shot => ({
      entity_id: shot.id,
      preview_file_id: pickPreviewFileId(shot, form.task_type_id)
    }))
    await store.dispatch('editPlaylist', { data: playlistToSave })
    createdPlaylist.value = playlist
    editSuccess.value = true
    loading.value.edit = false
    store.dispatch('loadPlaylists', {})
  } catch (err) {
    console.error(err)
    errors.value.edit = true
    loading.value.edit = false
  }
}

// the support chat bubble covers the player on a phone
let isChatHidden = false
const setChatHidden = hidden => {
  if (hidden !== isChatHidden) {
    isChatHidden = hidden
    crisp.setChatVisibility(hidden ? false : store.getters.isSupportChat)
  }
}

watch(() => props.active && isPhone.value, setChatHidden, { immediate: true })

onBeforeUnmount(() => setChatHidden(false))

watch(
  () => props.active,
  active => {
    if (active) {
      currentEntities.value = []
      previewFileMap = new Map()
      previewFileEntityMap = new Map()
      editSuccess.value = false
      createdPlaylist.value = null
      modals.value.edit = false
      isLoading.value = true
      const load = props.entityIds
        ? store.dispatch('loadTempPlaylistFromEntities', {
            entityIds: props.entityIds,
            sort: props.sort
          })
        : store.dispatch('loadTempPlaylist', {
            taskIds: currentTaskIds.value,
            sort: props.sort
          })
      load
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
  },
  { immediate: true }
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

.close-button {
  display: none;
}

// phones get the whole screen; top and bottom rather than 100vh, which
// iOS Safari measures under its toolbar
#temp-playlist-modal.phone {
  .modal-content.wide {
    bottom: 0;
    height: auto;
    left: 0;
    margin: 0;
    max-height: none;
    position: fixed;
    right: 0;
    top: 0;

    .box {
      border-radius: 0;
      height: 100%;
      padding: 0;
      position: relative;
    }
  }

  // a light round button, no box around it
  .close-button {
    align-items: center;
    background: rgba(0, 0, 0, 0.55);
    border: 0;
    border-radius: 50%;
    box-shadow: none;
    color: $white;
    display: flex;
    height: 36px;
    justify-content: center;
    padding: 0;
    position: absolute;
    right: 4px;
    top: 6px;
    width: 36px;
    z-index: 10;

    // 44px tap target around the 36px circle
    &::after {
      content: '';
      bottom: -4px;
      left: -4px;
      position: absolute;
      right: -4px;
      top: -4px;
    }
  }
}
</style>
