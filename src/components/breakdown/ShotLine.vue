<template>
<div
  :id="shotId"
  :class="{
    shot: true,
    selected: selected
  }"
  @click="onClicked"
  >
  {{ name }}
</div>
</template>

<script>
export default {
  name: 'shot-line',
  props: {
    shotId: {
      default: '',
      type: String
    },
    selected: {
      default: () => {},
      type: Boolean
    },
    name: {
      default: '',
      type: String
    }
  },
  methods: {
    onClicked (event) {
      this.$emit('click', event.target.id)
    }
  }
}
</script>
<style lang="scss" scoped>
.dark .shot:hover {
  background-color: #56595F;
}

.dark .shot.selected {
  background-color: #8F91EB;
}

.shot {
  font-size: 1.1em;
  padding: 0.5em 0 0.2em 0.2em;
  border-bottom: 1px solid #CCC;
  cursor: pointer;
}

.shot:hover {
  background: #ecfaec;
}

.shot.selected {
  background: #D1C4E9;
  border: 0;
}
</style>
