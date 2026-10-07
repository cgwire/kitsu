<template>
  <div class="app-login hero is-fullheight">
    <div class="container">
      <div class="box">
        <div class="has-text-centered login-header">
          <img
            src="@/assets/kitsu-text-dark.svg"
            alt="Kitsu"
            v-if="isDarkTheme"
          />
          <img src="@/assets/kitsu-text.svg" alt="Kitsu" v-else />
        </div>
        <p class="error" v-if="!request">
          {{ $t('app_login.invalid_request') }}
        </p>
        <p class="error" v-else-if="errorKey">
          {{ $t(errorKey) }}
        </p>
        <template v-else>
          <p class="consent">
            {{
              appName
                ? $t('app_login.consent_named', {
                    app_name: appName,
                    full_name: user.full_name
                  })
                : $t('app_login.consent', { full_name: user.full_name })
            }}
          </p>
          <p class="warning">{{ $t('app_login.warning') }}</p>
          <button
            class="button main-button is-fullwidth is-medium"
            :class="{ 'is-loading': isLoading }"
            :disabled="isLoading"
            @click="authorize"
          >
            {{ $t('app_login.authorize') }}
          </button>
          <button
            class="button is-fullwidth is-medium mt1"
            :disabled="isLoading"
            @click="cancel"
          >
            {{ $t('main.cancel') }}
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useHead } from '@unhead/vue'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

import auth from '@/lib/auth'

// Composables
// --------------------------------------------------------------------------

const { t } = useI18n()
const route = useRoute()
const store = useStore()

// State
// --------------------------------------------------------------------------

const errorKey = ref('')
const isLoading = ref(false)

// Computed
// --------------------------------------------------------------------------

const isDarkTheme = computed(() => store.getters.isDarkTheme)
const user = computed(() => store.getters.user)

// The consent click must not be reachable from a page framing Kitsu: the
// web server in front of Kitsu may not forbid framing.
const request = computed(() =>
  window.self === window.top ? auth.parseAppLoginQuery(route.query) : null
)
const appName = computed(() => request.value?.appName)

// Functions
// --------------------------------------------------------------------------

// A top-level navigation: browsers block requests from a public page to
// the loopback address, not navigations.
const goToApp = params => {
  const query = Object.entries({ ...params, state: request.value.state })
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&')
  window.location.assign(`http://127.0.0.1:${request.value.port}/?${query}`)
}

const authorize = async () => {
  isLoading.value = true
  try {
    const { code } = await auth.createAppLoginCode(request.value.codeChallenge)
    goToApp({ code })
  } catch (err) {
    errorKey.value =
      err.status === 403 ? 'app_login.error_2fa_setup' : 'app_login.error'
  }
}

const cancel = () => {
  goToApp({ error: 'access_denied' })
}

// Head
// --------------------------------------------------------------------------

useHead({ title: computed(() => `${t('app_login.title')} - Kitsu`) })
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

.consent {
  font-weight: bold;
  margin-bottom: 1em;
  overflow-wrap: anywhere;
}

.warning {
  margin-bottom: 2em;
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
  .app-login .container {
    flex: 1;
    width: 100%;
    max-width: 100%;
    display: flex;
  }

  .app-login .box {
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
