<template>

<div :class="{
  'modal': true,
  'delete-modal': true,
  'is-active': active
}">
  <div class="modal-background" @click="$emit('cancel')" ></div>
  <div class="modal-content">
    <div class="box">
      <p class="text">{{ text }}</p>
      <p>
        <input
          type="text"
          ref="confirmation-name"
          class="input"
          v-model="userLockText"
        />
      </p>
      <p class="is-danger" v-if="isError">{{ errorText }}</p>
      <p class="has-text-right">
        <a
          :class="{
            button: true,
            'is-danger': true,
            'is-loading': isLoading
          }"
          :disabled="isLocked"
          @click="$emit('confirm')">
          {{ $t("main.confirmation") }}
        </a>
        <button
          @click="$emit('cancel')"
          class="button is-link"
        >
          {{ $t('main.cancel') }}
        </button>
      </p>
    </div>
  </div>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { modalMixin } from './base_modal'

export default {
  name: 'hard-delete-modal',
  mixins: [modalMixin],

  data () {
    return {
      userLockText: ''
    }
  },

  props: {
    text: {
      type: String,
      default: ''
    },
    active: {
      type: Boolean,
      default: false
    },
    errorText: {
      type: String,
      default: ''
    },
    isError: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    lockText: {
      type: String,
      default: 'locked'
    }
  },

  computed: {
    ...mapGetters([
    ]),

    isLocked () {
      return (
        this.lockText === 'locked' ||
        this.lockText !== this.userLockText
      )
    }
  },

  methods: {
    ...mapActions([
    ])
  },

  watch: {
    active () {
      if (this.active) {
        this.userLockText = ''
        this.$nextTick(() => {
          if (this.$refs['confirmation-name']) {
            this.$refs['confirmation-name'].focus()
          }
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.input {
  margin-bottom: 1em;
}
</style>
