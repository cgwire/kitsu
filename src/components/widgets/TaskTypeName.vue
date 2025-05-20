<template>
  <router-link
    :to="targetRoute"
    v-if="
      isLink &&
      productionId &&
      !isCurrentUserClient &&
      taskType.for_entity !== 'Concept'
    "
  >
    <span
      class="tag task-type-name"
      :style="{
        'border-left': '4px solid ' + color,
        'border-top-right-radius': rounded ? '5px' : '0px',
        'border-bottom-right-radius': rounded ? '5px' : '0px'
      }"
    >
      {{ taskType.name }}
    </span>
  </router-link>
  <div
    :class="{
      tag: true,
      'task-type-name': true,
      'no-link': true,
      deletable,
      canceled: disable,
      thin: thin
    }"
    :style="{
      'border-left': '4px solid ' + color,
      'border-top-right-radius': rounded ? '5px' : '0px',
      'border-bottom-right-radius': rounded ? '5px' : '0px'
    }"
    v-else
  >
    {{ taskType.name }}
    <span class="delete-times" v-if="deletable" @click="$emit('delete')">
      ×
    </span>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import { pluralizeEntityType } from '@/lib/path'

export default {
  name: 'task-type-name',

  props: {
    isLink: {
      type: Boolean,
      default: true
    },
    deletable: {
      type: Boolean,
      default: false
    },
    disable: {
      type: Boolean,
      default: false
    },
    productionId: {
      type: String,
      default: null
    },
    rounded: {
      type: Boolean,
      default: false
    },
    taskId: {
      type: String,
      default: null
    },
    taskType: {
      type: Object,
      default: null
    },
    thin: {
      type: Boolean,
      default: false
    }
  },

  emits: ['delete'],

  computed: {
    ...mapGetters(['isCurrentUserClient']),

    color() {
      return this.taskType.color?.toUpperCase() === '#000000'
        ? '$grey-strong'
        : this.taskType.color
    },

    targetRoute() {
      let route = {}
      if (this.taskId) {
        if (this.$route.params.episode_id) {
          route = {
            name: 'episode-task',
            params: {
              production_id: this.productionId,
              task_id: this.taskId,
              episode_id: this.$route.params.episode_id,
              type: pluralizeEntityType(this.taskType.for_entity)
            }
          }
        } else {
          route = {
            name: 'task',
            params: {
              production_id: this.productionId,
              task_id: this.taskId,
              type: pluralizeEntityType(this.taskType.for_entity)
            }
          }
        }
      } else if (this.taskType.for_entity === 'Episode') {
        route = {
          name: 'episodes-task-type',
          params: {
            production_id: this.productionId,
            task_type_id: this.taskType.id
          }
        }
      } else {
        route = {
          name: 'task-type',
          params: {
            production_id: this.productionId,
            task_type_id: this.taskType.id,
            type: pluralizeEntityType(this.taskType.for_entity)
          }
        }

        if (this.taskType.episode_id || this.$route.params.episode_id) {
          route.name = 'episode-task-type'
          route.params.episode_id =
            this.taskType.episode_id || this.$route.params.episode_id
        }
      }
      return route
    }
  }
}
</script>

<style lang="scss" scoped>
.tag {
  border-radius: 0;
  color: var(--text);
  font-size: 0.9em;
  font-weight: 600;
  line-height: 0.8em;
  padding: 0 0.7em;
  margin: 0;

  &.thin {
    font-size: 0.7em;
    line-height: 0.6em;
    padding: 0 0.5em;
  }
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
  color: black;
}

.no-link {
  color: var(--text);
  cursor: default;
}
</style>
