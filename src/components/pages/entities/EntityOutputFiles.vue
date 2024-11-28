<template>
  <div class="mt1 flexcolumn wrapper output-files">
    <div class="has-text-centered" v-if="isLoading">
      <spinner />
    </div>
    <div v-else-if="outputFiles.length > 0">
      <table class="datatable">
        <thead class="datatable-head">
          <tr class="datatable-row-header">
            <th class="tasktype">
              {{ $t('entities.output_files.task_type') }}
            </th>
            <th class="type">
              {{ $t('entities.output_files.type') }}
            </th>
            <th class="name">
              {{ $t('entities.output_files.name') }}
            </th>
            <th class="extension">
              {{ $t('entities.output_files.extension') }}
            </th>
            <th class="revision">
              {{ $t('entities.output_files.revision') }}
            </th>
            <th class="size">
              {{ $t('entities.output_files.size') }}
            </th>
            <th class="status">
              {{ $t('entities.output_files.status') }}
            </th>
            <th class="person">
              {{ $t('entities.output_files.person') }}
            </th>
            <th class="end-cell"></th>
          </tr>
        </thead>
        <tbody class="datatable-body">
          <template v-for="outputFile in outputFiles" :key="outputFile.id">
            <tr class="datatable-row">
              <task-type-cell
                class="type"
                :task-type="getTaskType(outputFile)"
                :production-id="currentProduction.id"
              />
              <td class="type">
                {{ getOutputType(outputFile).name }}
              </td>
              <td class="name">
                {{ outputFile.name }}
              </td>
              <td class="extension">
                {{ outputFile.extension }}
              </td>
              <td class="revision">
                {{ outputFile.revision }}
              </td>
              <td class="size">
                {{ renderFileSize(outputFile.file_size) }}
              </td>
              <td class="status">
                {{ getFileStatus(outputFile).name }}
              </td>
              <people-name-cell
                class="person"
                :person="personMap.get(outputFile.person_id)"
              />
              <td class="end-cell"></td>
            </tr>
            <tr class="datatable-row" v-if="outputFile.path">
              <td colspan="10">
                {{ outputFile.path }}
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
    <div class="empty" v-else>
      {{ $t('entities.output_files.no_output_files') }}
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { renderFileSize } from '@/lib/render'

import PeopleNameCell from '@/components/cells/PeopleNameCell.vue'
import Spinner from '@/components/widgets/Spinner.vue'
import TaskTypeCell from '@/components/cells/TaskTypeCell.vue'

export default {
  name: 'entity-output-files',

  components: {
    PeopleNameCell,
    Spinner,
    TaskTypeCell
  },

  data() {
    return {
      isLoading: false,
      outputFiles: []
    }
  },

  props: {
    entity: {
      type: Object,
      default: () => {}
    }
  },

  mounted() {
    if (!this.entity) return
    this.reset()
  },

  computed: {
    ...mapGetters([
      'currentProduction',
      'isCurrentUserArtist',
      'personMap',
      'fileStatusMap',
      'outputFileTypeMap',
      'taskMap',
      'taskTypeMap'
    ])
  },

  methods: {
    ...mapActions([
      'loadEntityOutputFiles',
      'loadFileStatuses',
      'loadOutputTypes'
    ]),

    getTaskType(outputFile) {
      return this.taskTypeMap.get(outputFile.task_type_id)
    },

    getFileStatus(outputFile) {
      return this.fileStatusMap.get(outputFile.file_status_id)
    },

    getOutputType(outputFile) {
      return this.outputFileTypeMap.get(outputFile.output_type_id)
    },

    renderFileSize,

    async reset() {
      this.isLoading = true
      if (this.fileStatusMap.size === 0) await this.loadFileStatuses()
      if (this.outputFileTypeMap.size === 0) await this.loadOutputTypes()
      this.outputFiles = await this.loadEntityOutputFiles(this.entity.id)
      this.isLoading = false
    }
  },

  watch: {
    entity() {
      if (this.entity) this.reset()
    }
  }
}
</script>

<style lang="scss" scoped>
.datatable-body {
  overflow-y: auto;
}
table.datatable {
  table-layout: fixed;
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
  width: 120px;
}
.name {
  width: 250px;
}
.person {
  width: 250px;
}

.output-files {
  overflow-y: auto;
}

.output-thumbnail {
  cursor: pointer;
  border-radius: 4px;
}

.datatable-row-header::after {
  display: none;
}

.empty {
  font-style: italic;
}
</style>
