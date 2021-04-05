<template>
<div :class="{ field: withMargin }">
  <label class="label" v-if="label">{{ label }}</label>
  <p class="control flexrow">
    <datepicker
      wrapper-class="datepicker"
      :input-class="{
        'date-input': true,
        input: true,
        short: shortDate
      }"
      :language="locale"
      :disabled-dates="disabledDates"
      :monday-first="true"
      format="yyyy-MM-dd"
      @input="$emit('input', localValue)"
      v-model="localValue"
    />
    <span
      class="clear-button unselectable"
      @click="event => clearValue(event)"
      v-show="localValue && canDelete"
    >
      +
    </span>
  </p>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { en, fr } from 'vuejs-datepicker/dist/locale'
import Datepicker from 'vuejs-datepicker'

import { domMixin } from '@/components/mixins/dom'

export default {
  name: 'text-field',

  components: {
    Datepicker
  },

  mixins: [domMixin],

  props: {
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
      default: new Date(),
      type: Date
    },
    canDelete: {
      default: true,
      type: Boolean
    },
    withMargin: {
      default: true,
      type: Boolean
    }
  },

  data () {
    return {
      localValue: null
    }
  },

  mounted () {
    this.localValue = this.value
  },

  computed: {
    ...mapGetters([
      'user'
    ]),

    locale () {
      if (this.user.locale === 'fr_FR') {
        return fr
      } else {
        return en
      }
    }
  },

  methods: {
    ...mapActions([
    ]),

    clearValue (event) {
      this.pauseEvent(event)
      this.localValue = null
      this.$emit('input', null)
    }
  },

  watch: {
    value () {
      this.localValue = this.value
    },
    localValue () {
    }
  }
}
</script>
<style lang="scss" scoped>
.control {
  position: relative;
}

.clear-button {
  cursor: pointer;
  position: absolute;
  right: 5px;
  top: 0px;
  color: $light-grey;
  transform: rotate(45deg);
}
</style>
