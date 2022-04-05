<template>
<router-link
  :to="statusAutomationPath"
  v-if="productionId && !isCurrentUserClient"
>
  <span
    class="status-automation"
    v-if="statusAutomation"
  >
    {{ statusAutomation.entity_type }}
  </span>

</router-link>
<div
  class="tag status-automation no-link"
  :class="{ deletable }"
  v-else
>
  {{ statusAutomation.entity_type }}
  <task-type-name
    class="in-task-type"
    :task-type="getTaskType(statusAutomation.in_task_type_id)"
  />
  <task-status-name class="in-task-status"
    v-if="statusAutomation.in_field_type === 'status'"
    :entry="getTaskStatus(statusAutomation.in_task_status_id)"
  />
  <span class="input-separator">
    =={{ statusAutomation.out_field_type === 'ready_for' ? 'Ready For' : '' }}==>
  </span>
  <task-type-name
    class="out-task-type"
    :task-type="getTaskType(statusAutomation.out_task_type_id)"
  />
  <task-status-name class="out-task-status"
    v-if="statusAutomation.out_field_type === 'status'"
    :entry="getTaskStatus(statusAutomation.out_task_status_id)"
  />
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
    ...mapGetters([
      'isCurrentUserClient',
      'getTaskStatus',
      'getTaskType'
    ]),

    statusAutomationPath () {
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
    ...mapActions([
    ])
  }
}
</script>

<style lang="scss" scoped>
.tag {
  border-radius: 0;
  color: var(--text);
  font-size: 0.9em;
  font-weight: bold;
  line-height: 0.8em;
  padding: 0 0.7em;
  margin: 0;
}

.tag.deletable {
  padding-right: 0;
}

.dark .tag {
  background: $dark-grey-lightest;
}

.delete-times:hover {
  cursor: pointer;
}

.delete-times {
  font-size: 1.2rem;
  font-weight: bold;
  padding-left: 7px;
  padding-bottom: 2px;
  padding-right: 0.7rem;
}

.delete-times:hover {
  color: black
}

.no-link {
  color: var(--text);
  cursor: default;
}
</style>
