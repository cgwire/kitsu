<template>
  <div>
    <div
      class="combo"
      :class="{
        open: showList,
        reversed: isReversed || openUp,
        thin
      }"
      ref="select"
    >
      <div
        class="flexrow"
        :title="title"
        role="combobox"
        tabindex="0"
        aria-haspopup="listbox"
        :aria-expanded="showList"
        :aria-activedescendant="
          activeIndex > -1 ? optionId(activeIndex) : undefined
        "
        @click="toggleList()"
        @keydown="onKeydown"
      >
        <div class="selected-line mr05 ellipsis nowrap">
          {{ title }}
        </div>
        <chevron-down-icon class="down-icon flexrow-item" />
      </div>
      <div
        ref="list"
        class="select-input"
        :class="{ 'align-right': alignRight }"
        role="listbox"
        aria-multiselectable="true"
        v-if="showList"
      >
        <div
          :id="optionId(index)"
          :key="option.value"
          class="option-line flexrow"
          role="option"
          :aria-selected="!!modelValue[option.value]"
          @click="onUpdateValue(option.value)"
          v-for="(option, index) in optionList"
        >
          <toggle-button
            :label="$slots.option ? '' : option.label"
            :model-value="!!modelValue[option.value]"
          />
          <span class="ml05" v-if="$slots.option">
            <slot name="option" :option="option" />
          </span>
        </div>
      </div>
    </div>
    <div
      class="c-mask"
      :class="{
        'is-active': showList
      }"
      @click="toggleList()"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { ChevronDownIcon } from 'lucide-vue-next'

import { useComboboxKeyboard } from '@/composables/comboboxKeyboard'

import ToggleButton from '@/components/widgets/ToggleButton.vue'

const MAX_VISIBLE_OPTIONS = 7

const emit = defineEmits(['change', 'update:model-value'])

const props = defineProps({
  isReversed: {
    type: Boolean,
    default: false
  },
  modelValue: {
    type: Object,
    default: () => ({})
  },
  options: {
    type: Array,
    default: () => []
  },
  thin: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  }
})

const lastScrollPosition = ref(0)
const list = ref(null)
const showList = ref(false)
const select = ref(null)
const alignRight = ref(false)
const openUp = ref(false)

const optionList = computed(() => {
  return props.isReversed ? props.options.slice().reverse() : props.options
})

const toggleList = () => {
  if (showList.value) {
    lastScrollPosition.value = list.value?.scrollTop || 0
  }
  showList.value = !showList.value
  if (showList.value) {
    // Reset before measuring: a list already flipped always fits.
    alignRight.value = false
    openUp.value = false
    nextTick(() => {
      // Measured after the first default-position paint: the list size is
      // only known once its options are rendered.
      const rect = list.value?.getBoundingClientRect()
      alignRight.value = !!rect && rect.right > window.innerWidth
      if (rect && rect.bottom > window.innerHeight) {
        const comboTop = select.value.getBoundingClientRect().top
        openUp.value = comboTop >= rect.height
      }
      const top =
        lastScrollPosition.value ||
        (props.isReversed && list.value?.scrollHeight) ||
        0
      list.value?.scrollTo?.({ top })
    })
  }
}

const onUpdateValue = key => {
  const value = !props.modelValue[key]
  emit('update:model-value', {
    ...props.modelValue,
    [key]: value
  })
  emit('change', { key, value })
}

const { activeIndex, onKeydown, optionId } = useComboboxKeyboard({
  isOpen: showList,
  toggle: toggleList,
  optionsLength: () => optionList.value.length,
  onSelect: index => onUpdateValue(optionList.value[index].value),
  listRef: list
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
  max-width: 400px;
  padding: 0.5em;
  position: relative;
  vertical-align: middle;

  &.open {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }

  &:hover {
    border: 1px solid $green;
  }
}

.option-line {
  background: $white;
  border-bottom: 1px solid $light-grey-light;
  cursor: pointer;
  margin: 0;
  padding: 0.8em;
  min-width: 250px;

  &:hover {
    background: $purple;
  }
}

.down-icon {
  width: 15px;
  min-width: 15px;
  margin-right: 0.4em;
  color: $green;
}

.select-input {
  background: var(--background);
  border: 1px solid $light-grey-light;
  border-bottom-left-radius: 1em;
  border-bottom-right-radius: 1em;
  border-top-right-radius: 1em;
  left: 0;
  margin-left: -1px;
  // Each row: 0.8em padding × 2 + 1.5em line-height + 1px border
  max-height: calc(v-bind(MAX_VISIBLE_OPTIONS) * (3.1em + 1px) + 2px);
  overflow-x: hidden;
  overflow-y: auto;
  position: absolute;
  width: inherit;
  top: 38px;
  z-index: 2000;

  .option-line {
    padding-right: 0.4em;
    white-space: nowrap;
  }

  &.align-right {
    border-top-left-radius: 1em;
    border-top-right-radius: 0;
    left: auto;
    margin-left: 0;
    margin-right: -1px;
    right: 0;
  }
}

.c-mask {
  z-index: 199;
}

.thin {
  height: 34px;
  padding: 4px 0 3px 10px;
  margin-bottom: 3px;

  .select-input {
    top: 30px;
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
    bottom: 100%;
    top: auto;

    &.align-right {
      border-bottom-left-radius: 1em;
    }
  }
}
</style>
