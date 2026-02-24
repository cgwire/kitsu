<template>
  <div class="two-factor-authentication-setup">
    <p
      v-if="showCancelButton && twoFAButtonsDisabled"
      class="cancel-two-factor-action"
    >
      <x-circle-icon
        class="action-icon"
        :size="20"
        @click="cancelCurrentTwoFactorAuthAction"
      />
    </p>

    <div v-if="twoFA.TOTPPreEnabled" class="qrcode-informations">
      <p>
        {{ $t('profile.two_factor_authentication.scan_qrcode') }}
      </p>

      <qrcode-vue
        class="qrcode"
        :value="twoFA.TOTPProvisionningUri"
        :size="300"
        level="M"
      />

      <text-field
        :label="$t('profile.two_factor_authentication.otp_secret')"
        :readonly="true"
        type="text"
        v-model.trim="twoFA.OTPSecret"
        v-if="twoFA.OTPSecret"
      />
    </div>

    <div class="field" v-if="twoFA.TOTPPreEnabled || twoFA.emailOTPPreEnabled">
      <p class="control has-icon">
        <input
          class="input is-medium otp-input"
          type="text"
          v-model.trim="twoFA.validationOTP"
          @keyup.enter="nextEnable"
          :placeholder="placeholderInputEnableOTP"
          v-focus
        />
        <span class="icon">
          <lock-icon :size="20" />
        </span>
      </p>
    </div>

    <div v-if="twoFA.OTPRecoveryCodes">
      <label class="label label-recovery-codes">
        {{ $t('profile.two_factor_authentication.recovery_codes.title') }}
      </label>
      <x-circle-icon
        class="action-icon"
        :size="20"
        @click="cancelCurrentTwoFactorAuthAction"
      />
      <save-icon
        class="action-icon"
        :size="20"
        @click="saveRecoveryCodesToFile"
      />
      <copy-icon
        class="action-icon"
        :size="20"
        @click="copyRecoveryCodesToClipboard"
      />
      <textarea
        class="input recovery-codes"
        v-text="twoFA.OTPRecoveryCodes.join('\t')"
        readonly
      ></textarea>

      <p class="show-message error recovery-codes-warning">
        {{ $t('profile.two_factor_authentication.recovery_codes.warning') }}
      </p>
    </div>

    <two-factor-authentication
      v-else-if="twoFAVerificationNeeded"
      :preferred-two-fa="user.preferred_two_factor_authentication"
      :two-fas-enabled="twoFAsEnabled"
      :is-loading="twoFA.isLoading"
      :email="user.email"
      :text-validate-button="textValidateTwoFA"
      :is-disable-button="validateTwoFAIsDisable"
      :is-wrong-otp="twoFA.error.isWrongOTP"
      :is-profile="true"
      @validate="nextWithPayload"
      @changed-two-fa="changedTwoFA"
    />

    <button
      v-if="twoFA.TOTPPreEnabled || twoFA.emailOTPPreEnabled"
      class="two-fa-button button save-button is-medium"
      :class="{ 'is-loading': twoFA.isLoading }"
      @click="nextEnable()"
    >
      {{ textValidateNewTwoFA }}
    </button>

    <p
      class="show-message-2fa error"
      :class="{
        'is-hidden': !(
          twoFA.error.isWrongOTP &&
          (twoFA.TOTPPreEnabled || twoFA.emailOTPPreEnabled)
        )
      }"
    >
      {{ textWrongOTPError }}
    </p>

    <div class="field" v-if="twoFA.FIDOPreRegistered">
      <p class="control has-icon">
        <input
          class="input is-medium otp-input"
          type="text"
          v-model.trim="twoFA.FIDONewDeviceName"
          @keyup.enter="registerFIDORequested"
          :placeholder="
            $t('profile.two_factor_authentication.fido.device_name')
          "
          v-focus
        />
        <span class="icon">
          <key-icon :size="20" />
        </span>
      </p>
    </div>

    <button
      v-if="twoFA.FIDOPreRegistered"
      class="two-fa-button button save-button is-medium"
      :class="{ 'is-loading': twoFA.isLoading }"
      @click="registerFIDORequested()"
    >
      {{ $t('profile.two_factor_authentication.fido.button_register') }}
    </button>

    <p
      class="show-message-2fa error"
      :class="{ 'is-hidden': !twoFA.error.registerFIDO }"
    >
      {{ $t('profile.two_factor_authentication.fido.error_register') }}
    </p>

    <button
      v-if="!user.totp_enabled && !twoFA.TOTPPreEnabled"
      class="two-fa-button button save-button is-medium"
      :class="{
        'is-disabled': twoFAButtonsDisabled,
        'is-loading': twoFA.isLoading
      }"
      @click="preEnableTOTPRequested()"
    >
      {{ $t('profile.two_factor_authentication.totp.button_enable') }}
    </button>

    <button
      v-else-if="!twoFA.TOTPNeedTwoFA && !twoFA.TOTPPreEnabled"
      class="two-fa-button button disable-button is-medium"
      :class="{
        'is-disabled': twoFAButtonsDisabled,
        'is-loading': twoFA.isLoading
      }"
      @click="disableTOTPRequested()"
    >
      {{ $t('profile.two_factor_authentication.totp.button_disable') }}
    </button>

    <p
      class="show-message-2fa error"
      :class="{ 'is-hidden': !twoFA.error.enableTOTP }"
    >
      {{ $t('profile.two_factor_authentication.totp.error_enable') }}
    </p>

    <p
      class="show-message-2fa error"
      :class="{ 'is-hidden': !twoFA.error.disableTOTP }"
    >
      {{ $t('profile.two_factor_authentication.totp.error_disable') }}
    </p>

    <button
      v-if="!user.email_otp_enabled && !twoFA.emailOTPPreEnabled"
      class="two-fa-button button save-button is-medium"
      :class="{
        'is-disabled': twoFAButtonsDisabled,
        'is-loading': twoFA.isLoading
      }"
      @click="preEnableEmailOTPRequested()"
    >
      {{ $t('profile.two_factor_authentication.email_otp.button_enable') }}
    </button>

    <button
      v-else-if="!twoFA.emailOTPNeedTwoFA && !twoFA.emailOTPPreEnabled"
      class="two-fa-button button disable-button is-medium"
      :class="{
        'is-disabled': twoFAButtonsDisabled,
        'is-loading': twoFA.isLoading
      }"
      @click="disableEmailOTPRequested()"
    >
      {{ $t('profile.two_factor_authentication.email_otp.button_disable') }}
    </button>

    <p
      class="show-message-2fa error"
      :class="{ 'is-hidden': !twoFA.error.enableEmailOTP }"
    >
      {{ $t('profile.two_factor_authentication.email_otp.error_enable') }}
    </p>

    <p
      class="show-message-2fa error"
      :class="{ 'is-hidden': !twoFA.error.disableEmailOTP }"
    >
      {{ $t('profile.two_factor_authentication.email_otp.error_disable') }}
    </p>

    <button
      v-if="!twoFA.FIDOPreRegistered"
      class="two-fa-button button save-button is-medium"
      :class="{
        'is-disabled': twoFAButtonsDisabled,
        'is-loading': twoFA.isLoading
      }"
      @click="preRegisterFIDORequested()"
    >
      {{ $t('profile.two_factor_authentication.fido.button_register') }}
    </button>

    <button
      v-if="twoFAEnabled && !twoFA.newRecoveryCodesNeedTwoFA"
      class="two-fa-button button save-button is-medium"
      :class="{
        'is-disabled': twoFAButtonsDisabled,
        'is-loading': twoFA.isLoading
      }"
      @click="newRecoveryCodesRequested()"
    >
      {{ $t('profile.two_factor_authentication.recovery_codes.button_new') }}
    </button>

    <p
      class="show-message-2fa error"
      :class="{ 'is-hidden': !twoFA.error.newRecoveryCodes }"
    >
      {{ $t('profile.two_factor_authentication.recovery_codes.error_new') }}
    </p>

    <label class="label" v-if="user.fido_enabled">
      {{
        $t('profile.two_factor_authentication.fido.registered_devices_title')
      }}
    </label>

    <ul class="pa1" v-if="user.fido_devices?.length">
      <li
        :key="`${device}-${index}`"
        v-for="(device, index) in user.fido_devices"
      >
        {{ device }}
        <trash-icon
          class="action-icon pull-right"
          :size="15"
          @click="unregisterFIDORequested(device)"
        />
      </li>
    </ul>

    <p
      class="show-message-2fa error"
      :class="{ 'is-hidden': !twoFA.error.unregisterFIDO }"
    >
      {{ $t('profile.two_factor_authentication.fido.error_unregister') }}
    </p>
  </div>
