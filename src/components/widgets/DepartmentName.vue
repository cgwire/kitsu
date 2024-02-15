<template>
  <span class="department-name" :class="{ 'no-padding': noPadding }">
    <span
      class="dot"
      :style="{ borderColor: department.color }"
      :title="onlyDot ? department.name : undefined"
    ></span>
    <span class="name" v-if="!onlyDot">
      {{ department.name }}
    </span>
  </span>
</template>

<script>
export default {
  name: 'department-name',

  props: {
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
  }
}
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
  border: 5px solid;
  border-radius: 50%;
}

.name {
  margin-left: 0.3em;
}
</style>
