<template functional>
<div
  class="has-text-right"
  v-if="props.sorting.length > 0"
>
  {{ props.label }} {{ props.sorting[0].name }}
  <a
    @click="listeners['clear-sorting']()"
  >x</a>
</div>
</template>

<script>
export default {
  name: 'sorting-info',
  functional: true,

  props: {
    label: {
      default: 'Sorted by',
      type: String
    },
    sorting: {
      default: () => [],
      type: Array
    }
  }
}
</script>

<style lang="scss">
</style>
