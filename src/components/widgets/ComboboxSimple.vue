<template>
<div class="field">
  <label class="label" v-if="label.length > 0">
    {{ label }}
  </label>
  <div
    class="flexrow"
  >
    <span
      :key="option.label"
      :class="{
        'choice':true,
        'flexrow-item': true,
        'selected': selectedOption.value === option.value
      }"
      @click="selectOption(option)"
      v-for="option in options"
    >
      {{ getOptionLabel(option) }}
    </span>
  </div>
</div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'combobox-styled',

  components: {
  },

  data () {
    return {
      selectedOption: {
        label: '',
        value: ''
      },
      showList: false
    }
  },

  props: {
    label: {
      default: '',
      type: String
    },
    options: {
      default: () => [],
      type: Array
    },
    value: {
      default: '',
      type: String
    },
    localeKeyPrefix: {
      default: '',
      type: String
    }
  },

  mounted () {
    if (this.options.length > 0) {
      this.selectedOption = this.options[0]
    }
  },

  computed: {
    ...mapGetters([
      'isDarkTheme'
    ])
  },

  methods: {
    selectOption (option) {
      this.$emit('input', option.value)
      this.selectedOption = option
    },

    getOptionLabel (option) {
      if (this.localeKeyPrefix.length > 0) {
        return this.$t(this.localeKeyPrefix + option.label.toLowerCase())
      } else {
        return option.label
      }
    }
  },

  watch: {
    options () {
      if (this.options.length > 0) {
        const option = this.options.find(o => o.value === this.value)
        if (option) {
          this.selectedOption = option
        } else {
          this.selectedOption = this.options[0]
        }
      }
    },

    value () {
      this.selectedOption = this.options.find(o => o.value === this.value)
    }
  }
}
</script>

<style lang="scss" scoped>
.choice {
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

  &.selected {
    color: $light-green;
    border: 2px solid $light-green;
  }
}
</style>
