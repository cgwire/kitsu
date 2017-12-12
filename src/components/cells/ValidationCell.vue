<template>
<td
  ref="cell"
  :class="{
    validation: true,
    selected: selected
  }"
  :style="{
    'border-left': '2px solid ' + column.color,
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
      key="task.id + '-' + personId"
      :person="personMap[personId]"
      :size="20"
      :font-size="10"
      v-if="nbSelectedTasks > 0"
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
    return {
      selected: false
    }
  },

  components: {
    ValidationTag,
    PeopleAvatar
  },

  props: [
    'column',
    'entity'
  ],

  computed: {
    ...mapGetters([
      'selectedTasks',
      'nbSelectedTasks',
      'personMap'
    ]),

    task () {
      return this.entity.validations[this.column.name]
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

    select () {
      if (this.$refs.cell &&
          this.$refs.cell.className.indexOf('selected') < 0) {
        this.selected = true
        this.$emit('select', {
          entity: this.entity,
          column: this.column,
          task: this.task
        })
      } else {
        this.selected = false
        this.$emit('unselect', {
          entity: this.entity,
          column: this.column,
          task: this.task
        })
      }
    },

    isSelected () {
      return this.task !== undefined &&
             this.selectedTasks[this.task.id] !== undefined
    }
  },

  watch: {
    nbSelectedTasks () {
      if (this.nbSelectedTasks === 0) this.selected = false
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
  background: #ecfaec;
}

td.selected,
td.selected.validation:hover {
  background: #D1C4E9;
}

.person-avatar {
  margin-left: 3px;
}
</style>
