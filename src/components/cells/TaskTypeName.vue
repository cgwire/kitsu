<template>
<td class="name">
  <task-type-name
    :task-type="taskType"
    :production-id="productionId"
  />
</td>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import TaskTypeName from '../widgets/TaskTypeName'

export default {
  name: 'task-type-cell',
  components: {
    TaskTypeName
  },

  props: {
    taskType: {
      type: Object,
      default: null
    },
    productionId: {
      type: String,
      default: null
    }
  },

  computed: {
    ...mapGetters([
    ]),
    color () {
      if (this.entry.color.toUpperCase() === '#000000') return '$grey-strong'
      else return this.entry.color
    }
  },
  methods: {
    ...mapActions([
    ])
  }
}
</script>

<style lang="scss" scoped>
.tag {
  margin: 0.7em;
  padding: 1em;
  font-size: 1em;
  color: $grey-strong;
  border-radius: 0;
  font-weight: bold;
}
</style>
