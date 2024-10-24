<template>
  <div :class="{ field: withMargin }">
    <label class="label" v-if="label">{{ label }}</label>
    <p class="control">
      <vue-date-picker
        auto-apply
        class="datepicker"
        :clearable="canDelete"
        :disabled="disabled"
        :enable-time-picker="false"
        :format="'yyyy-MM-dd'"
        :min-date="minDate"
        :max-date="maxDate"
        :locale="user.locale.substring(0, 2)"
        :dark="isDarkTheme"
        :disabled-week-days="weekDaysDisabled ? [6, 0] : []"
        v-model="localValue"
      />
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
    label: {
      default: '',
      type: String
    },
    minDate: {
      default: null,
      type: Date
    },
    maxDate: {
      default: null,
      type: Date
    },
    modelValue: {
      default: () => new Date(),
      type: Date
    },
    weekDaysDisabled: {
      default: false,
      type: Boolean
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
    ...mapGetters(['user', 'isDarkTheme'])
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
    localValue() {
      this.$emit('update:modelValue', this.localValue)
    },

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

.datepicker {
  max-width: 200px;
}
</style>
