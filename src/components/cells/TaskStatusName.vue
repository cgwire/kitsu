<template>
<td class="name">
  <div
    class="tag"
    :style="{
      background: color,
      color: textColor
    }"
  >
    {{ entry.short_name }}
  </div>
</td>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'task-status-name',
  components: {
  },
  props: [
    'entry'
  ],
  computed: {
    ...mapGetters([]),
    color () {
      return this.entry.color
    },
    textColor () {
      if (this.entry.short_name === 'todo') {
        return '#333'
      } else {
        return 'white'
      }
    }
  },
  methods: {
    ...mapActions([])
  }
}
</script>

<style scoped>
.tag {
  margin: 0.7em;
  padding: 1em;
  font-size: 1em;
  color: white;
  text-transform: uppercase;
}
</style>
