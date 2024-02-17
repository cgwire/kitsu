<template>
  <div :class="{ field: withMargin }">
    <label class="label" v-if="label">{{ label }}</label>
    <p class="control">
      <datepicker
        wrapper-class="datepicker"
        :input-class="{
          'date-input': true,
          input: true,
          short: shortDate
        }"
        :language="locale"
        :disabled="disabled"
        :disabled-dates="disabledDates"
        :monday-first="true"
        format="yyyy-MM-dd"
        @input="$emit('input', localValue)"
        v-model="localValue"
      />
      <span
        class="clear-button unselectable"
        @click="event => clearValue(event)"
        v-if="localValue && canDelete && !disabled"
      >
        +
      </span>
    </p>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { en, fr } from 'vuejs-datepicker/dist/locale'
import Datepicker from 'vuejs-datepicker'

import { domMixin } from '@/components/mixins/dom'

export default {
  name: 'date-field',

  components: {
    Datepicker
  },

  mixins: [domMixin],

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
    shortDate: {
      default: true,
      type: Boolean
    },
    value: {
      default: () => new Date(),
      type: Date
    },
    withMargin: {
      default: true,
      type: Boolean
    }
  },

  data() {
    return {
      localValue: null
    }
  },

  mounted() {
    this.localValue = this.value
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
      this.pauseEvent(event)
      this.localValue = null
      this.$emit('input', null)
    }
  },

  watch: {
    value() {
      this.localValue = this.value
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
