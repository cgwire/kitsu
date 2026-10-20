<template>
  <div class="hero is-fullheight">
    <div class="container has-text-centered">
      <div class="box has-text-left">
        <div class="has-text-centered">
          <h1 class="title">
            {{ $t('login.reset_password_title') }}
          </h1>
        </div>

        <div class="field mt2">
          <p class="control has-icon">
            <input
              class="input is-medium email"
              type="email"
              :placeholder="$t('login.fields.email')"
              @keyup.enter="confirmResetPassword"
              v-model.trim="email"
              v-focus
            />
            <span class="icon">
              <mail-icon :size="20" />
            </span>
          </p>
        </div>

        <p class="control" v-if="!isSuccess">
          <a
            class="button main-button is-fullwidth"
            :class="{
              'is-loading': isLoading
            }"
            role="button"
            tabindex="0"
            @click="confirmResetPassword"
            @keydown.enter.prevent="confirmResetPassword"
            @keydown.space.prevent="confirmResetPassword"
          >
            {{ $t('login.reset_password') }}
          </a>
        </p>
        <p class="success" v-if="isSuccess">
          {{ $t('login.reset_password_succeed') }}
        </p>
        <p class="error" v-else-if="isError">
          {{ $t('login.reset_password_failed') }}
        </p>
        <p class="has-text-centered">
          <router-link :to="{ name: 'login' }">
            {{ isSuccess ? $t('login.back_to_login') : $t('login.login_page') }}
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useHead } from '@unhead/vue'
import { MailIcon } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

// Composables
// --------------------------------------------------------------------------

const { t } = useI18n()
const store = useStore()

// State
// --------------------------------------------------------------------------

const email = ref('')
const isError = ref(false)
const isLoading = ref(false)
const isSuccess = ref(false)

// Functions
// --------------------------------------------------------------------------

const confirmResetPassword = async () => {
  isLoading.value = true
  isError.value = false
  isSuccess.value = false
  try {
    await store.dispatch('resetPassword', email.value)
    isSuccess.value = true
  } catch {
    isError.value = true
  } finally {
    isLoading.value = false
  }
}

// Lifecycle
// --------------------------------------------------------------------------

onMounted(() => {
  email.value = store.state.login.email
})

// Head
// --------------------------------------------------------------------------

useHead({ title: computed(() => t('login.reset_password_title')) })
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
    color: $grey;
  }

  &:focus {
    border: 1px solid $green;
  }
}

.icon {
  padding: 0.25em;
}
</style>
