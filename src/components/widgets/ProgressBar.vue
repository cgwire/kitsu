<template>
  <div class="progress-wrapper">
    <div class="progress" :style="{ width: `${progress}%` }"></div>
  </div>
</template>

<script setup>
defineProps({
  // percentage done, 0 to 100
  progress: { type: Number, default: 0 }
})
</script>

<style lang="scss" scoped>
.progress-wrapper {
  border-radius: 5px;
  background: var(--background-alt);
  height: 5px;
}

.progress {
  height: 5px;
  background-color: $light-green;
}
</style>
