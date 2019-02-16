<template>
<div
  :class="{
    'supervisor-entity': true,
    selected: selected
  }"
  @click="select"
>
  <span
    class="entity-block"
  >
    <entity-thumbnail
      :entity="entity"
      :square="true"
      :empty-width="60"
      :empty-height="60"
      :width="60"
      :height="60"
      :with-link="false"
    />
    <span class="entity-name">
      {{ entity.name }}
    </span>
  </span>
  <validation-tag
    :task="task"
    :is-static="true"
    :pointer="true"
    v-if="task"
  />
</div>
</template>

<script>
import { mapGetters } from 'vuex'

import EntityThumbnail from '../../widgets/EntityThumbnail'
import ValidationTag from '../../widgets/ValidationTag'

export default {
  name: 'task-type-entity-block',

  components: {
    EntityThumbnail,
    ValidationTag
  },

  props: {
    entity: {
      default: () => {},
      type: Object
    },
    taskType: {
      default: () => {},
      type: Object
    },
    entityType: {
      default: 'shot',
      type: String
    },
    selected: {
      default: false,
      type: Boolean
    }
  },

  computed: {
    ...mapGetters([
      'currentEpisode',
      'currentProduction',
      'isCurrentUserClient',
      'taskMap'
    ]),

    task () {
      if (this.entity.validations[this.taskType.id]) {
        return this.taskMap[this.entity.validations[this.taskType.id]]
      } else {
        return null
      }
    }
  },

  methods: {
    select (event) {
      const isUserClick = event && event.isUserClick !== false
      if (!this.isCurrentUserClient) {
        const data = {
          entity: this.entity,
          column: this.taskType,
          task: this.task,
          isCtrlKey: event ? event.ctrlKey : false,
          isShiftKey: event ? event.shiftKey : false,
          isUserClick: isUserClick
        }
        this.$emit(this.selected ? 'unselect' : 'select', data)
      }
    }
  }
}
</script>

<style scoped>
.dark .selected {
  background-color: #5E60BA;
}

.selected {
  border: 0;
  border-radius: 0.5em;
  background-color: #8F91EB;
}

.supervisor-entity {
  display: flex;
  flex-direction: column;
  max-width: 80px;
  min-width: 80px;
  margin-right: 0.5em;
  margin-bottom: 2em;
  font-size: 0.8em;
  text-align: center;
  word-wrap: break-word;
  cursor: pointer;
  border: 0;
  padding: 0;
  padding: 0.6em;
  transition: background ease 0.3s;
}

.entity-block {
  flex: 1;
}

.thumbnail-picture {
  margin: 0 auto;
}
</style>
