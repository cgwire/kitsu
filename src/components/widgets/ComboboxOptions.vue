<template>
  <div>
    <div
      class="combo"
      :class="{
        open: showList,
        reversed: isReversed,
        thin
      }"
      ref="select"
    >
      <div class="flexrow" :title="title" @click="toggleList()">
        <div class="selected-line mr05 ellipsis nowrap">
          {{ title }}
        </div>
        <chevron-down-icon class="down-icon flexrow-item" />
      </div>
      <div ref="list" class="select-input" v-if="showList">
        <div
          :key="option.value"
          class="option-line flexrow"
          @click="onUpdateValue(option.value)"
          v-for="option in optionList"
        >
          <toggle-button
            :label="option.label"
            :model-value="modelValue[option.value]"
          />
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

import ToggleButton from '@/components/widgets/ToggleButton.vue'

const emit = defineEmits(['change', 'update:modelValue'])

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

const optionList = computed(() => {
  return props.isReversed ? props.options.slice().reverse() : props.options
})

function toggleList() {
  if (showList.value) {
    lastScrollPosition.value = list.value?.scrollTop || 0
  }
  showList.value = !showList.value
  if (showList.value) {
    nextTick(() => {
      const top =
        lastScrollPosition.value ||
        (props.isReversed && list.value?.scrollHeight) ||
        0
      list.value?.scrollTo({ top })
    })
  }
}

function onUpdateValue(key) {
  const value = !props.modelValue[key]
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value
  })
  emit('change', { key, value })
}
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
  max-height: 240px;
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
    height: 180px;
    top: -180px;
  }
}
</style>
