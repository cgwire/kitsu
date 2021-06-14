<template>
  <div class="mt1">
    <spinner v-if="previewFilesLoading" :size="20" />
    <template v-else>
      <template v-if="previewFiles.length === 0">
        {{ $t('logs.preview_files.empty_list') }}
      </template>
      <template v-else>
        <ul>
          <li
            class="flexrow"
            v-for="previewFile in previewFiles"
            :key="previewFile.id"
          >
            <people-avatar
              class="flexrow-item"
              :size="30"
              :person="personMap.get(previewFile.person_id)"
              v-if="previewFile.person_id"
            />
            <a @click="redirectToTask(previewFile)">
              <span class="date tag mr1">
                {{ formatDate(previewFile.updated_at) }}
              </span>
              <span
                class="status tag"
                :data-status="previewFile.status"
              >
              {{ previewFile.original_name }}.{{ previewFile.extension }}
              ({{ previewFile.status }})
              </span>
            </a>
          </li>
        </ul>
      </template>
    </template>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

import { getTaskPath } from '@/lib/path'

import playlistsApi from '@/store/api/playlists'
import tasksApi from '@/store/api/tasks'

import { timeMixin } from '@/components/mixins/time'
import PeopleAvatar from '@/components/widgets/PeopleAvatar'
import Spinner from '@/components/widgets/Spinner'

export default {
  name: 'PreviewFiles',
  mixins: [timeMixin],

  components: {
    PeopleAvatar,
    Spinner
  },

  data () {
    return {
      previewFilesLoading: true,
      previewFiles: []
    }
  },

  computed: {
    ...mapGetters([
      'personMap',
      'taskTypeMap',
      'user'
    ]),
    displayedPreviewFiles () {
      return this.previewFiles.filter(
        previewFile => previewFile.status !== 'ready'
      )
    }
  },

  methods: {
    ...mapActions([
      'getTask'
    ]),
    async redirectToTask (previewFile) {
      const task = await tasksApi.getTask(previewFile.task_id)
      await this.$router.push(getTaskPath(
        task,
        task.project,
        task.project.production_type === 'tvshow',
        task.episode,
        this.taskTypeMap
      ))
    }
  },

  async mounted () {
    this.previewFiles = await playlistsApi.getPreviewFiles()
    this.previewFilesLoading = false
  }
}
</script>

<style lang="scss" scoped>
.dark {
  .tag {
    color: $white;
    background: $dark-grey;
  }
}
.tag {
  border-radius: 4px;
}

.date {
  font-weight: 500;
}

.status {
  text-transform: uppercase;
  min-width: 50px;
}

.status[data-status="broken"] {
  color: white;
  background: $dark-red;
}

.status[data-status="processing"] {
  color: white;
  background: $blue;
}

</style>
