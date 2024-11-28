<template>
  <button-simple
    class="sorting-info mb05 is-small"
    icon="remove"
    :text="text"
    :title="$t('main.clear_sorting')"
    @click="$emit('clear-sorting')"
  />
</template>

<script>
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'

export default {
  name: 'sorting-info',

  components: {
    ButtonSimple
  },

  props: {
    sorting: {
      type: Array,
      required: true
    }
  },

  emits: ['clear-sorting'],

  computed: {
    text() {
      return `${this.$t('main.sorted_by')} ${this.sorting[0]?.name}`
    }
  }
}
</script>

<style lang="scss" scoped>
.sorting-info {
  align-self: end;
}
</style>
