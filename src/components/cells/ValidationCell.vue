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
  <div class="wrapper">
    <validation-tag
      class="validation-tag"
      :task="task"
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
    return {}
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
    isAssignees: {
      default: true,
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

  computed: {
    ...mapGetters([
      'selectedTasks',
      'selectedValidations',
      'nbSelectedTasks',
      'isCurrentUserClient',
      'isShowAssignations',
      'personMap',
      'taskMap',
      'taskStatusMap'
    ]),

    task () {
      return this.taskTest ||
        this.taskMap[this.entity.validations[this.column.name]]
    },

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
        return colors.hexToRGBa(this.column.color, 0.08)
      } else {
        return 'transparent'
      }
    },

    onMouseOver (event) {
      if (this.selectable && !this.selected) {
        this.changeStyle('#CCFFCC')
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
        const background = '#D1C4E9'
        this.changeStyle(background)
      } else {
        const background = this.getBackground(this.column.color)
        this.changeStyle(background)
      }
    }
  }
}
</script>

<style scoped>
.validation {
  cursor: pointer;
  margin-bottom: 3px;
}

.wrapper {
  display: flex;
  flex-wrap: wrap;
}

td.validation:hover {
  background: #CCFFCC;
}

td.selected,
td.selected.validation:hover {
  background: #D1C4E9;
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
