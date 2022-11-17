<template>
  <div class="profile page">
    <div class="profile-content">

      <div class="has-text-centered profile-header">
        <div class="profile-header-content has-text-centered">
          <people-avatar
            ref="avatar"
            :no-cache="true"
            :person="this.user"
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
          :disabled="this.user.is_generated_from_ldap"
          v-model="form.first_name"
        />
        <text-field
          :label="$t('people.fields.last_name')"
          :disabled="this.user.is_generated_from_ldap"
          v-model="form.last_name"
        />
        <text-field
          :label="$t('people.fields.email')"
          :disabled="this.user.is_generated_from_ldap"
          v-model="form.email"
        />
        <text-field
          :label="$t('people.fields.phone')"
          v-model="form.phone"
        />
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
              <option value="zh_Hant_TW">Chinese (TW)</option>
              <option value="nl_NL">Dutch</option>
              <option value="en_US">English</option>
              <option value="fr_FR">French</option>
              <option value="de_DE">German</option>
              <option value="hu_HU">Hungarian</option>
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
          @click="saveProfile({form: form})"
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
          :disabled="this.user.is_generated_from_ldap"
          type="password"
          v-model="passwordForm.oldPassword"
        />
        <text-field
          :label="$t('people.fields.password')"
          :disabled="this.user.is_generated_from_ldap"
          type="password"
          v-model="passwordForm.password"
        />
        <text-field
          :label="$t('people.fields.password_2')"
          :disabled="this.user.is_generated_from_ldap"
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
          :disabled="this.user.is_generated_from_ldap"
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

        <div
          v-if="twoFA.TOTPPreEnabled"
          class="qrcode-informations"
        >
          <p>
            {{ $t('profile.two_factor_authentication.scan_qrcode')}}
          </p>

          <qrcode-vue
            class="qrcode"
            :value="twoFA.TOTPProvisionningUri"
            :size="300"
            level="M"
          />
        </div>

        <text-field
            :label="$t('profile.two_factor_authentication.otp_secret')"
            :readonly="true"
            type="text"
            v-model="twoFA.OTPSecret"
            v-if="twoFA.OTPSecret"
        />

        <div
            class="field mt2"
            v-if="twoFA.TOTPPreEnabled || twoFA.TOTPPreDisabled"
          >
          <p class="control has-icon">
            <input
              class="input is-medium"
              type="text"
              v-model="twoFA.validation_otp"
              @keyup.enter="nextEnableOrDisable"
              :placeholder="$t('login.fields.otp')"
              v-focus
            >
            <span class="icon">
              <lock-icon width=20 height=20 />
            </span>
          </p>
        </div>

        <div
          v-if="twoFA.OTPRecoveryCodes"
        >
          <label class="label label-recovery-codes">
            {{ $t('profile.two_factor_authentication.recovery_codes') }}
          </label>
          <save-icon
              class="action-icon"
              @click="saveRecoveryCodesToFile"
          />
          <copy-icon
              class="action-icon"
              @click="copyRecoveryCodesToClipboard"
          />
          <textarea
            class="input recovery-codes"
            ref="textField"
            v-text="twoFA.OTPRecoveryCodes.join('\t')"
            readonly
          ></textarea>

          <p
            :class="{
              'show-message': true,
              error: true,
              'is-hidden': !twoFA.OTPRecoveryCodes,
              'recovery-codes-warning': true
            }"
          >
            {{ $t('profile.two_factor_authentication.warning_recovery_codes') }}
        </p>
        </div>

        <button
          v-if="twoFA.TOTPPreEnabled"
          :class="{
            button: true,
            'save-button': true,
            'is-medium': true,
            'is-loading': twoFA.isLoading
          }"
          @click="enableTOTPRequested()"
        >
          {{ $t('profile.two_factor_authentication.totp.button_validate') }}
        </button>

        <button
          v-else-if="!user.totp_enabled"
          :class="{
            button: true,
            'save-button': true,
            'is-medium': true,
            'is-loading': twoFA.isLoading
          }"
          @click="preEnableTOTPRequested()"
        >
          {{ $t('profile.two_factor_authentication.totp.button_enable') }}
        </button>

        <button
          v-else
          :class="{
            button: true,
            'save-button': true,
            'is-medium': true,
            'is-loading': twoFA.isLoading
          }"
          @click="disableTOTPRequested()"
        >
          {{ $t('profile.two_factor_authentication.totp.button_disable') }}
        </button>

        <p
          :class="{
            'show-message': true,
            error: true,
            'is-hidden': !twoFA.error.isWrongOTP
          }"
        >
          {{ $t('login.wrong_otp') }}
        </p>

        <p
          :class="{
            'show-message': true,
            error: true,
            'is-hidden': !twoFA.error.enableTOTP
          }"
        >
          {{ $t('profile.two_factor_authentication.totp.error_enable') }}
        </p>

        <p
          :class="{
            'show-message': true,
            error: true,
            'is-hidden': !twoFA.error.disableTOTP
          }"
        >
          {{ $t('profile.two_factor_authentication.totp.error_disable') }}
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
import { LockIcon, CopyIcon, SaveIcon } from 'vue-feather-icons'
import { mapGetters, mapActions } from 'vuex'

