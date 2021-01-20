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
      v-model="localValue"
    />
    <span
      class="clear-button unselectable"
      @click="clearValue"
      v-show="localValue">
      +
    </span>
  </p>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { en, fr } from 'vuejs-datepicker/dist/locale'
import Datepicker from 'vuejs-datepicker'

export default {
  name: 'text-field',
  components: {
    Datepicker
  },
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

    clearValue () {
      this.localValue = null
    }
  },

  watch: {
    value () {
      this.localValue = this.value
    },
    localValue () {
      this.$emit('input', this.localValue)
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
