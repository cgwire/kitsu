<template>
  <div class="production-settings fixed-page">
    <div class="wrapper">
    <div class="tabs">
      <ul>
        <li :class="{'is-active': isActiveTab('brief')}">
          <a @click="activeTab = 'brief'">
            {{ $t('productions.brief.title')}}
          </a>
        </li>
        <li :class="{'is-active': isActiveTab('parameters')}">
          <a @click="activeTab = 'parameters'">
            {{ $t('productions.parameters.title')}}
          </a>
        </li>
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
        <li :class="{'is-active': isActiveTab('statusAutomations')}">
          <a @click="activeTab = 'statusAutomations'">
            {{ $t('status_automations.title')}}
          </a>
        </li>
      </ul>
    </div>

    <div class="tab" v-show="isActiveTab('brief')">
      <ProductionBrief />
    </div>

    <div class="tab" v-show="isActiveTab('parameters')">
      <production-parameters />
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
      <div
        class="box"
        v-if="isEmpty(currentProduction.asset_types)"
      >
        {{ $t('settings.production.empty_list') }}
      </div>
      <table class="datatable list" v-else>
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
      <production-task-types />
    </div>

    <div class="tab" v-show="isActiveTab('taskStatus')">
      <div
        class="flexrow mt1 mb1 add-task-status"
        v-if="!isEmpty(remainingTaskStatuses)"
      >
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
      <div
        class="box"
        v-if="isEmpty(currentProduction.task_statuses)"
      >
        {{ $t('settings.production.empty_list') }}
      </div>
      <table class="datatable" v-else>
        <thead>
          <tr>
            <th class="th-name">{{ $t('task_status.fields.name') }}</th>
            <th class="th-short-name">{{ $t('task_status.fields.short_name') }}</th>
            <th class="th-bool">{{ $t('task_status.fields.is_done') }}</th>
            <th class="th-bool">{{ $t('task_status.fields.is_retake') }}</th>
            <th class="th-bool">{{ $t('task_status.fields.is_artist_allowed') }}</th>
            <th class="th-bool">{{ $t('task_status.fields.is_client_allowed') }}</th>
          </tr>
        </thead>
        <tbody class="datatable-body">
          <template v-for="taskStatus in productionTaskStatuses">
            <tr
              class="datatable-row"
              :key="taskStatus.id"
              v-if="taskStatus"
            >
              <td>
                {{taskStatus.name}}
              </td>
              <td class="name">
                <validation-tag
                  :is-static="true"
                  :task="{ task_status_id: taskStatus.id }"
                />
              </td>
              <td>{{ getBooleanTranslation(taskStatus.is_done) }}</td>
              <td>{{ getBooleanTranslation(taskStatus.is_retake) }}</td>
              <td>{{ getBooleanTranslation(taskStatus.is_artist_allowed) }}</td>
              <td>{{ getBooleanTranslation(taskStatus.is_client_allowed) }}</td>
              <td>
                <button
                  class="button"
                  @click="removeTaskStatus(taskStatus.id)"
                >
                  {{ $t('main.remove') }}
                </button>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <div class="tab" v-show="isActiveTab('statusAutomations')">
      <production-status-automations />
    </div>
  </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import Combobox from '@/components/widgets/Combobox'
import ComboboxStatus from '@/components/widgets/ComboboxStatus'
import ProductionBrief from '@/components/pages/production/ProductionBrief'
import ProductionParameters from '@/components/pages/production/ProductionParameters'
import ProductionTaskTypes from '@/components/pages/production/ProductionTaskTypes'
import ProductionStatusAutomations from '@/components/pages/production/ProductionStatusAutomations'
import ValidationTag from '@/components/widgets/ValidationTag'

export default {
  name: 'production-settings',
  components: {
    ProductionBrief,
    ProductionParameters,
    ProductionTaskTypes,
    ProductionStatusAutomations,
    Combobox,
    ComboboxStatus,
    ValidationTag
  },

  data () {
    return {
      activeTab: 'brief',
      assetTypeId: '',
      taskStatusId: ''
    }
  },

  mounted () {
    if (this.remainingAssetTypes.length > 0) {
      this.assetTypeId = this.remainingAssetTypes[0].value
    }
    if (this.remainingTaskStatuses.length > 0) {
      this.taskStatusId = this.remainingTaskStatuses[0].id
    }
    if (this.$route.query.tab) {
      this.activeTab = this.$route.query.tab
    }
  },

  computed: {
    ...mapGetters([
      'assetTypeMap',
      'currentProduction',
      'assetTypes',
      'productionAssetTypes',
      'productionTaskTypes',
      'productionTaskStatuses',
      'productionStatusAutomations',
      'taskStatus',
      'taskStatusMap',
      'taskTypeMap',
      'taskTypes',
      'isTVShow'
    ]),

    remainingAssetTypes () {
      return this.assetTypes
        .filter(t => !this.currentProduction.asset_types.includes(t.id))
        .map(t => ({ label: t.name, value: t.id }))
    },

    remainingTaskStatuses () {
      return this.taskStatus
        .filter(s => !this.currentProduction.task_statuses.includes(s.id))
    }
  },

  methods: {
    ...mapActions([
      'addAssetTypeToProduction',
      'addTaskStatusToProduction',
      'removeAssetTypeFromProduction',
      'removeTaskStatusFromProduction'
    ]),

    isEmpty (list) {
      return !list || list.length === 0
    },

    isActiveTab (tab) {
      return this.activeTab === tab
    },

    addAssetType () {
      this.addAssetTypeToProduction(this.assetTypeId)
      if (this.remainingAssetTypes.length > 0) {
        this.assetTypeId = this.remainingAssetTypes[0].value
      }
    },

    removeAssetType (assetTypeId) {
      this.removeAssetTypeFromProduction(assetTypeId)
    },

    addTaskStatus () {
      this.addTaskStatusToProduction(this.taskStatusId)
      if (this.remainingTaskStatuses.length > 0) {
        this.taskStatusId = this.remainingTaskStatuses[0].id
      } else {
        // Clean data to avoid duplicated data in combobox
        this.taskStatusId = ''
      }
    },

    async removeTaskStatus (taskStatusId) {
      await this.removeTaskStatusFromProduction(taskStatusId)
      await this.$nextTick()
      // Reselect the remainingTaskStatuses to avoid empty taskStatusId
      if (this.remainingTaskStatuses.length > 0) {
        this.taskStatusId = this.remainingTaskStatuses[0].id
      }
    },

    getBooleanTranslation (bool) {
      return bool ? this.$t('main.yes') : this.$t('main.no')
    }
  },

  watch: {
    activeTab () {
      if (this.$route.query.tab !== this.activeTab) {
        this.$router.push({
          query: {
            tab: this.activeTab
          }
        })
      }
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
.datatable th {
  color: var(--text);
}
p {
  color: var(--text);
}
.fixed-page {
  display: flex;
}

.wrapper {
  margin-top: 0px;
  overflow-y: scroll;
  padding: 2em;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.tabs {
  min-height: 2em;
}

.tabs ul {
  margin-left: 0;
}

.tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding-left: 2px;
  padding-top: 0.5em;
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

.th-name {
  width: 200px;
}

.th-short-name {
  width: 120px;
}

.th-bool {
  width: 140px;
}

th {
  padding-left: 10px;
  padding-bottom: 5px;
}

.box {
  max-width: 400px;
}
</style>
