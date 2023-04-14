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
    <div class="status-automation-combo">
      <div class="flexrow" @click="toggleStatusAutomationsList">
        <div class="selected-status-automation-line flexrow-item">
          <status-automation-item
            :status-automation="currentStatusAutomation"
            v-if="currentStatusAutomation"
          />
        </div>
        <chevron-down-icon class="down-icon flexrow-item" />
      </div>
      <div class="select-input" ref="select" v-if="showStatusAutomationsList">
        <div
          class="status-automation-line"
          v-for="statusAutomation in statusAutomationsList"
          @click="selectStatusAutomation(statusAutomation)"
          :key="statusAutomation.id"
        >
          <status-automation-item
            :status-automation="statusAutomation"
            v-if="statusAutomation"
          />
        </div>
      </div>
    </div>
    <combobox-mask
      :displayed="showStatusAutomationsList"
      @click="toggleStatusAutomationsList"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { ChevronDownIcon } from 'vue-feather-icons'

import colors from '@/lib/colors'
import ComboboxMask from '@/components/widgets/ComboboxMask'
import StatusAutomationItem from '@/components/widgets/StatusAutomationItem'

export default {
  name: 'combobox-status-automation',

  components: {
    ChevronDownIcon,
    ComboboxMask,
    StatusAutomationItem
  },

  data() {
    return {
      showStatusAutomationsList: false
    }
  },

  props: {
    label: {
      default: '',
      type: String
    },
    statusAutomationsList: {
      default: () => [],
      type: Array
    },
    value: {
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
    }
  },

  mounted() {
    this.selectedStatusAutomation = this.statusAutomation
  },

  computed: {
    ...mapGetters([
      'isDarkTheme',
      'statusAutomationMap',
      'getTaskStatus',
      'getTaskType'
    ]),

    currentStatusAutomation() {
      if (this.value) {
        return this.statusAutomationMap.get(this.value)
      } else if (this.addPlaceholder) {
        return {
          short_name: '+ status',
          color: '#999'
        }
      } else {
        return this.statusAutomationsList[0]
      }
    }
  },

  methods: {
    selectStatusAutomation(status) {
      this.$emit('input', status.id)
      this.showStatusAutomationsList = false
    },

    backgroundColor(statusAutomation) {
      if (
        (!statusAutomation || statusAutomation.is_default) &&
        !this.isDarkTheme
      ) {
        return '#ECECEC'
      } else if (
        (!statusAutomation || statusAutomation.is_default) &&
        this.isDarkTheme
      ) {
        return '#5F626A'
      } else if (this.isDarkTheme) {
        return colors.darkenColor(statusAutomation.color)
      } else {
        return statusAutomation.color
      }
    },

    color(statusAutomation) {
      if (
        !statusAutomation ||
        !statusAutomation.is_default ||
        this.isDarkTheme
      ) {
        return 'white'
      } else {
        return '#333'
      }
    },

    toggleStatusAutomationsList() {
      this.showStatusAutomationsList = !this.showStatusAutomationsList
    }
  }
}
</script>

<style lang="scss" scoped>
.dark {
  .select-input,
  .status-automation-line,
  .status-automation-combo {
    background: $dark-grey-light;
    border-color: $dark-grey;
  }

  .status-automation-line:hover {
    background: $dark-purple;
  }
}

.status-automation-combo {
  background: $white;
  border: 1px solid $light-grey-light;
  border-radius: 1em;
  user-select: none;
  cursor: pointer;
  margin: 0;
  margin-top: 1px;
  vertical-align: middle;
  position: relative;
}

.status-automation-combo:hover {
  border: 1px solid $green;
}

.field--narrow .status-automation-combo {
  padding: 0;
  margin: 0;
}

.selected-status-automation-line {
  text-transform: uppercase;
  flex: 1;
}

.status-automation-line {
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
  position: absolute;
  border: 1px solid $light-grey-light;
  border-bottom-left-radius: 1em;
  border-bottom-right-radius: 1em;
  z-index: 300;
  margin-left: -1px;
  max-height: 180px;
  top: 56px;
  left: 0;
  right: 0;
  overflow-y: auto;
}

.field .label {
  padding-top: 5px;
}
</style>
