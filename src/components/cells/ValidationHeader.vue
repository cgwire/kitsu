<template>
  <th
    scope="col"
    :class="{
      'validation-cell': !hiddenColumns[columnId],
      'hidden-validation-cell': hiddenColumns[columnId],
      'datatable-row-header': isStick
    }"
    :style="{'left': left}"
  >
    <div
      class="flexrow validation-content"
      :style="validationStyle"
    >
      <router-link
        class="flexrow-item datatable-dropdown task-type-name"
        style="margin-right: 0;"
        :to="taskTypePath(columnId)"
        v-if="!isCurrentUserClient"
      >
        {{ !hiddenColumns[columnId]
        ? taskTypeMap.get(columnId).name
        : '' }}
      </router-link>
      <span
        class="flexrow-item datatable-dropdown task-type-name"
        style="margin-right: 0;"
        v-else
      >
        {{ !hiddenColumns[columnId]
          ? taskTypeMap.get(columnId).name
          : '' }}
      </span>

      <chevron-down-icon
        @click="$emit('show-header-menu', $event)"
        class="header-icon flexrow-item"
      />
    </div>
  </th>
</template>

<script>
import {
  ChevronDownIcon
} from 'vue-feather-icons'
import { mapGetters } from 'vuex'

export default {
  name: 'ValidationHeader',
  props: {
    hiddenColumns: Object,
    columnId: String,
    validationStyle: Object,
    taskTypeMap: Map,
    isStick: {
      type: Boolean,
      default: false
    },
    left: {
      type: String,
      default: '0px'
    },
    type: {
      type: String,
      default: 'assets'
    }
  },
  components: { ChevronDownIcon },
  computed: {
    ...mapGetters([
      'currentEpisode',
      'currentProduction',
      'isCurrentUserClient',
      'isTVShow'
    ])
  },
  methods: {
    taskTypePath (taskTypeId) {
      const route = {
        name: 'task-type',
        params: {
          production_id: this.currentProduction.id,
          task_type_id: taskTypeId,
          type: this.type
        }
      }

      if (this.isTVShow && this.currentEpisode) {
        route.name = 'episode-task-type'
        route.params.episode_id = this.currentEpisode.id
      }

      return route
    }
  }
}
</script>

<style lang="scss" scoped>

th.metadata-descriptor {
  min-width: 120px;
  max-width: 120px;
  width: 120px;
  overflow-wrap: break-word;
  hyphens: auto;
}

.task-type-name {
  max-width: 95%;
}

</style>
