<template>
  <div :class="{ field: withMargin }">
    <label class="label" v-if="label.length > 0">
      {{ label }}
    </label>
    <div
      :class="{
        combo: true,
        thin: thin,
        reversed: isReversed,
        open: showList,
        shy: shy
      }"
      ref="selectRef"
    >
      <div class="flexrow" @click="toggleList" :title="renderedValue">
        <div class="selected-line flexrow-item ellipsis">
          {{ renderedValue }}
        </div>
        <chevron-down-icon class="down-icon flexrow-item" />
      </div>
      <div class="select-input" v-if="showList">
        <div
          :key="option.id"
          class="option-line flexrow"
          @click="!disabled && selectOption(option)"
          v-for="option in optionList"
        >
          <input
            type="checkbox"
            class="mr05"
            :checked="isChecked(option)"
            :disabled="disabled"
          />
          {{ getOptionLabel(option) }}
        </div>
      </div>
    </div>
    <div
      @click="toggleList"
      :class="{
        'c-mask': true,
        'is-active': showList
      }"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { ChevronDownIcon } from 'lucide-vue-next'

import { sortByValue } from '@/lib/sorting'

const { t } = useI18n()

const props = defineProps({
  disabled: {
    default: false,
    type: Boolean
  },
  label: {
    default: '',
    type: String
  },
  options: {
    default: () => [],
    type: Array
  },
  modelValue: {
    default: '',
    type: String
  },
  localeKeyPrefix: {
    default: '',
    type: String
  },
  isReversed: {
    default: false,
    type: Boolean
  },
  shy: {
    default: false,
    type: Boolean
  },
  thin: {
    default: false,
    type: Boolean
  },
  withMargin: {
    default: true,
    type: Boolean
  }
})

const emit = defineEmits(['change', 'update:modelValue'])

const showList = ref(false)
const selectRef = ref(null)
let lastScrollPosition = 0

const optionList = computed(() => {
  const sortedOptions = sortByValue([...props.options])
  if (props.isReversed) {
    sortedOptions.reverse()
  }
  return sortedOptions
})

const renderedValue = computed(() => {
  return props.modelValue.split(',').filter(Boolean).sort().join(', ')
})

const selectOption = option => {
  let values = props.modelValue.split(',').filter(Boolean)
  if (values.includes(option.value)) {
    values.splice(values.indexOf(option.value), 1)
  } else {
    values = optionList.value
      .filter(
        oldOption => isChecked(oldOption) || oldOption.value === option.value
      )
      .map(oldOption => oldOption.value)
  }
  const value = values.join(',')
  emit('update:modelValue', value)
  emit('change', value)
}

const toggleList = () => {
  if (showList.value) {
    lastScrollPosition = selectRef.value.scrollTop
  }
  showList.value = !showList.value
  if (showList.value) {
    nextTick(() => {
      selectRef.value?.scrollTo({ top: lastScrollPosition, left: 0 })
    })
  }
}

const getOptionLabel = option => {
  if (props.localeKeyPrefix && option.label) {
    return t(props.localeKeyPrefix + option.label.toLowerCase())
  }
  return option.label
}

const isChecked = option => {
  const values = props.modelValue.split(',')
  return values.includes(option.value)
}

watch(showList, () => {
  if (showList.value) {
    nextTick(() => {
      if (!selectRef.value?.children) return
      let list = null
      for (const child of selectRef.value.children) {
        if (child.className !== 'flexrow') {
          list = child
        }
      }
      list?.scrollTo({ top: optionList.value.length * 60 })
    })
  }
})
</script>

<style lang="scss" scoped>
.dark {
  .select-input,
  .selected-line,
  .option-line,
  .combo {
    color: var(--text);
    background: $dark-grey-light;
    border-color: $dark-grey;
  }

  .option-line:hover {
    background: $dark-purple;
  }
}

.combo {
  background: $white;
  border: 1px solid $light-grey-light;
  border-radius: 10px;
  user-select: none;
  cursor: pointer;
  display: inline-block;
  margin: 0;
  margin-top: 1px;
  width: 100%;
  padding: 0.5em;
  position: relative;
  vertical-align: middle;

  &.open {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }

  &.shy {
    background: transparent;
    min-width: 100%;
    width: 100%;
    border: 1px solid transparent;
    border-radius: 5px;

    .down-icon {
      opacity: 0;
    }

    .selected-line {
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
}

.combo:hover {
  border: 1px solid $green;
}

.selected-line {
  flex: 1;
  white-space: nowrap;
}

.option-line {
  background: $white;
  border-bottom: 1px solid $light-grey-light;
  cursor: pointer;
  margin: 0;
  padding: 0.5em;
  min-width: 150px;
  width: inherit;

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
  background: var(--background);
  border: 1px solid $light-grey-light;
  border-bottom-left-radius: 1em;
  border-bottom-right-radius: 1em;
  left: 0;
  margin-left: -1px;
  max-height: 180px;
  overflow-x: hidden;
  overflow-y: auto;
  position: absolute;
  min-width: 150px;
  top: 38px;
  z-index: 2000;

  .option-line {
    padding-right: 27px;
    white-space: nowrap;
  }
}

.c-mask {
  z-index: 199;
}

.field .label {
  padding-top: 5px;
}

.thin {
  height: 30px;
  padding: 3px 0 3px 10px;
  margin-bottom: 3px;

  .select-input {
    top: 29px;
  }
}

.reversed {
  &.open {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    border-bottom-left-radius: 1em;
    border-bottom-right-radius: 1em;
  }

  .select-input {
    border-top-left-radius: 1em;
    border-top-right-radius: 1em;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    height: 180px;
    top: -180px;
  }
}
</style>
