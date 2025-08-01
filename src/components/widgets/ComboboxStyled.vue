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

<script>
import { ChevronDownIcon } from 'lucide-vue-next'

import EntityThumbnail from '@/components/widgets/EntityThumbnail.vue'

export default {
  name: 'combobox-styled',

  components: {
    ChevronDownIcon,
    EntityThumbnail
  },

  emits: ['change', 'update:modelValue'],

  data() {
    return {
      selectedOption: {
        label: '',
        value: ''
      },
      showList: false
    }
  },

  props: {
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
  },

  computed: {
    optionList() {
      if (this.isReversed && !this.keepOrder) {
        return [...this.options].reverse()
      }
      return this.options
    },

    selectedOptionLabel() {
      return this.selectedOption ? this.getOptionLabel(this.selectedOption) : ''
    }
  },

  methods: {
    openRoute(option) {
      const ahref = this.$router.resolve(option.route).href
      const url = `${window.location.protocol}//${window.location.host}${ahref}`
      window.open(url, '_blank')
    },

    selectOption(option) {
      this.$emit('update:modelValue', option.value)
      this.$emit('change', option.value)
      this.selectedOption = option
    },

    toggleList() {
      if (this.showList) {
        this.lastScrollPosition = this.$refs.select.scrollTop
      }
      this.showList = !this.showList
      if (this.showList) {
        this.$nextTick(() => {
          this.$refs.select?.scrollTo({ top: this.lastScrollPosition, left: 0 })
        })
      }
    },

    getOptionLabel(option) {
      if (this.localeKeyPrefix && option.label) {
        return this.$t(this.localeKeyPrefix + option.label.toLowerCase())
      }
      return option.label
    }
  },

  watch: {
    options: {
      deep: true,
      immediate: true,
      handler() {
        if (this.options.length > 0) {
          const option = this.options.find(
            ({ value }) => value === this.modelValue
          )
          this.selectedOption = option || this.options[0]
        }
      }
    },

    showList() {
      if (this.showList && this.isReversed) {
        this.$nextTick(() => {
          if (!this.$refs.select?.children) return
          let list = null
          for (const child of this.$refs.select.children) {
            if (child.className !== 'flexrow') {
              list = child
            }
          }
          list?.scrollTo({ top: this.optionList.length * 60 })
        })
      }
    },

    modelValue() {
      this.selectedOption = this.options.find(o => o.value === this.modelValue)
    }
  }
}
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
