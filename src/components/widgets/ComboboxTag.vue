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
      ref="select"
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

<script>
import { ChevronDownIcon } from 'lucide-vue-next'

import { sortByValue } from '@/lib/sorting'

export default {
  name: 'combobox-tag',

  components: {
    ChevronDownIcon
  },

  emits: ['change', 'update:modelValue'],

  data() {
    return {
      showList: false
    }
  },

  props: {
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
  },

  computed: {
    optionList() {
      const sortedOptions = sortByValue([...this.options])
      if (this.isReversed) {
        sortedOptions.reverse()
      }
      return sortedOptions
    },

    renderedValue() {
      return this.modelValue.split(',').filter(Boolean).sort().join(', ')
    }
  },

  methods: {
    selectOption(option) {
      let values = this.modelValue.split(',').filter(Boolean)
      if (values.includes(option.value)) {
        values.splice(values.indexOf(option.value), 1)
      } else {
        values = this.optionList
          .filter(
            oldOption =>
              this.isChecked(oldOption) || oldOption.value === option.value
          )
          .map(oldOption => oldOption.value)
      }
      const value = values.join(',')
      this.$emit('update:modelValue', value)
      this.$emit('change', value)
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
    },

    isChecked(option) {
      const values = this.modelValue.split(',')
      return values.includes(option.value)
    }
  },

  watch: {
    showList() {
      if (this.showList) {
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
    }
  }
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