import ComboboxBoolean from '@/components/widgets/ComboboxBoolean'
import ChangeAvatarModal from '@/components/modals/ChangeAvatarModal'
import PeopleAvatar from '@/components/widgets/PeopleAvatar'
import TextField from '@/components/widgets/TextField'

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
    SaveIcon
  },

  data () {
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
        TOTPPreDisabled: false,
        validation_otp: '',
        error: {
          isWrongOTP: false,
          enableTOTP: false,
          disableTOTP: false
        }
      }
    }
  },

  watch: {
    user () {
      Object.assign(this.form, this.user)
    }
  },

  computed: {
    ...mapGetters([
      'changePassword',
      'isCurrentUserAdmin',
      'isSaveProfileLoading',
      'isSaveProfileLoadingError',
      'user'
    ]),
    departments () {
      return [{ name: 'Animation' }, { name: 'Modeling' }]
    },
    timezones () {
      return moment.tz.names().filter((timezone) => {
        return timezone.indexOf('/') > 0 && timezone.indexOf('Etc') < 0
      })
    }
  },

  methods: {
    ...mapActions([
      'saveProfile',
      'checkNewPasswordValidityAndSave',
      'uploadAvatar',
      'clearAvatar',
      'disableTOTP',
      'enableTOTP',
      'preEnableTOTP'
    ]),

    localeChanged () {
      this.$i18n.locale = this.form.locale.substring(0, 2)
      if (this.form.locale === 'zh_Hans_CN') {
        moment.locale('zh_CN')
      } else if (this.form.locale === 'zh_Hant_TW') {
        moment.locale('zh_TW')
        this.$i18n.locale = 'zw'
      } else {
        moment.locale(this.form.locale.substring(0, 2))
      }
    },

    passwordChangeRequested () {
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

    enableTOTPRequested () {
      this.twoFA.isLoading = true
      this.twoFA.error.enableTOTP = false
      this.twoFA.OTPRecoveryCodes = null
      this.enableTOTP(this.twoFA.validation_otp)
        .then(OTPRecoveryCodes => {
          if (OTPRecoveryCodes) {
            this.twoFA.OTPRecoveryCodes = OTPRecoveryCodes
          }
          this.twoFA.TOTPPreEnabled = false
          this.twoFA.validation_otp = ''
          this.twoFA.error.isWrongOTP = false
          this.twoFA.OTPSecret = ''
        })
        .catch((err) => {
          if (err.body.wrong_OTP) this.twoFA.error.isWrongOTP = true
          else this.twoFA.error.EnableTOTP = true
        })
      this.twoFA.isLoading = false
    },

    preEnableTOTPRequested () {
      this.twoFA.isLoading = true
      this.twoFA.error.EnableTOTP = false
      this.twoFA.TOTPPreEnabled = false
      this.preEnableTOTP()
        .then(body => {
          this.twoFA.TOTPProvisionningUri = body.totp_provisionning_uri
          this.twoFA.OTPSecret = body.otp_secret
          this.twoFA.TOTPPreEnabled = true
        })
        .catch(this.twoFA.error.EnableTOTP = true
        )
        .finally(this.twoFA.isLoading = false)
    },

    disableTOTPRequested () {
      this.twoFA.OTPRecoveryCodes = null
      if (!this.twoFA.TOTPPreDisabled) this.twoFA.TOTPPreDisabled = true
      else {
        this.twoFA.isLoading = true
        this.disableTOTP(this.twoFA.validation_otp)
          .then(() => {
            this.twoFA.TOTPPreDisabled = false
            this.twoFA.validation_otp = ''
            this.twoFA.error.isWrongOTP = false
          })
          .catch((err) => {
            if (err.body.wrong_OTP) this.twoFA.error.isWrongOTP = true
            else this.twoFA.error.disableTOTP = true
          })
          .finally(this.twoFA.isLoading = false)
      }
    },

    nextEnableOrDisable () {
      if (this.twoFA.TOTPPreEnabled) this.enableTOTPRequested()
      else if (this.twoFA.TOTPPreDisabled) this.disableTOTPRequested()
    },

    selectFile (formData) {
      this.$store.commit('CHANGE_AVATAR_FILE', formData)
    },

    uploadAvatarFile () {
      this.changeAvatar.isLoading = true
      this.changeAvatar.isError = false
      this.uploadAvatar((err) => {
        if (err) {
          this.changeAvatar.isError = true
        }
        this.changeAvatar.isLoading = false
        this.$refs.avatar.reloadAvatar()
        this.hideAvatarModal()
      })
    },

    hideAvatarModal () {
      this.changeAvatar.isModalShown = false
    },

    showAvatarModal () {
      this.changeAvatar.isModalShown = true
    },

    removeAvatar () {
      this.clearAvatar()
    },

    copyRecoveryCodesToClipboard () {
      navigator.clipboard.writeText(this.twoFA.OTPRecoveryCodes.join('\n'))
    },

    saveRecoveryCodesToFile () {
      var blob = new Blob(
        [this.twoFA.OTPRecoveryCodes.join('\n')],
        { type: 'text/plain;charset=utf-8' }
      )
      const link = document.createElement('a')
      link.setAttribute('href', URL.createObjectURL(blob))
      link.setAttribute('download', 'kitsu-recovery-codes.txt')
      document.body.appendChild(link)
      link.click()
    }
  },

  mounted () {
    this.form = Object.assign(this.form, this.user)
    this.form.notifications_enabled =
      this.form.notifications_enabled ? 'true' : 'false'
    this.form.notifications_slack_enabled =
      this.form.notifications_slack_enabled ? 'true' : 'false'
    this.form.notifications_mattermost_enabled =
      this.form.notifications_mattermost_enabled ? 'true' : 'false'
    this.form.notifications_discord_enabled =
      this.form.notifications_discord_enabled ? 'true' : 'false'
  },

  metaInfo () {
    return {
      title: `${this.$t('profile.title')} - Kitsu`
    }
  }
}
</script>

