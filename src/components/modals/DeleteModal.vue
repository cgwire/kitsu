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
        <p class="is-danger" v-if="isError">{{ errorText }}</p>
        <p class="has-text-right">
          <a
            :class="{
              button: true,
              'is-danger': true,
              'is-loading': isLoading
            }"
            @click="$emit('confirm')">
            {{ $t("main.confirmation") }}
          </a>
          <button
            class="button is-link"
            @click="$emit('cancel')"
          >
            {{ $t("main.cancel") }}
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
  name: 'delete-modal',
  mixins: [modalMixin],
  props: [
    'text',
    'active',
    'isLoading',
    'isError',
    'errorText'
  ],
  computed: {
    ...mapGetters([
    ])
  },
  methods: {
    ...mapActions([
    ])
  }
}
</script>

<style lang="scss" scoped>
.modal-content .box p.text {
  margin-bottom: 1em;
}

p.is-danger {
  color: #ff3860;
  font-style: italic;
  margin-bottom: 2em;
}
</style>
