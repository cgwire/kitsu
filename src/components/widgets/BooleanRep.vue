<template>
<span>
  <check-icon
    :title="$t('main.yes')"
    class="true"
    stroke-width="3"
    v-show="value"
  />
  <x-icon
    :title="$t('main.no')"
    class="false"
    stroke-width="3"
    v-show="!value"
  />
</span>
</template>

<script>
import {
  CheckIcon,
  XIcon
} from 'vue-feather-icons'

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
  width: 22px;
}

.false {
  width: 16px;
}
</style>
