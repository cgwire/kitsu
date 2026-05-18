<template>
  <div class="flexrow wrapper">
    <div
      :class="{
        'playlisted-entity': true,
        playing: isPlaying
      }"
    >
      <div class="thumbnail-wrapper" @click.prevent="onPlayClick">
        <span
          class="remove-button flexrow-item"
          :title="$t('playlists.remove')"
          @click.prevent="onRemoveClick"
          v-if="!readOnly && (isCurrentUserManager || isCurrentUserSupervisor)"
        >
          <x-icon />
        </span>
        <light-entity-thumbnail
          width="150px"
          height="103px"
          :extension="entity.preview_file_extension"
          :preview-file-id="previewFileId"
          :url-prefix="thumbnailUrlPrefix"
        />
      </div>

      <div
        class="entity-title"
        :title="taskStatus ? taskStatus.name : ''"
        :style="{
          'border-bottom': taskStatus
            ? '2px solid ' + taskStatus.color
            : 'none',
          'padding-bottom': '5px'
        }"
        @click.prevent="onPlayClick"
      >
        {{ entity.parent_name }} / {{ entity.name }}
      </div>

      <template v-if="!readOnly">
        <div class="preview-choice" v-if="taskTypeOptions.length > 0">
          <combobox
            :thin="true"
            :width="150"
            :options="taskTypeOptions"
            v-model="taskTypeId"
          />
          <combobox
            class="version-combo"
            :thin="true"
            :width="150"
            :options="previewFileOptions"
            v-model="previewFileId"
          />
        </div>
        <div v-else>
          {{ $t('playlists.no_preview') }}
        </div>
      </template>
      <div class="preview-meta" v-else-if="readOnlyTaskType">
        <task-type-name
          :task-type="readOnlyTaskType"
          :is-link="false"
          :thin="true"
        />
        <span class="revision" v-if="entity.preview_file_revision">
          v{{ entity.preview_file_revision }}
        </span>
      </div>
    </div>

    <div
      :id="'drop-area-' + entity.id"
      class="drop-area"
      @dragover="onDragover"
      @dragleave="onDragleave"
      @drop="onDropped"
      ref="drop-area"
      v-if="!readOnly"
    ></div>
  </div>
</template>

<script setup>
/*
 * Widget to describe an entity listed in a playlist. It allows to select a
 * given prevision for a given task type for current entity.
 * It fires events about drag'n'drop reordering too.
 */
import { XIcon } from 'lucide-vue-next'
import { firstBy } from 'thenby'
import { computed, onMounted, ref, useTemplateRef, watch } from 'vue'
import { useStore } from 'vuex'

import Combobox from '@/components/widgets/Combobox.vue'
import LightEntityThumbnail from '@/components/widgets/LightEntityThumbnail.vue'
import TaskTypeName from '@/components/widgets/TaskTypeName.vue'

const store = useStore()

const props = defineProps({
  entity: {
    type: Object,
    default: () => ({})
  },
  index: {
    type: Number,
    default: 0
  },
  isPlaying: {
    type: Boolean,
    default: false
  },
  readOnly: {
    type: Boolean,
    default: false
  },
  thumbnailUrlPrefix: {
    type: String,
    default: ''
  }
})

const emit = defineEmits([
  'entity-dropped',
  'play-click',
  'preview-changed',
  'remove-entity'
])

const taskTypeId = ref(null)
const previewFileId = ref(props.entity.preview_file_id)
const dropAreaRef = useTemplateRef('drop-area')

const isCurrentUserManager = computed(() => store.getters.isCurrentUserManager)
const isCurrentUserSupervisor = computed(
  () => store.getters.isCurrentUserSupervisor
)
const playlistEntryMap = computed(() => store.getters.playlistEntryMap)
const taskMap = computed(() => store.getters.taskMap)
const taskStatusMap = computed(() => store.getters.taskStatusMap)
const taskTypeMap = computed(() => store.getters.taskTypeMap)

const previewFiles = computed(() => {
  if (props.readOnly) return {}
  const files = { ...props.entity.preview_files }
  Object.keys(files).forEach(taskTypeId => {
    files[taskTypeId] = files[taskTypeId].filter(previewFile => {
      return (
        !playlistEntryMap.value?.has(`${props.entity.id}-${previewFile.id}`) ||
        previewFile.id === props.entity.preview_file_id
      )
    })
  })
  return files
})

const taskTypeOptions = computed(() => {
  if (props.readOnly) return []
  return previewFiles.value
    ? Object.keys(previewFiles.value)
        .filter(id => previewFiles.value[id].length > 0)
        .map(id => taskTypeMap.value?.get(id))
        .filter(Boolean)
        .sort(firstBy('priority', 1).thenBy('name'))
        .map(taskType => ({
          label: taskType.name,
          value: taskType.id
        }))
    : []
})

const previewFileOptions = computed(() => {
  if (props.readOnly) return []
  const files = previewFiles.value[taskTypeId.value] || []
  return files.map(previewFile => ({
    label: `v${previewFile.revision}`,
    value: previewFile.id
  }))
})

