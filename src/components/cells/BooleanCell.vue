<template>
  <td class="has-text-centered">
    <boolean-rep :value="value" />
  </td>
</template>

<script>
import BooleanRep from '@/components/widgets/BooleanRep.vue'

export default {
  name: 'boolean-cell',

  components: {
    BooleanRep
  },

  props: {
    value: {
      default: false,
      type: Boolean
    }
  }
}
</script>

<style lang="scss" scoped>
td {
  padding-top: 11px;
}
</style>
