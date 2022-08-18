<template>
<td class="name">
  <div
    class="tag"
    v-bind:class="[!disable ? '' : 'canceled']"
    :style="{
      background: color,
      color: textColor
    }"
    :title="entry.name"
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
  props: {
    entry: {
      type: Object,
      default: () => {}
    },
    disable: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapGetters([
      'isDarkTheme'
    ]),

    color () {
      if (this.entry.name === 'Todo' && this.isDarkTheme) {
        return '#5F626A'
      } else {
        return this.entry.color
      }
    },

    textColor () {
      if (this.entry.name === 'Todo' && !this.isDarkTheme) {
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

<style lang="scss" scoped>
.tag {
  margin: 0.7em;
  padding: 1em;
  font-size: 0.8em;
  color: white;
  letter-spacing: 1px;
  font-weight: 600;
  text-transform: uppercase;
}
</style>
