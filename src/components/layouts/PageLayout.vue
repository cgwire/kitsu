<template>
  <div ref="page" class="columns fixed-page">
    <div class="column main-column">
      <slot name="main" />
    </div>
    <div class="column side-column" v-if="side">
      <slot name="side" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'page-layout',

  props: {
    side: {
      type: Boolean,
      default: true
    }
  }
}
</script>
