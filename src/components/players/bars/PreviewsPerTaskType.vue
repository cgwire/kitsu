<template>
  <div class="flexrow">
    <combobox-styled
      class="flexrow-item"
      :options="taskTypeOptions"
      v-model="taskTypeId"
      v-if="taskTypeOptions.length"
    />
    <combobox-styled
      class="flexrow-item"
      :options="previewFileOptions"
      v-if="previewFileOptions.length"
      v-model="previewFileId"
    />
    <span class="flexrow-item" v-else>{{ $t('tasks.no_preview') }}</span>
    <validation-tag
      class="flexrow-item"
      :task="{ task_status_id: taskStatus.id }"
      :is-static="true"
      :thin="false"
      v-if="taskStatus"
    />
  </div>
</template>

<script setup>
/*
 * Widget displaying entity's revisions of previews per task type.
 * It allows to select a given revision for a given task type for current entity.
 */
import { firstBy } from 'thenby'
import { ref, computed, watch, onMounted } from 'vue'
import { useStore } from 'vuex'

import { formatRevision } from '@/lib/preview'
import editStore from '@/store/modules/edits'

import ComboboxStyled from '@/components/widgets/ComboboxStyled.vue'
import ValidationTag from '@/components/widgets/ValidationTag.vue'

// Composables
const store = useStore()

// Props / Emits
const props = defineProps({
  entity: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['preview-changed'])

// Computed
const taskMap = computed(() => store.getters.taskMap)
const taskTypeMap = computed(() => store.getters.taskTypeMap)
const taskStatusMap = computed(() => store.getters.taskStatusMap)
const currentProduction = computed(() => store.getters.currentProduction)

const taskTypeId = ref(null)
const previewFileId = ref(props.entity.preview_file_id)

const taskTypeOptions = computed(() => {
  const entity = editStore.cache.editMap.get(props.entity.id)
  return entity.tasks
    .map(taskId => taskMap.value.get(taskId))
    .map(task => taskTypeMap.value.get(task.task_type_id))
    .sort(firstBy('priority', 1).thenBy('name'))
    .map(taskType => ({
      label: taskType.name,
      value: taskType.id
    }))
})

const previewFileOptions = computed(() => {
  const previewFiles = props.entity.preview_files[taskTypeId.value] || []
  return previewFiles.map(previewFile => ({
    label: formatRevision(previewFile.revision, currentProduction.value),
    value: previewFile.id
  }))
})

const taskStatus = computed(() => {
  if (!editStore.cache.editMap) return ''
  const entity = editStore.cache.editMap.get(props.entity.id)
  if (!entity) return ''
  const taskId = entity.validations.get(taskTypeId.value)
  if (taskId) {
    const task = taskMap.value.get(taskId)
    if (!task) return ''
    return taskStatusMap.value.get(task.task_status_id)
  } else {
    return ''
  }
})

const getTaskTypeIdForPreviewFile = (taskTypeIds, previewFileIdValue) => {
  return taskTypeIds.find(ttId => {
    const previewFiles = props.entity.preview_files[ttId]
    return previewFiles.some(pf => pf.id === previewFileIdValue)
  })
}

const setCurrentParameters = () => {
  const taskTypeIds = Object.keys(props.entity.preview_files)
  if (taskTypeIds.length) {
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

// Watchers
watch(taskTypeId, () => {
  const previewFiles = props.entity.preview_files[taskTypeId.value]
  if (previewFiles?.length) {
    const isPreviewFile = previewFiles.some(
      pf => pf.id === props.entity.preview_file_id
    )
    if (isPreviewFile) {
      previewFileId.value = props.entity.preview_file_id
    } else {
      previewFileId.value = previewFiles[0].id
    }
  } else {
    previewFileId.value = null
  }
})

watch(previewFileId, () => {
  let previewFile = null
  const previewFiles = props.entity.preview_files[taskTypeId.value]
  if (previewFiles?.length) {
    previewFile = previewFiles.find(pf => pf.id === previewFileId.value)
  }
  emit('preview-changed', props.entity, previewFile)
})

watch(
  () => props.entity.preview_file_id,
  () => {
    if (previewFileId.value !== props.entity.preview_file_id) {
      previewFileId.value = props.entity.preview_file_id
    }
  }
)

// Lifecycle
onMounted(() => {
  setCurrentParameters()
})
</script>
