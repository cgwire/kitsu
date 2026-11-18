<template>
  <base-modal :active="active" :title="modalTitle" @cancel="$emit('cancel')">
    <form @submit.prevent>
      <text-field
        ref="firstPassword"
        autocomplete="new-password"
        :disabled="person.is_generated_from_ldap"
        :label="$t('people.fields.password')"
        type="password"
        @enter="confirmClicked"
        v-model="form.password"
      />
      <text-field
        autocomplete="new-password"
        :disabled="person.is_generated_from_ldap"
        :label="$t('people.fields.password_2')"
        type="password"
        @enter="confirmClicked"
        v-model="form.password2"
      />
    </form>

    <div class="flexrow">
      <button
        :class="{
          button: true,
          'is-primary': true,
          'flexrow-item': true,
          'is-loading': isLoading
        }"
        :disabled="person.is_generated_from_ldap"
        @click="confirmClicked"
      >
        {{ $t('profile.change_password.button') }}
      </button>
      <button
        :class="{
          button: true,
          'flexrow-item': true,
          'is-loading': isLoading,
          'is-warning': true
        }"
        :disabled="
          !(
            person.totp_enabled ||
            person.email_otp_enabled ||
            person.fido_enabled
          )
        "
        @click="disableTwoFactorAuthenticationClicked"
      >
        {{ $t('people.disable_2FA') }}
      </button>
      <div class="filler"></div>

      <button class="button is-link flexrow-item" @click="$emit('cancel')">
        {{ $t('main.cancel') }}
      </button>
    </div>

    <div class="error has-text-right mt1" v-if="!isValid">
      {{ $t('profile.change_password.unvalid') }}
    </div>
    <div class="error has-text-right mt1" v-if="isError">
      {{ $t('people.change_password_error') }}
    </div>
    <div class="error has-text-right mt1" v-if="isPasswordChangeRefused">
      {{ $t('people.change_password_refused') }}
    </div>
    <div
      class="error has-text-right mt1"
      v-if="isErrorDisableTwoFactorAuthentication"
    >
      {{ $t('people.disable_2FA_error') }}
    </div>
    <div
      class="error has-text-right mt1"
      v-if="isDisableTwoFactorAuthenticationRefused"
    >
      {{ $t('people.disable_2FA_refused') }}
    </div>
  </base-modal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import BaseModal from '@/components/modals/BaseModal.vue'
import TextField from '@/components/widgets/TextField.vue'

const { t } = useI18n()
const store = useStore()

// Props / Emits

const props = defineProps({
  active: { type: Boolean, default: false },
  person: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['cancel', 'confirm'])

// State

const form = ref({ password: '', password2: '' })
const firstPassword = ref(null)
const isError = ref(false)
const isErrorDisableTwoFactorAuthentication = ref(false)
const isDisableTwoFactorAuthenticationRefused = ref(false)
const isLoading = ref(false)
const isPasswordChangeRefused = ref(false)
const isValid = ref(true)

// Computed

const modalTitle = computed(
  () => `${t('people.change_password_for')} ${props.person.name}`
)

// Functions

// Zou keeps the password of another admin who has one, or of a protected
// account, for its owner. Its 400 also refuses a short or mismatched
// password: only the message tells them apart.
const isPasswordChangeRefusal = err =>
  /protected accounts|another admin's password/.test(err.body?.message ?? '')

// Same for the two-factor authentication of another admin, with the 400
// it also gives when the person has none.
const isTwoFactorAuthenticationRefusal = err =>
  /other admins/.test(err.body?.message ?? '')

const clearMessages = () => {
  isError.value = false
  isErrorDisableTwoFactorAuthentication.value = false
  isDisableTwoFactorAuthenticationRefused.value = false
  isPasswordChangeRefused.value = false
  isValid.value = true
}

const confirmClicked = async () => {
  clearMessages()
  isLoading.value = true
  try {
    await store.dispatch('changePasswordPerson', {
      person: props.person,
      form: form.value
    })
    emit('confirm')
  } catch (err) {
    if (err.isValidPassword === false) {
      isValid.value = false
    } else if (isPasswordChangeRefusal(err)) {
      isPasswordChangeRefused.value = true
    } else {
      isError.value = true
    }
  }
  isLoading.value = false
}

const disableTwoFactorAuthenticationClicked = async () => {
  clearMessages()
  isLoading.value = true
  try {
    await store.dispatch('disableTwoFactorAuthenticationPerson', props.person)
  } catch (err) {
    if (isTwoFactorAuthenticationRefusal(err)) {
      isDisableTwoFactorAuthenticationRefused.value = true
    } else {
      isErrorDisableTwoFactorAuthentication.value = true
    }
  }
  isLoading.value = false
}

const resetForm = () => {
  if (!props.person) return
  form.value = { password: '', password2: '' }
  isLoading.value = false
  clearMessages()
}

// Watchers

watch(() => props.person, resetForm)

watch(
  () => props.active,
  active => {
    if (active) {
      resetForm()
      setTimeout(() => {
        firstPassword.value?.focus()
      }, 100)
    }
  }
)
</script>
