<template>
<div>
  <spinner class="table-info" :is-stylish="true" v-if="isLoading && !isError" />
  <div class="has-text-centered table-info" v-if="isError">
    <span class="tag is-danger">
      {{ $t('main.loading_error') }}
    </span>
  </div>
</div>
</template>

<script>
import Spinner from '@/components/widgets/Spinner'

export default {
  name: 'table-info',
  components: {
    Spinner
  },
  props: {
    isLoading: {
      type: Boolean,
      default: false
    },
    isError: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
