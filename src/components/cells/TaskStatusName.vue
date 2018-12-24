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
    ...mapGetters([
      'isDarkTheme'
    ]),

    color () {
      if (this.entry.short_name === 'todo' && this.isDarkTheme) {
        return '#5F626A'
      } else {
        return this.entry.color
      }
    },

    textColor () {
      if (this.entry.short_name === 'todo' && !this.isDarkTheme) {
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
  font-size: 0.8em;
  color: white;
  text-transform: uppercase;
}
</style>
