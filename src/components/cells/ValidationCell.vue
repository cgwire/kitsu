<template>
<td
  ref="cell"
  :class="{
    validation: selectable,
    selected: selectable & selected
  }"
  :style="{
    'border-left': isBorder ? '2px solid ' + column.color : 'none',
  }"
  @click="select"
>
  <div class="wrapper">
    <validation-tag
      :task="task"
      v-if="task"
    >
    </validation-tag>
    <people-avatar
      class="person-avatar"
      :key="task.id + '-' + personId"
      :person="personMap[personId]"
      :size="20"
      :font-size="10"
      v-if="isAssignees && isShowAssignations"
      v-for="personId in assignees"
    >
    </people-avatar>
  </div>
</td>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
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
      'isShowAssignations',
      'personMap'
    ]),

    task () {
      return this.taskTest || this.entity.validations[this.column.name]
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
  }
}
</script>

<style scoped>
.validation {
  cursor: pointer;
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

.person-avatar {
  margin-left: 3px;
}
</style>
