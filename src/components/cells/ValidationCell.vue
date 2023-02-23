<template>
<td
  ref="cell"
  :class="{
    canceled,
    disabled: disabled,
    validation: selectable,
    selected: selectable & selected
  }"
  :style="{
    'border-left': isBorder ? '1px solid ' + column.color : 'none',
    'background': isBorder ? getBackground() : 'transparent',
    'left': left
  }"
  @mouseover="onMouseOver"
  @mouseout="onMouseOut"
  @click="onClick"
>
  <div
    class="wrapper"
    v-if="!minimized"
  >
    <span
      v-if="task"
    >
      <span
        class="tag"
        :title="taskStatus.name"
        :style="{
          background: backgroundColor,
          color: color
        }"
      >
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
        v-if="
          !isCurrentUserClient &&
          !disabled &&
          task.priority > 0 &&
          !this.taskStatus.is_done
        "
      >
        {{ priority }}
      </span>
      <span
        class="casting-status"
        :title="castingTitle"
        v-if="!isCurrentUserClient && isCastingReady"
      >
        <img src="@/assets/icons/casting-ready.png" width=20>
      </span>
      <span
        class="casting-status"
        :title="castingTitle"
        v-else-if="!isCurrentUserClient"
      >
        &nbsp;
        &nbsp;
        &nbsp;
        &nbsp;
      </span>
    </span>
    <span>
    </span>
    <span
      class="avatar has-text-centered"
      :title="personMap.get(personId).full_name"
      :style="{
        background: personMap.get(personId).color,
        width: '20px',
        height: '20px',
        'font-size': '10px'
      }"
      :key="'avatar-' + personId"
      v-for="personId in assignees"
      v-if="isAssignees && !isCurrentUserClient && !disabled"
    >
      <img
        v-lazy="avatarPath(personId)"
        :key="avatarKey(personId)"
        width="20"
        height="20"
        v-if="personMap.get(personId).has_avatar"
      />
      <span v-else>
        {{ personMap.get(personId).initials }}
      </span>
    </span>
    <span class="subscribed" v-if="task && task.is_subscribed">
      <eye-icon size="0.8x"/>
    </span>
  </div>
  <div
    class="wrapper"
    v-else
  >
    <span
      class="tag"
      :style="{
        background: backgroundColor,
        color: color
      }"
    >
      &nbsp;
    </span>
  </div>
</td>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import colors from '@/lib/colors'

import { EyeIcon } from 'vue-feather-icons'

