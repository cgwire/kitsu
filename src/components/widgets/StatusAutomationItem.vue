<template>
  <div class="status-automation flexrow">
    <span class="flexrow-item entity-type">
      {{ statusAutomation.entity_type }}
    </span>
    <span class="in-task-type flexrow-item">
      <task-type-name
        class="in-task-type flexrow-item"
        :task-type="getTaskType(statusAutomation.in_task_type_id)"
      />
    </span>
    <span class="in-task-status flexrow-item">
      <task-status-name
        :entry="getTaskStatus(statusAutomation.in_task_status_id)"
        v-if="statusAutomation.in_field_type !== 'ready_for'"
      />
    </span>
    <span class="flexrow-item trigger-type">
      changes
      {{
        statusAutomation.out_field_type === 'ready_for'
          ? 'ready for to'
          : 'task status for'
      }}
    </span>
    <span class="out-task-type flexrow-item">
      <task-type-name
        :task-type="getTaskType(statusAutomation.out_task_type_id)"
      />
    </span>
    <span
      class="flexrow-item"
      v-if="statusAutomation.out_field_type === 'status'"
    >
      to
    </span>
    <span class="out-task-status flexrow-item">
      <task-status-name
        :entry="getTaskStatus(statusAutomation.out_task_status_id)"
        v-if="statusAutomation.out_field_type === 'status'"
      />
    </span>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import TaskTypeName from '@/components/widgets/TaskTypeName'
import TaskStatusName from '@/components/cells/TaskStatusName'

export default {
  name: 'status-automation-item',
  components: {
    TaskTypeName,
    TaskStatusName
  },

  props: {
    statusAutomation: {
      type: Object,
      default: null
    },
    productionId: {
      type: String,
      default: null
    },
    deletable: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    ...mapGetters(['isCurrentUserClient', 'getTaskStatus', 'getTaskType']),

    statusAutomationPath() {
      const route = {
        name: 'status-automation',
        params: {
          production_id: this.productionId,
          status_automation_id: this.statusAutomation.id,
          type: this.$tc(this.statusAutomation.for_entity.toLowerCase(), 2)
        }
      }

      if (this.statusAutomation.episode_id || this.$route.params.episode_id) {
        route.name = 'episode-status-automation'
        route.params.episode_id =
          this.statusAutomation.episode_id || this.$route.params.episode_id
      }
      return route
    }
  },

  methods: {
    ...mapActions([])
  }
}
</script>

<style lang="scss" scoped>
.status-automation {
  text-transform: none;
  color: var(--text);
  padding: 1em;
}

.flexrow-item {
  text-align: left;
}

.entity-type {
  text-transform: capitalize;
  min-width: 40px;
}

.in-task-type {
  text-align: left;
}

.out-task-status {
  min-width: 100px;
}

.trigger-type {
  min-width: 160px;
}
</style>
