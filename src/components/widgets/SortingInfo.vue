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
    label: {
      type: String,
      default: function () {
        return this.$t('main.sorted_by')
      }
    },
    sorting: {
      type: Array,
      required: true
    }
  },

  computed: {
    text() {
      return `${this.label} ${this.sorting[0]?.name}`
    }
  }
}
</script>

<style lang="scss" scoped>
.sorting-info {
  align-self: end;
}
</style>
