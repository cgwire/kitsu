<template>
  <span
    class="bool-field flexrow"
    :class="{
      field: isField,
      'is-true': localValue,
      small: isSmall
    }"
    :disabled="disabled || null"
    @click="onClick"
  >
    <span class="icon-wrapper flexrow-item">
      <check-icon
        class="true"
        :size="12"
        :stroke-width="3"
        :title="$t('main.yes')"
        v-if="localValue"
      />
      <x-icon
        class="false"
        :size="12"
        :stroke-width="3"
        :title="$t('main.no')"
        v-else
      />
    </span>
    <span class="flexrow-item">
      {{ label }}
    </span>
  </span>
</template>

<script>
import { CheckIcon, XIcon } from 'lucide-vue-next'

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
    modelValue: {
      default: 'false',
      type: String
    },
    disabled: {
      default: false,
      type: Boolean
    },
    isField: {
      default: false,
      type: Boolean
    },
    isSmall: {
      default: false,
      type: Boolean
    }
  },

  emits: ['click', 'update:modelValue'],

  data() {
    return {
      localValue: false
    }
  },

  methods: {
    emitValue() {
      this.$emit('update:modelValue', this.localValue ? 'true' : 'false')
    },

    onClick() {
      this.localValue = !this.localValue
      this.$emit('click', this.localValue ? 'true' : 'false')
      this.emitValue()
    }
  },

  watch: {
    modelValue: {
      immediate: true,
      handler() {
        this.localValue = this.modelValue === 'true'
      }
    },

    localValue() {
      // this.emitValue()
    }
  }
}
</script>

<style lang="scss" scoped>
.true {
  color: $light-green;
}

.icon-wrapper {
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

.bool-field.flexrow-item:first-child {
  margin-right: 0;
}

.small {
  font-size: 0.8em;
  padding: 0.2em 0.8em 0.2em 1.8em;
  position: relative;

  .icon-wrapper {
    position: absolute;
    top: 4px;
    left: 6px;
  }
}
</style>
