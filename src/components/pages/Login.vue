<template>
  <div class="login hero is-fullheight" v-if="!isAuthenticated">
    <div class="container has-text-centered">
      <div
        class="box has-text-left"
        :class="{
          'xyz-out': fadeAway
        }"
        xyz="fade"
      >
        <div class="has-text-centered login-header">
          <img
            src="../../assets/kitsu-text-dark.svg"
            alt="Kitsu"
            v-if="isDarkTheme"
          />
          <img src="../../assets/kitsu-text.svg" alt="Kitsu" v-else />
        </div>
        <form v-if="!(isMissingOTP || isWrongOTP)">
          <div class="field" v-if="mainConfig?.saml_enabled">
            <p class="control">
              <a
                class="button is-fullwidth"
                href="/api/auth/saml/login"
                @click="saveSSORedirect"
              >
                {{ loginSAMLButtonInfo }}
              </a>
            </p>
          </div>
          <div class="field" v-if="mainConfig?.oidc_enabled">
            <p class="control">
              <a
                class="button is-fullwidth"
                href="/api/auth/oidc/login"
                @click="saveSSORedirect"
              >
                {{ loginOIDCButtonInfo }}
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
                @keyup.enter="confirmLogIn()"
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
                @keyup.enter="confirmLogIn()"
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
          :two-fas-enabled="twoFAsEnabled"
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
            role="button"
            tabindex="0"
            @click="confirmLogIn()"
            @keydown.enter.prevent="confirmLogIn()"
            @keydown.space.prevent="confirmLogIn()"
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
        <p class="control error" v-else-if="isInactiveUserError">
          {{ $t('login.login_inactive') }}
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

<script setup>
import { useHead } from '@unhead/vue'
import { LockIcon, MailIcon } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

import auth from '@/lib/auth'

import TwoFactorAuthentication from '@/components/widgets/TwoFactorAuthentication.vue'

// Composables
// --------------------------------------------------------------------------

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore()

// State
// --------------------------------------------------------------------------

const email = ref('')
const password = ref('')
const fadeAway = ref(false)
const isInactiveUserError = ref(false)
const isMissingOTP = ref(false)
const isServerError = ref(false)
const isTooMuchLoginFailedAttemps = ref(false)
const isWrongOTP = ref(false)
const preferredTwoFA = ref('')
const twoFAsEnabled = ref([])

// Computed
// --------------------------------------------------------------------------

const isAuthenticated = computed(() => store.getters.isAuthenticated)
const isDarkTheme = computed(() => store.getters.isDarkTheme)
const isLoginError = computed(() => store.getters.isLoginError)
const isLoginLoading = computed(() => store.getters.isLoginLoading)
const mainConfig = computed(() => store.getters.mainConfig)

const loginSAMLButtonInfo = computed(() =>
  mainConfig.value?.saml_idp_name
    ? t('login.login_with_saml', {
        saml_idp_name: mainConfig.value.saml_idp_name
      })
    : t('login.saml')
)

const loginOIDCButtonInfo = computed(() =>
  mainConfig.value?.oidc_idp_name
    ? t('login.login_with_oidc', {
        oidc_idp_name: mainConfig.value.oidc_idp_name
      })
    : t('login.oidc')
)

// Functions
// --------------------------------------------------------------------------

const updateEmail = event => {
  store.dispatch('changeEmail', event.target.value)
}

const updatePassword = event => {
  store.dispatch('changePassword', event.target.value)
}

const confirmLogIn = async twoFactorPayload => {
  isInactiveUserError.value = false
  isTooMuchLoginFailedAttemps.value = false
  isWrongOTP.value = false
  isMissingOTP.value = false
  isServerError.value = false
  try {
    await store.dispatch('logIn', twoFactorPayload)
    fadeAway.value = true
    setTimeout(() => {
      router.push(route.query.redirect || '/')
    }, 500)
  } catch (err) {
    if (err.default_password) {
      router.push({
        name: 'reset-change-password',
        query: { email: email.value, token: err.token }
      })
    } else if (err.too_many_failed_login_attemps) {
      isTooMuchLoginFailedAttemps.value = true
    } else if (err.wrong_OTP) {
      isWrongOTP.value = true
    } else if (err.missing_OTP) {
      isMissingOTP.value = true
      preferredTwoFA.value = err.preferred_two_factor_authentication
      twoFAsEnabled.value = err.two_factor_authentication_enabled
    } else if (err.two_factor_authentication_required) {
      router.push({ name: 'login-2fa' })
    } else if (err.unactive) {
      isInactiveUserError.value = true
    } else if (err.server_error) {
      isServerError.value = true
    } else {
      console.error(err)
    }
  }
}

const saveSSORedirect = () => {
  auth.saveSSORedirect(route.query.redirect)
}

const changedTwoFA = () => {
  isWrongOTP.value = false
}

// Lifecycle
// --------------------------------------------------------------------------

onMounted(() => {
  email.value = store.state.login.email
  password.value = store.state.login.password
})

// Head
// --------------------------------------------------------------------------

useHead({ title: computed(() => t('login.title')) })
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
