<template>
  <div class="mt1 flexcolumn wrapper time-logs">
    <div class="has-text-centered" v-if="isLoading">
      <spinner />
    </div>
    <table class="datatable">
      <thead class="datatable-head">
        <tr class="datatable-row-header">
          <th class="date">Date</th>
          <th class="person">Employee</th>
          <th class="type">
            {{ $t('entities.preview_files.task_type') }}
          </th>
          <th class="duration">Time spent</th>
          <th class="end-cell"></th>
        </tr>
      </thead>
    </table>
    <table class="datatable" style="overflow: auto;">
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
</style>
