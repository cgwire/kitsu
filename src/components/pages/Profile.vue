<template>
  <div class="profile page">
    <div class="profile-content">
      <div class="has-text-centered profile-header">
        <div class="profile-header-content has-text-centered">
          <people-avatar
            :is-lazy="false"
            :person="user"
            :size="150"
            :font-size="60"
          />

          <p>
            <button
              class="button is-link change-avatar-button"
              @click="showAvatarModal"
            >
              {{ $t('profile.change_avatar') }}
            </button>
          </p>
          <p>
            <button
              class="button is-link clear-avatar-button"
              @click="removeAvatar"
            >
              {{ $t('profile.clear_avatar') }}
            </button>
          </p>
          <h1>
            {{ $t('profile.title') }}
          </h1>
        </div>
      </div>

      <div class="profile-body">
        <h2>
          {{ $t('profile.info_title') }}
        </h2>
        <text-field
          :label="$t('people.fields.first_name')"
          :disabled="user.is_generated_from_ldap"
          v-model="form.first_name"
        />
        <text-field
          :label="$t('people.fields.last_name')"
          :disabled="user.is_generated_from_ldap"
          v-model="form.last_name"
        />
        <text-field
          :label="$t('people.fields.email')"
          :disabled="user.is_generated_from_ldap"
          v-model="form.email"
        />
        <text-field :label="$t('people.fields.phone')" v-model="form.phone" />
        <div class="field">
          <label class="label">
            {{ $t('profile.timezone') }}
          </label>
          <span class="select is-medium">
            <select v-model="form.timezone">
              <option :key="timezone" v-for="timezone in timezones">
                {{ timezone }}
              </option>
            </select>
          </span>
        </div>
        <div class="field">
          <label class="label">
            {{ $t('profile.language') }}
          </label>
          <span class="select is-medium">
            <select
              v-model="form.locale"
              :value="form.locale"
              @change="localeChanged"
            >
              <option value="zh_Hans_CN">Chinese</option>
              <option value="zh_Hant_TW">Chinese (TC)</option>
              <option value="da_DA">Dannish</option>
              <option value="nl_NL">Dutch</option>
              <option value="en_US">English</option>
              <option value="fr_FR">French</option>
              <option value="de_DE">German</option>
              <option value="hu_HU">Hungarian</option>
              <option value="ja_JP">Japanese</option>
              <option value="ko_KR">Korean</option>
              <option value="pt_BR">Portuguese (Brasilian)</option>
              <option value="fa_IR">Persian</option>
              <option value="es_ES">Spanish</option>
              <option value="ru_RU">Russian</option>
            </select>
          </span>
        </div>

        <div class="field">
          <combobox-boolean
            :label="$t('profile.notifications_enabled')"
            v-model="form.notifications_enabled"
          />
        </div>

        <div class="field">
          <combobox-boolean
            :label="$t('profile.notifications_slack_enabled')"
            v-model="form.notifications_slack_enabled"
          />
        </div>

        <text-field
          :label="$t('profile.notifications_slack_user')"
          v-model="form.notifications_slack_userid"
          v-if="form.notifications_slack_enabled === 'true'"
        />

        <div class="field">
          <combobox-boolean
            :label="$t('profile.notifications_mattermost_enabled')"
            v-model="form.notifications_mattermost_enabled"
          />
        </div>

        <text-field
          :label="$t('profile.notifications_mattermost_user')"
          v-model="form.notifications_mattermost_userid"
          v-if="form.notifications_mattermost_enabled === 'true'"
        />

        <div class="field">
          <combobox-boolean
            :label="$t('profile.notifications_discord_enabled')"
            v-model="form.notifications_discord_enabled"
          />
        </div>

        <text-field
          :label="$t('profile.notifications_discord_user')"
          v-model="form.notifications_discord_userid"
          v-if="form.notifications_discord_enabled === 'true'"
        />

        <button
          :class="{
            button: true,
            'save-button': true,
            'is-medium': true,
            'is-loading': isSaveProfileLoading
          }"
          @click="saveProfile({ form: form })"
        >
          {{ $t('profile.save.button') }}
        </button>
        <p
          :class="{
            error: true,
            'is-hidden': !isSaveProfileLoadingError
          }"
        >
          {{ $t('profile.save.error') }}
        </p>

        <h2>
          {{ $t('profile.password_title') }}
        </h2>
        <text-field
          :label="$t('people.fields.old_password')"
          :disabled="user.is_generated_from_ldap"
          type="password"
          v-model="passwordForm.oldPassword"
        />
        <text-field
          :label="$t('people.fields.password')"
          :disabled="user.is_generated_from_ldap"
          type="password"
          v-model="passwordForm.password"
        />
        <text-field
          :label="$t('people.fields.password_2')"
          :disabled="user.is_generated_from_ldap"
          type="password"
          v-model="passwordForm.password2"
        />

        <button
          :class="{
            button: true,
            'save-button': true,
            'is-medium': true,
            'is-loading': changePassword.isLoading
          }"
          :disabled="user.is_generated_from_ldap"
          @click="passwordChangeRequested()"
        >
          {{ $t('profile.change_password.button') }}
        </button>

        <p
          :class="{
            'show-message': true,
            error: true,
            'is-hidden': changePassword.isValid
          }"
        >
          {{ $t('profile.change_password.unvalid') }}
        </p>

        <p
          :class="{
            'show-message': true,
            success: true,
            'is-hidden': !changePassword.isSuccess
          }"
        >
          {{ $t('profile.change_password.success') }}
        </p>

        <p
          :class="{
            'show-message': true,
            error: true,
            'is-hidden': !changePassword.isError
          }"
        >
          {{ $t('profile.change_password.error') }}
        </p>

        <h2>
          {{ $t('profile.two_factor_authentication.title') }}
        </h2>
        <p v-if="twoFAButtonsDisabled" class="cancel-two-factor-action">
          <a @click="cancelCurrentTwoFactorAuthAction">
            <x-circle-icon :size="20" />
          </a>
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
            v-model="twoFA.OTPSecret"
            v-if="twoFA.OTPSecret"
          />
        </div>

        <div
          class="field"
          v-if="twoFA.TOTPPreEnabled || twoFA.emailOTPPreEnabled"
        >
          <p class="control has-icon">
            <input
              class="input is-medium otp-input"
              type="text"
              v-model="twoFA.validationOTP"
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

          <p
            :class="{
              'show-message': true,
              error: true,
              'recovery-codes-warning': true
            }"
          >
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
          :class="{
            'two-fa-button': true,
            button: true,
            'save-button': true,
            'is-medium': true,
            'is-loading': twoFA.isLoading
          }"
          @click="nextEnable()"
        >
          {{ textValidateNewTwoFA }}
        </button>

        <p
          :class="{
            'show-message-2fa': true,
            error: true,
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
              v-model="twoFA.FIDONewDeviceName"
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
          :class="{
            'two-fa-button': true,
            button: true,
            'save-button': true,
            'is-medium': true,
            'is-loading': twoFA.isLoading
          }"
          @click="registerFIDORequested()"
        >
          {{ $t('profile.two_factor_authentication.fido.button_register') }}
        </button>

        <p
          :class="{
            'show-message-2fa': true,
            error: true,
            'is-hidden': !twoFA.error.registerFIDO
          }"
        >
          {{ $t('profile.two_factor_authentication.fido.error_register') }}
        </p>

        <button
          v-if="!user.totp_enabled && !twoFA.TOTPPreEnabled"
          :class="{
            'two-fa-button': true,
            button: true,
            'save-button': true,
            'is-medium': true,
            'is-disabled': twoFAButtonsDisabled,
            'is-loading': twoFA.isLoading
          }"
          @click="preEnableTOTPRequested()"
        >
          {{ $t('profile.two_factor_authentication.totp.button_enable') }}
        </button>

        <button
          v-else-if="!twoFA.TOTPNeedTwoFA && !twoFA.TOTPPreEnabled"
          :class="{
            'two-fa-button': true,
            button: true,
            'disable-button': true,
            'is-medium': true,
            'is-disabled': twoFAButtonsDisabled,
            'is-loading': twoFA.isLoading
          }"
          @click="disableTOTPRequested()"
        >
          {{ $t('profile.two_factor_authentication.totp.button_disable') }}
        </button>

        <p
          :class="{
            'show-message-2fa': true,
            error: true,
            'is-hidden': !twoFA.error.enableTOTP
          }"
        >
          {{ $t('profile.two_factor_authentication.totp.error_enable') }}
        </p>

        <p
          :class="{
            'show-message-2fa': true,
            error: true,
            'is-hidden': !twoFA.error.disableTOTP
          }"
        >
          {{ $t('profile.two_factor_authentication.totp.error_disable') }}
        </p>

        <button
          v-if="!user.email_otp_enabled && !twoFA.emailOTPPreEnabled"
          :class="{
            'two-fa-button': true,
            button: true,
            'save-button': true,
            'is-medium': true,
            'is-disabled': twoFAButtonsDisabled,
            'is-loading': twoFA.isLoading
          }"
          @click="preEnableEmailOTPRequested()"
        >
          {{ $t('profile.two_factor_authentication.email_otp.button_enable') }}
        </button>

        <button
          v-else-if="!twoFA.emailOTPNeedTwoFA && !twoFA.emailOTPPreEnabled"
          :class="{
            'two-fa-button': true,
            button: true,
            'disable-button': true,
            'is-medium': true,
            'is-disabled': twoFAButtonsDisabled,
            'is-loading': twoFA.isLoading
          }"
          @click="disableEmailOTPRequested()"
        >
          {{ $t('profile.two_factor_authentication.email_otp.button_disable') }}
        </button>

        <p
          :class="{
            'show-message-2fa': true,
            error: true,
            'is-hidden': !twoFA.error.enableEmailOTP
          }"
        >
          {{ $t('profile.two_factor_authentication.email_otp.error_enable') }}
        </p>

        <p
          :class="{
            'show-message-2fa': true,
            error: true,
            'is-hidden': !twoFA.error.disableEmailOTP
          }"
        >
          {{ $t('profile.two_factor_authentication.email_otp.error_disable') }}
        </p>

        <button
          v-if="!twoFA.FIDOPreRegistered"
          :class="{
            'two-fa-button': true,
            button: true,
            'save-button': true,
            'is-medium': true,
            'is-disabled': twoFAButtonsDisabled,
            'is-loading': twoFA.isLoading
          }"
          @click="preRegisterFIDORequested()"
        >
          {{ $t('profile.two_factor_authentication.fido.button_register') }}
        </button>

        <button
          v-if="twoFAEnabled && !twoFA.newRecoveryCodesNeedTwoFA"
          :class="{
            'two-fa-button': true,
            button: true,
            'save-button': true,
            'is-medium': true,
            'is-disabled': twoFAButtonsDisabled,
            'is-loading': twoFA.isLoading
          }"
          @click="newRecoveryCodesRequested()"
        >
          {{
            $t('profile.two_factor_authentication.recovery_codes.button_new')
          }}
        </button>

        <p
          :class="{
            'show-message-2fa': true,
            error: true,
            'is-hidden': !twoFA.error.newRecoveryCodes
          }"
        >
          {{ $t('profile.two_factor_authentication.recovery_codes.error_new') }}
        </p>

        <h3 v-if="user.fido_enabled">
          {{
            $t(
              'profile.two_factor_authentication.fido.registered_devices_title'
            )
          }}
        </h3>

        <ul class="pa1">
          <li
            :key="`${device}-${index}`"
            v-for="(device, index) in user.fido_devices"
          >
            {{ device }}
            <trash-icon
              class="trash-icon-fido-device"
              :size="15"
              @click="unregisterFIDORequested(device)"
            />
          </li>
        </ul>

        <p
          :class="{
            'show-message-2fa': true,
            error: true,
            'is-hidden': !twoFA.error.unregisterFIDO
          }"
        >
          {{ $t('profile.two_factor_authentication.fido.error_unregister') }}
        </p>
      </div>
    </div>

    <change-avatar-modal
      :active="changeAvatar.isModalShown"
      :is-loading="changeAvatar.isLoading"
      :is-error="changeAvatar.isLoadingError"
      :form-data="changeAvatar.formData"
      :title="$t('profile.avatar.title')"
      @fileselected="selectFile"
      @confirm="uploadAvatarFile"
      @cancel="hideAvatarModal"
    />
  </div>
