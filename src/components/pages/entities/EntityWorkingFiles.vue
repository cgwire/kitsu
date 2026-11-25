<template>
  <div class="mt1 flexcolumn wrapper working-files">
    <div class="has-text-centered" v-if="isLoading">
      <spinner />
    </div>
    <div v-else-if="workingFiles.length > 0">
      <table class="datatable datatable--cards">
        <thead class="datatable-head">
          <tr class="datatable-row-header">
            <th class="tasktype">
              {{ $t('entities.output_files.task_type') }}
            </th>
            <th class="name">
              {{ $t('entities.output_files.name') }}
            </th>
            <th class="revision">
              {{ $t('entities.output_files.revision') }}
            </th>
            <th class="size">
              {{ $t('entities.output_files.size') }}
            </th>
            <th class="person">
              {{ $t('entities.output_files.person') }}
            </th>
            <th class="end-cell"></th>
          </tr>
        </thead>
        <tbody class="datatable-body">
          <template v-for="workingFile in sortedFiles" :key="workingFile.id">
            <tr class="datatable-row">
              <task-type-cell
                class="type card-head"
                :task-type="getTaskType(workingFile)"
                :production-id="currentProduction.id"
              />
              <td class="name" :data-label="$t('entities.output_files.name')">
                {{ workingFile.name }}
              </td>
              <td
                class="revision"
                :data-label="$t('entities.output_files.revision')"
              >
                {{ workingFile.revision }}
              </td>
              <td class="size" :data-label="$t('entities.output_files.size')">
                {{ renderFileSize(workingFile.size) }}
              </td>
              <people-name-cell
                class="person"
                :data-label="$t('entities.output_files.person')"
                :person="personMap.get(workingFile.person_id)"
                v-if="personMap.has(workingFile.person_id)"
              />
              <td class="person" v-else></td>
              <td class="end-cell"></td>
            </tr>
            <tr class="datatable-row" v-if="workingFile.path">
              <td class="path card-head" colspan="6">
                {{ renderPath(workingFile.path) }}
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
    <empty-section
      :icon="FolderIcon"
      :text="$t('entities.working_files.no_working_files')"
      v-else
    />
  </div>
</template>

<script setup>
import { FolderIcon } from 'lucide-vue-next'
import { firstBy } from 'thenby'
import { computed, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'

import { renderFilePath, renderFileSize } from '@/lib/render'

import PeopleNameCell from '@/components/cells/PeopleNameCell.vue'
import TaskTypeCell from '@/components/cells/TaskTypeCell.vue'
import EmptySection from '@/components/widgets/EmptySection.vue'
import Spinner from '@/components/widgets/Spinner.vue'

const store = useStore()

// Props
// --------------------------------------------------------------------------
const props = defineProps({
  entity: { type: Object, default: null }
})

// State
// --------------------------------------------------------------------------
const isLoading = ref(false)
const workingFiles = ref([])

// Computed
// --------------------------------------------------------------------------
const currentProduction = computed(() => store.getters.currentProduction)
const personMap = computed(() => store.getters.personMap)
const taskMap = computed(() => store.getters.taskMap)
const taskTypeMap = computed(() => store.getters.taskTypeMap)

// in the order of the pipeline, the last revision of a task first
const sortedFiles = computed(() => {
  const priority = file =>
    store.getters.getTaskTypePriority(getTaskType(file)?.id)
  return [...workingFiles.value].sort(
    firstBy((a, b) => priority(a) - priority(b))
      .thenBy(file => getTaskType(file)?.name)
      .thenBy('revision', -1)
      .thenBy('name', { ignoreCase: true })
      .thenBy('size')
  )
})

// Functions
// --------------------------------------------------------------------------
// a working file knows its task, not the type of it
const getTaskType = workingFile =>
  taskTypeMap.value.get(taskMap.value.get(workingFile.task_id)?.task_type_id)

const renderPath = path =>
  renderFilePath(path, currentProduction.value.file_tree?.working?.mountpoint)

const reset = async () => {
  isLoading.value = true
  workingFiles.value = await store.dispatch(
    'loadEntityWorkingFiles',
    props.entity.id
  )
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

// Lifecycle
// --------------------------------------------------------------------------
onMounted(() => {
  if (props.entity) reset()
})
</script>

<style lang="scss" scoped>
// each column as wide as what it holds, the last one takes what is left
table.datatable {
  table-layout: fixed;
  width: 100%;
}

.tasktype,
.name {
  width: 150px;
}

.revision {
  width: 90px;
}

.size {
  width: 70px;
}

.person {
  width: 200px;
}

.working-files {
  overflow: auto;
}

// a path has no space to wrap at
.path {
  white-space: normal;
  word-break: break-all;
}

.dark .wrapper.working-files {
  background: transparent;
}

.datatable-row-header::after {
  display: none;
}
</style>