</template>

<script setup>
import { reactive, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import QrcodeVue from 'qrcode.vue'
import {
  LockIcon,
  CopyIcon,
  SaveIcon,
  XCircleIcon,
  KeyIcon,
  TrashIcon
} from 'lucide-vue-next'

import TextField from '@/components/widgets/TextField.vue'
import TwoFactorAuthentication from '@/components/widgets/TwoFactorAuthentication.vue'

defineProps({
  showCancelButton: {
    type: Boolean,
    default: false
  }
})

const { t } = useI18n()
const store = useStore()

const user = computed(() => store.getters.user)

const twoFA = reactive({
  TOTPProvisionningUri: '',
  OTPSecret: '',
  OTPRecoveryCodes: null,
  isLoading: false,
  TOTPPreEnabled: false,
  TOTPNeedTwoFA: false,
  emailOTPPreEnabled: false,
  emailOTPNeedTwoFA: false,
  FIDONewDeviceName: '',
  FIDOPreRegistered: false,
  newRecoveryCodesNeedTwoFA: false,
  validationOTP: '',
  error: {
    isWrongOTP: false,
    enableTOTP: false,
    disableTOTP: false,
    enableEmailOTP: false,
    disableEmailOTP: false,
    registerFIDO: false,
    unregisterFIDO: false,
    newRecoveryCodes: false
  }
})

// Computed

const twoFAsEnabled = computed(() => {
  const enabled = []
  if (user.value.fido_enabled) enabled.push('fido')
  if (user.value.totp_enabled) enabled.push('totp')
  if (user.value.email_otp_enabled) enabled.push('email_otp')
  if (enabled.length) enabled.push('recovery_code')
  return enabled
})

const twoFAEnabled = computed(
  () =>
    user.value.totp_enabled ||
    user.value.email_otp_enabled ||
    user.value.fido_enabled
)

const twoFAVerificationNeeded = computed(
  () =>
    twoFA.TOTPNeedTwoFA ||
    twoFA.emailOTPNeedTwoFA ||
    twoFA.newRecoveryCodesNeedTwoFA
)

const twoFAButtonsDisabled = computed(
  () =>
    twoFA.TOTPPreEnabled ||
    twoFA.TOTPNeedTwoFA ||
    twoFA.emailOTPPreEnabled ||
    twoFA.emailOTPNeedTwoFA ||
    twoFA.FIDOPreRegistered ||
    twoFA.newRecoveryCodesNeedTwoFA
)

const textValidateNewTwoFA = computed(() => {
  if (twoFA.TOTPPreEnabled) {
    return t('profile.two_factor_authentication.totp.button_validate')
  } else if (twoFA.emailOTPPreEnabled) {
    return t('profile.two_factor_authentication.email_otp.button_validate')
  }
  return ''
})

const textValidateTwoFA = computed(() => {
  if (twoFA.TOTPNeedTwoFA) {
    return t('profile.two_factor_authentication.totp.button_validate_disable')
  } else if (twoFA.emailOTPNeedTwoFA) {
    return t(
      'profile.two_factor_authentication.email_otp.button_validate_disable'
    )
  } else if (twoFA.newRecoveryCodesNeedTwoFA) {
    return t('profile.two_factor_authentication.recovery_codes.button_validate')
  }
  return ''
})

const validateTwoFAIsDisable = computed(
  () => twoFA.TOTPNeedTwoFA || twoFA.emailOTPNeedTwoFA
)

const placeholderInputEnableOTP = computed(() => {
  if (twoFA.TOTPPreEnabled) return t('login.fields.totp')
  if (twoFA.emailOTPPreEnabled) return t('login.fields.email_otp')
  return ''
})

const textWrongOTPError = computed(() => {
  if (twoFA.TOTPPreEnabled) return t('login.wrong_totp')
  if (twoFA.emailOTPPreEnabled) return t('login.wrong_email_otp')
  return ''
})

// Methods

function removeTwoFactorErrors() {
  twoFA.error.isWrongOTP = false
  twoFA.error.enableTOTP = false
  twoFA.error.disableTOTP = false
  twoFA.error.enableEmailOTP = false
  twoFA.error.disableEmailOTP = false
  twoFA.error.newRecoveryCodes = false
  twoFA.error.unregisterFIDO = false
  twoFA.error.registerFIDO = false
  twoFA.OTPRecoveryCodes = null
}

function enableTOTPRequested() {
  removeTwoFactorErrors()
  twoFA.isLoading = true
  store
    .dispatch('enableTOTP', twoFA.validationOTP)
    .then(OTPRecoveryCodes => {
      if (OTPRecoveryCodes) twoFA.OTPRecoveryCodes = OTPRecoveryCodes
      twoFA.TOTPPreEnabled = false
      twoFA.validationOTP = ''
      twoFA.error.isWrongOTP = false
      twoFA.OTPSecret = ''
    })
    .catch(err => {
      if (err.body && err.body.wrong_OTP) twoFA.error.isWrongOTP = true
      else twoFA.error.enableTOTP = true
    })
    .finally(() => {
      twoFA.isLoading = false
    })
}

function preEnableTOTPRequested() {
  removeTwoFactorErrors()
  twoFA.isLoading = true
  twoFA.TOTPPreEnabled = false
  store
    .dispatch('preEnableTOTP')
    .then(body => {
      twoFA.TOTPProvisionningUri = body.totp_provisionning_uri
      twoFA.OTPSecret = body.otp_secret
      twoFA.TOTPPreEnabled = true
    })
    .catch(() => {
      twoFA.error.enableTOTP = true
    })
    .finally(() => {
      twoFA.isLoading = false
    })
}

function disableTOTPRequested(payload) {
  removeTwoFactorErrors()
  if (!twoFA.TOTPNeedTwoFA) {
    twoFA.TOTPNeedTwoFA = true
  } else {
    twoFA.isLoading = true
    store
      .dispatch('disableTOTP', payload)
      .then(() => {
        twoFA.TOTPNeedTwoFA = false
        twoFA.validationOTP = ''
        twoFA.error.isWrongOTP = false
      })
      .catch(err => {
        if (err.body && err.body.wrong_OTP) twoFA.error.isWrongOTP = true
        else twoFA.error.disableTOTP = true
      })
      .finally(() => {
        twoFA.isLoading = false
      })
  }
}

function enableEmailOTPRequested() {
  removeTwoFactorErrors()
  twoFA.isLoading = true
  store
    .dispatch('enableEmailOTP', twoFA.validationOTP)
    .then(OTPRecoveryCodes => {
      if (OTPRecoveryCodes) twoFA.OTPRecoveryCodes = OTPRecoveryCodes
      twoFA.emailOTPPreEnabled = false
      twoFA.validationOTP = ''
      twoFA.error.isWrongOTP = false
    })
    .catch(err => {
      if (err.body && err.body.wrong_OTP) twoFA.error.isWrongOTP = true
      else twoFA.error.enableEmailOTP = true
    })
    .finally(() => {
      twoFA.isLoading = false
    })
}

function preEnableEmailOTPRequested() {
  removeTwoFactorErrors()
  twoFA.isLoading = true
  twoFA.emailOTPPreEnabled = false
  twoFA.OTPRecoveryCodes = null
  store
    .dispatch('preEnableEmailOTP')
    .then(() => {
      twoFA.emailOTPPreEnabled = true
    })
    .catch(() => {
      twoFA.error.enableEmailOTP = true
    })
    .finally(() => {
      twoFA.isLoading = false
    })
}

function disableEmailOTPRequested(payload) {
  removeTwoFactorErrors()
  twoFA.OTPRecoveryCodes = null
  if (!twoFA.emailOTPNeedTwoFA) {
    twoFA.emailOTPNeedTwoFA = true
  } else {
    twoFA.isLoading = true
    store
      .dispatch('disableEmailOTP', payload)
      .then(() => {
        twoFA.emailOTPNeedTwoFA = false
        twoFA.validationOTP = ''
        twoFA.error.isWrongOTP = false
      })
      .catch(err => {
        if (err.body && err.body.wrong_OTP) twoFA.error.isWrongOTP = true
        else twoFA.error.disableEmailOTP = true
      })
      .finally(() => {
        twoFA.isLoading = false
      })
  }
}

function preRegisterFIDORequested() {
  removeTwoFactorErrors()
  twoFA.FIDOPreRegistered = true
}

function registerFIDORequested() {
  if (!twoFA.FIDONewDeviceName) return

  removeTwoFactorErrors()
  twoFA.isLoading = true
  store
    .dispatch('preRegisterFIDO')
    .then(publicKey => navigator.credentials.create({ publicKey }))
    .then(newCredentialResponse =>
      store.dispatch('registerFIDO', {
        registrationResponse: newCredentialResponse,
        deviceName: twoFA.FIDONewDeviceName
      })
    )
    .then(OTPRecoveryCodes => {
      if (OTPRecoveryCodes) twoFA.OTPRecoveryCodes = OTPRecoveryCodes
    })
    .catch(err => {
      if (err instanceof DOMException) console.error(err)
      twoFA.error.registerFIDO = true
    })
    .finally(() => {
      twoFA.FIDOPreRegistered = false
      twoFA.isLoading = false
      twoFA.FIDONewDeviceName = ''
    })
}

function unregisterFIDORequested(deviceName) {
  removeTwoFactorErrors()
  twoFA.isLoading = true
  store
    .dispatch('unregisterFIDO', { deviceName })
    .then(() => {
      twoFA.validationOTP = ''
      twoFA.error.isWrongOTP = false
    })
    .catch(err => {
      if (err.body && err.body.wrong_OTP) twoFA.error.isWrongOTP = true
      else twoFA.error.unregisterFIDO = true
    })
    .finally(() => {
      twoFA.isLoading = false
    })
}

function newRecoveryCodesRequested(payload) {
  removeTwoFactorErrors()
  if (!twoFA.newRecoveryCodesNeedTwoFA) {
    twoFA.newRecoveryCodesNeedTwoFA = true
  } else {
    twoFA.isLoading = true
    store
      .dispatch('newRecoveryCodes', payload)
      .then(OTPRecoveryCodes => {
        twoFA.OTPRecoveryCodes = OTPRecoveryCodes
        twoFA.newRecoveryCodesNeedTwoFA = false
        twoFA.validationOTP = ''
        twoFA.error.isWrongOTP = false
      })
      .catch(err => {
        if (err.body && err.body.wrong_OTP) twoFA.error.isWrongOTP = true
        else twoFA.error.newRecoveryCodes = true
      })
      .finally(() => {
        twoFA.isLoading = false
      })
  }
}

function nextEnable() {
  if (twoFA.TOTPPreEnabled) enableTOTPRequested()
  else if (twoFA.emailOTPPreEnabled) enableEmailOTPRequested()
}

function nextWithPayload(payload) {
  if (twoFA.TOTPNeedTwoFA) disableTOTPRequested(payload)
  else if (twoFA.emailOTPNeedTwoFA) disableEmailOTPRequested(payload)
  else if (twoFA.newRecoveryCodesNeedTwoFA) newRecoveryCodesRequested(payload)
}

function copyRecoveryCodesToClipboard() {
  navigator.clipboard.writeText(twoFA.OTPRecoveryCodes.join('\n'))
}

function saveRecoveryCodesToFile() {
  const blob = new Blob([twoFA.OTPRecoveryCodes.join('\n')], {
    type: 'text/plain;charset=utf-8'
  })
  const link = document.createElement('a')
  link.setAttribute('href', URL.createObjectURL(blob))
  link.setAttribute('download', 'kitsu-recovery-codes.txt')
  document.body.appendChild(link)
  link.click()
}

function changedTwoFA() {
  twoFA.error.isWrongOTP = false
}

function cancelCurrentTwoFactorAuthAction() {
  twoFA.TOTPPreEnabled = false
  twoFA.TOTPNeedTwoFA = false
  twoFA.emailOTPPreEnabled = false
  twoFA.emailOTPNeedTwoFA = false
  twoFA.newRecoveryCodesNeedTwoFA = false
  twoFA.FIDOPreRegistered = false
  twoFA.FIDONewDeviceName = ''
  twoFA.isLoading = false
  twoFA.validationOTP = ''
  twoFA.error.isWrongOTP = false
  twoFA.error.enableTOTP = false
  twoFA.error.disableTOTP = false
  twoFA.error.enableEmailOTP = false
  twoFA.error.disableEmailOTP = false
  twoFA.error.newRecoveryCodes = false
  twoFA.error.unregisterFIDO = false
  twoFA.error.registerFIDO = false
  twoFA.OTPRecoveryCodes = null
}

function onKeyDown(event) {
  if (event.key === 'Escape') cancelCurrentTwoFactorAuthAction()
}

// Lifecycle

onMounted(() => {
  window.addEventListener('keydown', onKeyDown, false)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown, false)
})
</script>

