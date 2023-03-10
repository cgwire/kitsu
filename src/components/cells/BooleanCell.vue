<template>
  <td class="has-text-centered">
    <boolean-rep class="bool-icon" :value="value" />
  </td>
</template>

<script>
import BooleanRep from '@/components/widgets/BooleanRep'

export default {
  name: 'boolean-cell',
  components: {
    BooleanRep
  },

  data() {
    return {}
  },

  props: {
    value: {
      default: false,
      type: Boolean
    }
  },

  computed: {},

  methods: {}
}
</script>

<style lang="scss" scoped>
td {
  padding-top: 11px;
  .bool-icon {
    margin-top: 0px;
  }
}
</style>
