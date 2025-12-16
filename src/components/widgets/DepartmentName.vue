<template>
  <span
    class="department-name"
    :class="{ 'no-padding': noPadding }"
    v-if="department"
  >
    <span class="dot" :title="onlyDot ? department.name : null"></span>
    <span class="name" v-if="!onlyDot">
      {{ department.name }}
    </span>
  </span>
</template>

<script setup>
defineProps({
  department: {
    type: Object,
    required: true
  },
  noPadding: {
    type: Boolean,
    default: false
  },
  onlyDot: {
    type: Boolean,
    default: false
  }
})
</script>

<style lang="scss" scoped>
.department-name {
  display: inline-block;
  color: var(--text);
  padding: 0.2em 0.6em;
  white-space: nowrap;

  &.no-padding {
    padding: 0;
  }
}

.dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  background-color: v-bind('department?.color');
  border-radius: 50%;
}

.name {
  margin-left: 0.3em;
}
</style>
