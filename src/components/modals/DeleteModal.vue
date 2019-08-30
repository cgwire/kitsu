<template>
<div :class="{
  'modal': true,
  'delete-modal': true,
  'is-active': active
}">
  <div class="modal-background"></div>
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
          <router-link
            :to="cancelRoute"
            class="button is-text"
            v-if="cancelRoute"
          >
            {{ $t("main.cancel") }}
          </router-link>
          <button
            class="button is-text"
            @click="$emit('cancel')"
            v-else
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

export default {
  name: 'delete-modal',
  props: [
    'text',
    'active',
    'cancelRoute',
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
