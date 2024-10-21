<template>
  <div class="field">
    <label class="label" v-if="label.length > 0">
      {{ label }}
    </label>
    <div class="task-type-combo" :class="{ shy }">
      <div class="flexrow selector" @click="toggleTaskTypeList">
        <div class="selected-task-type-line flexrow-item">
          <task-type-name :task-type="currentTaskType" v-if="currentTaskType" />
        </div>
        <chevron-down-icon class="ml05 down-icon flexrow-item" />
      </div>
      <div
        class="select-input"
        :class="{ 'open-top': openTop }"
        ref="select"
        v-if="showTaskTypeList"
      >
        <div
          class="task-type-line"
          :key="taskType.id"
          @click="selectTaskType(taskType)"
          v-for="taskType in taskTypeList"
        >
          <task-type-name :task-type="taskType" />
        </div>
      </div>
    </div>
    <combobox-mask :displayed="showTaskTypeList" @click="toggleTaskTypeList" />
  </div>
</template>

<script>
import { ChevronDownIcon } from 'lucide-vue-next'
import { mapGetters } from 'vuex'

import ComboboxMask from '@/components/widgets/ComboboxMask.vue'
import TaskTypeName from '@/components/widgets/TaskTypeName.vue'

export default {
  name: 'combobox-task-type',

  components: {
    ChevronDownIcon,
    ComboboxMask,
    TaskTypeName
  },

  emits: ['update:modelValue'],

  data() {
    return {
      showTaskTypeList: false
    }
  },

  props: {
    label: {
      default: '',
      type: String
    },
    taskTypeList: {
      default: () => [],
      type: Array
    },
    modelValue: {
      default: '',
      type: String
    },
    shy: {
      default: false,
      type: Boolean
    },
    addPlaceholder: {
      default: false,
      type: Boolean
    },
    placeholder: {
      type: String
    },
    openTop: {
      default: false,
      type: Boolean
    }
  },

  computed: {
    ...mapGetters(['taskTypeMap']),

    currentTaskType() {
      if (this.modelValue) {
        return this.taskTypeMap.get(this.modelValue)
      } else if (this.addPlaceholder) {
        return {
          name: this.placeholder ?? this.defaultPlaceholder,
          color: '#E5E5E5',
          id: ''
        }
      } else {
        return this.taskTypeList[0]
      }
    },

    defaultPlaceholder() {
      return this.$t('task_types.add_task_type_placeholder')
    }
  },

  methods: {
    selectTaskType(taskType) {
      this.$emit('update:modelValue', taskType.id)
      this.showTaskTypeList = false
    },

    toggleTaskTypeList() {
      this.showTaskTypeList = !this.showTaskTypeList
    }
  }
}
</script>

<style lang="scss" scoped>
.dark {
  .task-type-line:hover {
    background: $dark-purple;
  }
}

.task-type-combo {
  background: var(--background);
  min-width: 200px;
  width: 200px;
  border: 1px solid var(--border);
  user-select: none;
  cursor: pointer;
  border-radius: 10px;
  margin: 0;
  padding: 0.15em;
  position: relative;
}

.task-type-combo:hover {
  border: 1px solid $green;
}

.selected-task-type-line {
  background: var(--background);
  padding: 0.4em;
  flex: 1;
}

.task-type-line {
  background: var(--background);
  cursor: pointer;
  padding: 0.4em;
  margin: 0;

  &:hover {
    background: $purple;
  }
}

.down-icon {
  width: 15px;
  min-width: 15px;
  margin-right: 0.4em;
  color: $green;
  cursor: pointer;
}

.select-input {
  background: $white;
  border: 1px solid var(--border);
  margin-left: -1px;
  max-height: 200px;
  overflow-y: auto;
  position: absolute;
  width: 195px;
  z-index: 300;

  &.open-top {
    bottom: 41px;
  }
}

.task-type-combo.shy {
  background: transparent;
  min-width: 100%;
  width: 100%;
  border: 1px solid transparent;
  border-radius: 5px;

  .down-icon {
    opacity: 0;
  }

  .selected-task-type-line,
  .selected-task-type {
    background: transparent;
  }

  &:hover {
    background: var(--background);
    border: 1px solid var(--border-alt);
    .down-icon {
      opacity: 1;
    }
  }
}

.field .label {
  padding-top: 5px;
}

.task-type-name.no-link {
  cursor: inherit;
}
</style>
