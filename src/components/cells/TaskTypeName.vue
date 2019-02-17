<template>
<td class="name">
  <task-type-name
    :task-type="entry"
    :production-id="productionId"
  >
  </task-type-name>
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
  props: [
    'entry',
    'productionId'
  ],
  computed: {
    ...mapGetters([
    ]),
    color () {
      if (this.entry.color.toUpperCase() === '#000000') return '#666'
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
  color: #666;
  border-radius: 0;
  font-weight: bold;
}
</style>
