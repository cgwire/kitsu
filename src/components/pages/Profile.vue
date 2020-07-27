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

          <p v-if="!isLdap">
            <button
              class="button is-link change-avatar-button"
              @click="showAvatarModal"
            >
            {{ $t('profile.change_avatar') }}
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
          :disabled="isLdap"
          v-model="form.first_name"
        />
        <text-field
          :label="$t('people.fields.last_name')"
          :disabled="isLdap"
          v-model="form.last_name"
        />
        <text-field
          :label="$t('people.fields.email')"
          :disabled="isLdap"
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
              <option value="en_US">English</option>
              <option value="fr_FR">French</option>
              <option value="de_DE">German</option>
              <option value="fa_IR">Persian</option>
              <option value="zh_Hans_CN">Chinese</option>
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
          type="password"
          v-model="passwordForm.oldPassword"
        />
        <text-field
          :label="$t('people.fields.password')"
          type="password"
          v-model="passwordForm.password"
        />
        <text-field
          :label="$t('people.fields.password_2')"
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
          @click="passwordChangeRequested()"
        >
          {{ $t('profile.change_password.button') }}
        </button>

        <p
          :class="{
            'change-password-message': true,
            error: true,
            'is-hidden': changePassword.isValid
          }"
        >
          {{ $t('profile.change_password.unvalid') }}
        </p>

        <p
          :class="{
            'change-password-message': true,
            success: true,
            'is-hidden': !changePassword.isSuccess
          }"
        >
          {{ $t('profile.change_password.success') }}
        </p>

        <p
          :class="{
            'change-password-message': true,
            error: true,
            'is-hidden': !changePassword.isError
          }"
        >
          {{ $t('profile.change_password.error') }}
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
import { mapGetters, mapActions } from 'vuex'

import ComboboxBoolean from '../widgets/ComboboxBoolean'
import ChangeAvatarModal from '../modals/ChangeAvatarModal'
import PeopleAvatar from '../widgets/PeopleAvatar'
import TextField from '../widgets/TextField'

export default {
  name: 'profile',

  components: {
    ComboboxBoolean,
    PeopleAvatar,
    ChangeAvatarModal,
    TextField
  },

  data () {
    return {
      form: {
        first_name: '',
        last_name: '',
        notifications_enabled: 'false',
        notifications_slack_enabled: 'false',
        notifications_slack_userid: '',
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
      'isLdap',
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
      'uploadAvatar'
    ]),

    localeChanged () {
      this.$i18n.locale = this.form.locale.substring(0, 2)
      if (this.form.locale === 'zh_Hans_CN') {
        moment.locale('zh_CN')
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
    }
  },

  mounted () {
    this.form = Object.assign(this.form, this.user)
    this.form.notifications_enabled =
      this.form.notifications_enabled ? 'true' : 'false'
    this.form.notifications_slack_enabled =
      this.form.notifications_slack_enabled ? 'true' : 'false'
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
  margin-top: 0.5em;
}

.profile-header, .profile-header a {
  color: white;
}

.profile-header .column {
}

h2 {
  border-bottom: 1px solid #DDD;
  font-size: 1.5em;
  margin-top: 2em;
  margin-bottom: 1em;
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

.change-password-message {
  margin-top: 1em;
}

select {
  height: 3em;
}
</style>
