<template>
  <div
    :class="{
      field: withMargin,
      'field--narrow': narrow
    }"
  >
    <label class="label" v-if="label.length > 0">
      {{ label }}
    </label>
    <div class="status-combo" :style="comboStyles">
      <div class="flexrow" @click="toggleStatusList">
        <div class="selected-status-line flexrow-item">
          <span
            class="tag"
            :style="{
              background: backgroundColor(currentStatus),
              color: color(currentStatus)
            }"
            v-if="currentStatus"
          >
            {{ currentStatus.short_name }}
          </span>
        </div>
        <chevron-down-icon
          :class="{
            'down-icon': true,
            'flexrow-item': true,
            white: colorOnly
          }"
        />
      </div>
      <div
        ref="select"
        :class="{
          big: big,
          'select-input': true,
          'open-top': openTop
        }"
        v-if="showStatusList"
      >
        <div
          :key="status.id"
          class="status-line"
          @click="selectStatus(status)"
          v-for="status in sortedTaskStatusList"
        >
          <span
            class="tag"
            :style="{
              background: backgroundColor(status),
              color: color(status)
            }"
          >
            {{ status.short_name }}
          </span>
        </div>
      </div>
    </div>
    <combobox-mask :displayed="showStatusList" @click="toggleStatusList" />
  </div>
</template>

<script>
import { ChevronDownIcon } from 'lucide-vue-next'
import { mapGetters } from 'vuex'

import colors from '@/lib/colors'
import { sortTaskStatuses } from '@/lib/sorting'

import ComboboxMask from '@/components/widgets/ComboboxMask.vue'

export default {
  name: 'combobox-status',

  components: {
    ChevronDownIcon,
    ComboboxMask
  },

  emits: ['update:modelValue'],

  data() {
    return {
      showStatusList: false
    }
  },

  props: {
    big: {
      default: false,
      type: Boolean
    },
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
  },

  mounted() {
    this.selectedTaskStatus = this.taskStatus
  },

  computed: {
    ...mapGetters(['isDarkTheme', 'productionMap', 'taskStatusMap']),

    sortedTaskStatusList() {
      if (this.productionId) {
        const production = this.productionMap.get(this.productionId)
        return sortTaskStatuses(this.taskStatusList, production)
      } else {
        return this.taskStatusList
      }
    },

    currentStatus() {
      if (this.modelValue) {
        return this.taskStatusMap.get(this.modelValue)
      } else if (this.addPlaceholder) {
        return {
          short_name: '+ add status',
          color: '#999'
        }
      } else {
        return this.taskStatusList[0]
      }
    },

    comboStyles() {
      return {
        width: this.big ? '150px' : '120px',
        background: this.colorOnly
          ? this.backgroundColor(this.currentStatus)
          : this.isDarkTheme
            ? '#36393F'
            : '#FEFEFE',
        color: this.colorOnly ? this.color(this.currentStatus) : 'inherit',
        'border-top-left-radius': this.colorOnly ? '20px' : '10px',
        'border-top-right-radius': this.colorOnly ? '0px' : '10px',
        'border-bottom-left-radius': this.showStatusList
          ? '0'
          : this.colorOnly
            ? '20px'
            : '10px',
        'border-bottom-right-radius': this.showStatusList
          ? '0'
          : this.colorOnly
            ? '0px'
            : '10px'
      }
    }
  },

  methods: {
    selectStatus(status) {
      this.$emit('update:modelValue', status.id)
      this.showStatusList = false
    },

    backgroundColor(taskStatus) {
      if ((!taskStatus || taskStatus.name === 'Todo') && !this.isDarkTheme) {
        return '#ECECEC'
      } else if (
        (!taskStatus || taskStatus.name === 'Todo') &&
        this.isDarkTheme
      ) {
        return '#5F626A'
      } else if (this.isDarkTheme) {
        return colors.darkenColor(taskStatus.color)
      } else {
        return taskStatus.color
      }
    },

    color(taskStatus) {
      if (!taskStatus || taskStatus.name !== 'Todo' || this.isDarkTheme) {
        return 'white'
      } else {
        return '#333'
      }
    },

    toggleStatusList() {
      this.showStatusList = !this.showStatusList
    }
  }
}
</script>

<style lang="scss" scoped>
.dark {
  .select-input,
  .status-line,
  .status-combo {
    background: $dark-grey-light;
    border-color: $dark-grey;
  }

  .status-line:hover {
    background: $dark-purple;
  }
}

.status-combo {
  background: var(--background);
  min-width: 120px;
  width: 120px;
  border: 1px solid $light-grey-light;
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
}

.status-line {
  background: $white;
  cursor: pointer;
  margin: 0;
  text-transform: uppercase;

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
  background: $white;
  width: 120px;
  position: absolute;
  border: 1px solid $light-grey-light;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  z-index: 300;
  margin-left: -1px;
  max-height: 180px;
  top: 38px;
  left: 0;
  overflow-y: auto;

  &.big {
    width: 150px;
  }

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