<style lang="scss" scoped>
.otp-input {
  border-radius: 10px;
  height: 3em !important;
}

.field {
  margin-bottom: 2em;
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

.qrcode {
  margin-bottom: 1em;
  margin-top: 1em;
}

.qrcode-informations {
  text-align: center;
}

.recovery-codes {
  resize: none;
  height: 13em !important;
  font-size: 1.5em;
  padding-left: 2.5em;
  padding-top: 0.5em;
  font-family:
    ui-monospace,
    SFMono-Regular,
    SF Mono,
    Menlo,
    Consolas,
    Liberation Mono,
    monospace;
}

.action-icon {
  cursor: pointer;
  float: right;
  margin: 0 5px 5px;
  color: $light-grey;

  &:hover {
    color: var(--text);
  }
}

.cancel-two-factor-action {
  text-align: right;
  margin-bottom: 0.2em;

  .action-icon {
    float: none;
  }
}

.label-recovery-codes {
  float: left;
}

.recovery-codes-warning {
  margin-bottom: 1em;
}

.disable-button {
  border-radius: 2em;
  width: 100%;
  background: $red;
  border-color: $red;
  color: white;
}

.show-message {
  margin-top: 1em;
}

.show-message-2fa {
  margin-bottom: 1em;
}

.two-fa-button {
  margin-bottom: 1em;
}

.icon {
  padding: 0.25em;
}
</style>
