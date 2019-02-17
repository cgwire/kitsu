<template>
<div>
  <spinner class="table-info" v-if="isLoading"></spinner>
  <div class="has-text-centered table-info" v-if="isError">
    <span class="tag is-danger">
      {{ $t('main.loading_error') }}
    </span>
  </div>
</div>
</template>

<script>
import Spinner from './Spinner'

export default {
  name: 'table-footer',
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
