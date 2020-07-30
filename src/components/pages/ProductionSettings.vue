<template>
  <div class="production-settings fixed-page">
    <div class="wrapper">
    <div class="tabs">
      <ul>
        <li :class="{'is-active': isActiveTab('taskStatus')}">
          <a @click="activeTab = 'taskStatus'">
            {{ $t('task_status.title')}}
          </a>
        </li>
        <li :class="{'is-active': isActiveTab('taskTypes')}">
          <a @click="activeTab = 'taskTypes'">
            {{ $t('task_types.title')}}
          </a>
        </li>
        <li :class="{'is-active': isActiveTab('assetTypes')}">
          <a @click="activeTab = 'assetTypes'">
            {{ $t('asset_types.title')}}
          </a>
        </li>
      </ul>
    </div>

    <div class="tab" v-show="isActiveTab('assetTypes')">
      <div class="flexrow mt1 mb1 add-asset-type">
        <combobox
          class="flexrow-item"
          :options="remainingAssetTypes"
          v-model="assetTypeId"
        />
        <button
          class="button flexrow-item"
          @click="addAssetType"
        >
          {{ $t('main.add') }}
        </button>
      </div>
      <table class="datatable list">
        <tbody class="datatable-body">
          <tr
            class="datatable-row"
            :key="assetType.id"
            v-for="assetType in productionAssetTypes"
          >
            <td class="name">{{ assetType.name }}</td>
            <td>
              <button
                class="button"
                @click="removeAssetType(assetType.id)"
              >
                {{ $t('main.remove') }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="tab" v-show="isActiveTab('taskTypes')">
      <div class="flexrow mt1 mb1 add-task-type">
        <combobox-task-type
          class="flexrow-item selector"
          :task-type-list="remainingTaskTypes"
          v-model="taskTypeId"
        />
        <button
          class="button flexrow-item"
          @click="addTaskType"
        >
          {{ $t('main.add') }}
        </button>
      </div>
      <table class="datatable list">
        <tbody class="datatable-body">
          <tr
            class="datatable-row"
            :key="taskType.id"
            v-for="taskType in productionTaskTypes"
          >
            <task-type-cell
              :task-type="taskType"
            />
            <td>
              <button
                class="button"
                @click="removeTaskType(taskType.id)"
              >
                {{ $t('main.remove') }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="tab" v-show="isActiveTab('taskStatus')">
      <div class="flexrow mt1 mb1 add-task-status">
        <combobox-status
          class="flexrow-item selector"
          :task-status-list="remainingTaskStatuses"
          v-model="taskStatusId"
        />
        <button
          class="button flexrow-item"
          @click="addTaskStatus"
        >
          {{ $t('main.add') }}
        </button>
      </div>
      <table class="datatable list">
        <tbody class="datatable-body">
          <tr
            class="datatable-row"
            :key="taskStatus.id"
            v-for="taskStatus in productionTaskStatuses"
          >
            <td class="name">
              <validation-tag
                :is-static="true"
                :task="{ task_status_id: taskStatus.id }"
              />
            </td>
            <td>
              <button
                class="button"
                @click="removeTaskStatus(taskStatus.id)"
              >
                {{ $t('main.remove') }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { sortByName } from '@/lib/sorting'

import Combobox from '@/components/widgets/Combobox'
import ComboboxStatus from '@/components/widgets/ComboboxStatus'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType'
import TaskTypeCell from '@/components/cells/TaskTypeName'
import ValidationTag from '@/components/widgets/ValidationTag'

export default {
  name: 'production-settings',
  components: {
    Combobox,
    ComboboxStatus,
    ComboboxTaskType,
    TaskTypeCell,
    ValidationTag
  },

  data () {
    return {
      activeTab: 'taskStatus',
      assetTypeId: '',
      taskStatusId: '',
      taskTypeId: ''
    }
  },

  mounted () {
    if (this.remainingAssetTypes.length > 0) {
      this.assetTypeId = this.remainingAssetTypes[0].value
    }
    if (this.remainingTaskStatuses.length > 0) {
      this.taskStatusId = this.remainingTaskStatuses[0].value
    }
    if (this.remainingTaskTypes.length > 0) {
      this.taskTypeId = this.remainingTaskTypes[0].id
    }
  },

  computed: {
    ...mapGetters([
      'assetTypeMap',
      'currentProduction',
      'assetTypes',
      'productionAssetTypes',
      'productionTaskStatuses',
      'taskStatus',
      'taskStatusMap',
      'taskTypeMap',
      'taskTypes'
    ]),

    remainingAssetTypes () {
      return this.assetTypes
        .filter(t => !this.currentProduction.asset_types.includes(t.id))
        .map(t => ({ label: t.name, value: t.id }))
    },

    remainingTaskStatuses () {
      return this.taskStatus
        .filter(s => !this.currentProduction.task_statuses.includes(s.id))
    },

    productionTaskTypes () {
      return sortByName(
        this.currentProduction
          .task_types
          .map(id => this.taskTypeMap[id])
      )
    },

    remainingTaskTypes () {
      return this.taskTypes
        .filter(t => !this.currentProduction.task_types.includes(t.id))
    }
  },

  methods: {
    ...mapActions([
      'addAssetTypeToProduction',
      'addTaskStatusToProduction',
      'addTaskTypeToProduction',
      'removeAssetTypeFromProduction',
      'removeTaskStatusFromProduction',
      'removeTaskTypeFromProduction'
    ]),

    isActiveTab (tab) {
      return this.activeTab === tab
    },

    addAssetType () {
      this.addAssetTypeToProduction(this.assetTypeId)
    },

    removeAssetType (assetTypeId) {
      this.removeAssetTypeFromProduction(assetTypeId)
    },

    addTaskStatus () {
      this.addTaskStatusToProduction(this.taskStatusId)
      if (this.remainingTaskStatuses.length > 0) {
        this.taskStatusId = this.remainingTaskStatuses[0].value
      }
    },

    removeTaskStatus (taskStatusId) {
      this.removeTaskStatusFromProduction(taskStatusId)
    },

    addTaskType () {
      this.addTaskTypeToProduction(this.taskTypeId)
      if (this.remainingTaskTypes.length > 0) {
        this.taskTypeId = this.remainingTaskTypes[0].id
      }
    },

    removeTaskType (taskTypeId) {
      this.removeTaskTypeFromProduction(taskTypeId)
    }
  },

  metaInfo () {
    return {
      title: `${this.currentProduction.name} | ${this.$t('settings.title')} - Kitsu`
    }
  }
}
</script>

<style lang="scss" scoped>
.fixed-page {
  display: flex;
}

.wrapper {
  margin-top: 0px;
  overflow-y: scroll;
  padding: 2em;
  flex: 1;
}

.tabs ul {
  margin-left: 0;
}

.tab {
  flex: 1;
}

h2.subtitle {
  color: $grey;
  font-size: 1.2em;
  font-weight: bold;
  margin-bottom: 0.4em;
  text-transform: uppercase;
}

.field {
  margin-bottom: 0;
}

.list {
  width: 400px;
  min-width: 400px;
  max-width: 400px;

  .name {
    width: 100%;
  }
}
</style>
