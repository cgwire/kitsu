<template>
  <div ref="page" class="columns fixed-page">
    <div class="column left-side-column">
      <slot name="side" />
    </div>
    <div class="column main-column">
      <slot name="main" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'page-left-side-layout'
}
</script>