<style lang="scss" scoped>
.dark .profile {
  background: #36393F;
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
  box-shadow: rgba(0,0,0,0.15) 0px 1px 4px 2px;
}

.profile-body {
  padding: 2em;
}

input, select, span.select {
  width: 100%;
}

.field {
  margin-bottom: 2em;
}

.profile-header {
  background: $light-green;
  padding: 2em;
  max-height:170px;
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
  margin-top: 0em;
}

.profile-header, .profile-header a {
  color: white;
}

.profile-header .column {
}

h2:first-child {
  margin-top: 0em;
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

.clear-avatar-button {
  color: white;
  font-size: 0.7em;
  text-transform: lowercase
}

select {
  height: 3em;
}

.qrcode {
  margin-bottom: 1em;
  margin-top: 1em;
}

.qrcode-informations {
  text-align: center;
}

.icon {
  padding: 0.25em;
}

.recovery-codes {
  resize: none;
  height: 13em;
  font-size: 1.5em;
  padding-left: 2.5em;
  padding-top: 0.5em;
  font-family: ui-monospace,SFMono-Regular,SF Mono,Menlo,
    Consolas,Liberation Mono,monospace;
}

.action-icon {
  cursor: pointer;
  float: right;
  margin-bottom: 5px;
}

.label-recovery-codes {
  float: left;
}

.recovery-codes-warning {
  margin-bottom: 1em;
}
</style>
