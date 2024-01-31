<template functional>
  <div class="" v-if="props.sorting.length > 0">
    <div @click="listeners['clear-sorting']()" class="sort-tag">
    {{ props.label }} {{ props.sorting[0].name }}
    </div>
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

<style lang="scss" scoped>
.sort-tag {
  border: 1px solid var(--border-alt);
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.75rem;
  margin-bottom: 0.5rem;
  float: right;
  padding: 0.25rem 0.5rem;
}
</style>
