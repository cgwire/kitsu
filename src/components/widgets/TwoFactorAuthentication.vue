<template>
  <div
    class="two-factor-authentication"
    :class="{
      'two-factor-authentication-profile': isProfile
    }"
  >
    <div class="field">
      <p class="control has-icon" v-if="chosenTwoFA !== 'fido'">
        <input
          class="input is-medium password"
          type="text"
          :autocomplete="isDigitCode ? 'one-time-code' : 'off'"
          :inputmode="isDigitCode ? 'numeric' : null"
          :aria-describedby="informationId"
          :placeholder="placeholderInputText"
          @input="updatePayload"
          @keyup.enter="validate"
          v-model="OTPValue"
          v-focus
        />
        <span class="icon">
          <smartphone-icon :size="20" v-if="chosenTwoFA === 'totp'" />
          <mail-icon :size="20" v-else-if="chosenTwoFA === 'email_otp'" />
          <key-icon :size="20" v-else-if="chosenTwoFA === 'recovery_code'" />
        </span>
      </p>

      <button-simple
        v-if="chosenTwoFA !== 'fido'"
        :class="{
          button: true,
          'main-button': true,
          'is-fullwidth': true,
          'is-loading': isLoading,
          'disable-button': isDisableButton
        }"
        :text="textValidateButtonOrVerify"
        @click="validate"
      />
      <p class="control error" v-if="isWrongOtp">
        {{ wrongOTPError }}
      </p>
      <p class="control error" v-else-if="errorRequestingFIDOChallenge">
        {{ $t('login.error_requesting_fido') }}
      </p>
      <p class="control error" v-if="errorSendingEmail">
        {{ $t('login.error_sending_email') }}
      </p>
      <p v-if="chosenTwoFA === 'email_otp'">
        <a
          role="button"
          tabindex="0"
          :aria-disabled="isLoading"
          @click="resendEmailOTP"
          @keydown.enter.prevent="resendEmailOTP"
          @keydown.space.prevent="resendEmailOTP"
        >
          {{ $t('login.send_email_otp') }}
        </a>
      </p>

      <p v-if="chosenTwoFA === 'fido'">
        <a
          role="button"
          tabindex="0"
          :aria-disabled="isLoading"
          @click="retryFIDOChallenge"
          @keydown.enter.prevent="retryFIDOChallenge"
          @keydown.space.prevent="retryFIDOChallenge"
        >
          {{ $t('login.retry_fido_challenge') }}
        </a>
      </p>

      <p :id="informationId" class="control">
        {{ informationTwoFA }}
      </p>
      <p class="visuallyhidden" role="status">{{ emailSendingStatus }}</p>
      <div v-if="othersTwoFA.length >= 1">
        <p class="control">
          {{ unableToVerify }}
        </p>
        <ul>
          <li :key="twoFA" v-for="twoFA in othersTwoFA">
            <a
              role="button"
              tabindex="0"
              :aria-disabled="isLoading"
              @click="chooseTwoFA(twoFA)"
              @keydown.enter.prevent="chooseTwoFA(twoFA)"
              @keydown.space.prevent="chooseTwoFA(twoFA)"
            >
              {{ changeTwoFAText(twoFA) }}
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, useId } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { SmartphoneIcon, KeyIcon, MailIcon } from 'lucide-vue-next'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'

const { t } = useI18n()
const store = useStore()

const props = defineProps({
  preferredTwoFa: {
    required: true,
    validator: prop => typeof prop === 'string' || prop === null
  },
  twoFasEnabled: {
    required: true,
    type: Array
  },
  email: {
    required: true,
    type: String
  },
  isLoading: {
    default: false,
    type: Boolean
  },
  isWrongOtp: {
    default: false,
    type: Boolean
  },
  textValidateButton: {
    default: '',
    type: String
  },
  isDisableButton: {
    default: false,
    type: Boolean
  },
  isProfile: {
    default: false,
    type: Boolean
  }
})

const emit = defineEmits(['changed-two-fa', 'validate'])

const chosenTwoFA = ref(props.preferredTwoFa)
const OTPValue = ref('')
const twoFactorPayload = ref({})
const errorSendingEmail = ref(false)
const errorRequestingFIDOChallenge = ref(false)
const emailSendingStatus = ref('')
let lastEmailSending = 0
const informationId = useId()

const textValidateButtonOrVerify = computed(
  () => props.textValidateButton || t('login.verify')
)

const isNewEmailCodeSent = computed(
  () =>
    !errorSendingEmail.value &&
    (store.getters.emailOTPCodesSent[props.email] ?? 0) > 1
)

const placeholderInputText = computed(() => {
  switch (chosenTwoFA.value) {
    case 'totp':
      return t('login.fields.totp')
    case 'email_otp':
      return t('login.fields.email_otp')
    case 'recovery_code':
      return t('login.fields.recovery_code')
  }
  return ''
})

// Recovery codes hold letters, and match none of the codes a browser offers.
const isDigitCode = computed(() =>
  ['totp', 'email_otp'].includes(chosenTwoFA.value)
)

const wrongOTPError = computed(() => {
  switch (chosenTwoFA.value) {
    case 'totp':
      return t('login.wrong_totp')
    case 'email_otp':
      return t('login.wrong_email_otp')
    case 'recovery_code':
      return t('login.wrong_recovery_code')
    case 'fido':
      return t('login.wrong_fido_challenge')
  }
  return ''
})

