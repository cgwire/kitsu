<template>
  <div>
    <div
      class="combo thin"
      :class="{
        open: showList
      }"
      ref="select"
    >
      <div
        class="flexrow"
        :title="$t('entities.display_options')"
        @click="toggleList"
      >
        <div class="selected-line mr05">
          {{ $t('entities.display_options') }}
        </div>
        <chevron-down-icon
          class="down-icon flexrow-item"
          :class="{ rotated: showList }"
        />
      </div>
      <div class="select-input" v-if="showList">
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

import ToggleButton from '@/components/widgets/ToggleButton.vue'

export default {
  name: 'combobox-display-options',

  components: {
    ChevronDownIcon,
    ToggleButton
  },

  emits: ['update:modelValue'],

  data() {
    return {
      options: [
        {
          label: this.$t('tasks.show_assignations'),
          value: 'showAssignations'
        },
        {
          label: this.$t('tasks.show_infos'),
          value: 'showInfos'
        },
        {
          label: this.$t('tasks.big_thumbnails'),
          value: 'bigThumbnails'
        },
        {
          label: this.$t('tasks.show_contact_sheet'),
          value: 'contactSheetMode'
        }
      ],
      showList: false
    }
  },

  props: {
    modelValue: {
      default: () => {},
      type: Object
    },
    type: {
      type: String,
      default: 'shot'
    }
  },

  mounted() {
    if (this.type === 'shot') {
      this.options.push({
        label: this.$t('shots.show_timecode'),
        value: 'inOutTimecode'
      })
    } else if (this.type === 'asset') {
      this.options.push({
        label: this.$t('breakdown.show_library'),
        value: 'showSharedAssets'
      })
    }
  },

  computed: {
    optionList() {
      if (this.isReversed && !this.keepOrder) {
        return [...this.options].reverse()
      }
      return this.options
    }
  },

  methods: {
    toggleList() {
      if (this.showList) {
        this.lastScrollPosition = this.$refs.select.scrollTop
      }
      this.showList = !this.showList
      if (this.showList) {
        this.$nextTick(() => {
          this.$refs.select.scrollTo({ top: this.lastScrollPosition, left: 0 })
        })
      }
    },

    onUpdateValue(value) {
      const newValue = { ...this.modelValue, [value]: !this.modelValue[value] }
      this.$emit('update:modelValue', newValue)
    }
  },

  watch: {
    showList() {
      if (this.showList && this.isReversed) {
        this.$nextTick(() => {
          let list = null
          for (const child of this.$refs.select.children) {
            if (child.className !== 'flexrow') {
              list = child
            }
          }
          list.scrollTo({ top: this.optionList.length * 60 })
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
  padding: 0.8em;
  min-width: 250px;

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
  transition: transform 0.2s ease-in-out;

  &.rotated {
    // transform: rotate(180deg);
  }
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

.field .label {
  padding-top: 5px;
}

.revision-thumbnail {
  margin-right: 0.5em;
}

.thin {
  height: 34px;
  padding: 4px 0 3px 10px;
  margin-bottom: 3px;

  .select-input {
    top: 30px;
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
