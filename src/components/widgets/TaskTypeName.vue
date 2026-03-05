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
      :class="{
        rounded
      }"
      :title="title"
    >
      {{ taskType.name }}
    </span>
  </router-link>
  <div
    class="tag task-type-name no-link"
    :class="{
      deletable,
      canceled: disable,
      rounded,
      thin: thin
    }"
    v-else
  >
    <span :title="title">
      {{ taskType.name }}
    </span>
    <span class="delete-times" v-if="deletable" @click="$emit('delete')">
      ×
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

import { pluralizeEntityType } from '@/lib/path'

const route = useRoute()
const store = useStore()

const props = defineProps({
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
  },
  transparent: {
    type: Boolean,
    default: false
  }
})

defineEmits(['delete'])

const isCurrentUserClient = computed(() => store.getters.isCurrentUserClient)

const color = computed(() => {
  return props.taskType.color?.toUpperCase() === '#000000'
    ? '#666'
    : props.taskType.color
})

const title = computed(() => {
  return `${props.taskType.for_entity} / ${props.taskType.name}`
})

const targetRoute = computed(() => {
  if (props.taskId) {
    if (route.params.episode_id) {
      return {
        name: 'episode-task',
        params: {
          production_id: props.productionId,
          task_id: props.taskId,
          episode_id: route.params.episode_id,
          type: pluralizeEntityType(props.taskType.for_entity)
        }
      }
    } else {
      return {
        name: 'task',
        params: {
          production_id: props.productionId,
          task_id: props.taskId,
          type: pluralizeEntityType(props.taskType.for_entity)
        }
      }
    }
  } else if (props.taskType.for_entity === 'Episode') {
    return {
      name: 'episodes-task-type',
      params: {
        production_id: props.productionId,
        task_type_id: props.taskType.id
      }
    }
  } else {
    const r = {
      name: 'task-type',
      params: {
        production_id: props.productionId,
        task_type_id: props.taskType.id,
        type: pluralizeEntityType(props.taskType.for_entity)
      }
    }

    if (props.taskType.episode_id || route.params.episode_id) {
      r.name = 'episode-task-type'
      r.params.episode_id =
        props.taskType.episode_id || route.params.episode_id
    }
    return r
  }
})
</script>

<style lang="scss" scoped>
.tag {
  border-left: 4px solid v-bind(color);
  border-radius: 0;
  color: var(--text);
  font-size: 0.9em;
  font-weight: 600;
  line-height: 0.8em;
  padding: 0 0.7em;
  margin: 0;

  &.deletable {
    padding-right: 0;
  }

  &.rounded {
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;
  }

  &.thin {
    font-size: 0.7em;
    line-height: 0.6em;
    padding: 0 0.5em;
  }

  .dark & {
    background: $dark-grey-lightest;
  }
}

.delete-times {
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: bold;
  padding-left: 7px;
  padding-bottom: 2px;
  padding-right: 0.7rem;

  &:hover {
    color: $black;
  }
}

.no-link {
  color: var(--text);
  cursor: default;
}
</style>
