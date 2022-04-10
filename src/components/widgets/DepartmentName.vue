<template>
<div
>
  <span
    class="dot"
    :style="{ 'border': '5px solid ' + color }"
    v-if="!onlyDot"
  >
  </span>
  <span
    class="dot"
    :style="{ 'border': '5px solid ' + color }"
    :title="department.name"
    v-if="onlyDot"
  >
  </span>
  <span v-if="!onlyDot">
    {{ department.name }}
  </span>
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
    },
    onlyDot: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    ...mapGetters([
    ]),

    color () {
      return this.department.color
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
  border-radius: 5px;
  display: inline-block;
  padding: 0.2em 0.6em;
}

span.dot {
  border-radius: 20px;
  font-weight: 500;
  display: inline-block;
  height: 8px;
  margin-right: 0.3em;
  padding: 0em;
  width: 8px;
}

span {
  color: var(--text);
}
</style>
