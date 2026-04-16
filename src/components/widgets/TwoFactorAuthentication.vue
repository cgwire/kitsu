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
      <p class="control error" v-else-if="errorSendingEmail">
        {{ $t('login.error_sending_email') }}
      </p>
      <p v-if="chosenTwoFA === 'email_otp'">
        <a @click="requestSendEmailOTP">
          {{ $t('login.send_email_otp') }}
        </a>
      </p>

      <p v-if="chosenTwoFA === 'fido'">
        <a @click="requestGetFIDOChallenge">
          {{ $t('login.retry_fido_challenge') }}
        </a>
      </p>

      <p class="control">
        {{ informationTwoFA }}
      </p>
      <div v-if="othersTwoFA.length >= 1">
        <p class="control">
          {{ unableToVerify }}
        </p>
        <ul>
          <li :key="twoFA" v-for="twoFA in othersTwoFA">
            <a @click="changeTwoFA(twoFA)">
              {{ changeTwoFAText(twoFA) }}
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
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

const chosenTwoFA = ref('')
const OTPValue = ref('')
const twoFactorPayload = ref({})
const errorSendingEmail = ref(false)
const errorRequestingFIDOChallenge = ref(false)
const textValidateButtonOrVerify = ref('')

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
      return t('login.information_email_otp')
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

const validate = () => {
  emit('validate', twoFactorPayload.value)
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

const changeTwoFA = (twoFA, emitChanged = true) => {
  removeErrors()
  chosenTwoFA.value = twoFA
  if (chosenTwoFA.value === 'email_otp') {
    requestSendEmailOTP()
  } else if (chosenTwoFA.value === 'fido') {
    requestGetFIDOChallenge()
  }
  if (emitChanged) emit('changed-two-fa', chosenTwoFA.value)
}

const requestSendEmailOTP = () => {
  removeErrors()
  store.dispatch('sendEmailOTP', props.email).catch(() => {
    errorSendingEmail.value = true
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

onMounted(() => {
  changeTwoFA(props.preferredTwoFa, false)
  if (props.textValidateButton) {
    textValidateButtonOrVerify.value = props.textValidateButton
  } else {
    textValidateButtonOrVerify.value = t('login.verify')
  }
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
</style>
