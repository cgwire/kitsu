<template>
  <div class="hero is-fullheight">
    <div class="container has-text-centered">
      <div class="box has-text-left">
        <div class="has-text-centered">
          <h1 class="title">
            {{ title }}
          </h1>
        </div>

        <div class="field mt2">
          <p class="control has-icon">
            <input
              class="input is-medium email"
              type="password"
              autocomplete="new-password"
              :placeholder="$t('login.fields.password')"
              @keyup.enter="confirmResetChangePassword"
              v-model="password"
              v-focus
            />
            <span class="icon">
              <lock-icon :size="20" />
            </span>
          </p>
          <p class="control has-icon">
            <input
              class="input is-medium email"
              type="password"
              autocomplete="new-password"
              :placeholder="$t('login.fields.password2')"
              @keyup.enter="confirmResetChangePassword"
              v-model="password2"
            />
            <span class="icon">
              <lock-icon :size="20" />
            </span>
          </p>
        </div>

        <p class="control">
          <a
            class="button main-button is-fullwidth"
            :class="{ 'is-loading': isLoading }"
            role="button"
            tabindex="0"
            @click="confirmResetChangePassword"
            @keydown.enter.prevent="confirmResetChangePassword"
            @keydown.space.prevent="confirmResetChangePassword"
            v-if="!isSuccess"
          >
            {{
              isNew
                ? $t('login.set_password')
                : $t('login.reset_change_password')
            }}
          </a>
        </p>
        <p class="error" v-if="isFormError">
          {{ $t('login.reset_change_password_form_failed') }}
        </p>
        <p class="error" v-else-if="isTokenError">
          {{ $t('login.reset_change_password_token_failed') }}
        </p>
        <p class="error" v-else-if="isError">
          {{ $t('login.reset_change_password_failed') }}
        </p>
        <p class="success" v-if="isSuccess">
          {{ $t('login.reset_change_password_succeed') }}
        </p>
        <p class="has-text-centered mt2" v-if="isSuccess">
          {{ $t('login.redirecting', { count: secondsLeft }) }}
        </p>
        <p class="has-text-centered mt2">
          <router-link :to="{ name: 'login' }">
            <span v-if="isSuccess">
              {{ $t('login.back_to_login') }}
            </span>
            <span v-else>
              {{ $t('login.login_page') }}
            </span>
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useHead } from '@unhead/vue'
import { LockIcon } from 'lucide-vue-next'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

import auth from '@/lib/auth'

// Composables
// --------------------------------------------------------------------------

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore()

// State
// --------------------------------------------------------------------------

const password = ref('')
const password2 = ref('')
const isError = ref(false)
const isFormError = ref(false)
const isLoading = ref(false)
const isSuccess = ref(false)
const isTokenError = ref(false)
const secondsLeft = ref(5)

let redirectInterval = null

// Computed
// --------------------------------------------------------------------------

const isNew = computed(() => route.query.type === 'new')
const title = computed(() =>
  isNew.value
    ? t('login.set_password_title')
    : t('login.reset_change_password_title')
)

// Functions
// --------------------------------------------------------------------------

const confirmResetChangePassword = async () => {
  // Enter in a field submits too, whatever the button shows, and Zou spends
  // the token on the first success.
  if (isLoading.value || isSuccess.value) return
  isError.value = false
  isFormError.value = false
  isTokenError.value = false
  if (!auth.isPasswordValid(password.value, password2.value)) {
    isFormError.value = true
    return
  }
  isLoading.value = true
  try {
    await store.dispatch('resetChangePassword', {
      email: route.query.email,
      token: route.query.token,
      password: password.value,
      password2: password2.value
    })
    isSuccess.value = true
    redirectInterval = setInterval(() => {
      secondsLeft.value--
      if (secondsLeft.value === 0) {
        clearInterval(redirectInterval)
        router.push({ name: 'login' })
      }
    }, 1000)
  } catch (error) {
    if (error.body?.message?.includes('Wrong or expired token')) {
      isTokenError.value = true
    } else {
      isError.value = true
    }
  } finally {
    isLoading.value = false
  }
}

// Lifecycle
// --------------------------------------------------------------------------

onMounted(() => {
  store.commit('LOGIN_SUCCESS')
})

onBeforeUnmount(() => {
  clearInterval(redirectInterval)
})

// Head
// --------------------------------------------------------------------------

useHead({ title })
</script>

<style lang="scss" scoped>
.box {
  border-radius: 1em;
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
</style>
