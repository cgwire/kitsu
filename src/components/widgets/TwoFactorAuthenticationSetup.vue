<template>
  <div class="two-factor-authentication-setup">
    <p
      class="mb2"
      v-html="$t('profile.two_factor_authentication.description')"
    />

    <div v-if="twoFA.OTPRecoveryCodes" class="recovery-codes-panel">
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
      v-else-if="twoFA.newRecoveryCodesNeedTwoFA"
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

    <div class="two-fa-methods">
      <div class="two-fa-card">
        <div class="two-fa-card-head">
          <smartphone-icon class="two-fa-card-icon" :size="22" />
          <span class="two-fa-card-title">
            {{ $t('profile.two_factor_authentication.totp.name') }}
          </span>
          <span
            class="status-badge"
            :class="user.totp_enabled ? 'is-enabled' : 'is-disabled'"
          >
            <span class="status-dot" />
            {{
              user.totp_enabled
                ? $t('profile.two_factor_authentication.status_enabled')
                : $t('profile.two_factor_authentication.status_disabled')
            }}
          </span>
        </div>
        <p class="two-fa-card-description">
          {{ $t('profile.two_factor_authentication.totp.description') }}
        </p>

        <div v-if="twoFA.TOTPPreEnabled" class="two-fa-flow">
          <div class="qrcode-block">
            <p class="qrcode-instruction">
              {{ $t('profile.two_factor_authentication.scan_qrcode') }}
            </p>
            <div class="qrcode-frame">
              <qrcode-vue
                :value="twoFA.TOTPProvisionningUri"
                :size="240"
                level="M"
              />
            </div>
          </div>
          <text-field
            v-if="twoFA.OTPSecret"
            :label="$t('profile.two_factor_authentication.otp_secret')"
            :readonly="true"
            type="text"
            v-model.trim="twoFA.OTPSecret"
          />
          <div class="field">
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
          <p class="show-message-2fa error" v-if="twoFA.error.isWrongOTP">
            {{ textWrongOTPError }}
          </p>
          <div class="two-fa-flow-actions">
            <button
              class="button cancel-flow-button is-medium"
              @click="cancelCurrentTwoFactorAuthAction"
            >
              {{ $t('main.cancel') }}
            </button>
            <button
              class="button save-button is-medium"
              :class="{ 'is-loading': twoFA.isLoading }"
              @click="nextEnable()"
            >
              {{ textValidateNewTwoFA }}
            </button>
          </div>
        </div>

        <two-factor-authentication
          v-else-if="twoFA.TOTPNeedTwoFA"
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

        <div v-else class="two-fa-card-actions">
          <button
            v-if="!user.totp_enabled"
            class="button two-fa-action enable-action is-medium"
            :class="{
              'is-disabled': twoFAButtonsDisabled,
              'is-loading': twoFA.isLoading
            }"
            @click="preEnableTOTPRequested()"
          >
            {{ $t('profile.two_factor_authentication.totp.button_enable') }}
          </button>
          <button
            v-else
            class="button two-fa-action disable-action is-medium"
            :class="{
              'is-disabled': twoFAButtonsDisabled,
              'is-loading': twoFA.isLoading
            }"
            @click="disableTOTPRequested()"
          >
            {{ $t('profile.two_factor_authentication.totp.button_disable') }}
          </button>
        </div>
        <p class="card-error error" v-if="twoFA.error.enableTOTP">
          {{ $t('profile.two_factor_authentication.totp.error_enable') }}
        </p>
        <p class="card-error error" v-if="twoFA.error.disableTOTP">
          {{ $t('profile.two_factor_authentication.totp.error_disable') }}
        </p>
      </div>

      <div class="two-fa-card">
        <div class="two-fa-card-head">
          <mail-icon class="two-fa-card-icon" :size="22" />
          <span class="two-fa-card-title">
            {{ $t('profile.two_factor_authentication.email_otp.name') }}
          </span>
          <span
            class="status-badge"
            :class="user.email_otp_enabled ? 'is-enabled' : 'is-disabled'"
          >
            <span class="status-dot" />
            {{
              user.email_otp_enabled
                ? $t('profile.two_factor_authentication.status_enabled')
                : $t('profile.two_factor_authentication.status_disabled')
            }}
          </span>
        </div>
        <p class="two-fa-card-description">
          {{ $t('profile.two_factor_authentication.email_otp.description') }}
        </p>

        <div v-if="twoFA.emailOTPPreEnabled" class="two-fa-flow">
          <div class="field">
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
          <p class="show-message-2fa error" v-if="twoFA.error.isWrongOTP">
            {{ textWrongOTPError }}
          </p>
          <div class="two-fa-flow-actions">
            <button
              class="button cancel-flow-button is-medium"
              @click="cancelCurrentTwoFactorAuthAction"
            >
              {{ $t('main.cancel') }}
            </button>
            <button
              class="button save-button is-medium"
              :class="{ 'is-loading': twoFA.isLoading }"
              @click="nextEnable()"
            >
              {{ textValidateNewTwoFA }}
            </button>
          </div>
        </div>

        <two-factor-authentication
          v-else-if="twoFA.emailOTPNeedTwoFA"
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

        <div v-else class="two-fa-card-actions">
          <button
            v-if="!user.email_otp_enabled"
            class="button two-fa-action enable-action is-medium"
            :class="{
              'is-disabled': twoFAButtonsDisabled,
              'is-loading': twoFA.isLoading
            }"
            @click="preEnableEmailOTPRequested()"
          >
            {{
              $t('profile.two_factor_authentication.email_otp.button_enable')
            }}
          </button>
          <button
            v-else
            class="button two-fa-action disable-action is-medium"
            :class="{
              'is-disabled': twoFAButtonsDisabled,
              'is-loading': twoFA.isLoading
            }"
            @click="disableEmailOTPRequested()"
          >
            {{
              $t('profile.two_factor_authentication.email_otp.button_disable')
            }}
          </button>
        </div>
        <p class="card-error error" v-if="twoFA.error.enableEmailOTP">
          {{ $t('profile.two_factor_authentication.email_otp.error_enable') }}
        </p>
        <p class="card-error error" v-if="twoFA.error.disableEmailOTP">
          {{ $t('profile.two_factor_authentication.email_otp.error_disable') }}
        </p>
      </div>

      <div class="two-fa-card">
        <div class="two-fa-card-head">
          <key-round-icon class="two-fa-card-icon" :size="22" />
          <span class="two-fa-card-title">
            {{ $t('profile.two_factor_authentication.fido.name') }}
          </span>
          <span
            class="status-badge"
            :class="user.fido_enabled ? 'is-enabled' : 'is-disabled'"
          >
            <span class="status-dot" />
            {{
              user.fido_enabled
                ? $t('profile.two_factor_authentication.status_enabled')
                : $t('profile.two_factor_authentication.status_disabled')
            }}
          </span>
        </div>
        <p class="two-fa-card-description">
          {{ $t('profile.two_factor_authentication.fido.description') }}
        </p>

        <div v-if="twoFA.FIDOPreRegistered" class="two-fa-flow">
          <div class="field">
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
          <p class="show-message-2fa error" v-if="twoFA.error.registerFIDO">
            {{ $t('profile.two_factor_authentication.fido.error_register') }}
          </p>
          <div class="two-fa-flow-actions">
            <button
              class="button cancel-flow-button is-medium"
              @click="cancelCurrentTwoFactorAuthAction"
            >
              {{ $t('main.cancel') }}
            </button>
            <button
              class="button save-button is-medium"
              :class="{ 'is-loading': twoFA.isLoading }"
              @click="registerFIDORequested()"
            >
              {{ $t('profile.two_factor_authentication.fido.button_register') }}
            </button>
          </div>
        </div>

        <div v-else class="two-fa-card-actions">
          <button
            class="button two-fa-action enable-action is-medium"
            :class="{
              'is-disabled': twoFAButtonsDisabled,
              'is-loading': twoFA.isLoading
            }"
            @click="preRegisterFIDORequested()"
          >
            {{ $t('profile.two_factor_authentication.fido.button_register') }}
          </button>
        </div>
      </div>
    </div>

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
  CopyIcon,
  KeyIcon,
  KeyRoundIcon,
  LockIcon,
  MailIcon,
  SaveIcon,
  SmartphoneIcon,
  TrashIcon,
  XCircleIcon
} from 'lucide-vue-next'

