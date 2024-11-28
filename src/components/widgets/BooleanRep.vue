<template>
  <check-icon
    class="true"
    :size="22"
    :stroke-width="3"
    :title="$t('main.yes')"
    v-if="value"
  />
  <x-icon
    class="false"
    :size="16"
    :stroke-width="3"
    :title="$t('main.no')"
    v-else
  />
</template>

<script>
import { CheckIcon, XIcon } from 'lucide-vue-next'

export default {
  name: 'boolean-rep',

  components: {
    CheckIcon,
    XIcon
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
.true {
  color: $light-green;
}
</style>
