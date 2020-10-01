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
      <div class="has-text-right flexrow">
        <div class="filler"></div>
        <combobox
          class="flexrow-item"
          :options="selectionOptions"
          :with-margin="false"
          v-model="selectionOnly"
          v-if="selectionOption"
        />
        <a
          :class="{
            button: true,
            'is-danger': true,
            'is-loading': isLoading
          }"
          :disabled="isLocked"
          @click="$emit('confirm', selectionOnly === 'true')">
          {{ $t("main.confirmation") }}
        </a>
        <button
          @click="$emit('cancel')"
          class="button is-link"
        >
          {{ $t('main.cancel') }}
        </button>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { modalMixin } from '@/components/modals/base_modal'

import Combobox from '@/components/widgets/Combobox'

export default {
  name: 'hard-delete-modal',
  mixins: [modalMixin],

  components: {
    Combobox
  },

  data () {
    return {
      userLockText: '',
      selectionOnly: 'true',
      selectionOptions: [
        { label: this.$t('tasks.for_selection'), value: 'true' },
        { label: this.$t('tasks.for_project'), value: 'false' }
      ]
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
    },
    selectionOption: {
      type: Boolean,
      default: false
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
.flexrow {
  align-items: center;
  justify-content: center;
}

.input {
  margin-bottom: 1em;
}
</style>
