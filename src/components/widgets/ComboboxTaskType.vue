<template>
  <div :class="{ field: withMargin }">
    <label class="label" v-if="label.length > 0">
      {{ label }}
    </label>
    <div class="task-type-combo" :class="{ disabled, shy }">
      <div
        class="flexrow selector"
        ref="triggerRef"
        role="combobox"
        :tabindex="disabled ? -1 : 0"
        aria-haspopup="listbox"
        :aria-expanded="showTaskTypeList"
        :aria-activedescendant="
          activeIndex > -1 ? optionId(activeIndex) : undefined
        "
        @click="toggleTaskTypeList"
        @keydown="onKeydown"
      >
        <div class="selected-task-type-line flexrow-item">
          <task-type-name :task-type="currentTaskType" v-if="currentTaskType" />
        </div>
        <chevron-down-icon class="ml05 down-icon flexrow-item" />
      </div>
      <teleport :to="fullScreenContainer || 'body'">
        <div
          class="select-input"
          ref="listRef"
          role="listbox"
          :class="[
            { 'open-top': openTop },
            { dark: isDarkTheme },
            { 'in-full-screen': fullScreenContainer }
          ]"
          :style="tooltipStyle"
          v-if="showTaskTypeList"
        >
          <div
            :id="optionId(index)"
            :key="taskType.id"
            class="task-type-line"
            role="option"
            :aria-selected="taskType.id === currentTaskType?.id"
            @click="!disabled && selectTaskType(taskType)"
            v-for="(taskType, index) in taskTypeList"
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
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import { ChevronDownIcon } from 'lucide-vue-next'

import { useComboboxKeyboard } from '@/composables/comboboxKeyboard'
import { useFullScreenContainer } from '@/composables/fullScreen'

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

const emit = defineEmits(['change', 'update:model-value'])

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

const selectTaskType = taskType => {
  emit('update:model-value', taskType.id)
  emit('change', taskType.id)
  showTaskTypeList.value = false
}

const triggerRef = ref(null)
const fullScreenContainer = useFullScreenContainer(() => triggerRef.value)

const toggleTaskTypeList = event => {
  if (props.disabled) {
    return
  }

  showTaskTypeList.value = !showTaskTypeList.value

  if (!showTaskTypeList.value) {
    return
  }

  // Keyboard-triggered opens (via useComboboxKeyboard) call toggle() with no
  // event, so fall back to the trigger element for positioning.
  const curDiv = event?.currentTarget ?? triggerRef.value
  const rect = curDiv.getBoundingClientRect()
  // An element in full screen starts at the top left of the screen, whatever
  // the scroll of the page.
  const isInFullScreen = Boolean(fullScreenContainer.value)
  const scrollTop = isInFullScreen
    ? 0
    : window.pageYOffset || document.documentElement.scrollTop
  const scrollLeft = isInFullScreen
    ? 0
    : window.pageXOffset || document.documentElement.scrollLeft
  tooltipPosition.value = {
    top: rect.top + scrollTop + 35,
    left: rect.left + scrollLeft
  }
}

const listRef = ref(null)
const { activeIndex, onKeydown, optionId } = useComboboxKeyboard({
  isOpen: showTaskTypeList,
  toggle: toggleTaskTypeList,
  optionsLength: () => props.taskTypeList.length,
  onSelect: index => {
    if (!props.disabled) selectTaskType(props.taskTypeList[index])
  },
  listRef
})

// The list would stay where the full screen put it, away from its trigger.
watch(fullScreenContainer, () => {
  showTaskTypeList.value = false
})
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
  z-index: $z-modal;

  &.open-top {
    bottom: 41px;
  }

  // Over the modals (Bulma: 1986) the element in full screen holds with it.
  &.in-full-screen {
    z-index: 2000;
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
