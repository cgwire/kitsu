<template>
  <div>
    <label class="label" v-if="label.length > 0">
      {{ label }}
    </label>
    <div
      :class="{
        combo: true,
        thin: thin,
        reversed: isReversed,
        open: showList
      }"
      ref="select"
      @click="toggleList"
    >
      <div class="flexrow">
        <div class="selected-line flexrow-item">
          {{ selectedOption ? getOptionLabel(selectedOption) : '' }}
        </div>
        <chevron-down-icon class="down-icon flexrow-item" />
      </div>
      <div class="select-input" v-if="showList">
        <div
          :key="option.id"
          class="option-line flexrow"
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
import { mapGetters } from 'vuex'
import { ChevronDownIcon } from 'vue-feather-icons'
import EntityThumbnail from '@/components/widgets/EntityThumbnail.vue'

export default {
  name: 'combobox-styled',

  components: {
    ChevronDownIcon,
    EntityThumbnail
  },

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
    label: {
      default: '',
      type: String
    },
    options: {
      default: () => [],
      type: Array
    },
    value: {
      default: '',
      type: String
    },
    localeKeyPrefix: {
      default: '',
      type: String
    },
    isPreview: {
      default: false,
      type: Boolean
    },
    isReversed: {
      default: false,
      type: Boolean
    },
    thin: {
      default: false,
      type: Boolean
    }
  },

  mounted() {
    if (this.options.length > 0) {
      this.selectedOption = this.options[0]
    }
  },

  computed: {
    ...mapGetters(['isDarkTheme']),

    optionList() {
      if (this.isReversed) {
        return [...this.options].reverse()
      } else {
        return this.options
      }
    }
  },

  methods: {
    openRoute(option) {
      const ahref = this.$router.resolve(option.route).href
      const url = `${window.location.protocol}//${window.location.host}${ahref}`
      window.open(url, '_blank')
    },

    selectOption(option) {
      this.$emit('input', option.value)
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
          this.$refs.select.scrollTo({ top: this.lastScrollPosition, left: 0 })
        })
      }
    },

    getOptionLabel(option) {
      if (this.localeKeyPrefix.length > 0) {
        return this.$t(this.localeKeyPrefix + option.label.toLowerCase())
      } else {
        return option.label
      }
    }
  },

  watch: {
    options() {
      if (this.options.length > 0) {
        const option = this.options.find(o => o.value === this.value)
        if (option) {
          this.selectedOption = option
        } else {
          this.selectedOption = this.options[0]
        }
      }
    },

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

    value() {
      this.selectedOption = this.options.find(o => o.value === this.value)
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
    border-bottom-left-radius: 0em;
    border-bottom-right-radius: 0em;
  }
}

.combo:hover {
  border: 1px solid $green;
}

.selected-line {
  flex: 1;
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
  width: inherit;
  top: 38px;
  z-index: 2000;

  .option-line {
    padding-right: 27px;
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

.reversed {
  &.open {
    border-top-left-radius: 0em;
    border-top-right-radius: 0em;
    border-bottom-left-radius: 1em;
    border-bottom-right-radius: 1em;
  }

  .select-input {
    border-top-left-radius: 1em;
    border-top-right-radius: 1em;
    border-bottom-left-radius: 0em;
    border-bottom-right-radius: 0em;
    height: 180px;
    top: -180px;
  }
}
</style>