import TextField from '@/components/widgets/TextField.vue'
import TwoFactorAuthentication from '@/components/widgets/TwoFactorAuthentication.vue'

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

const removeTwoFactorErrors = () => {
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

const enableTOTPRequested = () => {
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

const preEnableTOTPRequested = () => {
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

const disableTOTPRequested = payload => {
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

const enableEmailOTPRequested = () => {
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

const preEnableEmailOTPRequested = () => {
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

const disableEmailOTPRequested = payload => {
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

const preRegisterFIDORequested = () => {
  removeTwoFactorErrors()
  twoFA.FIDOPreRegistered = true
}

const registerFIDORequested = () => {
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

const unregisterFIDORequested = deviceName => {
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

const newRecoveryCodesRequested = payload => {
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

const nextEnable = () => {
  if (twoFA.TOTPPreEnabled) enableTOTPRequested()
  else if (twoFA.emailOTPPreEnabled) enableEmailOTPRequested()
}

const nextWithPayload = payload => {
  if (twoFA.TOTPNeedTwoFA) disableTOTPRequested(payload)
  else if (twoFA.emailOTPNeedTwoFA) disableEmailOTPRequested(payload)
  else if (twoFA.newRecoveryCodesNeedTwoFA) newRecoveryCodesRequested(payload)
}

const copyRecoveryCodesToClipboard = () => {
  navigator.clipboard.writeText(twoFA.OTPRecoveryCodes.join('\n'))
}

const saveRecoveryCodesToFile = () => {
  const blob = new Blob([twoFA.OTPRecoveryCodes.join('\n')], {
    type: 'text/plain;charset=utf-8'
  })
  const link = document.createElement('a')
  link.setAttribute('href', URL.createObjectURL(blob))
  link.setAttribute('download', 'kitsu-recovery-codes.txt')
  document.body.appendChild(link)
  link.click()
}

const changedTwoFA = () => {
  twoFA.error.isWrongOTP = false
}

const cancelCurrentTwoFactorAuthAction = () => {
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

const onKeyDown = event => {
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

.qrcode-block {
  text-align: center;
  margin-bottom: 1em;
}

.qrcode-frame {
  display: inline-block;
  margin: 0.5em 0;
  padding: 1em;
  background: $white;
  border: 1px solid var(--border);
  border-radius: 8px;
  line-height: 0;
}

.qrcode-instruction {
  margin-bottom: 0.5em;
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

.label-recovery-codes {
  float: left;
}

.recovery-codes-panel {
  margin-bottom: 1.5em;
}

.two-fa-flow {
  border-top: 1px dashed var(--border);
  margin-top: 0.5em;
  padding-top: 1em;

  .field {
    margin-bottom: 1em;
  }
}

.two-fa-flow-actions {
  display: flex;
  gap: 0.6em;
  justify-content: flex-end;

  .button {
    flex: 0 0 auto;
  }

  .save-button {
    width: auto;
    min-width: 140px;
  }
}

.cancel-flow-button {
  border-radius: 8px;
  background: transparent;
  border-color: var(--border);
  color: var(--text);

  &:hover {
    background: var(--background-hover);
  }
}

.recovery-codes-warning {
  margin-bottom: 1em;
}

.two-fa-methods {
  display: flex;
  flex-direction: column;
  gap: 0.75em;
  margin-bottom: 1.5em;
}

.two-fa-card {
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 1em 1.2em;
  background: var(--background);
}

.two-fa-card-head {
  display: flex;
  align-items: center;
  gap: 0.7em;
  margin-bottom: 0.4em;
}

.two-fa-card-icon {
  color: var(--text);
  flex-shrink: 0;
}

.two-fa-card-title {
  font-weight: 600;
  color: var(--text-strong);
  flex: 1;
  min-width: 0;
}

.two-fa-card-description {
  color: var(--text);
  font-size: 0.9em;
  margin: 0 0 1em;
}

.two-fa-card-actions {
  display: flex;
  justify-content: flex-end;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
  font-size: 0.8em;
  color: var(--text);

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: $light-grey;
  }

  &.is-enabled .status-dot {
    background: $green;
  }
}

.two-fa-action {
  border-radius: 8px;
  font-weight: 500;
  min-width: 140px;

  &.enable-action {
    background: $green;
    border-color: $green;
    color: $white;

    &:hover:not(.is-disabled) {
      background: $light-green;
      border-color: $light-green;
    }
  }

  &.disable-action {
    background: transparent;
    border-color: $red;
    color: $red;

    &:hover:not(.is-disabled) {
      background: $red;
      color: $white;
    }
  }
}

.card-error {
  margin-top: 0.6em;
  margin-bottom: 0;
  font-size: 0.85em;
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
