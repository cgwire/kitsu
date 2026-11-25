<template>
  <div class="flexrow field-header">
    <span class="flexrow-item">
      <slot>{{ label }}</slot>
      <arrow-up-icon
        class="sort-direction-icon"
        :size="12"
        v-if="sortDirection === 'asc'"
      />
      <arrow-down-icon
        class="sort-direction-icon"
        :size="12"
        v-else-if="sortDirection === 'desc'"
      />
    </span>
    <span
      class="asset-field-menu-button header-icon pointer"
      :title="$t('main.column_options')"
      role="button"
      tabindex="0"
      @click="showMenu"
      @keydown.enter.prevent="showMenu"
      @keydown.space.prevent="showMenu"
    >
      <chevron-down-icon :size="14" />
    </span>
    <slot name="actions" />
  </div>
</template>

<script setup>
import { ArrowDownIcon, ArrowUpIcon, ChevronDownIcon } from 'lucide-vue-next'
import { computed, inject } from 'vue'

const props = defineProps({
  fieldName: { type: String, required: true },
  label: { type: String, default: '' }
})

const emit = defineEmits(['show-menu'])

// Provided by entityListMixin: the active { column, ascending } field sort.
const activeFieldSort = inject('activeFieldSort', null)

const sortDirection = computed(() => {
  const sort = activeFieldSort?.value
  if (sort && sort.column === props.fieldName) {
    return sort.ascending === false ? 'desc' : 'asc'
  }
  return null
})

const showMenu = event => {
  emit('show-menu', props.fieldName, props.label, event)
}
</script>

<style lang="scss" scoped>
.sort-direction-icon {
  margin-left: 0.2em;
  vertical-align: middle;
}
</style>
