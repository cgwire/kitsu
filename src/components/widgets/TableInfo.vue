<template>
  <div>
    <list-loading-skeleton
      :rows="rows"
      :cells="cells"
      :with-thumbnail="withThumbnail"
      :with-actions="withActions"
      :big-cells="bigCells"
      v-if="isLoading && variant === 'list' && !isError"
    />
    <kanban-loading-skeleton
      v-if="isLoading && variant === 'kanban' && !isError"
    />
    <grid-loading-skeleton v-if="isLoading && variant === 'grid' && !isError" />
    <div class="has-text-centered table-info" v-if="isError">
      <span class="tag is-danger">
        {{ $t('main.loading_error') }}
      </span>
    </div>
  </div>
</template>

<script setup>
import GridLoadingSkeleton from '@/components/widgets/GridLoadingSkeleton.vue'
import KanbanLoadingSkeleton from '@/components/widgets/KanbanLoadingSkeleton.vue'
import ListLoadingSkeleton from '@/components/widgets/ListLoadingSkeleton.vue'

defineProps({
  isLoading: { type: Boolean, default: false },
  isError: { type: Boolean, default: false },
  variant: {
    type: String,
    default: 'list',
    validator: v => ['list', 'kanban', 'grid'].includes(v)
  },
  rows: { type: Number, default: 8 },
  cells: { type: Number, default: 6 },
  withThumbnail: { type: Boolean, default: true },
  withActions: { type: Boolean, default: true },
  bigCells: { type: Boolean, default: false }
})
</script>
