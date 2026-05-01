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
    <div
      class="error has-text-right mt1"
      v-if="isErrorDisableTwoFactorAuthentication"
    >
      {{ $t('people.disable_2FA_error') }}
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
const isLoading = ref(false)
const isValid = ref(true)

// Computed

const modalTitle = computed(
  () => `${t('people.change_password_for')} ${props.person.name}`
)

// Functions

const confirmClicked = async () => {
  isErrorDisableTwoFactorAuthentication.value = false
  isError.value = false
  isLoading.value = true
  try {
    await store.dispatch('changePasswordPerson', {
      person: props.person,
      form: form.value
    })
    emit('confirm')
  } catch (err) {
    if (err.isValidPassword === false) isValid.value = false
    else isError.value = true
  }
  isLoading.value = false
}

const disableTwoFactorAuthenticationClicked = async () => {
  isErrorDisableTwoFactorAuthentication.value = false
  isError.value = false
  isLoading.value = true
  try {
    await store.dispatch('disableTwoFactorAuthenticationPerson', props.person)
  } catch {
    isErrorDisableTwoFactorAuthentication.value = true
  }
  isLoading.value = false
}

const resetForm = () => {
  if (!props.person) return
  form.value = { password: '', password2: '' }
  isLoading.value = false
  isError.value = false
  isErrorDisableTwoFactorAuthentication.value = false
  isValid.value = true
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
