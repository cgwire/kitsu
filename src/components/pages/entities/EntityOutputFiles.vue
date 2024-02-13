<template>
  <div class="mt1 flexcolumn wrapper output-files">
    <div class="has-text-centered" v-if="isLoading">
      <spinner />
    </div>
    <div v-else-if="outputFiles.length > 0">
      <table class="datatable">
        <thead class="datatable-head">
          <tr class="datatable-row-header">
            <th class="thumbnail"></th>
            <th class="type">
              {{ $t('entities.output_files.task_type') }}
            </th>
            <th class="original-name">
              {{ $t('entities.output_files.original_file_name') }}
            </th>
            <th class="revision">
              {{ $t('entities.output_files.revision') }}
            </th>
            <th class="extension">
              {{ $t('entities.output_files.extension') }}
            </th>
            <th class="size">
              {{ $t('entities.output_files.size') }}
            </th>
            <th class="status">
              {{ $t('entities.output_files.status') }}
            </th>
            <th class="person">
              {{ $t('entities.output_files.uploader') }}
            </th>
            <th class="end-cell"></th>
          </tr>
        </thead>
        <tbody class="datatable-body">
          <tr
            :key="outputFile.id"
            class="datatable-row"
            v-for="outputFile in outputFiles"
          >
            <td class="thumbnail">
              <entity-thumbnail
                class="output-thumbnail"
                :output-file-id="outputFile.id"
                :empty-width="60"
                :width="60"
              />
            </td>

            <task-type-cell
              class="type"
              :task-type="getTaskType(outputFile)"
              :production-id="currentProduction.id"
            />
            <td class="original-name">
              {{ outputFile.original_name }}
            </td>
            <td class="revision">
              {{ outputFile.revision }}
            </td>
            <td class="extension">
              {{ outputFile.extension }}
            </td>
            <td class="size">
              {{ renderFileSize(outputFile.file_size) }}
            </td>
            <td class="status">
              {{ outputFile.validation_status }}
            </td>
            <people-name-cell
              class="person"
              :person="personMap.get(outputFile.person_id)"
            />

            <td class="download">
              <a
                class="button flexrow-item"
                :href="getDownloadPath(outputFile.id)"
                :title="$t('playlists.actions.download_file')"
                v-if="!isCurrentUserArtist"
              >
                <download-icon class="icon is-small" />
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else>
      {{ $t('entities.output_files.no_output_files') }}
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import { DownloadIcon } from 'vue-feather-icons'
import { renderFileSize } from '@/lib/render'
import EntityThumbnail from '@/components/widgets/EntityThumbnail'
import PeopleNameCell from '@/components/cells/PeopleNameCell'
import Spinner from '@/components/widgets/Spinner'
import TaskTypeCell from '@/components/cells/TaskTypeCell'

export default {
  name: 'entity-output-files',
  components: {
    DownloadIcon,
    EntityThumbnail,
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
      'taskMap',
      'taskTypeMap'
    ])
  },

  methods: {
    ...mapActions(['getEntityPreviewFiles']),

    getTaskType(outputFile) {
      const task = this.taskMap.get(outputFile.task_id)
      return this.taskTypeMap.get(task.task_type_id)
    },

    getDownloadPath(outputFileId) {
      const type = this.isMovie ? 'movies' : 'pictures'
      return `/api/${type}/originals/output-files/` + `${outputFileId}/download`
    },

    renderFileSize,

    reset() {
      this.isLoading = true
      this.getEntityPreviewFiles(this.entity.id)
        .then(outputFiles => {
          this.outputFiles = outputFiles
          this.isLoading = false
        })
        .catch(err => {
          console.error(err)
          this.outputFiles = []
          this.isLoading = false
        })
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

.original-name {
  width: 250px;
}
.person {
  width: 250px;
}

.output-files {
  overflow-y: auto;
}
.dark .output-files.wrapper {
  background: transparent;
}

.output-thumbnail {
  cursor: pointer;
  border-radius: 4px;
}

.datatable-row-header::after {
  display: none;
}
</style>
