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
        :utc="utc ? 'preserve' : false"
        v-model="localValue"
      >
        <template #input-icon></template>
      </vue-date-picker>
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
      type: [Date, String]
    },
    utc: {
      default: false,
      type: Boolean
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
      silent: false,
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
      if (!this.silent) {
        // if (this.localValue) {
        if (this.localValue?.setHours) {
          this.localValue.setHours(0, 0, 0, 0)
        }
        this.$emit('update:modelValue', this.localValue)
      }
    },

    modelValue() {
      this.silent = true
      this.localValue = this.modelValue
      this.$nextTick(() => {
        this.silent = false
      })
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
