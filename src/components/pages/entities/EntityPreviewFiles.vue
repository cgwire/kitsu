<template>
  <div class="mt1 flexcolumn wrapper preview-files">
    <div class="has-text-centered" v-if="isLoading">
      <spinner />
    </div>
    <div v-else-if="previewFiles.length > 0">
      <table class="datatable">
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
            <th class="end-cell"></th>
          </tr>
        </thead>
        <tbody class="datatable-body">
          <tr
            :key="previewFile.id"
            class="datatable-row"
            v-for="previewFile in previewFiles"
          >
            <td class="thumbnail">
              <entity-thumbnail
                class="preview-thumbnail"
                :preview-file-id="previewFile.id"
                :empty-width="60"
                :width="60"
              />
            </td>

            <task-type-cell
              class="type"
              :task-type="getTaskType(previewFile)"
              :production-id="currentProduction.id"
            />
            <td class="original-name">
              {{ previewFile.original_name }}
            </td>
            <td class="revision">
              {{ previewFile.revision }}
            </td>
            <td class="extension">
              {{ previewFile.extension }}
            </td>
            <td class="size">
              {{ renderFileSize(previewFile.file_size) }}
            </td>
            <td class="status">
              {{ previewFile.validation_status }}
            </td>
            <people-name-cell
              class="person"
              :person="personMap.get(previewFile.person_id)"
            />

            <td class="download">
              <a
                class="button flexrow-item"
                :href="getDownloadPath(previewFile.id)"
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
      {{ $t('entities.preview_files.no_preview_files') }}
    </div>
  </div>
</template>

<script>
import { DownloadIcon } from 'lucide-vue-next'
import { mapGetters, mapActions } from 'vuex'

import { renderFileSize } from '@/lib/render'

import EntityThumbnail from '@/components/widgets/EntityThumbnail.vue'
import PeopleNameCell from '@/components/cells/PeopleNameCell.vue'
import Spinner from '@/components/widgets/Spinner.vue'
import TaskTypeCell from '@/components/cells/TaskTypeCell.vue'

export default {
  name: 'entity-preview-files',

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
      previewFiles: []
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

    getTaskType(previewFile) {
      const task = this.taskMap.get(previewFile.task_id)
      return this.taskTypeMap.get(task.task_type_id)
    },

    getDownloadPath(previewFileId) {
      const previewFile = this.previewFiles.find(
        file => file.id === previewFileId
      )
      if (!previewFile) return ''

      const type = previewFile.extension === 'mp4' ? 'movies' : 'pictures'
      return (
        `/api/${type}/originals/preview-files/` + `${previewFileId}/download`
      )
    },

    renderFileSize,

    reset() {
      this.isLoading = true
      this.getEntityPreviewFiles(this.entity.id)
        .then(previewFiles => {
          this.previewFiles = previewFiles
          this.isLoading = false
        })
        .catch(err => {
          console.error(err)
          this.previewFiles = []
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

.preview-files {
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
</style>
