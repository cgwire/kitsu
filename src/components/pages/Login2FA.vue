<template>
  <div class="login hero is-fullheight" v-if="user">
    <div class="container">
      <div class="box">
        <div class="has-text-centered login-header">
          <img src="@/assets/kitsu-text-dark.svg" v-if="isDarkTheme" />
          <img src="@/assets/kitsu-text.svg" v-else />
        </div>
        <p class="has-text-centered mandatory-message">
          {{ $t('profile.two_factor_authentication.mandatory') }}
        </p>
        <two-factor-authentication-setup show-cancel-button />
        <hr />
        <button
          class="button save-button is-medium mt1"
          :disabled="!twoFAEnabled"
          @click="continueLogin"
        >
          {{ $t('main.continue') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useHead } from '@unhead/vue'

import TwoFactorAuthenticationSetup from '@/components/widgets/TwoFactorAuthenticationSetup.vue'

const { t } = useI18n()
const router = useRouter()
const store = useStore()

const isDarkTheme = computed(() => store.getters.isDarkTheme)
const user = computed(() => store.getters.user)

const twoFAEnabled = computed(
  () =>
    user.value?.totp_enabled ||
    user.value?.email_otp_enabled ||
    user.value?.fido_enabled
)

function continueLogin() {
  router.push('/')
}

useHead({
  title: `${t('profile.two_factor_authentication.title')} - Kitsu`
})
</script>

<style lang="scss" scoped>
.box {
  border-radius: 1em;
}

.container {
  max-width: 500px;
}

.login-header img {
  border-radius: 20%;
  padding: 1em;
  margin: 2.5em 0;
  width: 200px;
}

.mandatory-message {
  margin-bottom: 2em;
  font-weight: bold;
}

.save-button {
  width: 100%;
  background: $green;
  border-color: $green;
  color: $white;

  &:hover {
    background: $light-green;
    border-color: $light-green;
  }
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