</template>

<script>
import moment from 'moment-timezone'
import QrcodeVue from 'qrcode.vue'
import {
  LockIcon,
  CopyIcon,
  SaveIcon,
  XCircleIcon,
  KeyIcon,
  TrashIcon
} from 'lucide-vue-next'
import { mapGetters, mapActions } from 'vuex'

import lang from '@/lib/lang'

import ComboboxBoolean from '@/components/widgets/ComboboxBoolean.vue'
import ChangeAvatarModal from '@/components/modals/ChangeAvatarModal.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import TextField from '@/components/widgets/TextField.vue'
import TwoFactorAuthentication from '@/components/widgets/TwoFactorAuthentication.vue'

export default {
  name: 'profile',

  components: {
    ComboboxBoolean,
    PeopleAvatar,
    ChangeAvatarModal,
    TextField,
    QrcodeVue,
    LockIcon,
    CopyIcon,
    SaveIcon,
    XCircleIcon,
    KeyIcon,
    TrashIcon,
    TwoFactorAuthentication
  },

  data() {
    return {
      form: {
        first_name: '',
        last_name: '',
        notifications_enabled: 'false',
        notifications_slack_enabled: 'false',
        notifications_slack_userid: '',
        notifications_mattermost_enabled: 'false',
        notifications_mattermost_userid: '',
        notifications_discord_enabled: 'false',
        notifications_discord_userid: '',
        email: '',
        phone: '',
        timezone: 'Europe/Paris',
        locale: 'French'
      },
      passwordForm: {
        oldPassword: '',
        password: '',
        password2: ''
      },
      changeAvatar: {
        isModalShown: false,
        isLoading: false,
        isLoadingError: false,
        formData: null
      },
      twoFA: {
        TOTPProvisionningUri: '',
        OTPSecret: '',
        OTPRecoveryCodes: null,
        isLoading: false,
        TOTPPreEnabled: false,
        TOTPNeedTwoFA: false,
        emailOTPPreEnabled: false,
        emailOTPNeedTwoFA: false,
        FIDONeedTwoFA: false,
        FIDONewDeviceName: '',
        FIDOPreRegistered: false,
        preUnregisteredFIDODeviceName: '',
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
      }
    }
  },

  watch: {
    user() {
      Object.assign(this.form, this.user)
    }
  },

  computed: {
    ...mapGetters([
      'changePassword',
      'isSaveProfileLoading',
      'isSaveProfileLoadingError',
      'user'
    ]),

    timezones() {
      return moment.tz.names().filter(timezone => {
        return timezone.indexOf('/') > 0 && timezone.indexOf('Etc') < 0
      })
    },

    twoFAsEnabled() {
      const twoFAsEnabled = []
      if (this.user.fido_enabled) {
        twoFAsEnabled.push('fido')
      }
      if (this.user.totp_enabled) {
        twoFAsEnabled.push('totp')
      }
      if (this.user.email_otp_enabled) {
        twoFAsEnabled.push('email_otp')
      }
      if (twoFAsEnabled.length >= 0) {
        twoFAsEnabled.push('recovery_code')
      }
      return twoFAsEnabled
    },

    twoFAEnabled() {
      return (
        this.user.totp_enabled ||
        this.user.email_otp_enabled ||
        this.user.fido_enabled
      )
    },

    twoFAVerificationNeeded() {
      return (
        this.twoFA.TOTPNeedTwoFA ||
        this.twoFA.emailOTPNeedTwoFA ||
        this.twoFA.FIDONeedTwoFA ||
        this.twoFA.newRecoveryCodesNeedTwoFA
      )
    },

    twoFAButtonsDisabled() {
      return (
        this.twoFA.TOTPPreEnabled ||
        this.twoFA.TOTPNeedTwoFA ||
        this.twoFA.emailOTPPreEnabled ||
        this.twoFA.emailOTPNeedTwoFA ||
        this.twoFA.FIDONeedTwoFA ||
        this.twoFA.FIDOPreRegistered ||
        this.twoFA.newRecoveryCodesNeedTwoFA
      )
    },

    textValidateNewTwoFA() {
      if (this.twoFA.TOTPPreEnabled) {
        return this.$t('profile.two_factor_authentication.totp.button_validate')
      } else if (this.twoFA.emailOTPPreEnabled) {
        return this.$t(
          'profile.two_factor_authentication.email_otp.button_validate'
        )
      } else return ''
    },

    textValidateTwoFA() {
      if (this.twoFA.TOTPNeedTwoFA) {
        return this.$t(
          'profile.two_factor_authentication.totp.button_validate_disable'
        )
      } else if (this.twoFA.emailOTPNeedTwoFA) {
        return this.$t(
          'profile.two_factor_authentication.email_otp.button_validate_disable'
        )
      } else if (this.twoFA.newRecoveryCodesNeedTwoFA) {
        return this.$t(
          'profile.two_factor_authentication.recovery_codes.button_validate'
        )
      } else if (this.twoFA.FIDONeedTwoFA) {
        return this.$t(
          'profile.two_factor_authentication.fido.button_unregister'
        )
      } else return ''
    },

    validateTwoFAIsDisable() {
      return (
        this.twoFA.TOTPNeedTwoFA ||
        this.twoFA.emailOTPNeedTwoFA ||
        this.twoFA.FIDONeedTwoFA
      )
    },

    placeholderInputEnableOTP() {
      if (this.twoFA.TOTPPreEnabled) return this.$t('login.fields.totp')
      else if (this.twoFA.emailOTPPreEnabled)
        return this.$t('login.fields.email_otp')
      return ''
    },

    textWrongOTPError() {
      if (this.twoFA.TOTPPreEnabled) return this.$t('login.wrong_totp')
      else if (this.twoFA.emailOTPPreEnabled)
        return this.$t('login.wrong_email_otp')
      return ''
    }
  },

  methods: {
    ...mapActions([
      'checkNewPasswordValidityAndSave',
      'clearAvatar',
      'disableEmailOTP',
      'disableTOTP',
      'enableEmailOTP',
      'enableTOTP',
      'newRecoveryCodes',
      'preEnableEmailOTP',
      'preEnableTOTP',
      'preRegisterFIDO',
      'registerFIDO',
      'saveProfile',
      'uploadAvatar',
      'unregisterFIDO'
    ]),

    localeChanged() {
      lang.setLocale(this.form.locale)
    },

    passwordChangeRequested() {
      this.checkNewPasswordValidityAndSave({
        form: this.passwordForm,
        callback: () => {
          this.passwordForm = {
            oldPassword: '',
            password: '',
            password2: ''
          }
        }
      })
    },

    enableTOTPRequested() {
      this.removeTwoFactorErrors()
      this.twoFA.isLoading = true
      this.enableTOTP(this.twoFA.validationOTP)
        .then(OTPRecoveryCodes => {
          if (OTPRecoveryCodes) {
            this.twoFA.OTPRecoveryCodes = OTPRecoveryCodes
          }
          this.twoFA.TOTPPreEnabled = false
          this.twoFA.validationOTP = ''
          this.twoFA.error.isWrongOTP = false
          this.twoFA.OTPSecret = ''
        })
        .catch(err => {
          if (err.body && err.body.wrong_OTP) this.twoFA.error.isWrongOTP = true
          else this.twoFA.error.EnableTOTP = true
        })
        .finally(() => {
          this.twoFA.isLoading = false
        })
    },

    preEnableTOTPRequested() {
      this.removeTwoFactorErrors()
      this.twoFA.isLoading = true
      this.twoFA.TOTPPreEnabled = false
      this.preEnableTOTP()
        .then(body => {
          this.twoFA.TOTPProvisionningUri = body.totp_provisionning_uri
          this.twoFA.OTPSecret = body.otp_secret
          this.twoFA.TOTPPreEnabled = true
        })
        .catch(() => {
          this.twoFA.error.EnableTOTP = true
        })
        .finally(() => {
          this.twoFA.isLoading = false
        })
    },

    disableTOTPRequested(payload) {
      this.removeTwoFactorErrors()
      if (!this.twoFA.TOTPNeedTwoFA) this.twoFA.TOTPNeedTwoFA = true
      else {
        this.twoFA.isLoading = true
        this.disableTOTP(payload)
          .then(() => {
            this.twoFA.TOTPNeedTwoFA = false
            this.twoFA.validationOTP = ''
            this.twoFA.error.isWrongOTP = false
          })
          .catch(err => {
            if (err.body && err.body.wrong_OTP)
              this.twoFA.error.isWrongOTP = true
            else this.twoFA.error.disableTOTP = true
          })
          .finally(() => {
            this.twoFA.isLoading = false
          })
      }
    },

    enableEmailOTPRequested() {
      this.removeTwoFactorErrors()
      this.twoFA.isLoading = true
      this.enableEmailOTP(this.twoFA.validationOTP)
        .then(OTPRecoveryCodes => {
          if (OTPRecoveryCodes) {
            this.twoFA.OTPRecoveryCodes = OTPRecoveryCodes
          }
          this.twoFA.emailOTPPreEnabled = false
          this.twoFA.validationOTP = ''
          this.twoFA.error.isWrongOTP = false
        })
        .catch(err => {
          if (err.body && err.body.wrong_OTP) this.twoFA.error.isWrongOTP = true
          else this.twoFA.error.enableEmailOTP = true
        })
        .finally(() => {
          this.twoFA.isLoading = false
        })
    },

    preEnableEmailOTPRequested() {
      this.removeTwoFactorErrors()
      this.twoFA.isLoading = true
      this.twoFA.emailOTPPreEnabled = false
      this.twoFA.OTPRecoveryCodes = null
      this.preEnableEmailOTP()
        .then(() => {
          this.twoFA.emailOTPPreEnabled = true
        })
        .catch(() => {
          this.twoFA.error.EnableEmailOTP = true
        })
        .finally(() => {
          this.twoFA.isLoading = false
        })
    },

    disableEmailOTPRequested(payload) {
      this.removeTwoFactorErrors()
      this.twoFA.OTPRecoveryCodes = null
      if (!this.twoFA.emailOTPNeedTwoFA) this.twoFA.emailOTPNeedTwoFA = true
      else {
        this.twoFA.isLoading = true
        this.disableEmailOTP(payload)
          .then(() => {
            this.twoFA.emailOTPNeedTwoFA = false
            this.twoFA.validationOTP = ''
            this.twoFA.error.isWrongOTP = false
          })
          .catch(err => {
            if (err.body && err.body.wrong_OTP)
              this.twoFA.error.isWrongOTP = true
            else this.twoFA.error.disableEmailOTP = true
          })
          .finally(() => {
            this.twoFA.isLoading = false
          })
      }
    },

    preRegisterFIDORequested() {
      this.removeTwoFactorErrors()
      this.twoFA.FIDOPreRegistered = true
    },

    registerFIDORequested() {
      this.removeTwoFactorErrors()
      this.twoFA.isLoading = true
      this.preRegisterFIDO()
        .then(publicKey => {
          return navigator.credentials.create({ publicKey: publicKey })
        })
        .then(newCredentialResponse => {
          return this.registerFIDO({
            registrationResponse: newCredentialResponse,
            deviceName: this.twoFA.FIDONewDeviceName
          })
        })
        .then(OTPRecoveryCodes => {
          if (OTPRecoveryCodes) {
            this.twoFA.OTPRecoveryCodes = OTPRecoveryCodes
          }
        })
        .catch(err => {
          if (err instanceof DOMException) console.error(err)
          this.twoFA.error.registerFIDO = true
        })
        .finally(() => {
          this.twoFA.FIDOPreRegistered = false
          this.twoFA.isLoading = false
          this.twoFA.FIDONewDeviceName = ''
        })
    },

    unregisterFIDORequested(deviceName, payload) {
      this.removeTwoFactorErrors()
      if (!this.twoFA.FIDONeedTwoFA) {
        this.twoFA.FIDONeedTwoFA = true
        this.twoFA.preUnregisteredFIDODeviceName = deviceName
      } else {
        this.twoFA.isLoading = true
        this.unregisterFIDO({
          twoFactorPayload: payload,
          deviceName: this.twoFA.preUnregisteredFIDODeviceName
        })
          .then(() => {
            this.twoFA.FIDONeedTwoFA = false
            this.twoFA.preUnregisteredFIDODeviceName = ''
            this.twoFA.validationOTP = ''
            this.twoFA.error.isWrongOTP = false
          })
          .catch(err => {
            if (err.body && err.body.wrong_OTP)
              this.twoFA.error.isWrongOTP = true
            else this.twoFA.error.unregisterFIDO = true
          })
          .finally(() => {
            this.twoFA.isLoading = false
          })
      }
    },

    newRecoveryCodesRequested(payload) {
      this.removeTwoFactorErrors()
      if (!this.twoFA.newRecoveryCodesNeedTwoFA) {
        this.twoFA.newRecoveryCodesNeedTwoFA = true
      } else {
        this.twoFA.isLoading = true
        this.newRecoveryCodes(payload)
          .then(OTPRecoveryCodes => {
            this.twoFA.OTPRecoveryCodes = OTPRecoveryCodes
            this.twoFA.newRecoveryCodesNeedTwoFA = false
            this.twoFA.validationOTP = ''
            this.twoFA.error.isWrongOTP = false
          })
          .catch(err => {
            if (err.body && err.body.wrong_OTP)
              this.twoFA.error.isWrongOTP = true
            else this.twoFA.error.newRecoveryCodes = true
          })
          .finally(() => {
            this.twoFA.isLoading = false
          })
      }
    },

    nextEnable() {
      if (this.twoFA.TOTPPreEnabled) this.enableTOTPRequested()
      else if (this.twoFA.emailOTPPreEnabled) this.enableEmailOTPRequested()
    },

    nextWithPayload(payload) {
      if (this.twoFA.TOTPNeedTwoFA) this.disableTOTPRequested(payload)
      else if (this.twoFA.emailOTPNeedTwoFA) {
        this.disableEmailOTPRequested(payload)
      } else if (this.twoFA.newRecoveryCodesNeedTwoFA) {
        this.newRecoveryCodesRequested(payload)
      } else if (this.twoFA.FIDONeedTwoFA) {
        this.unregisterFIDORequested(
          this.twoFA.preUnregisteredFIDODeviceName,
          payload
        )
      }
    },

    selectFile(formData) {
      this.$store.commit('CHANGE_AVATAR_FILE', formData)
    },

    uploadAvatarFile() {
      this.changeAvatar.isLoading = true
      this.changeAvatar.isError = false
      this.uploadAvatar()
        .catch(err => {
          console.error(err)
          this.changeAvatar.isError = true
        })
        .finally(() => {
          this.changeAvatar.isLoading = false
          this.hideAvatarModal()
        })
    },

    hideAvatarModal() {
      this.changeAvatar.isModalShown = false
    },

    showAvatarModal() {
      this.changeAvatar.isModalShown = true
    },

    removeAvatar() {
      this.clearAvatar()
    },

    copyRecoveryCodesToClipboard() {
      navigator.clipboard.writeText(this.twoFA.OTPRecoveryCodes.join('\n'))
    },

    saveRecoveryCodesToFile() {
      const blob = new Blob([this.twoFA.OTPRecoveryCodes.join('\n')], {
        type: 'text/plain;charset=utf-8'
      })
      const link = document.createElement('a')
      link.setAttribute('href', URL.createObjectURL(blob))
      link.setAttribute('download', 'kitsu-recovery-codes.txt')
      document.body.appendChild(link)
      link.click()
    },

    changedTwoFA(twoFA) {
      this.twoFA.error.isWrongOTP = false
    },

    cancelCurrentTwoFactorAuthAction() {
      this.twoFA.TOTPPreEnabled = false
      this.twoFA.TOTPNeedTwoFA = false
      this.twoFA.emailOTPPreEnabled = false
      this.twoFA.emailOTPNeedTwoFA = false
      this.twoFA.newRecoveryCodesNeedTwoFA = false
      this.twoFA.FIDOPreRegistered = false
      this.twoFA.FIDONewDeviceName = ''
      this.twoFA.FIDONeedTwoFA = false
      this.twoFA.preUnregisteredFIDODeviceName = ''
      this.twoFA.isLoading = false
      this.twoFA.validationOTP = ''
      this.twoFA.error.isWrongOTP = false
      this.twoFA.error.enableTOTP = false
      this.twoFA.error.disableTOTP = false
      this.twoFA.error.enableEmailOTP = false
      this.twoFA.error.disableEmailOTP = false
      this.twoFA.error.newRecoveryCodes = false
      this.twoFA.error.unregisterFIDO = false
      this.twoFA.error.registerFIDO = false
      this.twoFA.OTPRecoveryCodes = null
    },

    removeTwoFactorErrors() {
      this.twoFA.error.isWrongOTP = false
      this.twoFA.error.enableTOTP = false
      this.twoFA.error.disableTOTP = false
      this.twoFA.error.enableEmailOTP = false
      this.twoFA.error.disableEmailOTP = false
      this.twoFA.error.newRecoveryCodes = false
      this.twoFA.error.unregisterFIDO = false
      this.twoFA.error.registerFIDO = false
      this.twoFA.OTPRecoveryCodes = null
    },

    onKeyDown(event) {
      if (event.key === 'Escape') this.cancelCurrentTwoFactorAuthAction()
    }
  },

  mounted() {
    this.form = Object.assign(this.form, this.user)
    this.form.notifications_enabled = this.form.notifications_enabled
      ? 'true'
      : 'false'
    this.form.notifications_slack_enabled = this.form
      .notifications_slack_enabled
      ? 'true'
      : 'false'
    this.form.notifications_mattermost_enabled = this.form
      .notifications_mattermost_enabled
      ? 'true'
      : 'false'
    this.form.notifications_discord_enabled = this.form
      .notifications_discord_enabled
      ? 'true'
      : 'false'
    window.addEventListener('keydown', this.onKeyDown, false)
  },

  head() {
    return {
      title: `${this.$t('profile.title')} - Kitsu`
    }
  }
}
</script>

