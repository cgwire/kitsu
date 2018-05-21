<template>
<span
  class="tag task-type-name"
  :style="{ 'border-left': '4px solid ' + color }"
>
  {{ taskType.name }}
</span>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'task-type-name',
  components: {
  },
  props: [
    'taskType'
  ],
  computed: {
    ...mapGetters([
    ]),
    color () {
      if (this.taskType.color.toUpperCase() === '#000000') return '#666'
      else return this.taskType.color
    }
  },
  methods: {
    ...mapActions([
    ])
  }
}
</script>

<style scoped>
.tag {
  margin: 0;
  padding: 0 0.7em;
  font-size: 0.9em;
  line-height: 0.8em;
  color: #666;
  border-radius: 0;
  font-weight: bold;
}
</style>
