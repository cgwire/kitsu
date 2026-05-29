<template>
  <section class="card">
    <h2 class="card-title" v-if="title">{{ title }}</h2>
    <slot />
    <div
      class="card-actions"
      v-if="$slots.actions || error || success || saveLabel"
    >
      <p class="error" v-if="error">{{ error }}</p>
      <p class="success" v-else-if="success">{{ success }}</p>
      <slot name="actions" />
      <button
        class="button save-button"
        :class="{ 'is-loading': loading }"
        :disabled="disabled || loading"
        type="button"
        @click="$emit('save')"
        v-if="saveLabel"
      >
        {{ saveLabel }}
      </button>
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: { type: String, default: '' },
  error: { type: String, default: '' },
  success: { type: String, default: '' },
  saveLabel: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false }
})

defineEmits(['save'])
</script>

<style lang="scss" scoped>
.card {
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 6px 16px rgba(0, 0, 0, 0.06);
  color: var(--text);
  padding: 1.75rem 2rem;

  :deep(label.label) {
    color: var(--text);
  }
}

.dark .card {
  background: var(--background-alt);
}

.card-title {
  border-bottom: none;
  color: var(--text);
  font-size: 1.2rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  margin: 0 0 2.5rem;
  text-transform: uppercase;
}

.card-actions {
  align-items: center;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;

  .error,
  .success {
    flex: 1;
    margin: 0;
  }

  .success {
    color: $green;
  }
}

.save-button {
  background: $green;
  border-color: $green;
  color: $white;
  min-width: 8rem;

  &:hover:not([disabled]) {
    background: $light-green;
    border-color: $light-green;
  }
}

@media screen and (max-width: 768px) {
  .card {
    padding: 1.25rem;
  }
}
</style>
