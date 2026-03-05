<template>
  <div>
    <spinner
      class="table-info"
      :is-stylish="true"
      v-if="isLoading && !isError"
    />
    <div class="has-text-centered table-info" v-if="isError">
      <span class="tag is-danger">
        {{ $t('main.loading_error') }}
      </span>
    </div>
  </div>
</template>

<script setup>
import Spinner from '@/components/widgets/Spinner.vue'

defineProps({
  isLoading: {
    type: Boolean,
    default: false
  },
  isError: {
    type: Boolean,
    default: false
  }
})
</script>
