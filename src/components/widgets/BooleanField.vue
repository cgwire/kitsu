<template>
  <div class="field">
    <span
      :class="{
        'bool-field': true,
        flexrow: true,
        'is-true': localValue
      }"
      :disabled="disabled"
      @click="onClick"
    >
      <span class="icon-wrapper flexrow-item">
        <check-icon
          :title="$t('main.yes')"
          class="true"
          stroke-width="3"
          v-show="localValue"
        />
        <x-icon
          :title="$t('main.no')"
          class="false"
          stroke-width="3"
          v-show="!localValue"
        />
      </span>
      <span class="flexrow-item">
        {{ label }}
      </span>
    </span>
  </div>
</template>

<script>
import { CheckIcon, XIcon } from 'vue-feather-icons'

export default {
  name: 'combobox-field',

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

  mounted() {
    if (this.value === 'true') this.localValue = true
  },

  computed: {},

  methods: {
    emitValue() {
      if (this.localValue) this.$emit('input', 'true')
      else this.$emit('input', 'false')
    },

    emitEnter() {
      this.emitValue()
    },

    onClick() {
      this.localValue = !this.localValue
    }
  },

  watch: {
    value() {
      if (this.value === 'true') this.localValue = true
      else this.localValue = false
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

.false {
}

.field {
  display: inline-block;
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

  &.is-true {
    color: $light-green;
    border: 2px solid $light-green;
  }
}
</style>
