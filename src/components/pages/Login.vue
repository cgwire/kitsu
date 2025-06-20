<template>
  <div class="login hero is-fullheight">
    <div class="container has-text-centered">
      <div
        class="box has-text-left"
        :class="{
          'xyz-out': fadeAway
        }"
        xyz="fade"
      >
        <div class="has-text-centered login-header">
          <img src="../../assets/kitsu-text-dark.svg" v-if="isDarkTheme" />
          <img src="../../assets/kitsu-text.svg" v-else />
        </div>
        <form v-if="!(isMissingOTP || isWrongOTP)">
          <div class="field" v-if="mainConfig?.saml_enabled">
            <p class="control">
              <a
                class="button is-fullwidth"
                :class="{
                  'is-loading': isLoginLoading
                }"
                href="/api/auth/saml/login"
              >
                {{ loginSAMLButtonInfo }}
              </a>
            </p>
          </div>
          <div class="field mt2">
            <p class="control has-icon">
              <input
                class="input is-medium email"
                type="email"
                autocomplete="username"
                :placeholder="$t('login.fields.email')"
                @input="updateEmail"
                @keyup.enter="confirmLogIn"
                v-model="email"
                v-focus
              />
              <span class="icon">
                <mail-icon :size="20" />
              </span>
            </p>
          </div>
          <div class="field">
            <p class="control has-icon">
              <input
                class="input is-medium password"
                type="password"
                autocomplete="current-password"
                :placeholder="$t('login.fields.password')"
                @input="updatePassword"
                @keyup.enter="confirmLogIn"
                v-model="password"
              />
              <span class="icon">
                <lock-icon :size="20" />
              </span>
            </p>
          </div>
        </form>
        <two-factor-authentication
          v-if="isMissingOTP || isWrongOTP"
          :preferred-two-fa="preferredTwoFA"
          :two-fas-enabled="TwoFAsEnabled"
          :is-loading="isLoginLoading"
          :email="email"
          :is-wrong-otp="isWrongOTP"
          @validate="confirmLogIn"
          @changed-two-fa="changedTwoFA"
        />
        <p v-if="!(isMissingOTP || isWrongOTP)" class="control">
          <a
            class="button main-button is-fullwidth"
            :class="{
              'is-loading': isLoginLoading
            }"
            @click="confirmLogIn"
          >
            {{ $t('login.login') }}
          </a>
        </p>
        <p class="control error" v-if="isServerError">
          {{ $t('login.login_server_failed') }}
        </p>
        <p class="control error" v-else-if="isTooMuchLoginFailedAttemps">
          {{ $t('login.too_many_failed_login_attemps') }}
        </p>
        <p
          class="control error"
          v-else-if="isLoginError && !isMissingOTP && !isWrongOTP"
        >
          {{ $t('login.login_failed') }}
        </p>

        <p v-if="!(isMissingOTP || isWrongOTP)" class="has-text-centered">
          <router-link :to="{ name: 'reset-password' }">
            {{ $t('login.forgot_password') }}
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { MailIcon, LockIcon } from 'lucide-vue-next'

import TwoFactorAuthentication from '@/components/widgets/TwoFactorAuthentication.vue'

export default {
  name: 'login',

  components: {
    MailIcon,
    LockIcon,
    TwoFactorAuthentication
  },

  data() {
    return {
      email: '',
      password: '',
      isTooMuchLoginFailedAttemps: false,
      isWrongOTP: false,
      isMissingOTP: false,
      isServerError: false,
      preferredTwoFA: '',
      TwoFAsEnabled: [],
      fadeAway: false
    }
  },

  mounted() {
    this.fadeAway = false
    this.email = this.$store.state.login.email
    this.password = this.$store.state.login.password
  },

  computed: {
    ...mapGetters([
      'isDarkTheme',
      'isLoginLoading',
      'isLoginError',
      'mainConfig'
    ]),

    loginSAMLButtonInfo() {
      if (this.mainConfig?.saml_idp_name) {
        return this.$t('login.login_with_saml', {
          saml_idp_name: this.mainConfig.saml_idp_name
        })
      } else {
        return this.$t('login.saml')
      }
    }
  },

  methods: {
    ...mapActions(['logIn']),

    updateEmail(e) {
      this.$store.dispatch('changeEmail', e.target.value)
    },

    updatePassword(e) {
      this.$store.dispatch('changePassword', e.target.value)
    },

    confirmLogIn(twoFactorPayload) {
      this.isTooMuchLoginFailedAttemps = false
      this.isWrongOTP = false
      this.isMissingOTP = false
      this.isServerError = false
      this.logIn({
        twoFactorPayload,
        callback: (err, success) => {
          if (err) {
            if (err.default_password) {
              this.$router.push({
                name: 'reset-change-password',
                query: { email: this.email, token: err.token }
              })
            } else if (err.too_many_failed_login_attemps) {
              this.isTooMuchLoginFailedAttemps = true
            } else if (err.wrong_OTP) {
              this.isWrongOTP = true
            } else if (err.missing_OTP) {
              this.isMissingOTP = true
              this.preferredTwoFA = err.preferred_two_factor_authentication
              this.TwoFAsEnabled = err.two_factor_authentication_enabled
            } else if (err.server_error) {
              this.isServerError = true
            } else {
              console.error(err)
            }
          }
          if (success) {
            this.fadeAway = true
            setTimeout(() => {
              if (this.$route.query.redirect) {
                this.$router.push(this.$route.query.redirect)
              } else {
                this.$router.push('/')
              }
            }, 500)
          }
        }
      })
    },

    changedTwoFA(twoFA) {
      this.isWrongOTP = false
    }
  },

  head() {
    return {
      title: this.$t('login.title')
    }
  }
}
</script>

<style lang="scss" scoped>
.box {
  border-radius: 1em;

  h1.title {
    color: #6a6a6a;
    font-weight: 300;
    font-size: 1.8em;
    margin-bottom: 1em;
  }

  h2.subtitle {
    color: #4a4a4a;
    margin-bottom: 1em;
  }
}

.login-header img {
  border-radius: 20%;
  padding: 1em;
  margin: 2.5em 0;
  width: 200px;
}

.field {
  margin-bottom: 1em;
}

.input {
  height: 3em;
  padding: 1.5em;
  border-radius: 4px;

  &::placeholder {
    color: #999;
  }

  &:focus {
    border: 1px solid $green;
  }
}

.icon {
  padding: 0.25em;
}

.error {
  text-align: center;
}

@media (max-width: 1600px) {
  .box {
    margin-top: 4em;
  }
}

@media (min-width: 500px) {
  .container {
    margin: 0 auto;
  }
}

@media (max-width: 500px) {
  .login .container {
    flex: 1;
    width: 100%;
    max-width: 100%;
    display: flex;
  }

  .login .box {
    flex: 1;
  }

  .hero {
    display: flex;
    flex-direction: column;
  }

  .box {
    margin: 0;
    width: 100%;
    min-width: 100%;
  }
}
</style>
