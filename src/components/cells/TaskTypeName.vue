<template>
<td class="name">
  <task-type-name
    :task-type="taskType"
    :production-id="productionId"
    :disable="disable"
  />
</td>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import TaskTypeName from '@/components/widgets/TaskTypeName'

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
    },
    disable: {
      type: Boolean,
      default: false
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
  color: var(--text);
  border-radius: 0;
  font-weight: bold;
}
</style>