export default {
  name: 'validation-cell',

  data () {
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

  mounted () {
    if (this.taskTest) {
      this.task = this.taskTest
    } else if (this.entity && this.column && this.entity.validations) {
      this.task = this.taskMap.get(this.entity.validations.get(this.column.id))
    }
    this.changeStyleBasedOnSelected()
  },

  computed: {
    ...mapGetters([
      'isDarkTheme',
      'isCurrentUserClient',
      'personMap',
      'taskMap',
      'taskStatusMap'
    ]),

    assignees () {
      if (this.task) {
        return this.task.assignees
      } else {
        return []
      }
    },

    backgroundColor () {
      const isTodo = this.taskStatus.name === 'Todo'
      if (isTodo && !this.isDarkTheme) {
        return '#ECECEC'
      } else if (isTodo && this.isDarkTheme) {
        return '#5F626A'
      } else if (this.isDarkTheme && this.taskStatus.color) {
        return colors.darkenColor(this.taskStatus.color)
      } else if (this.taskStatus.color) {
        return this.taskStatus.color
      } else {
        return 'transparent'
      }
    },

    color () {
      const isTodo = this.taskStatus.name === 'Todo'
      if (!isTodo || this.isDarkTheme) {
        return 'white'
      } else {
        return '#333'
      }
    },

    priority () {
      if (
        this.task.priority &&
        !this.taskStatus.is_done
      ) {
        if (this.task.priority === 3) {
          return '!!!'
        } else if (this.task.priority === 2) {
          return '!!'
        } else if (this.task.priority === 1) {
          return '!'
        } else {
          return ''
        }
      } else {
        return ''
      }
    },

    taskStatus () {
      if (this.task) {
        const taskStatusId = this.task.task_status_id
        return this.taskStatusMap ? this.taskStatusMap.get(taskStatusId) : {}
      } else {
        return {}
      }
    }
  },

  methods: {
    ...mapActions([
    ]),

    getBackground () {
      if (this.disabled) {
        return 'rgba(0, 0, 0, 0.15)'
      } else if (this.isBorder && !this.sticked) {
        const opacity = this.isDarkTheme ? 0.15 : 0.08
        return colors.hexToRGBa(this.column.color, opacity)
      } else {
        return 'inherit'
      }
    },

    onMouseOver (event) {
      if (this.selectable && !this.selected) {
        const background = this.isDarkTheme ? '#6E70CA' : '#CFD1FF'
        this.changeStyle(background)
      }
    },

    onMouseOut (event) {
      if (this.selectable && !this.selected) {
        const background = this.getBackground()
        this.changeStyle(background)
      }
    },

    onClick (event) {
      if (this.clickable) {
        this.select(event)
      }
    },

    changeStyle (background) {
      const border =
        this.isBorder ? '1px solid ' + this.column.color : 'none'
      if (this.$refs.cell) {
        this.$refs.cell.style =
          `border-left: ${border}; background: ${background}; left: ${this.left}`
      }
    },

    select (event) {
      const isUserClick = event.isUserClick !== false
      if (this.selectable) {
        if (this.$refs.cell &&
            this.$refs.cell.className.indexOf('selected') < 0) {
          this.$emit('select', {
            entity: this.entity,
            column: this.column,
            task: this.task,
            x: this.rowX,
            y: this.columnY,
            isCtrlKey: event.ctrlKey || event.metaKey,
            isShiftKey: event.shiftKey,
            isUserClick: isUserClick
          })
        } else {
          this.$emit('unselect', {
            entity: this.entity,
            column: this.column,
            task: this.task,
            x: this.rowX,
            y: this.columnY,
            isCtrlKey: event.ctrlKey || event.metaKey,
            isShiftKey: event.shiftKey,
            isUserClick: isUserClick
          })
        }
      }
    },

    avatarPath (personId) {
      const person = this.personMap.get(personId)
      if (person) {
        return person.avatarPath + '?unique=' + person.uniqueHash
      } else {
        return ''
      }
    },

    avatarKey (personId) {
      const person = this.personMap.get(personId)
      if (person) {
        return person.id + '-' + person.uniqueHash
      } else {
        return ''
      }
    },

    changeStyleBasedOnSelected () {
      if (this.selected) {
        const background = this.isDarkTheme ? '#5E60BA' : '#BFC1FF'
        this.changeStyle(background)
      } else {
        const background = this.getBackground(
          this.column ? this.column.color : 'transparent'
        )
        this.changeStyle(background)
      }
    },

    formatPriority (priority) {
      let label = priority + ''
      if (priority === 0) {
        label = 'normal'
      } else if (priority === 1) {
        label = this.$t('tasks.priority.high')
      } else if (priority === 2) {
        label = this.$t('tasks.priority.very_high')
      } else if (priority === 3) {
        label = this.$t('tasks.priority.emergency')
      }
      return label
    }
  },

  watch: {
    selected () {
      this.changeStyleBasedOnSelected()
    },

    taskTest () {
      if (this.taskTest) {
        this.task = this.taskTest
      } else if (this.entity && this.entity.validations) {
        this.task =
          this.taskMap.get(this.entity.validations.get(this.column.id))
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dark td.selected,
.dark td.selected.validation:hover {
  background-color: #8F91EB;
}

.validation {
  cursor: pointer;
  margin-bottom: 3px;
}

.wrapper {
  position: relative;
  display: flex;
  flex-wrap: wrap;
}

span.person-avatar:nth-child(2) {
  margin-left: 3px;
}

.validation-tag {
  margin-bottom: 3px;
}

.person-avatar {
  margin-right: 3px;
}

.avatar {
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 2px;
}

.avatar span {
  flex: 1;
}

.avatar img {
  width: 20px;
  height: 20px;
}

.tag {
  font-weight: 500;
  letter-spacing: 1px;
  margin-right: 0.1em;
  margin-bottom: 0.3em;
  text-transform: uppercase;
}

.priority {
  color: red;
  margin-right: 3px;
}

.disabled .tag {
  opacity: 0;
}

.casting-status {
  position: absolute;
  right: -5px;
  top: -8px;

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
  display: inline-block;
  color: white;
  margin-left: 5px;
  font-weight: bold;
  min-width: 23px;
  text-align: center;
}

.high {
  background: $yellow;
}

.veryhigh {
  background: $orange;
}

.emergency {
  background: $red;
}
</style>
