<template>
  <span class="studio-name" :class="{ 'no-padding': noPadding }">
    <span
      class="square"
      :style="{ backgroundColor: studio.color }"
      :title="onlyDot ? studio.name : undefined"
    ></span>
    <span class="name" v-if="!onlyDot">
      {{ studio.name }}
    </span>
  </span>
</template>

<script>
export default {
  name: 'studio-name',

  props: {
    noPadding: {
      type: Boolean,
      default: false
    },
    onlyDot: {
      type: Boolean,
      default: false
    },
    studio: {
      type: Object,
      required: true
    }
  }
}
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
}

.name {
  margin-left: 0.3em;
}
</style>
