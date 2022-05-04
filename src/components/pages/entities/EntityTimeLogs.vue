<template>
  <div class="mt1 wrapper time-logs">
    <div class="has-text-centered" v-if="isLoading">
      <spinner />
    </div>
    <div v-else-if="logs.length > 0">
      <table class="datatable">
        <thead class="datatable-head">
          <tr class="datatable-row-header">
            <th class="date">
              {{ $t('main.date') }}
            </th>
            <th class="person">
              {{ $t('main.person') }}
            </th>
            <th class="type">
              {{ $t('entities.preview_files.task_type') }}
            </th>
            <th class="duration">
              {{ $t('tasks.fields.duration') }}
            </th>
            <th class="end-cell"></th>
          </tr>
        </thead>
      </table>
      <table class="datatable">
        <tbody class="datatable-body">
          <tr
            :key="log.id"
            class="datatable-row"
            v-for="log in logs"
          >
            <td class="date">
              {{ formatSimpleDate(log.date) }}
            </td>
            <people-name-cell
              class="person"
              :person="personMap.get(log.person_id)"
            />
            <task-type-name
              class="type"
              :task-type="getTaskType(log)"
              :production-id="currentProduction.id"
            />
            <td class="duration">
              {{ formatDuration(log.duration) }}
            </td>
            <td class="end-cell"></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else>
      {{ $t('entities.logs.no_logs') }}
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import { formatListMixin } from '@/components/mixins/format'
import PeopleNameCell from '@/components/cells/PeopleNameCell'
import Spinner from '@/components/widgets/Spinner'
import TaskTypeName from '@/components/cells/TaskTypeName'

export default {
  name: 'entity-time-logs',
  mixins: [formatListMixin],
  components: {
    PeopleNameCell,
    Spinner,
    TaskTypeName
  },

  props: {
    entity: {
      type: Object,
      default: () => {}
    }
  },

  data () {
    return {
      logs: [],
      isLoading: false
    }
  },

  mounted () {
    if (!this.entity) return
    this.reset()
  },

  computed: {
    ...mapGetters([
      'currentProduction',
      'personMap',
      'taskMap',
      'taskTypeMap'
    ])
  },

  methods: {
    ...mapActions([
      'getEntityTimeLogs'
    ]),

    getTaskType (log) {
      const task = this.taskMap.get(log.task_id)
      return this.taskTypeMap.get(task.task_type_id)
    },

    reset () {
      this.isLoading = true
      this.getEntityTimeLogs(this.entity.id)
        .then(logs => {
          this.logs = logs
          this.isLoading = false
        })
        .catch(err => {
          console.error(err)
          this.logs = []
          this.isLoading = false
        })
    }
  },

  watch: {
    entity () {
      if (this.entity) this.reset()
    }
  }
}
</script>

<style lang="scss" scoped>
.date { width: 100px; }
.person { width: 200px; }
.type { width: 150px; }
.duration { width: 50px; }

.time-logs {
  overflow-y: auto;
}

.dark .wrapper.time-logs {
  background: transparent;
}

.datatable-row-header::after {
  display: none;
}
</style>
