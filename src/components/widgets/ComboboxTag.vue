<template>
  <div :class="{ field: withMargin }">
    <label class="label" v-if="label.length > 0">
      {{ label }}
    </label>
    <div
      class="combo"
      :class="{
        thin,
        above: isAbove,
        open: showList,
        shy
      }"
      ref="selectRef"
    >
      <div
        class="flexrow"
        :title="renderedValue"
        role="combobox"
        tabindex="0"
        aria-haspopup="listbox"
        :aria-expanded="showList"
        :aria-controls="showList ? listId : undefined"
        :aria-activedescendant="
          activeIndex > -1 ? optionId(activeIndex) : undefined
        "
        @click="toggleList"
        @keydown="onKeydown"
      >
        <div class="selected-line filler nowrap ellipsis">
          {{ renderedValue }}
        </div>
        <chevron-down-icon class="down-icon" />
      </div>
    </div>
    <!-- Out of the list cells and modals, which clip their overflow. -->
    <teleport to=".theme" v-if="showList">
      <div class="c-mask is-active" @click="toggleList"></div>
      <div
        :id="listId"
        class="select-input"
        :class="{ above: isAbove, shy }"
        :style="listStyle"
        ref="listRef"
        role="listbox"
        aria-multiselectable="true"
      >
        <!-- mousedown.prevent keeps the focus and the keys on the combo. Set
             on the options only: a press on the scrollbar stays native. -->
        <div
          :id="optionId(index)"
          :key="option.id"
          class="option-line flexrow"
          role="option"
          :aria-selected="isChecked(option)"
          @click="!disabled && selectOption(option)"
          @mousedown.prevent
          v-for="(option, index) in optionList"
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
    </teleport>
  </div>
</template>

<script setup>
import { ChevronDownIcon } from 'lucide-vue-next'
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { useComboboxKeyboard } from '@/composables/comboboxKeyboard'
import { getPopupStyle } from '@/lib/popup'
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
    type: [Number, String]
  },
  localeKeyPrefix: {
    default: '',
    type: String
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

const emit = defineEmits(['change', 'update:model-value'])

const showList = ref(false)
const isAbove = ref(false)
const listStyle = ref({})
const selectRef = ref(null)
const listRef = ref(null)
const listId = useId()

const selectedValues = computed(() => {
  const optionValues = props.options.map(option => option.value)
  return String(props.modelValue ?? '')
    .split(',')
    .filter(value => value && optionValues.includes(value))
})

const optionList = computed(() => sortByValue([...props.options]))

const renderedValue = computed(() => {
  return [...selectedValues.value].sort().join(', ')
})

const selectOption = option => {
  let values = [...selectedValues.value]
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
  emit('update:model-value', value)
  emit('change', value)
}

// Placed once rendered: its size depends on its options.
const placeList = () => {
  if (!listRef.value || !selectRef.value) return
  const { width, height } = listRef.value.getBoundingClientRect()
  const { bottom, left, maxHeight, top } = getPopupStyle(
    selectRef.value.getBoundingClientRect(),
    { width, height },
    { width: window.innerWidth, height: window.innerHeight },
    -1 // drawn attached to the combo, over its border
  )
  isAbove.value = bottom !== undefined
  listStyle.value = {
    bottom,
    left,
    // Also capped at the list height: it overrides the CSS max height.
    maxHeight: `${Math.min(parseFloat(maxHeight), height)}px`,
    top
  }
}

const toggleList = () => {
  isAbove.value = false
  listStyle.value = {}
  showList.value = !showList.value
  if (showList.value) nextTick(placeList)
}

const closeList = () => {
  if (showList.value) toggleList()
}

// Drawn over the page, the list neither follows its combo nor hides with
// the modal around it: it closes on any Escape and when the page under it
// scrolls or resizes.
const onWindowKeydown = event => {
  if (event.key === 'Escape') closeList()
}

const onWindowScroll = event => {
  if (event.target.contains?.(selectRef.value)) closeList()
}

const listenToWindow = isListening => {
  const method = isListening ? 'addEventListener' : 'removeEventListener'
  window[method]('keydown', onWindowKeydown)
  window[method]('resize', closeList)
  // Captured: the scroll of an element does not bubble.
  window[method]('scroll', onWindowScroll, true)
}

const getOptionLabel = option => {
  if (props.localeKeyPrefix && option.label) {
    return t(props.localeKeyPrefix + option.label.toLowerCase())
  }
  return option.label
}

const isChecked = option => {
  return selectedValues.value.includes(option.value)
}

const { activeIndex, onKeydown, optionId } = useComboboxKeyboard({
  isOpen: showList,
  toggle: toggleList,
  optionsLength: () => optionList.value.length,
  onSelect: index => {
    if (!props.disabled) selectOption(optionList.value[index])
  },
  listRef
})

watch(showList, listenToWindow)

onBeforeUnmount(() => listenToWindow(false))
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

.option-line {
  background: $white;
  border-bottom: 1px solid $light-grey-light;
  margin: 0;
  padding: 0.5em;
  min-width: 150px;
  width: inherit;

  &:hover {
    background: $purple;
  }
}

.down-icon {
  width: 20px;
  min-width: 20px;
  padding: 0 2px;
  color: $green;
}

.select-input {
  background: var(--background);
  border: 1px solid $light-grey-light;
  border-bottom-left-radius: 1em;
  border-bottom-right-radius: 1em;
  cursor: pointer;
  max-height: 180px;
  overflow-x: hidden;
  overflow-y: auto;
  position: fixed;
  min-width: 150px;
  user-select: none;
  z-index: 2000;

  // The text color of the list cells, where shy combos are drawn.
  &.shy {
    color: var(--text);
  }

  .option-line {
    padding-right: 27px;
    white-space: nowrap;
  }
}

// Over the modals (Bulma: 1986), under the list.
.c-mask {
  z-index: 1999;
}

.field .label {
  padding-top: 5px;
}

.thin {
  height: 30px;
  padding: 3px 0 3px 10px;
  margin-bottom: 3px;
}

.above {
  &.open {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    border-bottom-left-radius: 1em;
    border-bottom-right-radius: 1em;
  }

  &.select-input {
    border-top-left-radius: 1em;
    border-top-right-radius: 1em;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
}
</style>
