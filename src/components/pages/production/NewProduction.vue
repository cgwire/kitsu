<template>
  <div class="new-production page">
    <div class="columns">
      <div class="column is-offset-one-quarter is-half">
        <section class="hero">
          <div class="hero-body">
            <h1 class="title">
              {{ $t('productions.creation.create_production') }}
            </h1>
          </div>
        </section>
        <timeline-item
          :title="$t('productions.creation.give_a_name')"
          :subtitle="$t('productions.creation.give_a_name_description')"
          :step="1"
          :is-completed="hasValidName"
        >
          <text-field
            input-class=" is-small is-inline"
            :placeholder="$t('productions.creation.placeholder_name')"
            v-model="productionToCreate.name"
          />
        </timeline-item>
        <timeline-item
          :title="$t('productions.creation.production_settings')"
          :subtitle="$t('productions.creation.production_settings_description')"
          :step="2"
          :is-completed="hasValidSettings"
        >
          <combobox
            :options="productionTypeOptions"
            localeKeyPrefix="productions.type."
            v-model="productionToCreate.settings.type"
            is-inline
            thin
          />
          <span class="input-separator">&gt;</span>
          <text-field
            input-class=" is-small is-inline is-size-3"
            type="number"
            :step="1"
            :placeholder="$t('productions.creation.placeholder_fps')"
            is-inline
            v-model="productionToCreate.settings.fps"
          />
          <span class="input-separator">fps &gt;</span>
          <text-field
            input-class=" is-small is-inline is-size-2"
            type="number"
            :step="1"
            :placeholder="$t('productions.creation.placeholder_ratio1')"
            is-inline
            v-model="productionToCreate.settings.ratio[0]"
          />
          <span class="input-separator">:</span>
          <text-field
            input-class=" is-small is-inline is-size-2"
            type="number"
            :step="1"
            :placeholder="$t('productions.creation.placeholder_ratio2')"
            is-inline
            v-model="productionToCreate.settings.ratio[1]"
          />
          <span class="input-separator">&gt;</span>
          <text-field
            input-class=" is-small is-inline is-size-4"
            type="number"
            :step="1"
            :placeholder="$t('productions.creation.placeholder_resolution1')"
            is-inline
            v-model="productionToCreate.settings.resolution[0]"
          />
          <span class="input-separator">x</span>
          <text-field
            input-class=" is-small is-inline is-size-4"
            type="number"
            :step="1"
            :placeholder="$t('productions.creation.placeholder_resolution2')"
            is-inline
            v-model="productionToCreate.settings.resolution[1]"
          />
          <div class="date-picker-wrapper">
            <calendar-icon />
            <datepicker
              wrapper-class="datepicker"
              input-class="is-small date-input input"
              :placeholder="$t('productions.creation.placeholder_date_start')"
              :language="locale"
              :disabled-dates="{ days: [6, 0] }"
              :monday-first="true"
              format="yyyy-MM-dd"
              v-model="productionToCreate.settings.dateStart"
            />
            <span class="input-separator">-</span>
            <datepicker
              wrapper-class="datepicker"
              input-class="is-small date-input input"
              :language="locale"
              :disabled-dates="{ days: [6, 0] }"
              :placeholder="$t('productions.creation.placeholder_date_end')"
              :monday-first="true"
              :disabledDates="{ to: productionToCreate.settings.dateStart }"
              format="yyyy-MM-dd"
              v-model="productionToCreate.settings.dateEnd"
            />
          </div>
        </timeline-item>
        <timeline-item
          :title="$t('productions.creation.select_asset_task_type')"
          :subtitle="$t('productions.creation.select_asset_task_type_description')"
          :step="3"
          :is-completed="hasValidAssetTaskTypes"
          v-if="taskTypesLoaded"
        >
          <draggable
            v-model="productionToCreate.assetTaskTypes"
            draggable=".task-type"
          >
            <task-type-name
              class="task-type"
              :task-type="taskType"
              :key="taskType.id"
              @delete="deleteFromList(taskType, 'assetTaskTypes')"
              deletable
              v-for="taskType in productionToCreate.assetTaskTypes"
            />
            <combobox-task-type
              slot="footer"
              class="is-inline"
              :task-type-list="availableAssetTaskTypes"
              @input="id => productionToCreate.assetTaskTypes.push(taskTypeMap.get(id))"
              v-if="availableAssetTaskTypes.length > 0"
            />
          </draggable>
        </timeline-item>
        <timeline-item
          :title="$t('productions.creation.select_shot_task_type')"
          :subtitle="$t('productions.creation.select_shot_task_type_description')"
          :step="4"
          :is-completed="hasValidShotTaskTypes"
          v-if="taskTypesLoaded"
        >
          <draggable
            v-model="productionToCreate.shotTaskTypes"
            draggable=".task-type"
          >
            <task-type-name
              class="task-type"
              :task-type="taskType"
              :key="taskType.id"
              @delete="deleteFromList(taskType, 'shotTaskTypes')"
              deletable
              v-for="taskType in productionToCreate.shotTaskTypes"
            />
            <combobox-task-type
              slot="footer"
              class="is-inline"
              :task-type-list="availableShotTaskTypes"
              @input="id => productionToCreate.shotTaskTypes.push(taskTypeMap.get(id))"
              v-if="availableShotTaskTypes.length > 0"
            />
          </draggable>
        </timeline-item>
        <timeline-item
          :title="$t('productions.creation.select_task_status')"
          :subtitle="$t('productions.creation.select_task_status_description')"
          :step="5"
          :is-completed="hasValidTaskStatuses"
          v-if="taskStatusesLoaded"
          is-last
        >
          <draggable
            v-model="productionToCreate.taskStatuses"
            draggable=".task-type"
          >
            <task-type-name
              class="task-type"
              :task-type="taskStatus"
              :key="taskStatus.id"
              @delete="deleteFromList(taskStatus, 'taskStatuses')"
              :deletable="taskStatus.short_name !== 'todo'"
              v-for="taskStatus in productionToCreate.taskStatuses"
            />
            <combobox-task-type
              slot="footer"
              class="is-inline"
              :task-type-list="availableTaskStatuses"
              @input="id => productionToCreate.taskStatuses.push(taskStatusMap.get(id))"
              v-if="availableTaskStatuses.length > 0"
            />
          </draggable>
        </timeline-item>
