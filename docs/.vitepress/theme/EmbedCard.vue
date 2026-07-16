<template>
  <div class="detail-card" :class="{ 'is-open': isOpen }">
    <div class="detail-card__header" @click="toggle">
      <h3 class="detail-card__title">{{ title }}</h3>
      <button
        class="detail-card__toggle"
        type="button"
        :aria-expanded="isOpen"
        @click.stop="toggle"
      >
        <span class="detail-card__icon">{{ isOpen ? '−' : '+' }}</span>
      </button>
    </div>

    <div v-show="isOpen" class="detail-card__content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  title: {
    type: String,
    required: true,
  },
})

const isOpen = ref(false)

function toggle() {
  isOpen.value = !isOpen.value
}
</script>

<style scoped>
.detail-card {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  font-family: inherit;
  margin-bottom: 1rem;
}

.detail-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
}

.detail-card__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #00b242;
}

.detail-card__toggle {
  background: none;
  border: none;
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  color: #555;
  flex-shrink: 0;
}

.detail-card__toggle:hover {
  background: rgba(0, 0, 0, 0.05);
}

.detail-card__icon {
  font-size: 1rem;
  line-height: 1;
}

.detail-card__content {
  padding: 0 16px 16px;
  color: #333;
  font-size: 0.9rem;
  line-height: 1.5;
}
</style>