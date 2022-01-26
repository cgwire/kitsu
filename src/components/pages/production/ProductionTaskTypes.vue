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
        v-for="(taskListObject, index) in [assetTaskTypes, shotTaskTypes, editTaskTypes]"
        v-else
      >
        <div
          :key="index"
        >
          <h2 class="section-title">
            {{ taskListObject.title }}
          </h2>
          <table
            class="datatable list"
            v-if="taskListObject.list.length > 0"
          >
            <thead>
              <tr>
                <th class="name">
                  {{ $t('task_types.fields.name') }}
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
            <draggable
              v-model="taskListObject.list"
              draggable=".task-type"
              class="datatable-body"
              tag="tbody"
              @end="updatePriorities(taskListObject.list)"
            >
              <production-task-type
                class="task-type"
                :key="taskTypeData.taskType.id"
                :task-type="taskTypeData.taskType"
                :schedule-item="taskTypeData.scheduleItem"
                @date-changed="onDateChanged"
                @remove="removeTaskType"
                v-for="taskTypeData in taskListObject.list"
              />
            </draggable>
          </table>
        </div>
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
import draggable from 'vuedraggable'
import moment from 'moment'
import { mapGetters, mapActions } from 'vuex'
import { sortByName, sortTaskTypes } from '@/lib/sorting'
import { formatFullDate } from '@/lib/time'

import ComboboxTaskType from '@/components/widgets/ComboboxTaskType'
import ProductionTaskType from '@/components/pages/production/ProductionTaskType'

export default {
  name: 'production-task-types',

  components: {
    ComboboxTaskType,
    draggable,
    ProductionTaskType
  },

  data () {
    return {
      assetTaskTypes: { list: [] },
      editTaskTypes: { list: [] },
      episode_span: 0,
      shotTaskTypes: { list: [] },
      taskTypeId: '',
      loading: {
        episode_span: false,
        scheduleTimeUpdate: false,
        scheduleTimeDelete: false
      },
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

    this.resetDisplayedTaskTypes()
    if (this.currentProduction) {
      this.episode_span = this.currentProduction.episode_span
      this.loadAllScheduleItems(this.currentProduction)
        .then(() => {
          this.resetDisplayedTaskTypes()
        })
    }
  },

  computed: {
    ...mapGetters([
      'currentProduction',
      'currentScheduleItems',
      'productionTaskTypes',
      'productionAssetTaskTypes',
      'productionShotTaskTypes',
      'productionEditTaskTypes',
      'taskStatusMap',
      'taskTypeMap',
      'taskTypes',
      'isTVShow'
    ]),

    remainingTaskTypes () {
      return sortByName(
        this.taskTypes
          .filter(t => !this.currentProduction.task_types.includes(t.id))
      )
    }
  },

  methods: {
    ...mapActions([
      'addTaskTypeToProduction',
      'createScheduleItem',
      'deleteScheduleItem',
      'editProduction',
      'editTaskTypeLink',
      'loadAllScheduleItems',
      'loadContext',
      'removeTaskTypeFromProduction',
      'saveScheduleItem'
    ]),

    isEmpty (list) {
      return !list || list.length === 0
    },

    resetDisplayedTaskTypes () {
      this.resetAssetTaskTypes()
      this.resetShotTaskTypes()
      this.resetEditTaskTypes()
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
      await this.addTaskTypeToProduction(
        {
          taskTypeId: this.taskTypeId,
          priority: this.assetTaskTypes.length
        }
      )
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
      this.resetDisplayedTaskTypes()
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
      this.resetDisplayedTaskTypes()
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
    resetAssetTaskTypes () {
      const list = sortTaskTypes(
        [...this.productionAssetTaskTypes], this.currentProduction
      ).map(taskType => {
        return {
          taskType,
          scheduleItem: this.getScheduleItemForTaskType(taskType)
        }
      })
      this.assetTaskTypes = {
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
    resetShotTaskTypes () {
      const list = sortTaskTypes(
        [...this.productionShotTaskTypes], this.currentProduction
      ).map(taskType => {
        return {
          taskType,
          scheduleItem: this.getScheduleItemForTaskType(taskType)
        }
      })
      this.shotTaskTypes = {
        title: this.$t('shots.title'),
        list
      }
    },

    resetEditTaskTypes () {
      const list = sortTaskTypes(
        [...this.productionEditTaskTypes], this.currentProduction
      ).map(taskType => {
        return {
          taskType,
          scheduleItem: this.getScheduleItemForTaskType(taskType)
        }
      })
      this.editTaskTypes = {
        title: this.$t('edits.title'),
        list
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
    },

    async savePriorities (forms) {
      const now = new Date().getTime()
      this.lastCall = this.lastCall || 0
      if (now - this.lastCall > 1000 && !this.isSaving) {
        this.lastCall = now
        this.isSaving = true
        await Promise.all(forms.map(
          async (form) => {
            return await this.editTaskTypeLink(form)
          }
        ))
        this.isSaving = false
        if (this.newSaveCall) {
          await this.savePriorities(forms)
        }
        setTimeout(() => {
          this.$store.commit('SORT_VALIDATION_COLUMNS', this.taskTypeMap)
        }, 100)
      } else {
        this.newSaveCall = true
      }
    },

    async updatePriorities (taskTypes) {
      const forms = []
      taskTypes.forEach((item, index) => {
        index += 1
        const form = {
          projectId: this.currentProduction.id,
          taskTypeId: item.taskType.id,
          priority: index
        }
        forms.push(form)
      })
      await this.savePriorities(forms)
      await this.loadContext()
    }
  },

  watch: {
    currentProduction: {
      handler () {
        this.episode_span = this.currentProduction.episode_span
        this.loadAllScheduleItems(this.currentProduction)
        this.resetDisplayedTaskTypes()
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

td ::v-deep p.control.flexrow {
  width: 105px;
}

.episode-span-column {
  margin-left: 5rem;
}

.field {
  margin-bottom: 0;
}

.section-title {
  color: $grey;
  font-size: 1.2em;
  margin-bottom: 1em;
  margin-top: 2em;
  text-transform: uppercase;
}
</style>
