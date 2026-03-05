<template>
  <div :class="{ field: withMargin }">
    <label class="label" v-if="label.length > 0">
      {{ label }}
    </label>
    <div class="task-type-combo" :class="{ disabled, shy }">
      <div class="flexrow selector" @click="toggleTaskTypeList">
        <div class="selected-task-type-line flexrow-item">
          <task-type-name :task-type="currentTaskType" v-if="currentTaskType" />
        </div>
        <chevron-down-icon class="ml05 down-icon flexrow-item" />
      </div>
      <teleport to="body">
        <div
          class="select-input"
          :class="[{ 'open-top': openTop }, { dark: isDarkTheme }]"
          :style="tooltipStyle"
          v-if="showTaskTypeList"
        >
          <div
            class="task-type-line"
            :key="taskType.id"
            @click="!disabled && selectTaskType(taskType)"
            v-for="taskType in taskTypeList"
          >
            <task-type-name :task-type="taskType" />
          </div>
        </div>
      </teleport>
    </div>
    <combobox-mask :displayed="showTaskTypeList" @click="toggleTaskTypeList" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import { ChevronDownIcon } from 'lucide-vue-next'

import ComboboxMask from '@/components/widgets/ComboboxMask.vue'
import TaskTypeName from '@/components/widgets/TaskTypeName.vue'

const { t } = useI18n()
const store = useStore()

const props = defineProps({
  disabled: {
    default: false,
    type: Boolean
  },
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
  },
  withMargin: {
    default: true,
    type: Boolean
  }
})

const emit = defineEmits(['change', 'update:modelValue'])

const showTaskTypeList = ref(false)
const tooltipPosition = ref({ top: 0, left: 0 })

const taskTypeMap = computed(() => store.getters.taskTypeMap)
const isDarkTheme = computed(() => store.getters.isDarkTheme)

const defaultPlaceholder = computed(() => {
  return t('task_types.add_task_type_placeholder')
})

const currentTaskType = computed(() => {
  if (props.modelValue) {
    return taskTypeMap.value.get(props.modelValue)
  } else if (props.addPlaceholder) {
    return {
      name: props.placeholder ?? defaultPlaceholder.value,
      color: '#E5E5E5',
      id: ''
    }
  } else {
    return props.taskTypeList[0]
  }
})

const tooltipStyle = computed(() => {
  return {
    top: tooltipPosition.value.top + 'px',
    left: tooltipPosition.value.left + 'px'
  }
})

function selectTaskType(taskType) {
  emit('update:modelValue', taskType.id)
  emit('change', taskType.id)
  showTaskTypeList.value = false
}

function toggleTaskTypeList(event) {
  if (props.disabled) {
    return
  }

  showTaskTypeList.value = !showTaskTypeList.value

  if (!showTaskTypeList.value) {
    return
  }

  const curDiv = event.currentTarget
  const rect = curDiv.getBoundingClientRect()
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const scrollLeft =
    window.pageXOffset || document.documentElement.scrollLeft
  tooltipPosition.value = {
    top: rect.top + scrollTop + 35,
    left: rect.left + scrollLeft
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

  &.disabled {
    pointer-events: none;
    cursor: not-allowed;
    opacity: 0.6;
  }

  &:hover {
    border: 1px solid $green;
  }
}

.selected-task-type-line {
  background: var(--background);
  flex: 1;
  margin: 0;
  padding: 0.4em;
  max-width: calc(100% - 27px);

  .task-type-name {
    align-content: center;
    white-space: normal;
  }
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

  .disabled & {
    color: $grey;
  }
}

.select-input {
  background: $white;
  border: 1px solid var(--border);
  margin-left: -1px;
  max-height: 200px;
  overflow-y: auto;
  position: absolute;
  width: 195px;
  z-index: 1000;

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
