<template>
<td
  ref="cell"
  :class="{
    validation: selectable && !isCurrentUserClient,
    selected: selectable & selected
  }"
  :style="{
    'border-left': isBorder ? '1px solid ' + column.color : 'none',
    'background': isBorder ? getBackground() : 'transparent'
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
      <span class="priority" v-if="!isCurrentUserClient">
        {{ priority }}
      </span>
    </span>
    <span
      class="avatar has-text-centered"
      :title="personMap[personId].full_name"
      :style="{
        background: personMap[personId].color,
        width: '20px',
        height: '20px',
        'font-size': '10px'
      }"
      :key="'avatar-' + personId"
      v-for="personId in assignees"
      v-if="isAssignees && !isCurrentUserClient"
    >
      <img
        v-lazy="avatarPath(personId)"
        :key="avatarKey(personId)"
        width="20"
        height="20"
        v-if="personMap[personId].has_avatar"
      />
      <span v-else>
        {{ personMap[personId].initials }}
      </span>
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
import colors from '../../lib/colors'

export default {
  name: 'validation-cell',

  data () {
    return {
      task: null
    }
  },

  components: {
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
    rowX: {
      default: 0,
      type: Number
    },
    columnY: {
      default: 0,
      type: Number
    }
  },

  mounted () {
    if (this.taskTest) {
      this.task = this.taskTest
    } else if (this.entity) {
      this.task = this.taskMap[this.entity.validations[this.column.id]]
    }
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
      if (this.taskStatus.short_name === 'todo' && !this.isDarkTheme) {
        return '#ECECEC'
      } else if (this.taskStatus.short_name === 'todo' && this.isDarkTheme) {
        return '#5F626A'
      } else if (this.isDarkTheme) {
        return colors.darkenColor(this.taskStatus.color)
      } else {
        return this.taskStatus.color
      }
    },

    color () {
      if (this.taskStatus.short_name !== 'todo' || this.isDarkTheme) {
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
        return this.taskStatusMap ? this.taskStatusMap[taskStatusId] : {}
      } else {
        return {}
      }
    }
  },

  methods: {
    ...mapActions([
    ]),

    getBackground () {
      if (this.isBorder) {
        const opacity = this.isDarkTheme ? 0.15 : 0.08
        return colors.hexToRGBa(this.column.color, opacity)
      } else {
        return 'transparent'
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
      this.$refs.cell.style =
        `border-left: ${border}; background: ${background};`
    },

    select (event) {
      const isUserClick = event.isUserClick !== false
      if (this.selectable && !this.isCurrentUserClient) {
        if (this.$refs.cell &&
            this.$refs.cell.className.indexOf('selected') < 0) {
          this.$emit('select', {
            entity: this.entity,
            column: this.column,
            task: this.task,
            x: this.rowX,
            y: this.columnY,
            isCtrlKey: event.ctrlKey,
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
            isCtrlKey: event.ctrlKey,
            isShiftKey: event.shiftKey,
            isUserClick: isUserClick
          })
        }
      }
    },

    avatarPath (personId) {
      const person = this.personMap[personId]
      if (person) {
        return person.avatarPath + '?unique=' + person.uniqueHash
      } else {
        return ''
      }
    },

    avatarKey (personId) {
      const person = this.personMap[personId]
      if (person) {
        return person.id + '-' + person.uniqueHash
      } else {
        return ''
      }
    }
  },

  watch: {
    selected () {
      if (this.selected) {
        const background = this.isDarkTheme ? '#5E60BA' : '#BFC1FF'
        this.changeStyle(background)
      } else {
        const background = this.getBackground(this.column.color)
        this.changeStyle(background)
      }
    },

    taskTest () {
      if (this.taskTest) {
        this.task = this.taskTest
      } else if (this.entity) {
        this.task = this.taskMap[this.entity.validations[this.column.id]]
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
  text-transform: uppercase;
  margin-right: 0.1em;
  margin-bottom: 0.3em;
}

.priority {
  color: red;
  margin-right: 3px;
}
</style>
