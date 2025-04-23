<template>
  <div :class="{ field: withMargin }">
    <label class="label" v-if="label">{{ label }}</label>
    <vue-date-picker
      auto-apply
      class="datepicker"
      :clearable="canDelete"
      :dark="isDarkTheme"
      :disabled-week-days="weekDaysDisabled ? [6, 0] : []"
      :disabled="disabled"
      :enable-time-picker="false"
      :format="format"
      hide-input-icon
      :locale="user.locale.substring(0, 2)"
      :min-date="minDate"
      :max-date="maxDate"
      :placeholder="placeholder"
      :teleport="true"
      :utc="utc ? 'preserve' : false"
      v-model="localValue"
    >
    </vue-date-picker>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'date-field',

  props: {
    canDelete: {
      default: true,
      type: Boolean
    },
    disabled: {
      default: false,
      type: Boolean
    },
    format: {
      default: 'yyyy-MM-dd',
      type: String
    },
    label: {
      default: '',
      type: String
    },
    minDate: {
      default: null,
      type: [Date, String]
    },
    maxDate: {
      default: null,
      type: [Date, String]
    },
    modelValue: {
      default: () => new Date(),
      type: [Date, String]
    },
    placeholder: {
      default: null,
      type: String
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

  computed: {
    ...mapGetters(['isDarkTheme', 'user']),

    localValue: {
      get() {
        return this.modelValue
      },
      set(value) {
        if (value?.setHours) {
          value.setHours(0, 0, 0, 0)
        }
        this.$emit('update:modelValue', value)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.datepicker {
  display: inline-flex;
  max-width: 200px;
}
</style>