<style lang="scss" scoped>
.dark .profile {
  background: #36393f;
  color: $white-grey;
}

.dark .profile-content {
  background: $dark-grey-lighter;
  color: $white-grey;
}

.profile {
  background: $white-grey;
  width: 100%;
  flex: 1 1 auto;
  height: 100%;
}

.profile-content {
  background: white;
  max-width: 500px;
  margin: auto;
  margin-top: 6em;
  margin-bottom: 2em;
  box-shadow: rgba(0, 0, 0, 0.15) 0 1px 4px 2px;
}

.profile-body {
  padding: 2em;
}

input,
select,
span.select {
  width: 100%;
}

.otp-input {
  border-radius: 10px;
}

.field {
  margin-bottom: 2em;
}

.profile-header {
  background: $light-green;
  padding: 2em;
  max-height: 170px;
}

.profile-content,
.profile-header {
  border-top-left-radius: 1em;
  border-top-right-radius: 1em;
}

.profile-content {
  border-bottom-left-radius: 1em;
  border-bottom-right-radius: 1em;
}

.profile-header-content {
  position: relative;
  top: -8em;
}

.profile-header h1 {
  font-size: 2em;
  margin-top: 0;
}

.profile-header,
.profile-header a {
  color: white;
}

h2:first-child {
  margin-top: 0;
}

.big-number {
  font-size: 3em;
}

.select:after {
  border-color: $light-green;
}

.save-button {
  border-radius: 2em;
  width: 100%;
  background: $green;
  border-color: $green;
  color: white;
}

.save-button:hover {
  background: $light-green;
  border-color: $light-green;
}

.avatar {
  margin: auto;
  border: 5px solid white;
}

.change-avatar-button {
  color: white;
}

.show-message {
  margin-top: 1em;
}

.show-message-2fa {
  margin-bottom: 1em;
}

.clear-avatar-button {
  color: white;
  font-size: 0.7em;
  text-transform: lowercase;
}

select {
  height: 3em;
}

.qrcode {
  margin-bottom: 1em;
  margin-top: 1em;
}

.cancel-two-factor-action {
  text-align: right;
  margin-bottom: 0.2em;
}

.qrcode-informations {
  text-align: center;
}

.recovery-codes {
  resize: none;
  height: 13em;
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

.two-fa-button {
  margin-bottom: 1em;
}

.icon {
  padding: 0.25em;
}

.trash-icon-fido-device {
  float: right;
  cursor: pointer;
}

.button {
  border-radius: 10px;
}
</style>
