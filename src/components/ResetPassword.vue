<template>
  <div class="hero is-fullheight">
    <div class="container has-text-centered">
      <div class="box has-text-left">
        <div class="has-text-centered">
          <h1 class="title">
            {{ $t("login.reset_password_title") }}
          </h1>
        </div>

        <div class="field mt2">
          <p class="control has-icon">
            <input
              class="input is-medium email"
              type="text"
              :placeholder="$t('login.fields.email')"
              @keyup.enter="confirmResetPassword"
              v-model="email"
              v-focus
            />
            <span class="icon">
              <mail-icon width=20 height=20 />
            </span>
          </p>
        </div>

        <p class="control">
          <a v-bind:class="{
            'main-button': true,
            'is-fullwidth': true,
            'is-loading': isLoading
          }"
            @click="confirmResetPassword">
              {{ $t("login.reset_password") }}
          </a>
        </p>
        <p class="error" v-show="isError">
          {{ $t("login.reset_password_failed") }}
        </p>
        <p class="success" v-show="isSuccess">
          {{ $t("login.reset_password_succeed") }}
        </p>
        <p
          class="has-text-centered"
        >
          <router-link
            :to="{name: 'login'}"
          >
            {{ $t("login.login_page")}}
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import { MailIcon } from 'vue-feather-icons'

export default {
  name: 'reset-password',

  components: {
    MailIcon
  },

  data () {
    return {
      email: '',
      isLoading: false,
      isError: false,
      isSuccess: false
    }
  },

  computed: {
    ...mapGetters([
    ])
  },

  methods: {
    ...mapActions([
      'resetPassword'
    ]),

    confirmResetPassword () {
      this.isLoading = true
      this.isError = false
      this.isSuccess = false
      this.resetPassword(this.email)
        .then(() => {
          this.isLoading = false
          this.isSuccess = true
        })
        .catch(() => {
          this.isLoading = false
          this.isError = true
          this.isSuccess = false
        })
    }
  },

  metaInfo () {
    return {
      title: this.$t('login.reset_password_title')
    }
  }
}
</script>

<style scoped>
.box h1.title {
  color: #6a6a6a;
  font-weight: 500;
  font-size: 1.4em;
  line-height: 1.6em;
}

.field {
  margin-bottom: 1em;
}

.input {
  height: 2.4em;
}

.input:focus {
  border: 1px solid #00B242;
}
</style>
