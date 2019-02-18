<template>
<div>
  <p class="error" v-if="isError">
    {{ errorText }}
  </p>

  <p class="has-text-right">
    <a
      :class="{
        button: true,
        'is-primary': true,
        'is-loading': isLoading,
        'is-disabled': isDisabled
      }"
      @click="$emit('confirm')"
    >
      {{ $t("main.confirmation") }}
    </a>
    <button
      @click="$emit('cancel')"
      class="button is-link"
    >
      {{ $t("main.cancel") }}
    </button>
  </p>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'add-metadata-modal',

  components: {},

  props: {
    errorText: {
      type: String,
      default: ''
    },
    isDisabled: {
      type: Boolean,
      default: false
    },
    isError: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    ...mapGetters([
    ])
  },

  methods: {
    ...mapActions([
    ])
  },

  watch: {}
}
</script>

<style lang="scss" scoped>
.error {
  margin-top: 1em;
}
</style>
