<template>
  <div class="columns">
    <div class="column">

      <template v-if="remainingTaskTypes.length > 0">
        <div class="flexrow mt1 mb1 add-task-type">
          <combobox-task-type
            class="flexrow-item selector"
            :task-type-list="remainingTaskTypes"
            v-model="taskTypeId"
          />
          <button
            class="button flexrow-item"
            :disabled="loading.scheduleTimeDelete"
            @click="addTaskType"
          >
            {{ $t('main.add') }}
          </button>
        </div>
      </template>

      <p v-if="errors.delete || errors.scheduleTimeUpdate" class="error mt1 mb1">
        {{ $t('productions.edit_error') }}
      </p>

      <div
        class="box"
        v-if="isEmpty(currentProduction.task_types)"
      >
        {{ $t('settings.production.empty_list') }}
      </div>

      <template
        v-for="(taskListObject, index) in [assetTaskTypes, shotTaskTypes]"
        v-else
      >
        <table
          class="datatable list"
          v-if="taskListObject.list.length > 0"
          :key="index"
        >
          <thead>
            <tr>
              <th>
                {{ taskListObject.title }}
              </th>
              <th class="start-date">
                {{ $t('productions.fields.start_date') }}
              </th>
              <th class="end-date">
                {{ $t('productions.fields.end_date') }}
              </th>
              <th class="remove"></th>
            </tr>
          </thead>
          <tbody class="datatable-body">
            <production-task-type
              :key="taskTypeData.taskType.id"
              :task-type="taskTypeData.taskType"
              :schedule-item="taskTypeData.scheduleItem"
              @date-changed="onDateChanged"
              @remove="removeTaskType"
              v-for="taskTypeData in taskListObject.list"
            />
          </tbody>
        </table>
      </template>
    </div>

    <!--div class="column is-2 episode-span-column hidden">
      <text-field
        ref="episodesSpanField"
        type="number"
        :label="$t('productions.fields.episode_span')"
        :disabled="loading.episode_span"
        @enter="editEpisodeSpan"
        v-focus
        v-model="episode_span"
        v-if="currentProduction && currentProduction.id && isTVShow"
      />
      <p v-if="errors.episode_span" class="error mt1">
        {{ $t('productions.edit_error') }}
      </p>
    </div-->
  </div>
</template>
<script>
import moment from 'moment'
import { mapGetters, mapActions } from 'vuex'
import { sortByName } from '@/lib/sorting'
import { formatFullDate } from '@/lib/time'

import ComboboxTaskType from '@/components/widgets/ComboboxTaskType'
import ProductionTaskType from '@/components/pages/production/ProductionTaskType'
// import TextField from '@/components/widgets/TextField'

