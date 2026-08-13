<template>
  <div class="detail-card is-open">
    <div v-if="link" class="detail-card__link-bar">
      <a
        :href="link"
        target="_blank"
        rel="noopener noreferrer"
        class="detail-card__link-btn"
      >
        Open Full Page ↗
      </a>
    </div>

    <div class="detail-card__content">
      <slot></slot>
    </div>

    <div v-if="link" class="detail-card__link-bar">
      <a
        :href="link"
        target="_blank"
        rel="noopener noreferrer"
        class="detail-card__link-btn"
      >
        Open Full Page ↗
      </a>
    </div>
  </div>
</template>

<script setup>
defineProps({
  link: {
    type: String,
    default: ''
  }
})
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

.detail-card__link-bar {
  display: flex;
  justify-content: flex-end;
  padding: 8px 16px;
}

.detail-card__link-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 0.8rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.15s ease;
}

.detail-card__link-btn:hover {
  background: var(--vp-c-brand-1);
  color: var(--vp-c-white, #fff);
}
</style>