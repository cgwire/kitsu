<template>
  <td class="has-text-centered">
    <boolean-rep :value="value" />
  </td>
</template>

<script setup>
import BooleanRep from '@/components/widgets/BooleanRep.vue'

defineProps({
  value: { type: Boolean, default: false }
})
</script>

<style lang="scss" scoped>
td {
  padding-top: 11px;
}
</style>
