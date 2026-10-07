<template>
  <div class="mt1 flexcolumn wrapper preview-files">
    <div class="buttons flexrow mb1">
      <button-simple
        class="flexrow-item"
        icon="grid"
        :is-on="contactSheetMode"
        :title="$t('tasks.show_contact_sheet')"
        @click="contactSheetMode = !contactSheetMode"
      />
    </div>
    <div class="has-text-centered" v-if="isLoading">
      <spinner />
    </div>
    <div v-else-if="previewFiles.length > 0">
      <div class="contact-sheet flexcolumn" v-if="contactSheetMode">
        <div
          :key="`task-type-group-${index}`"
          v-for="(taskTypePreviewFiles, index) in taskTypePreviewFileGroups"
        >
          <div class="flexrow-item mb1">
            <task-type-name :task-type="getTaskType(taskTypePreviewFiles[0])" />
          </div>

          <div class="flexrow task-types-preview mb2">
            <entity-preview-file-card
              :key="previewFile.id"
              :preview-file="previewFile"
              v-for="previewFile in taskTypePreviewFiles"
            />
          </div>
        </div>
      </div>
      <table class="datatable datatable--cards" v-else>
        <thead class="datatable-head">
          <tr class="datatable-row-header">
            <th class="thumbnail"></th>
            <th class="type">
              {{ $t('entities.preview_files.task_type') }}
            </th>
            <th class="original-name">
              {{ $t('entities.preview_files.original_file_name') }}
            </th>
            <th class="revision">
              {{ $t('entities.preview_files.revision') }}
            </th>
            <th class="extension">
              {{ $t('entities.preview_files.extension') }}
            </th>
            <th class="size">
              {{ $t('entities.preview_files.size') }}
            </th>
            <th class="status">
              {{ $t('entities.preview_files.status') }}
            </th>
            <th class="person">
              {{ $t('entities.preview_files.uploader') }}
            </th>
            <th class="date">
              {{ $t('entities.preview_files.uploaded_at') }}
            </th>
            <th class="end-cell"></th>
          </tr>
        </thead>
        <tbody class="datatable-body">
          <tr
            :key="previewFile.id"
            class="datatable-row"
            v-for="previewFile in taskTypePreviewFileGroups.flat()"
          >
            <td class="thumbnail card-head">
              <entity-thumbnail
                class="preview-thumbnail"
                :preview-file-id="previewFile.id"
                :preview-file-status="previewFile.status"
                :empty-width="60"
                :width="60"
                :empty-height="40"
                :height="40"
              />
            </td>

            <task-type-cell
              class="type card-head"
              :task-type="getTaskType(previewFile)"
              :production-id="currentProduction.id"
            />
            <td
              class="original-name"
              :data-label="$t('entities.preview_files.original_file_name')"
            >
              {{ previewFile.original_name }}
            </td>
            <td
              class="revision"
              :data-label="$t('entities.preview_files.revision')"
            >
              {{ previewFile.revision }}
            </td>
            <td
              class="extension"
              :data-label="$t('entities.preview_files.extension')"
            >
              {{ previewFile.extension }}
            </td>
            <td class="size" :data-label="$t('entities.preview_files.size')">
              {{ renderFileSize(previewFile.file_size) }}
            </td>
            <td
              class="status"
              :data-label="$t('entities.preview_files.status')"
            >
              {{ previewFile.validation_status }}
            </td>
            <people-name-cell
              class="person"
              :data-label="$t('entities.preview_files.uploader')"
              :person="personMap.get(previewFile.person_id)"
            />
            <td
              class="date"
              :data-label="$t('entities.preview_files.uploaded_at')"
            >
              {{ formatDate(previewFile.created_at) }}
            </td>

            <td class="download">
              <a
                class="button flexrow-item"
                :href="getDownloadPath(previewFile.id)"
                :title="$t('playlists.actions.download_file')"
                download
                v-if="!isCurrentUserArtist"
              >
                <download-icon class="icon is-small" />
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <empty-section
      :icon="FilmIcon"
      :text="$t('entities.preview_files.no_preview_files')"
      v-else
    />
  </div>
</template>

<script setup>
import { DownloadIcon, FilmIcon } from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'

import { useFormat } from '@/composables/format'
import preferences from '@/lib/preferences'
import { getTaskTypePriorityOfProd } from '@/lib/productions'
import { renderFileSize } from '@/lib/render'

