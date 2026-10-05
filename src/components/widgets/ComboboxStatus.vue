<template>
  <div
    :class="{
      field: withMargin,
      'field--narrow': narrow
    }"
  >
    <label class="label" v-if="label">
      {{ label }}
    </label>
    <div class="status-combo" :style="comboStyles">
      <div
        class="flexrow"
        role="combobox"
        tabindex="0"
        aria-haspopup="listbox"
        :aria-expanded="showStatusList"
        :aria-activedescendant="
          activeIndex > -1 ? optionId(activeIndex) : undefined
        "
        @click="toggleStatusList"
        @keydown="onKeydown"
      >
        <div class="selected-status-line flexrow-item">
          <span
            class="tag"
            :style="{
              background: backgroundColor(currentStatus),
              color: color(currentStatus)
            }"
            :title="currentStatus.name"
            v-if="currentStatus"
          >
            {{ currentStatus.short_name }}
          </span>
        </div>
        <chevron-down-icon
          class="down-icon flexrow-item"
          :class="{
            white: colorOnly
          }"
        />
      </div>
      <div
        class="select-input"
        ref="listRef"
        role="listbox"
        :class="{
          'open-top': openTop
        }"
        v-if="showStatusList"
      >
        <div
          :id="optionId(index)"
          :key="status.id"
          class="status-line"
          role="option"
          :aria-selected="status.id === currentStatus?.id"
          @click="selectStatus(status)"
          v-for="(status, index) in sortedTaskStatusList"
        >
          <span
            class="tag"
            :style="{
              background: backgroundColor(status),
              color: color(status)
            }"
            :title="status.name"
          >
            {{ status.short_name }}
          </span>
        </div>
      </div>
    </div>
    <combobox-mask :displayed="showStatusList" @click="toggleStatusList" />
  </div>
</template>

<script setup>
// Imports
// --------------------------------------------------------------------------
import { ChevronDownIcon } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { useCombobox } from '@/composables/combobox'
import { useComboboxKeyboard } from '@/composables/comboboxKeyboard'
import { useTaskStatusStyle } from '@/composables/taskStatus'
import { sortTaskStatuses } from '@/lib/sorting'

import ComboboxMask from '@/components/widgets/ComboboxMask.vue'

const { t } = useI18n()
const store = useStore()
const { backgroundColor, color } = useTaskStatusStyle()

// Props / Emits
// --------------------------------------------------------------------------
const props = defineProps({
  colorOnly: {
    default: false,
    type: Boolean
  },
  label: {
    default: '',
    type: String
  },
  taskStatusList: {
    default: () => [],
    type: Array
  },
  modelValue: {
    default: '',
    type: String
  },
  narrow: {
    default: false,
    type: Boolean
  },
  withMargin: {
    default: true,
    type: Boolean
  },
  addPlaceholder: {
    default: false,
    type: Boolean
  },
  openTop: {
    default: false,
    type: Boolean
  },
  productionId: {
    default: '',
    type: String
  }
})

const emit = defineEmits(['update:model-value'])

// State
// --------------------------------------------------------------------------
const {
  showList: showStatusList,
  toggle: toggleStatusList,
  select: selectStatus
} = useCombobox(emit)

const listRef = ref(null)
const { activeIndex, onKeydown, optionId } = useComboboxKeyboard({
  isOpen: showStatusList,
  toggle: toggleStatusList,
  optionsLength: () => sortedTaskStatusList.value.length,
  onSelect: index => selectStatus(sortedTaskStatusList.value[index]),
  listRef
})

// Computed
// --------------------------------------------------------------------------
const productionMap = computed(() => store.getters.productionMap)
const taskStatusMap = computed(() => store.getters.taskStatusMap)

const sortedTaskStatusList = computed(() => {
  if (props.productionId) {
    const production = productionMap.value.get(props.productionId)
    return sortTaskStatuses(props.taskStatusList, production)
  } else {
    return props.taskStatusList
  }
})

const currentStatus = computed(() => {
  if (props.modelValue) {
    return taskStatusMap.value.get(props.modelValue)
  } else if (props.addPlaceholder) {
    return {
      short_name: t('task_status.add_task_status_placeholder'),
      color: '#999'
    }
  } else {
    return props.taskStatusList[0]
  }
})

const comboStyles = computed(() => ({
  background: props.colorOnly
    ? backgroundColor(currentStatus.value)
    : undefined,
  color: props.colorOnly ? color(currentStatus.value) : 'inherit',
  'border-top-left-radius': props.colorOnly ? '20px' : '10px',
  'border-top-right-radius': props.colorOnly ? '0px' : '10px',
  'border-bottom-left-radius': showStatusList.value
    ? '0'
    : props.colorOnly
      ? '20px'
      : '10px',
  'border-bottom-right-radius': showStatusList.value
    ? '0'
    : props.colorOnly
      ? '0px'
      : '10px'
}))
</script>

<style lang="scss" scoped>
.dark {
  .select-input,
  .status-line {
    background: $dark-grey-light;
  }
}

.status-combo {
  display: inline-block;
  background: var(--background);
  min-width: 80px;
  border: 1px solid var(--border);
  user-select: none;
  cursor: pointer;
  margin: 0;
  margin-top: 1px;
  vertical-align: middle;
  position: relative;
}

.status-combo:hover {
  border: 1px solid $green;
}

.field--narrow .status-combo {
  padding: 0;
  margin: 0;
  border-radius: 0;
}

.selected-status-line {
  text-transform: uppercase;
  flex: 1;
  margin-right: 0;
}

.status-line {
  background: $white;
  cursor: pointer;
  margin: 0;
  text-transform: uppercase;

  &:hover {
    background: var(--purple);
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
  min-width: calc(100% + 2px);
  position: absolute;
  border: 1px solid var(--border);
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  z-index: $z-dropdown;
  margin-left: -1px;
  max-height: 180px;
  top: 38px;
  left: 0;
  overflow-y: auto;

  &.open-top {
    top: auto;
    bottom: 41px;
  }
}

.field--narrow {
  .select-input {
    top: 33px;
  }
}

.field .label {
  padding-top: 5px;
}

.down-icon.white {
  color: $white;
  margin-right: 0.8em;
}
</style>
