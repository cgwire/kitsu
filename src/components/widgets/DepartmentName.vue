<template>
  <div
    class="tag"
    :style="{ 'border-left': '4px solid ' + color }"
    v-if="department"
  >
    {{ department.name }}
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'department-name',
  components: {
  },

  props: {
    department: {
      type: Object,
      default: null
    }
  },

  computed: {
    ...mapGetters([
    ]),

    color () {
      if (this.department.color.toUpperCase() === '#000000') return '$grey-strong'
      else return this.department.color
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
  margin: 0;
  padding: 0 0.7em;
  font-size: 0.9em;
  line-height: 0.8em;
  color: $grey-strong;
  border-radius: 0;
  font-weight: bold;
}

.dark .tag {
  color: $white-grey;
  background: $dark-grey-lightest;
}
</style>