<!--        <timeline-item-->
<!--          :title="$t('productions.creation.add_assets')"-->
<!--          :subtitle="$t('productions.creation.add_assets_description')"-->
<!--          :step="6"-->
<!--          is-completed-->
<!--        />-->
<!--        <timeline-item-->
<!--          :title="$t('productions.creation.add_shots')"-->
<!--          :subtitle="$t('productions.creation.add_shots_description')"-->
<!--          :step="7"-->
<!--          is-completed-->
<!--          is-last-->
<!--        />-->
        <section class="has-text-centered mt2">
          <p v-if="errorCreatingProduction" class="error">
            {{ $t('productions.creation.error') }}
            {{ creationError }}
          </p>
          <button
            class="button big-button"
            v-if="hasAllDataCorrect"
            :disabled="createProductionLoading"
            @click="createProduction"
          >
            <spinner v-if="createProductionLoading" :size="20" class="mr1" />
            {{ $t('productions.creation.create_button') }}
          </button>
          <button class="button big-button" disabled v-else>
            {{ $t('productions.creation.create_button_disabled') }}
          </button>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import TimelineItem from './TimelineItem'
import { PRODUCTION_TYPE_OPTIONS } from '../../../lib/productions'
import TextField from '../../widgets/TextField'
import Combobox from '../../widgets/Combobox'
import { mapActions, mapGetters } from 'vuex'
import { en, fr } from 'vuejs-datepicker/dist/locale'
import Datepicker from 'vuejs-datepicker'
import { CalendarIcon } from 'vue-feather-icons'
import TaskTypeName from '../../widgets/TaskTypeName'
import { removeModelFromList } from '../../../lib/models'
import ComboboxTaskType from '../../widgets/ComboboxTaskType'
import Spinner from '../../widgets/Spinner'

