<template>
  <div class="hero is-fullheight">
    <div class="container has-text-centered">
      <div class="box has-text-left" :aria-busy="isCheckingToken">
        <div class="has-text-centered">
          <h1 class="title">
            {{ title }}
          </h1>
        </div>

        <div class="token-check" :class="{ 'is-checking': isCheckingToken }">
          <spinner class="token-spinner" v-if="isCheckingToken" />

          <div class="field mt2" v-if="!isTokenError">
            <input
              type="email"
              autocomplete="username"
              :value="route.query.email"
              hidden
            />
            <p class="control has-icon">
              <input
                ref="passwordRef"
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
              v-if="!isSuccess && !isTokenError"
            >
              {{
                isNew
                  ? $t('login.set_password')
                  : $t('login.reset_change_password')
              }}
            </a>
          </p>
        </div>
        <p class="error" v-if="isFormError">
          {{ $t('login.reset_change_password_form_failed') }}
        </p>
        <p
          ref="tokenErrorRef"
          class="error mt2"
          :role="isDeadOnOpen ? 'alert' : undefined"
          tabindex="-1"
          v-else-if="isTokenError && !isNewLinkSent"
        >
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
        <template v-if="isTokenError">
          <p
            ref="newLinkSentRef"
            class="success mt2"
            tabindex="-1"
            v-if="isNewLinkSent"
          >
            {{ $t('login.new_link_sent_to') }}
            <span class="sent-address">{{ route.query.email }}</span>
            {{ $t('login.new_link_use_most_recent') }}
          </p>
          <p class="control mt1" v-else>
            <a
              class="button main-button is-fullwidth"
              :class="{ 'is-loading': isSendingLink }"
              role="button"
              tabindex="0"
              @click="sendNewLink"
              @keydown.enter.prevent="sendNewLink"
              @keydown.space.prevent="sendNewLink"
            >
              {{ $t('login.send_new_link') }}
            </a>
          </p>
          <p class="error" role="alert" v-if="isSendLinkError">
            {{ $t('login.send_new_link_failed') }}
          </p>
        </template>
        <p class="has-text-centered mt2">
          <router-link :to="{ name: 'login' }">
            <span v-if="isSuccess || isTokenError">
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
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

import auth from '@/lib/auth'
import errors from '@/lib/errors'

import Spinner from '@/components/widgets/Spinner.vue'

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
// Zou tells if the link is still valid before the form shows.
const isCheckingToken = ref(Boolean(route.query.email && route.query.token))
const isDeadOnOpen = ref(false)
const isNewLinkSent = ref(false)
const isSendingLink = ref(false)
const isSendLinkError = ref(false)
const secondsLeft = ref(5)
const passwordRef = ref(null)
const tokenErrorRef = ref(null)
const newLinkSentRef = ref(null)

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

// The field or button that had the focus goes away with the form: hand the
// focus to the message that replaces it, so the keyboard stays on the page.
const focusOnceShown = async elementRef => {
  await nextTick()
  elementRef.value?.focus()
}

const confirmResetChangePassword = async () => {
  // Enter in a field submits too, whatever the button shows, and Zou spends
  // the token on the first success. The form waits for the check of its link.
  if (isLoading.value || isSuccess.value || isCheckingToken.value) return
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
      await focusOnceShown(tokenErrorRef)
    } else {
      isError.value = true
    }
  } finally {
    isLoading.value = false
  }
}

const checkToken = async () => {
  try {
    const isValid = await store.dispatch('checkResetToken', {
      email: route.query.email,
      token: route.query.token
    })
    isTokenError.value = !isValid
    isDeadOnOpen.value = !isValid
  } catch (err) {
    // The API client reported the failed request, the 404 of an older Zou
    // without the route included. The form shows: setting the password
    // checks the link anyway. A bug stays unhandled for Sentry.
    if (!errors.isRequestFailure(err)) throw err
  } finally {
    isCheckingToken.value = false
  }
  // Hidden during the check, the field missed the v-focus. The message of
  // a dead link is an alert instead: a focus given on load would draw its
  // ring for mouse users too.
  await nextTick()
  if (document.activeElement === document.body) passwordRef.value?.focus()
}

const sendNewLink = async () => {
  if (isSendingLink.value) return
  isSendLinkError.value = false
  isSendingLink.value = true
  try {
    await store.dispatch('resetPassword', route.query.email)
    isNewLinkSent.value = true
    await focusOnceShown(newLinkSentRef)
  } catch (err) {
    isSendLinkError.value = true
    // The API client reported a failed request: a bug stays unhandled.
    if (!errors.isRequestFailure(err)) throw err
  } finally {
    isSendingLink.value = false
  }
}

// Lifecycle
// --------------------------------------------------------------------------

onMounted(async () => {
  store.commit('LOGIN_SUCCESS')
  // Awaited, a bug of the check reaches the error handler of the app.
  if (isCheckingToken.value) await checkToken()
})

onBeforeUnmount(() => {
  clearInterval(redirectInterval)
})

// Head
// --------------------------------------------------------------------------

useHead({ title })
</script>

<style lang="scss" scoped>
// The box keeps one width, the 400 px cap of App.vue, while the form gives
// way to the message of a dead link, then to the confirmation that a new
// link was sent.
.container {
  width: 100%;
}

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

// Inline, the length of the address would move the line breaks of the
// message. On a line of its own, it never shares a line with the sentences
// around it, and a very long one breaks inside the box.
.sent-address {
  display: block;
  overflow-wrap: break-word;
}

// While Zou checks the link, the form keeps its place, so the box does not
// change size, and the spinner shows only if the answer is slow.
.token-check {
  position: relative;
}

.is-checking > :not(.token-spinner) {
  visibility: hidden;
}

.token-spinner {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  animation: appear 0s 0.3s forwards;
}

@keyframes appear {
  to {
    opacity: 1;
  }
}
</style>
