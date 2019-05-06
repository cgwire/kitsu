<template>
  <div class="hero is-fullheight">
    <div class="container has-text-centered">
      <div class="box has-text-left">
        <div class="has-text-centered">
          <h1 class="title">
            {{ $t("login.reset_change_password_title") }}
          </h1>
        </div>

        <div class="field mt2">
          <p class="control has-icon">
            <input
              class="input is-medium email"
              type="password"
              :placeholder="$t('login.fields.password')"
              @keyup.enter="confirmResetChangePassword"
              v-model="password"
              v-focus
            />
            <span class="icon">
              <lock-icon width=20 height=20 />
            </span>
          </p>
          <p class="control has-icon">
            <input
              class="input is-medium email"
              type="password"
              :placeholder="$t('login.fields.password2')"
              @keyup.enter="confirmResetChangePassword"
              v-model="password2"
            />
            <span class="icon">
              <lock-icon width=20 height=20 />
            </span>
          </p>
        </div>

        <p class="control">
          <a v-bind:class="{
            'main-button': true,
            'is-fullwidth': true,
            'is-loading': isLoading
          }"
            @click="confirmResetChangePassword">
              {{ $t("login.reset_change_password") }}
          </a>
        </p>
        <p class="error" v-show="isFormError">
          {{ $t("login.reset_change_password_form_failed") }}
        </p>
        <p class="error" v-show="isError">
          {{ $t("login.reset_change_password_failed") }}
        </p>
        <p class="success" v-show="isSuccess">
          {{ $t("login.reset_change_password_succeed") }}
        </p>
        <p
          class="has-text-centered"
        >
          <router-link
            :to="{ name: 'login' }"
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

import { LockIcon } from 'vue-feather-icons'
import auth from '../../lib/auth'

export default {
  name: 'reset-password',

  components: {
    LockIcon
  },

  data () {
    return {
      password: '',
      password2: '',
      isLoading: false,
      isError: false,
      isFormError: false,
      isSuccess: false
    }
  },

  mounted () {
    this.$store.commit('LOGIN_SUCCESS')
  },

  computed: {
    ...mapGetters([
    ])
  },

  methods: {
    ...mapActions([
      'resetChangePassword'
    ]),

    confirmResetChangePassword () {
      this.isFormError = false
      this.isError = false
      if (auth.isPasswordValid(this.password, this.password2)) {
        this.isLoading = true
        this.isSuccess = false
        this.resetChangePassword({
          token: this.$route.params.token,
          password: this.password,
          password2: this.password2
        })
          .then(() => {
            this.isLoading = false
            this.isSuccess = true
            setTimeout(() => {
              this.$router.push({ name: 'login' })
            }, 3000)
          })
          .catch(() => {
            this.isLoading = false
            this.isError = true
            this.isSuccess = false
          })
      } else {
        this.isFormError = true
      }
    }
  },

  metaInfo () {
    return {
      title: this.$t('login.reset_change_password_title')
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
