<template>
  <span class="studio-name" :class="{ 'no-padding': noPadding }" v-if="studio">
    <span class="square" :title="onlySquare ? studio.name : null"></span>
    <span class="name" v-if="!onlySquare">
      {{ studio.name }}
    </span>
  </span>
</template>

<script setup>
defineProps({
  noPadding: {
    type: Boolean,
    default: false
  },
  onlySquare: {
    type: Boolean,
    default: false
  },
  studio: {
    type: Object,
    required: true
  }
})
</script>

<style lang="scss" scoped>
.studio-name {
  display: inline-block;
  color: var(--text);
  padding: 0.2em 0.6em;
  white-space: nowrap;

  &.no-padding {
    padding: 0;
  }
}

.square {
  display: inline-block;
  width: 10px;
  height: 10px;
  background-color: v-bind('studio?.color');
}

.name {
  margin-left: 0.3em;
}
</style>
