<template>
<td class="name">
  <div
    class="tag task-type-name"
    :style="{ 'border-left': '4px solid ' + color }"
  >
    {{ entry.name }}
  </div>
</td>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'task-type-cell',
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
  font-size: 1em;
  color: #666;
  border-radius: 0;
  font-weight: bold;
  cursor: default;
}
</style>