const taskStatus = computed(() => {
  if (props.readOnly) return null
  const taskId = props.entity.preview_file_task_id
  if (taskId) {
    const task = taskMap.value?.get(taskId)
    if (!task) return null
    return taskStatusMap.value?.get(task.task_status_id) || null
  }
  return null
})

const readOnlyTaskType = computed(() => {
  if (!props.readOnly) return null
  if (props.entity.preview_file_task_type) {
    return props.entity.preview_file_task_type
  }
  const taskId = props.entity.preview_file_task_id
  const task = taskMap.value?.get(taskId)
  return (task && taskTypeMap.value?.get(task.task_type_id)) || null
})

const getTaskTypeIdForPreviewFile = (taskTypeIds, previewFileId) => {
  return taskTypeIds.find(taskTypeId => {
    const files = props.entity.preview_files[taskTypeId]
    return files.some(previewFile => previewFile.id === previewFileId)
  })
}

const setCurrentParameters = () => {
  // Find task type matching current preview.
  const taskTypeIds = Object.keys(props.entity.preview_files)
  if (taskTypeIds.length > 0) {
    if (props.entity.preview_file_id) {
      taskTypeId.value = getTaskTypeIdForPreviewFile(
        taskTypeIds,
        props.entity.preview_file_id
      )
    }
    if (!taskTypeId.value) {
      taskTypeId.value = taskTypeIds[0]
    }
  }
}

const onPlayClick = () => {
  emit('play-click', props.index)
}

const onRemoveClick = event => {
  event.preventDefault()
  event.stopPropagation()
  emit('remove-entity', {
    entity: props.entity,
    previewFileId: previewFileId.value
  })
}

const onDragleave = () => {
  dropAreaRef.value.style.width = '15px'
}

const onDragover = event => {
  event.preventDefault()
  dropAreaRef.value.style.width = '60px'
}

const onDropped = event => {
  dropAreaRef.value.style.width = '15px'
  emit('entity-dropped', {
    before: {
      entity_id: props.entity.id,
      preview_file_id: previewFileId.value
    },
    after: {
      entity_id: event.dataTransfer.getData('entityId'),
      preview_file_id: event.dataTransfer.getData('previewFileId')
    }
  })
}

watch(taskTypeId, () => {
  // Set current preview was last preview selected. If there is no preview
  // matching this task type, it selects the first preview available for
  // this task type.
  const files = props.entity.preview_files[taskTypeId.value]
  if (files && files.length > 0) {
    const isPreviewFile = files.some(previewFile => {
      return previewFile.id === props.entity.preview_file_id
    })
    if (isPreviewFile) {
      previewFileId.value = props.entity.preview_file_id
    } else {
      previewFileId.value = files[0].id
    }
  }
})

watch(previewFileId, (newValue, oldValue) => {
  let previewFile = null
  const files = props.entity.preview_files[taskTypeId.value]
  if (files && files.length > 0) {
    previewFile = files.find(file => file.id === newValue)
  }
  emit('preview-changed', {
    entity: props.entity,
    previewFile,
    previousPreviewFileId: oldValue
  })
})

watch(
  () => props.entity.preview_file_id,
  () => {
    if (previewFileId.value !== props.entity.preview_file_id) {
      previewFileId.value = props.entity.preview_file_id
    }
  }
)

onMounted(() => {
  setCurrentParameters()
})
</script>

<style lang="scss" scoped>
.wrapper {
  align-items: stretch;
  position: relative;
}

.drop-area {
  width: 15px;
  height: 220px;
  transition: width 0.3s ease;
}

.playlisted-entity {
  border-top: 3px solid transparent;
  border-radius: 5px;
  border: 3px solid transparent;
  box-shadow: 2px 2px 2px $dark-grey-strong;
  background: $dark-grey-lighter;
  display: flex;
  flex-direction: column;
  min-width: 150px;
  padding: 4px 4px;

  &:hover {
    border: 3px solid var(--background-selectable);
  }

  &.playing {
    border: 3px solid $green;
  }
}

.entity-title {
  color: $white;
  cursor: pointer;
  font-size: 0.9em;
  margin-bottom: 0.6em;
  max-width: 150px;
  word-wrap: anywhere;
}

.thumbnail-wrapper {
  position: relative;
  cursor: pointer;

  :deep(.thumbnail-picture) {
    background-color: #000;
  }

  img {
    border-radius: 5px;
  }
}

.field {
  margin-bottom: 0;
}

.version-combo {
  margin-top: 0.1em;
}

.preview-meta {
  align-items: center;
  color: $white-grey;
  display: flex;
  font-size: 0.85em;
  gap: 0.4em;
  justify-content: space-between;
  max-width: 150px;

  .revision {
    flex-shrink: 0;
    font-variant-numeric: tabular-nums;
  }
}

.remove-button {
  position: absolute;
  width: 20px;
  height: 20px;
  right: 0;
  margin: 0.4em;
  border-radius: 2em;
  text-align: center;
  background: rgba(0, 0, 0, 0.3);
  cursor: pointer;
  z-index: 10;

  &:hover {
    background: rgba(0, 0, 0, 0.2);
  }

  svg {
    width: 10px;
    height: 10px;
  }
}
</style>
