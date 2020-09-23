<template>
<div class="field">
  <label class="label" v-if="label">{{ label }}</label>
  <p class="control flexrow">
    <datepicker
      wrapper-class="datepicker"
      input-class="date-input input"
      :language="locale"
      :disabled-dates="disabledDates"
      :monday-first="true"
      format="yyyy-MM-dd"
      v-model="localValue"
    />
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
    value: {
      default: new Date(),
      type: Date
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
    ])
  },

  watch: {
    localValue () {
      this.$emit('input', this.localValue)
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