export default {
  name: 'NewProduction',
  components: {
    draggable,
    CalendarIcon,
    Combobox,
    ComboboxTaskType,
    Datepicker,
    Spinner,
    TaskTypeName,
    TextField,
    TimelineItem
  },
  data () {
    return {
      productionToCreate: {
        name: null,
        settings: {
          type: PRODUCTION_TYPE_OPTIONS[0].value,
          fps: null, // eg: '24'
          ratio: [], // eg: [4, 3]
          resolution: [], // eg: [1440, 1080]
          dateStart: null,
          dateEnd: null
        },
        assetTaskTypes: [],
        shotTaskTypes: [],
        taskStatuses: []
      },
      productionTypeOptions: PRODUCTION_TYPE_OPTIONS,
      taskTypesLoaded: false,
      taskStatusesLoaded: true,
      createProductionLoading: false,
      errorCreatingProduction: false,
      creationError: ''
    }
  },
  computed: {
    ...mapGetters([
      'assetTaskTypes',
      'productions',
      'productionStatus',
      'shotTaskTypes',
      'taskStatus',
      'taskStatusMap',
      'taskTypeMap',
      'user'
    ]),

    locale () {
      if (this.user.locale === 'fr_FR') {
        return fr
      } else {
        return en
      }
    },
    allowedProductionTypes () {
      return PRODUCTION_TYPE_OPTIONS.map(
        option => option.value
      )
    },
    hasValidName () {
      return !this.isEmpty(this.productionToCreate.name)
    },
    hasValidStartDate () {
      return !this.isEmpty(this.productionToCreate.settings.dateStart)
    },
    hasValidEndDate () {
      return !this.isEmpty(this.productionToCreate.settings.dateEnd)
    },
    hasValidSettings () {
      return (
        this.hasValidType &&
        this.hasValidFPS &&
        this.hasValidRatio &&
        this.hasValidResolution &&
        this.hasValidStartDate &&
        this.hasValidEndDate
      )
    },
    hasValidFPS () {
      return this.isInteger(this.productionToCreate.settings.fps)
    },
    hasValidRatio () {
      if (this.isEmpty(this.productionToCreate.settings.ratio)) {
        return false
      }
      return (
        this.productionToCreate.settings.ratio.length === 2 &&
        this.isInteger(this.productionToCreate.settings.ratio[0]) &&
        this.isInteger(this.productionToCreate.settings.ratio[1])
      )
    },
    hasValidResolution () {
      if (this.isEmpty(this.productionToCreate.settings.resolution)) {
        return false
      }
      return (
        this.productionToCreate.settings.resolution.length === 2 &&
        this.isInteger(this.productionToCreate.settings.resolution[0]) &&
        this.isInteger(this.productionToCreate.settings.resolution[1])
      )
    },
    hasValidType () {
      return this.allowedProductionTypes.indexOf(
        this.productionToCreate.settings.type
      ) !== -1
    },
    hasValidAssetTaskTypes () {
      return this.productionToCreate.assetTaskTypes.length > 0
    },
    hasValidShotTaskTypes () {
      return this.productionToCreate.shotTaskTypes.length > 0
    },
    hasValidTaskStatuses () {
      return this.productionToCreate.taskStatuses.length > 0
    },
    hasAllDataCorrect () {
      return (
        this.hasValidName &&
        this.hasValidSettings &&
        this.hasValidAssetTaskTypes &&
        this.hasValidShotTaskTypes &&
        this.hasValidTaskStatuses
      )
    },
    availableAssetTaskTypes () {
      return this.assetTaskTypes.filter(
        assetTaskType => this.productionToCreate.assetTaskTypes.indexOf(
          assetTaskType
        ) === -1
      )
    },
    availableShotTaskTypes () {
      return this.shotTaskTypes.filter(
        shotTaskType => this.productionToCreate.shotTaskTypes.indexOf(
          shotTaskType
        ) === -1
      )
    },
    availableTaskStatuses () {
      return this.taskStatus.filter(
        status => this.productionToCreate.taskStatuses.indexOf(status) === -1
      )
    }
  },
  methods: {
    ...mapActions([
      'addTaskStatusToProduction',
      'addTaskTypeToProduction',
      'loadProductionStatus',
      'loadTaskStatuses',
      'loadTaskTypes',
      'newProduction',
      'setProduction'
    ]),
    removeModelFromList,
    deleteFromList (object, listName) {
      this.productionToCreate[listName] = removeModelFromList(
        this.productionToCreate[listName], object
      )
    },
    isEmpty (value) {
      return value === null || value === undefined || value === '' || value === [] || value === {}
    },
    isInteger (value) {
      return !this.isEmpty(value) && /^\d+$/.test(value)
    },
    async createProduction () {
      this.createProductionLoading = true
      this.errorCreatingProduction = false
      this.creationError = ''
      try {
        await this.newProduction({
          name: this.productionToCreate.name,
          project_status_id: this.productionStatus[0].id,
          fps: this.productionToCreate.settings.fps,
          ratio: this.productionToCreate.settings.ratio.join(':'),
          resolution: this.productionToCreate.settings.resolution.join('x'),
          production_type: this.productionToCreate.settings.type,
          start_date: this.productionToCreate.settings.dateStart,
          end_date: this.productionToCreate.settings.dateEnd
        })
        const createdProduction = this.productions[this.productions.length - 1]
        await this.setProduction(createdProduction.id)
        await Promise.all(this.productionToCreate.assetTaskTypes.concat(
          this.productionToCreate.shotTaskTypes
        ).map(
          // add task types
          async (taskType) => {
            return await this.addTaskTypeToProduction(taskType.id)
          }
        ).concat(
          // add task statuses
          this.productionToCreate.taskStatuses.map(
            async (taskStatus) => {
              return await this.addTaskStatusToProduction(taskStatus.id)
            }
          )
        ))

        await this.$router.push({
          name: 'assets',
          params: {
            production_id: createdProduction.id
          }
        })
      } catch (error) {
        console.error(error, error.response)
        this.errorCreatingProduction = true
        this.creationError = error.response ? ': ' + error.response.body.message.substring(0, 165) : ''
      }
      this.createProductionLoading = false
    }
  },
  async mounted () {
    this.loadTaskStatuses(() => {
      this.productionToCreate.taskStatuses = [...this.taskStatus]
      this.taskStatusesLoaded = true
    })

    await this.loadTaskTypes()
    this.productionToCreate.assetTaskTypes = [...this.assetTaskTypes]
    this.productionToCreate.shotTaskTypes = [...this.shotTaskTypes]
    this.taskTypesLoaded = true

    await this.loadProductionStatus()
  }
}
</script>

<style scoped>
.hero {
  background-color: inherit;
}

h1.title {
  font-weight: bold;
}

.new-production > .columns {
  padding-bottom: 3rem
}

span.input-separator {
  display: inline-block;
  padding: 3px;
}

>>> .input.is-small {
  height: 2rem;
  font-size: 1rem;
  padding: 0 0.5rem;
}

>>> .input.is-size-2 {
  width: 3.5rem;
}

>>> .input.is-size-3 {
  width: 4rem;
}

>>> .input.is-size-4 {
  width: 4.5rem;
}

>>> .datepicker {
  display: inline-flex;
}

.date-picker-wrapper {
  margin-top: .5rem;
  display: flex;
  align-items: center;
}

>>> .datepicker input.date-input {
  width: 6.5rem;
}

>>> .task-type.task-type-name:hover {
  cursor: grab;
}
>>> .task-type.task-type-name {
  margin-right: 5px;
  margin-bottom: 5px;
  height: 2.3rem;
}
>>> .task-type-combo {
  display: inline-flex;
  width: auto;
  min-width: auto;
}
>>> .selected-task-type-line {
  padding: 0;
  margin-right: 0;
}
</style>
