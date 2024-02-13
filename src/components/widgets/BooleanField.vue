<template>
  <span
    class="field bool-field flexrow"
    :class="{ 'is-true': localValue }"
    :disabled="disabled"
    @click="onClick"
  >
    <span class="icon-wrapper flexrow-item">
      <check-icon
        :title="$t('main.yes')"
        class="true"
        stroke-width="3"
        v-if="localValue"
      />
      <x-icon :title="$t('main.no')" class="false" stroke-width="3" v-else />
    </span>
    <span class="flexrow-item">
      {{ label }}
    </span>
  </span>
</template>

<script>
import { CheckIcon, XIcon } from 'vue-feather-icons'

export default {
  name: 'boolean-field',

  components: {
    CheckIcon,
    XIcon
  },

  props: {
    label: {
      default: '',
      type: String
    },
    value: {
      default: 'false',
      type: String
    },
    disabled: {
      default: false,
      type: Boolean
    }
  },

  data() {
    return {
      localValue: false
    }
  },

  methods: {
    emitValue() {
      this.$emit('input', this.localValue ? 'true' : 'false')
    },

    onClick() {
      this.localValue = !this.localValue
      this.$emit('click', this.localValue ? 'true' : 'false')
    }
  },

  watch: {
    value: {
      immediate: true,
      handler() {
        this.localValue = this.value === 'true'
      }
    },

    localValue() {
      this.emitValue()
    }
  }
}
</script>

<style lang="scss" scoped>
.true {
  color: $light-green;
}

.true,
.false {
  height: 12px;
  width: 12px;
}

.icon-wrapper {
  height: 12px;
  width: 12px;
  margin-right: 5px;
}

.field {
  margin-right: 0.5em;
}

.bool-field {
  align-items: center;
  border: 2px solid var(--border);
  border-radius: 25px;
  color: $grey;
  cursor: pointer;
  display: inline-block;
  font-size: 0.9em;
  font-weight: 500;
  padding: 0.5em 1.2em;
  text-transform: uppercase;
  transition: 0.3s ease all;

  &[disabled] {
    opacity: 0.5;
    pointer-events: none;
  }

  &.is-true {
    color: $light-green;
    border: 2px solid $light-green;
  }
}
</style>