/* eslint-disable no-unused-vars */
import PeopleNameCell from '@/components/cells/PeopleNameCell.vue'
import TaskTypeCell from '@/components/cells/TaskTypeCell.vue'
import EntityPreviewFileCard from '@/components/pages/entities/EntityPreviewFileCard.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import EmptySection from '@/components/widgets/EmptySection.vue'
import EntityThumbnail from '@/components/widgets/EntityThumbnail.vue'
import Spinner from '@/components/widgets/Spinner.vue'
import TaskTypeName from '@/components/widgets/TaskTypeName.vue'
/* eslint-enable no-unused-vars */

const store = useStore()
const { formatDate } = useFormat()

// Props
// --------------------------------------------------------------------------
const props = defineProps({
  entity: { type: Object, default: null }
})

// State
// --------------------------------------------------------------------------
const contactSheetMode = ref(false)
const isLoading = ref(false)
const previewFiles = ref([])

// Computed
// --------------------------------------------------------------------------
const currentProduction = computed(() => store.getters.currentProduction)
const isCurrentUserArtist = computed(() => store.getters.isCurrentUserArtist)
const personMap = computed(() => store.getters.personMap)
const taskMap = computed(() => store.getters.taskMap)
const taskTypeMap = computed(() => store.getters.taskTypeMap)

const taskTypePreviewFileGroups = computed(() => {
  const groups = previewFiles.value.reduce((acc, previewFile) => {
    const taskType = getTaskType(previewFile)
    if (taskType) {
      acc.set(taskType.id, [...(acc.get(taskType.id) || []), previewFile])
    }
    return acc
  }, new Map())
  const priorityOf = taskTypeId =>
    getTaskTypePriorityOfProd(
      taskTypeMap.value.get(taskTypeId),
      currentProduction.value
    )
  return Array.from(groups.keys())
    .sort((a, b) => priorityOf(b) - priorityOf(a))
    .map(taskTypeId => groups.get(taskTypeId))
})

// Functions
// --------------------------------------------------------------------------
const getTaskType = previewFile => {
  const task = taskMap.value.get(previewFile.task_id)
  return task && taskTypeMap.value.get(task.task_type_id)
}

const getDownloadPath = previewFileId => {
  const previewFile = previewFiles.value.find(file => file.id === previewFileId)
  if (!previewFile) return ''
  const type = previewFile.extension === 'mp4' ? 'movies' : 'pictures'
  return `/api/${type}/originals/preview-files/${previewFileId}/download`
}

const reset = async () => {
  isLoading.value = true
  try {
    previewFiles.value = await store.dispatch(
      'getEntityPreviewFiles',
      props.entity.id
    )
    // The store reads again the ones still processing when the socket
    // reconnects, in case it missed the end of their job.
    store.dispatch('registerPreviewFileStatuses', previewFiles.value)
  } catch (err) {
    console.error(err)
    previewFiles.value = []
  }
  isLoading.value = false
}

// Watchers
// --------------------------------------------------------------------------
watch(
  () => props.entity,
  () => {
    if (props.entity) reset()
  }
)

watch(contactSheetMode, () => {
  preferences.setPreference(
    'entity:preview-files-contact-sheet',
    contactSheetMode.value
  )
})

// Lifecycle
// --------------------------------------------------------------------------
onMounted(() => {
  if (!props.entity) return
  reset()
  contactSheetMode.value = preferences.getBoolPreference(
    'entity:preview-files-contact-sheet'
  )
})
</script>

<style lang="scss" scoped>
.datatable-body {
  overflow-y: auto;
}

table.datatable {
  table-layout: fixed;
}

th.thumbnail {
  padding-top: 10px;
  width: 80px;
}

td.thumbnail {
  width: 80px;
}

td.type {
  width: 100px;
}
.revision {
  width: 80px;
}
.extension {
  width: 80px;
}
.size {
  width: 50px;
}
.status {
  width: 80px;
}
.download {
  width: 40px;
}
.date {
  width: 80px;
  white-space: nowrap;
}

.original-name {
  width: 250px;
}
.person {
  width: 250px;
}

.preview-files {
  flex: 1;
  margin-top: 0;
  overflow-y: auto;
}

.dark .preview-files.wrapper {
  background: transparent;
}

.preview-thumbnail {
  cursor: pointer;
  border-radius: 4px;
}

.datatable-row-header::after {
  display: none;
}

.contact-sheet {
  flex-wrap: wrap;
}

.task-types-preview {
  flex-wrap: wrap;
}
</style>