export default {
  name: 'production-task-types',

  components: {
    ComboboxTaskType,
    ProductionTaskType
    // TextField
  },

  data () {
    return {
      taskTypeId: '',
      loading: {
        episode_span: false,
        scheduleTimeUpdate: false,
        scheduleTimeDelete: false
      },
      episode_span: 0,
      errors: {
        episode_span: false,
        scheduleTimeUpdate: false,
        delete: false
      }
    }
  },

  mounted () {
    if (this.remainingTaskTypes.length > 0) {
      this.taskTypeId = this.remainingTaskTypes[0].id
    }

    if (this.currentProduction) {
      this.episode_span = this.currentProduction.episode_span
      this.loadAllScheduleItems(this.currentProduction)
    }
  },

  computed: {
    ...mapGetters([
      'currentProduction',
      'currentScheduleItems',
      'productionTaskTypes',
      'taskStatusMap',
      'taskTypes',
      'isTVShow'
    ]),

    remainingTaskTypes () {
      return sortByName(
        this.taskTypes
          .filter(t => !this.currentProduction.task_types.includes(t.id))
      )
    },

    /*
      Return an object with the following structure:
      {
        title: 'title of the first column of the tab (Assets or short)',
        list:  [{taskTypes, scheduleItem}]
        // A list of objects that represents a couple of taskType and their
        linked scheduleItem.
      }
    */
    assetTaskTypes () {
      const list = this.productionTaskTypes
        .filter(t => !t.for_shots)
        .map(taskType => {
          return {
            taskType,
            scheduleItem: this.getScheduleItemForTaskType(taskType)
          }
        })
      return {
        title: this.$t('assets.title'),
        list
      }
    },

    /*
      Return an object with the following structure:
      {
        title: 'title of the first column of the tab (Assets or short)',
        list:  [{taskTypes, scheduleItem}]
        // A list of objects that represents a couple of taskType and their
        linked scheduleItem }
    */
    shotTaskTypes () {
      const list = this.productionTaskTypes
        .filter(t => t.for_shots)
        .map(taskType => {
          return {
            taskType,
            scheduleItem: this.getScheduleItemForTaskType(taskType)
          }
        })
      return {
        title: this.$t('shots.title'),
        list
      }
    }
  },

  methods: {
    ...mapActions([
      'addTaskTypeToProduction',
      'createScheduleItem',
      'deleteScheduleItem',
      'editProduction',
      'loadAllScheduleItems',
      'removeTaskTypeFromProduction',
      'saveScheduleItem'
    ]),

    isEmpty (list) {
      return !list || list.length === 0
    },

    getScheduleItemForTaskType (taskType) {
      const item = this.currentScheduleItems.find(
        scheduleItem => scheduleItem.task_type_id === taskType.id
      ) || {
        start_date: formatFullDate(moment()),
        end_date: formatFullDate(moment())
      }
      return item
    },

    async addTaskType () {
      await this.addTaskTypeToProduction(this.taskTypeId)
      await this.createScheduleItem(
        {
          startDate: moment(),
          endDate: moment(),
          project_id: this.currentProduction.id,
          task_type_id: this.taskTypeId
        }
      )
      if (this.remainingTaskTypes.length > 0) {
        this.taskTypeId = this.remainingTaskTypes[0].id
      } else {
        this.taskTypeId = ''
      }
    },

    async removeTaskType ({ taskType, scheduleItem }) {
      this.errors.delete = false
      try {
        await this.removeTaskTypeFromProduction(taskType.id)
        if (scheduleItem !== null) {
          this.loading.scheduleTimeDelete = true
          await this.deleteScheduleItem(scheduleItem)
          this.loading.scheduleTimeDelete = false
        }
      } catch {
        this.errors.delete = true
        this.loading.scheduleTimeDelete = false
        return
      }
      await this.$nextTick()
      if (this.remainingTaskTypes.length > 0) {
        this.taskTypeId = this.remainingTaskTypes[0].id
      }
    },

    async editEpisodeSpan () {
      this.loading.episode_span = true
      this.errors.episode_span = false
      try {
        await this.editProduction({
          id: this.currentProduction.id,
          episode_span: this.episode_span
        })
      } catch (err) {
        this.errors.episode_span = true
        console.error(err)
      }
      this.loading.episode_span = false
    },

    async onDateChanged (scheduleItem) {
      this.errors.scheduleTimeUpdate = false
      try {
        await this.saveScheduleItem(scheduleItem)
      } catch (err) {
        console.error(err)
        this.errors.scheduleTimeUpdate = true
      }
    }
  },

  watch: {
    currentProduction: {
      handler () {
        this.episode_span = this.currentProduction.episode_span
        this.loadAllScheduleItems(this.currentProduction)
      },
      deep: true
    }
  }
}
</script>

<style lang="scss" scoped>
.column {
  overflow-y: initial;
}

.datatable th {
  color: var(--text);
}

table {
  margin-bottom: 1.5em;
}

th {
  padding-left: 10px;
  padding-bottom: 5px;
}

td p {
  color: var(--text);
}

.column {
  max-width: 800px;
}

td.name {
  flex: 1;
}

.start-date {
  width: 135px;
}

.end-date {
  width: 135px;
}

.remove {
  width: 100px;
}

td /deep/ p.control.flexrow {
  width: 105px;
}

.episode-span-column {
  margin-left: 5rem;
}

.field {
  margin-bottom: 0;
}
</style>
