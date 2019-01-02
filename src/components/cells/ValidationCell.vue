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
  @click="select"
>
  <div
    class="wrapper"
    v-if="!minimized"
  >
    <validation-tag
      class="validation-tag"
      :task="task"
      :is-static="selectable"
      :pointer="true"
      v-if="task"
    />
    <people-avatar
      class="person-avatar"
      :key="task.id + '-' + personId"
      :person="personMap[personId]"
      :size="20"
      :font-size="10"
      v-if="isAssignees && isShowAssignations && !isCurrentUserClient"
      v-for="personId in assignees"
    />
  </div>
  <div
    class="wrapper"
    v-else
  >
    <validation-tag
      class="validation-tag"
      :task="task"
      :minimized="minimized"
      v-if="task"
    />
  </div>
</td>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import colors from '../../lib/colors'

import ValidationTag from '../widgets/ValidationTag'
import PeopleAvatar from '../widgets/PeopleAvatar'

export default {
  name: 'validation-cell',

  data () {
    return {
      task: null
    }
  },

  components: {
    ValidationTag,
    PeopleAvatar
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
      'isShowAssignations',
      'nbSelectedTasks',
      'personMap',
      'selectedTasks',
      'selectedValidations',
      'taskMap',
      'taskStatusMap'
    ]),

    assignees () {
      if (this.task) {
        return this.task.assignees
      } else {
        return []
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
        const background = this.isDarkTheme ? '#878B97' : '#CCFFCC'
        this.changeStyle(background)
      }
    },

    onMouseOut (event) {
      if (this.selectable && !this.selected) {
        const background = this.getBackground()
        this.changeStyle(background)
      }
    },

    changeStyle (background) {
      const border =
        this.isBorder ? '1px solid ' + this.column.color : 'none'
      this.$refs['cell'].style =
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
    }
  },

  watch: {
    selected () {
      if (this.selected) {
        const background = this.isDarkTheme ? '#5E60BA' : '#D1C4E9'
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

<style scoped>
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
</style>
