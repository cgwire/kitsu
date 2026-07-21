<template>
  <div class="detail-card is-open">
    <div class="detail-card__content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
</script>

<style scoped>
.detail-card {
  overflow: hidden;
  font-family: inherit;
  margin-bottom: 2rem;
  margin-top: 2rem;
}

.detail-card__content {
  color: #333;
  font-size: 0.9rem;
  line-height: 1.5;
}
</style>