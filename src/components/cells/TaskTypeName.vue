<template>
<td class="name">
  <div
    class="tag task-type-name"
    :style="{ 'border-left': '3px solid ' + color }"
  >
    {{ entry.name }}
  </div>
</td>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'task-type-name',
  components: {
  },
  props: [
    'entry'
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

<style scoped>
.tag {
  margin: 0.7em;
  padding: 1em;
  font-size: 0.8em;
  color: #666;
  border-radius: 0;
}
</style>
