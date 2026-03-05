<template>
  <div :class="{ active }" :disabled="disabled || null">
    <label class="label" v-if="label.length">
      {{ label }}
    </label>
    <div
      class="combo"
      :class="{
        thin,
        compact: isCompact,
        reversed: isReversed,
        open: showList
      }"
      ref="select"
      @click="toggleList"
    >
      <div class="flexrow" :title="selectedOptionLabel">
        <slot name="icon"></slot>
        <div
          class="selected-line mr05"
          :class="{ placeholder: selectedOption?.placeholder }"
          v-if="!isCompact"
        >
          {{ selectedOptionLabel }}
        </div>
        <span
          class="preview-status"
          :title="$t('tasks.validated')"
          v-if="selectedOption?.validation_status === 'validated'"
        ></span>
        <chevron-down-icon class="down-icon flexrow-item" />
      </div>
      <div class="select-input" v-if="showList">
        <div
          :key="option.id"
          class="option-line flexrow"
          :class="{ placeholder: option.placeholder }"
          @click="selectOption(option)"
          @click.middle="openRoute(option)"
          v-for="option in optionList"
        >
          <entity-thumbnail
            class="revision-thumbnail"
            :preview-file-id="option.value"
            :width="75"
            :height="45"
            :empty-width="75"
            :empty-height="45"
            no-preview
            v-if="isPreview"
          />
          <span class="filler">
            {{ option.optionLabel ?? getOptionLabel(option) }}
          </span>
          <span
            class="preview-status"
            :title="$t('tasks.validated')"
            v-if="option.validation_status === 'validated'"
          ></span>
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
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { ChevronDownIcon } from 'lucide-vue-next'

import EntityThumbnail from '@/components/widgets/EntityThumbnail.vue'

const { t } = useI18n()
const router = useRouter()

const props = defineProps({
  active: {
    default: false,
    type: Boolean
  },
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
    type: [String, Object]
  },
  localeKeyPrefix: {
    default: '',
    type: String
  },
  isCompact: {
    default: false,
    type: Boolean
  },
  isPreview: {
    default: false,
    type: Boolean
  },
  isReversed: {
    default: false,
    type: Boolean
  },
  keepOrder: {
    default: false,
    type: Boolean
  },
  thin: {
    default: false,
    type: Boolean
  }
})

const emit = defineEmits(['change', 'update:modelValue'])

const select = ref(null)
const selectedOption = ref({
  label: '',
  value: ''
})
const showList = ref(false)
let lastScrollPosition = 0

const optionList = computed(() => {
  if (props.isReversed && !props.keepOrder) {
    return [...props.options].reverse()
  }
  return props.options
})

const getOptionLabel = (option) => {
  if (props.localeKeyPrefix && option.label) {
    return t(props.localeKeyPrefix + option.label.toLowerCase())
  }
  return option.label
}

const selectedOptionLabel = computed(() => {
  return selectedOption.value ? getOptionLabel(selectedOption.value) : ''
})

const openRoute = (option) => {
  const ahref = router.resolve(option.route).href
  const url = `${window.location.protocol}//${window.location.host}${ahref}`
  window.open(url, '_blank')
}

const selectOption = (option) => {
  emit('update:modelValue', option.value)
  emit('change', option.value)
  selectedOption.value = option
}

const toggleList = () => {
  if (showList.value) {
    lastScrollPosition = select.value.scrollTop
  }
  showList.value = !showList.value
  if (showList.value) {
    nextTick(() => {
      select.value?.scrollTo({ top: lastScrollPosition, left: 0 })
    })
  }
}

watch(() => props.options, () => {
  if (props.options.length > 0) {
    const option = props.options.find(
      ({ value }) => value === props.modelValue
    )
    selectedOption.value = option || props.options[0]
  }
}, { deep: true, immediate: true })

watch(showList, () => {
  if (showList.value && props.isReversed) {
    nextTick(() => {
      if (!select.value?.children) return
      let list = null
      for (const child of select.value.children) {
        if (child.className !== 'flexrow') {
          list = child
        }
      }
      list?.scrollTo({ top: optionList.value.length * 60 })
    })
  }
})

watch(() => props.modelValue, () => {
  selectedOption.value = props.options.find(o => o.value === props.modelValue)
})
</script>

<style lang="scss" scoped>
[disabled] {
  pointer-events: none;
  opacity: 0.5;

  .down-icon {
    color: $white;
  }
}

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
}

.combo:hover {
  border: 1px solid $green;
}

.selected-line {
  flex: 1;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.option-line {
  background: $white;
  border-bottom: 1px solid $light-grey-light;
  cursor: pointer;
  margin: 0;
  padding: 0.5em;
  min-width: 150px;

  &:hover {
    background: $purple;
  }
}

.option-line,
.selected-line {
  &.placeholder {
    color: rgba($white, 0.5);
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
  left: 0;
  margin-left: -1px;
  max-height: 180px;
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

.field .label {
  padding-top: 5px;
}

.revision-thumbnail {
  margin-right: 0.5em;
}

.thin {
  height: 30px;
  padding: 3px 0 3px 10px;
  margin-bottom: 3px;

  .select-input {
    top: 29px;
  }
}

.preview-status {
  background: $light-green;
  border-radius: 50%;
  height: 8px;
  min-width: 8px;
  width: 8px;
  margin-right: 0.5em;
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
