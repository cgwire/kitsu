<template>
<router-link
  :to="taskTypePath"
  v-if="productionId && !isCurrentUserClient"
>
  <span
    class="tag task-type-name"
    :style="{ 'border-left': '4px solid ' + color }"
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
    canceled: disable
  }"
  :style="{ 'border-left': '4px solid ' + color }"
  v-else
>
  {{ taskType.name }}
  <span class="delete-times" v-if="deletable" @click="$emit('delete')">
    ×
  </span>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'task-type-name',
  components: {
  },

  props: {
    taskType: {
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
    },
    disable: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    ...mapGetters([
      'isCurrentUserClient',
      'isTaskTypePriorityHigherById'
    ]),

    color () {
      if (this.taskType.color.toUpperCase() === '#000000') return '$grey-strong'
      else return this.taskType.color
    },

    taskTypePath () {
      let route = {}
      if (this.taskType.for_entity === 'Episode') {
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
            type: this.$tc(this.taskType.for_entity.toLowerCase(), 2) + 's'
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
  font-weight: 600;
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