const informationTwoFA = computed(() => {
  switch (chosenTwoFA.value) {
    case 'totp':
      return t('login.information_totp')
    case 'email_otp':
      return isNewEmailCodeSent.value
        ? t('profile.two_factor_authentication.email_otp.new_code_sent')
        : t('login.information_email_otp')
    case 'recovery_code':
      return t('login.information_recovery_code')
    case 'fido':
      return t('login.information_fido')
  }
  return ''
})

const unableToVerify = computed(() => {
  switch (chosenTwoFA.value) {
    case 'totp':
      return t('login.unable_to_verify_totp')
    case 'email_otp':
      return t('login.unable_to_verify_email_otp')
    case 'recovery_code':
      return t('login.unable_to_verify_recovery_code')
    case 'fido':
      return t('login.unable_to_verify_fido')
  }
  return ''
})

const othersTwoFA = computed(() => {
  return props.twoFasEnabled.filter((val, _) => val !== chosenTwoFA.value)
})

const updatePayload = () => {
  twoFactorPayload.value = {}
  twoFactorPayload.value[chosenTwoFA.value] = OTPValue.value
}

// Enter in the code field lands here too: the release of the key that showed
// the field, before any code, and a second Enter while the code is checked.
const validate = () => {
  const hasCode = Object.values(twoFactorPayload.value).some(Boolean)
  if (hasCode && !props.isLoading) emit('validate', twoFactorPayload.value)
}

const removeErrors = () => {
  errorRequestingFIDOChallenge.value = false
  errorSendingEmail.value = false
}

const changeTwoFAText = twoFA => {
  switch (twoFA) {
    case 'totp':
      return t('login.choose_totp')
    case 'email_otp':
      return t('login.choose_email_otp')
    case 'recovery_code':
      return t('login.choose_recovery_code')
    case 'fido':
      return t('login.choose_fido')
  }
  return ''
}

const changeTwoFA = (twoFA, isOpening = false) => {
  removeErrors()
  emailSendingStatus.value = ''
  chosenTwoFA.value = twoFA
  // Validate would send the code typed for the method left, under its name.
  OTPValue.value = ''
  twoFactorPayload.value = {}
  if (chosenTwoFA.value === 'email_otp') {
    requestSendEmailOTP({ isOpening })
  } else if (chosenTwoFA.value === 'fido') {
    requestGetFIDOChallenge()
  }
  if (!isOpening) emit('changed-two-fa', chosenTwoFA.value)
}

// The answer to the code being checked would read as one for the new method.
const chooseTwoFA = twoFA => {
  if (!props.isLoading) changeTwoFA(twoFA)
}

// A status region speaks only when its text changes: emptied first, it reads
// the help line once a resend or a method switch has sent a code, and the
// error of a failed sending. The field takes the focus at the opening, before
// the code is sent: the help line is read again only if that code changed it.
// A newer sending or a method switch makes a result stale.
const requestSendEmailOTP = ({ isOpening = false } = {}) => {
  removeErrors()
  emailSendingStatus.value = ''
  const sending = ++lastEmailSending
  const helpBeforeSending = informationTwoFA.value
  const isStale = () =>
    sending !== lastEmailSending || chosenTwoFA.value !== 'email_otp'
  store
    .dispatch('sendEmailOTP', props.email)
    .then(() => {
      const isHelpChanged = informationTwoFA.value !== helpBeforeSending
      if (!isStale() && (!isOpening || isHelpChanged)) {
        emailSendingStatus.value = informationTwoFA.value
      }
    })
    .catch(() => {
      if (isStale()) return
      errorSendingEmail.value = true
      emailSendingStatus.value = t('login.error_sending_email')
    })
}

const requestGetFIDOChallenge = () => {
  removeErrors()
  store
    .dispatch('getFIDOChallenge', props.email)
    .then(FIDOChallenge => {
      return navigator.credentials.get({ publicKey: FIDOChallenge })
    })
    .then(FIDOAuthenticationResponse => {
      twoFactorPayload.value = {}
      twoFactorPayload.value.fido_authentication_response =
        FIDOAuthenticationResponse
      validate()
    })
    .catch(err => {
      if (err instanceof DOMException) console.error(err)
      errorRequestingFIDOChallenge.value = true
    })
}

// A new email can void the code being checked, and a new challenge opens a
// second prompt of the security key while its first response is checked.
const resendEmailOTP = () => {
  if (!props.isLoading) requestSendEmailOTP()
}

const retryFIDOChallenge = () => {
  if (!props.isLoading) requestGetFIDOChallenge()
}

onMounted(() => {
  changeTwoFA(props.preferredTwoFa, true)
})
</script>

<style lang="scss" scoped>
.button {
  margin-bottom: 1em;
  margin-top: 1em;
}

.input {
  padding: 1.5em;
}

.icon {
  padding: 0.25em;
}

.two-factor-authentication-profile {
  .button {
    border-radius: 2em;
    font-size: 1.25rem;
  }

  .input {
    padding: 1.5em;
    border-radius: 10px;
  }

  .icon {
    padding: 0.25em;
  }
}

a[aria-disabled='true'] {
  opacity: 0.5;
  pointer-events: none;
}
</style>
