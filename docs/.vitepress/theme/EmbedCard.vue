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

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  isOpen: {
    type: Boolean,
    default: false,
  },
})

const isOpen = ref(props.isOpen)

function toggle() {
  isOpen.value = !isOpen.value
}
</script>

<style scoped>
.detail-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  font-family: inherit;
  margin-bottom: 2rem;
  margin-top: 2rem;
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
  color: var(--vp-c-brand-1);
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
  color: var(--vp-c-text-2);
  flex-shrink: 0;
}

.detail-card__toggle:hover {
  background: var(--vp-c-default-soft);
}

.detail-card__icon {
  font-size: 1rem;
  line-height: 1;
}

.detail-card__content {
  padding: 0 16px 16px;
  color: var(--vp-c-text-1);
  font-size: 0.9rem;
  line-height: 1.5;
}
</style>