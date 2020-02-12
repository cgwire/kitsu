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
      {{ confirmLabel || $t("main.confirmation") }}
    </a>
    <button
      @click="$emit('cancel')"
      class="button is-link"
    >
      {{ cancelLabel || $t('main.cancel') }}
    </button>
  </p>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'modal-footer',

  components: {},

  props: {
    cancelLabel: {
      type: String,
      default: ''
    },
    confirmLabel: {
      type: String,
      default: ''
    },
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
