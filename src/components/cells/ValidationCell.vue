<template>
  <td
    :class="{
      canceled,
      disabled,
      selected: selectable & selected,
      validation: selectable
    }"
    :style="cellStyle"
    @click="onClick"
  >
    <div class="wrapper" v-if="!minimized">
      <template v-if="task">
        <span class="tag" :title="taskStatus.name" :style="tagStyle">
          {{ taskStatus.short_name }}
        </span>
        <span
          :class="{
            priority: true,
            high: task.priority === 1,
            veryhigh: task.priority === 2,
            emergency: task.priority === 3
          }"
          :title="formatPriority(task.priority)"
          v-if="!isCurrentUserClient && !disabled && task.priority > 0"
        >
          {{ priority }}
        </span>
        <span
          class="casting-status"
          :class="{ 'casting-status-not-ready': !isCastingReady }"
          :title="castingTitle"
          v-if="!isCurrentUserClient && castingTitle"
        >
          <img src="@/assets/icons/casting-ready.png" v-if="isCastingReady" />
          <img src="@/assets/icons/casting-not-ready.png" v-else />
        </span>
      </template>
      <template v-if="isAssignees && !isCurrentUserClient && !disabled">
        <span
          class="avatar has-text-centered"
          :title="person.full_name"
          :style="{
            backgroundColor: person.color,
            color: isDarkTheme ? '#333' : '#FFF',
            'font-weight': isDarkTheme ? 'bold' : 'normal'
          }"
          :key="`avatar-${person.id}`"
          v-for="person in assignees"
        >
          <img
            loading="lazy"
            alt=""
            :src="person.avatarPath"
            v-if="person.has_avatar"
          />
          <template v-else>{{ person.initials }}</template>
        </span>
      </template>
      <span class="subscribed" v-if="task?.is_subscribed">
        <eye-icon size="0.8x" />
      </span>
    </div>
    <div class="wrapper" v-else>
      <span class="tag" :style="tagStyle"> &nbsp; </span>
    </div>
  </td>
</template>

<script>
import { mapGetters } from 'vuex'
import { EyeIcon } from 'vue-feather-icons'

import colors from '@/lib/colors'
import { sortPeople } from '@/lib/sorting'
import { formatListMixin } from '@/components/mixins/format'

export default {
  name: 'validation-cell',

  mixins: [formatListMixin],

  data() {
    return {
      task: null
    }
  },

  components: {
    EyeIcon
  },

  props: {
    column: {
      default: null,
      type: Object
    },
    entity: {
      default: null,
      type: Object
    },
    taskTest: {
      default: null,
      type: Object
    },
    isCastingReady: {
      default: false,
      type: Boolean
    },
    castingTitle: {
      default: '',
      type: String
    },
    isBorder: {
      default: true,
      type: Boolean
    },
    isStatic: {
      default: false,
      type: Boolean
    },
    isAssignees: {
      default: true,
      type: Boolean
    },
    minimized: {
      default: false,
      type: Boolean
    },
    selectable: {
      default: true,
      type: Boolean
    },
    clickable: {
      default: true,
      type: Boolean
    },
    selected: {
      default: false,
      type: Boolean
    },
    disabled: {
      default: false,
      type: Boolean
    },
    rowX: {
      default: 0,
      type: Number
    },
    columnY: {
      default: 0,
      type: Number
    },
    left: {
      type: String,
      default: '0px'
    },
    sticked: {
      default: false,
      type: Boolean
    },
    canceled: {
      default: false,
      type: Boolean
    }
  },

  mounted() {
    if (this.taskTest) {
      this.task = this.taskTest
    } else if (this.column && this.entity?.validations) {
      this.task = this.taskMap.get(this.entity.validations.get(this.column.id))
    }
  },

  computed: {
    ...mapGetters([
      'isCurrentUserClient',
      'isDarkTheme',
      'personMap',
      'taskMap',
      'taskStatusMap'
    ]),

    assignees() {
      return sortPeople(
        this.task?.assignees.map(personId => this.personMap.get(personId)) || []
      )
    },

    priority() {
      return this.formatPrioritySymbol(this.task.priority)
    },

    cellStyle() {
      let backgroundColor
      if (this.isBorder && !this.sticked) {
        const opacity = this.isDarkTheme ? 0.15 : 0.08
        backgroundColor = colors.hexToRGBa(this.column.color, opacity)
      }

      return {
        borderLeft: this.isBorder ? `1px solid ${this.column.color}` : 'none',
        backgroundColor: backgroundColor,
        left: this.left
      }
    },

    tagStyle() {
      const isTodo = this.taskStatus.name === 'Todo'
      let backgroundColor
      if (isTodo) {
        backgroundColor = this.isDarkTheme ? '#5F626A' : '#ECECEC'
      } else if (this.taskStatus.color) {
        backgroundColor = this.isDarkTheme
          ? colors.darkenColor(this.taskStatus.color)
          : this.taskStatus.color
      } else {
        backgroundColor = 'transparent'
      }
      const color = !isTodo || this.isDarkTheme ? 'white' : '#333'
      return {
        backgroundColor,
        color
      }
    },

    taskStatus() {
      const taskStatusId = this.task?.task_status_id
      return this.taskStatusMap?.get(taskStatusId) || {}
    }
  },

  methods: {
    onClick(event) {
      if (this.clickable) {
        this.select(event)
      }
    },

    select(event) {
      if (!this.selectable) {
        return
      }
      this.$emit(!this.selected ? 'select' : 'unselect', {
        entity: this.entity,
        column: this.column,
        task: this.task,
        x: this.rowX,
        y: this.columnY,
        isCtrlKey: event.ctrlKey || event.metaKey,
        isShiftKey: event.shiftKey,
        isUserClick: event.isUserClick !== false
      })
    }
  },

  watch: {
    taskTest() {
      if (this.taskTest) {
        this.task = this.taskTest
      } else if (this.entity?.validations) {
        this.task = this.taskMap.get(
          this.entity.validations.get(this.column.id)
        )
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.validation {
  cursor: pointer;
  margin-bottom: 3px;

  &.selected {
    background-color: #bfc1ff !important;

    .dark & {
      background-color: #5e60ba !important;
    }
  }

  &:not(.selected):hover {
    background-color: #cfd1ff !important;

    .dark & {
      background-color: #6e70ca !important;
    }
  }
}

.wrapper {
  position: relative;
  display: flex;
  flex-wrap: wrap;
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 2px;
  width: 21px;
  height: 21px;
  font-size: 10px;

  img {
    width: 21px;
    height: 21px;
  }
}

.tag {
  font-weight: 500;
  letter-spacing: 1px;
  margin-right: 0.1em;
  margin-bottom: 0.3em;
  text-transform: uppercase;
}

.disabled {
  background-color: rgba(0, 0, 0, 0.15) !important;

  .tag {
    opacity: 0;
  }
}

.casting-status {
  position: absolute;
  right: -5px;
  top: -8px;

  &.casting-status-not-ready {
    opacity: 0.5;
  }

  img {
    width: 12px;
  }
}

.subscribed {
  position: absolute;
  bottom: -10px;
  right: -5px;
  color: $grey;
}

.priority {
  border-radius: 5px;
  color: white;
  display: inline-block;
  font-weight: bold;
  height: 21px;
  margin-left: 5px;
  margin-right: 3px;
  min-width: 23px;
  text-align: center;

  &.high {
    background-color: $yellow;
  }

  &.veryhigh {
    background-color: $orange;
  }

  &.emergency {
    background-color: $red;
  }
}
</style>
