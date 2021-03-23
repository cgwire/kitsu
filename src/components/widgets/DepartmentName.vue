<template>
<div
  :style="{ 'border': '2px solid ' + color }"
>
  <span
    class="dot"
    :style="{ 'border': '5px solid ' + color, color }"
  >
  </span>
  <span>
    {{ department.name }}
  </span>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
// import colors from '@/lib/colors'

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
      if (this.department.color.toUpperCase() === '#000000') {
        return '$grey-strong'
      } else return this.department.color
    }
  },

  methods: {
    ...mapActions([
    ])
  }
}
</script>

<style lang="scss" scoped>
div {
  display: inline-block;
  padding: 0.4em 0.6em;
  border-radius: 5px;
}

span.dot {
  display: inline-block;
  height: 8px;
  width: 8px;
  border-radius: 20px;
  font-weight: 500;
  padding: 0em;
  margin-right: 0.6em;
}

span {
  color: var(--text);
}
</style>
