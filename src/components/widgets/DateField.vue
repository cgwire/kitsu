<template>
  <div :class="{ field: withMargin }">
    <label class="label" v-if="label">{{ label }}</label>
    <p class="control">
      <vue-date-picker></vue-date-picker>
      <span
        class="clear-button unselectable"
        @click.stop="clearValue"
        v-if="localValue && canDelete && !disabled"
      >
        +
      </span>
    </p>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'date-field',

  components: {},

  props: {
    canDelete: {
      default: true,
      type: Boolean
    },
    disabled: {
      default: false,
      type: Boolean
    },
    disabledDates: {
      default: () => {},
      type: Object
    },
    invalid: {
      default: false,
      type: Boolean
    },
    label: {
      default: '',
      type: String
    },
    shortDate: {
      default: true,
      type: Boolean
    },
    modelValue: {
      default: () => new Date(),
      type: Date
    },
    withMargin: {
      default: true,
      type: Boolean
    }
  },

  emits: ['update:modelValue'],

  data() {
    return {
      localValue: null
    }
  },

  mounted() {
    this.localValue = this.modelValue
  },

  computed: {
    ...mapGetters(['user']),

    locale() {
      if (this.user.locale === 'fr_FR') {
        return fr
      } else {
        return en
      }
    }
  },

  methods: {
    clearValue(event) {
      this.localValue = null
      this.updateValue(null)
    },

    updateValue(value) {
      this.$emit('update:modelValue', value)
    }
  },

  watch: {
    modelValue() {
      this.localValue = this.modelValue
    }
  }
}
</script>
<style lang="scss" scoped>
.control {
  display: inline-flex;
}

.clear-button {
  cursor: pointer;
  position: absolute;
  right: 5px;
  top: 0;
  color: $light-grey;
  transform: rotate(45deg);
}
</style>
