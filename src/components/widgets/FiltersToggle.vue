<template>
  <div class="filters-buttons">
    <button-simple
      class="reset-filters"
      icon="remove"
      :title="$t('main.clear_filters')"
      @click="$emit('reset')"
      v-if="resettable"
    />
    <button-simple
      class="filters-toggle"
      :icon="isOpen ? 'minus' : 'plus'"
      :aria-expanded="`${isOpen}`"
      :is-on="isOpen"
      :text="count ? `${count}` : ''"
      :title="$t(isOpen ? 'main.less_filters' : 'main.more_filters')"
      @click="isOpen = !isOpen"
    />
  </div>
</template>

<script setup>
/*
 * The two buttons closing a row of filters: one clears the filters set, the
 * other folds and unfolds the filters kept out of sight, and counts those
 * set among them.
 */
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'

const isOpen = defineModel({ type: Boolean, default: false })

defineProps({
  count: { type: Number, default: 0 },
  resettable: { type: Boolean, default: false }
})

defineEmits(['reset'])
</script>

<style lang="scss" scoped>
.filters-buttons {
  align-self: flex-end;
  display: flex;
  flex: none;
}

.reset-filters,
.filters-toggle {
  // Bulma's near-black button text outweighs the grey of the filter labels
  color: var(--text);
  height: 42px;
  padding: 0 14px;
}

.reset-filters {
  margin-right: 1rem;
}
</style>
