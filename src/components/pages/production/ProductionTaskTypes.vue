<template>
  <div class="columns">
    <div class="column is-7">
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
    <p v-if="errors.delete || errors.scheduleTimeUpdate" class="error mt1">
      {{ $t('productions.edit_error') }}
    </p>
    <div
      class="box"
      v-if="isEmpty(currentProduction.task_types)"
    >
      {{ $t('settings.production.empty_list') }}
    </div>
    <template v-for="(taskListObject, index) in [assetTableDatas, shotTableDatas]" v-else>
      <table class="datatable list" v-if="taskListObject.list.length > 0" :key="index">
        <thead>
          <tr>
            <th>
              {{taskListObject.title}}
            </th>
            <th>
              {{$t('productions.fields.start_date')}}
            </th>
            <th>
              {{$t('productions.fields.end_date')}}
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody class="datatable-body">
          <tr
            class="datatable-row"
            :key="taskTypeScheduleItemCouple.taskTypes.id"
            v-for="taskTypeScheduleItemCouple in taskListObject.list"
          >
            <task-type-cell
              :task-type="taskTypeScheduleItemCouple.taskTypes"
            />
            <td>
             <date-field
              :value="new Date(taskTypeScheduleItemCouple.scheduleItem.startDate)"
              @input="(startDate) => { updateScheduleItem(taskTypeScheduleItemCouple.scheduleItem, {startDate})}"
              v-if="taskTypeScheduleItemCouple.scheduleItem && !loading.scheduleTimeUpdate"
             />
             <spinner v-else />
            </td>
            <td>
             <date-field
               :value="new Date(taskTypeScheduleItemCouple.scheduleItem.endDate)"
               @input="(endDate) => { updateScheduleItem(taskTypeScheduleItemCouple.scheduleItem, {endDate})}"
               v-if="taskTypeScheduleItemCouple.scheduleItem && !loading.scheduleTimeUpdate"
             />
             <spinner v-else />
            </td>
            <td>
              <button
                class="button"
                @click="removeTaskTypeScheduleItemCouple(taskTypeScheduleItemCouple)"
              >
                {{ $t('main.remove') }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </template>
    </div>
    <div class="column is-2 episode-span-column">
      <text-field
        ref="episodesSpanField"
        type="number"
        :label="$t('productions.fields.episode_span')"
        :value="currentProduction.episode_span"
        :disabled="loading.episode_span"
        @enter="editEpisodeSpan"
        v-focus
        v-model="episode_span"
        v-if="currentProduction && currentProduction.id && isTVShow"
      />
      <p v-if="errors.episode_span" class="error mt1">
        {{ $t('productions.edit_error') }}
      </p>
    </div>
  </div>
</template>
<script>
import moment from 'moment'
import { mapGetters, mapActions } from 'vuex'
import { sortByName } from '@/lib/sorting'

import ComboboxTaskType from '@/components/widgets/ComboboxTaskType'
import DateField from '@/components/widgets/DateField'
import Spinner from '@/components/widgets/Spinner'
import TaskTypeCell from '@/components/cells/TaskTypeName'
import TextField from '@/components/widgets/TextField'

export default {
  name: 'production-task-types',
  components: {
    ComboboxTaskType,
    DateField,
    Spinner,
    TaskTypeCell,
    TextField
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
        list:  [{taskTypes, scheduleItem}] // A list of objects that represente a couple of taskType and their linked scheduleItem
      }
    */
    assetTableDatas () {
      const list = []
      const assetTaskTypes = sortByName(
        this.taskTypes.filter(
          t => !t.for_shots && this.currentProduction.task_types.includes(t.id)
        )
      )
      assetTaskTypes.forEach(taskTypes => {
        list.push(this.computeCoupleTaskTypeScheduleItem(taskTypes))
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
        list:  [{taskTypes, scheduleItem}] // A list of objects that represente a couple of taskType and their linked scheduleItem
      }
    */
    shotTableDatas () {
      const list = []
      const assetTaskTypes = sortByName(
        this.taskTypes.filter(
          t => t.for_shots && this.currentProduction.task_types.includes(t.id)
        )
      )
      assetTaskTypes.forEach(taskTypes => {
        list.push(this.computeCoupleTaskTypeScheduleItem(taskTypes))
      })
      return {
        title: this.$t('shots.title'),
        list
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

    computeCoupleTaskTypeScheduleItem (taskTypes) {
      const index = this.currentScheduleItems.findIndex(
        scheduleItem => scheduleItem.task_type_id === taskTypes.id
      )
      // We need to clone the value from the store
      const scheduleItem = (index !== -1) ? { ...this.currentScheduleItems[index] } : null
      if (scheduleItem) {
        scheduleItem.startDate = scheduleItem.start_date
        scheduleItem.endDate = scheduleItem.end_date
        // clean data to avoir mix camelCase / snake_case
        delete scheduleItem.start_date
        delete scheduleItem.end_date
      }
      return { taskTypes, scheduleItem }
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

    async updateScheduleItem (scheduleItem, updatedData) {
      const data = {
        ...scheduleItem,
        ...updatedData
      }
      data.startDate = moment(data.startDate)
      data.endDate = moment(data.endDate)
      this.loading.scheduleTimeUpdate = true
      this.errors.scheduleTimeUpdate = false
      try {
        await this.saveScheduleItem(data)
      } catch {
        this.loading.scheduleTimeUpdate = false
        this.errors.scheduleTimeUpdate = true
        return
      }
      this.loading.scheduleTimeUpdate = false
    },

    async removeTaskTypeScheduleItemCouple (taskTypeScheduleItemCouple) {
      this.errors.delete = false
      try {
        await this.removeTaskTypeFromProduction(taskTypeScheduleItemCouple.taskTypes.id)
        if (taskTypeScheduleItemCouple.scheduleItem !== null) {
          this.loading.scheduleTimeDelete = true
          await this.deleteScheduleItem(taskTypeScheduleItemCouple.scheduleItem)
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
        await this.editProduction(
          {
            id: this.currentProduction.id,
            episode_span: this.episode_span
          }
        )
      } catch {
        this.loading.episode_span = false
        this.errors.episode_span = true
        return
      }
      this.loading.episode_span = false
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
td.name {
  width: 200px;
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
