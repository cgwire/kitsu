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
              'is-loading': isLoading
            }"
            @click="$emit('confirm')">
            {{ $t("main.confirmation") }}
          </a>
          <router-link
            :to="cancelRoute"
            class="button is-primary">
            {{ $t("main.cancel") }}
          </router-link>
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

<style scoped>
.modal-content .box p.text {
  margin-bottom: 1em;
}

.is-danger {
  color: #ff3860;
  font-style: italic;
  margin-bottom: 2em;
}
</style>
