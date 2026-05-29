<template>
  <div class="profile page">
    <div class="profile-content">
      <header class="profile-header">
        <people-avatar
          :is-lazy="false"
          :person="user"
          :size="120"
          :font-size="48"
        />
        <h1 class="profile-name">{{ user.full_name }}</h1>
        <p class="profile-role" v-if="user.role">
          {{ $t(`people.role.${user.role}`) }}
        </p>
        <div class="profile-avatar-actions">
          <button class="link-button" @click="showAvatarModal">
            {{ $t('profile.change_avatar') }}
          </button>
          <span class="dot">·</span>
          <button class="link-button muted" @click="removeAvatar">
            {{ $t('profile.clear_avatar') }}
          </button>
        </div>
      </header>

      <card
        :title="$t('profile.info_title')"
        :error="errors.info ? $t('profile.save.error') : ''"
        :save-label="$t('profile.save.button')"
        :loading="loading.info"
        @save="saveInfo"
      >
        <div class="grid-two">
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
        </div>
        <div class="grid-two">
          <combobox
            :label="$t('profile.timezone')"
            :options="timezoneOptions"
            v-model="form.timezone"
          />
          <combobox
            :label="$t('profile.language')"
            :options="localeOptions"
            v-model="form.locale"
            @update:model-value="localeChanged"
          />
        </div>
      </card>

      <card
        :title="$t('profile.notifications_title')"
        :error="errors.notifications ? $t('profile.save.error') : ''"
        :save-label="$t('profile.save.button')"
        :loading="loading.notifications"
        @save="saveNotifications"
      >
        <div class="toggle-row">
          <checkbox
            :toggle="true"
            :label="$t('profile.notifications_enabled')"
            v-model="form.notifications_enabled"
          />
        </div>

        <div class="channel">
          <checkbox
            :toggle="true"
            :label="$t('profile.notifications_slack_enabled')"
            v-model="form.notifications_slack_enabled"
          />
          <text-field
            :label="$t('profile.notifications_slack_user')"
            v-model="form.notifications_slack_userid"
            v-if="form.notifications_slack_enabled"
          />
        </div>

        <div class="channel">
          <checkbox
            :toggle="true"
            :label="$t('profile.notifications_mattermost_enabled')"
            v-model="form.notifications_mattermost_enabled"
          />
          <text-field
            :label="$t('profile.notifications_mattermost_user')"
            v-model="form.notifications_mattermost_userid"
            v-if="form.notifications_mattermost_enabled"
          />
        </div>

        <div class="channel">
          <checkbox
            :toggle="true"
            :label="$t('profile.notifications_discord_enabled')"
            v-model="form.notifications_discord_enabled"
          />
          <text-field
            :label="$t('profile.notifications_discord_user')"
            v-model="form.notifications_discord_userid"
            v-if="form.notifications_discord_enabled"
          />
        </div>
      </card>

      <card
        :title="$t('profile.password_title')"
        :error="
          !changePassword.isValid
            ? $t('profile.change_password.unvalid')
            : changePassword.isError
              ? $t('profile.change_password.error')
              : ''
        "
        :success="
          changePassword.isSuccess ? $t('profile.change_password.success') : ''
        "
        :save-label="$t('profile.change_password.button')"
        :loading="changePassword.isLoading"
        :disabled="user.is_generated_from_ldap"
        @save="passwordChangeRequested"
      >
        <text-field
          autocomplete="current-password"
          :label="$t('people.fields.old_password')"
          :disabled="user.is_generated_from_ldap"
          type="password"
          v-model="passwordForm.oldPassword"
        />
        <text-field
          autocomplete="new-password"
          :label="$t('people.fields.password')"
          :disabled="user.is_generated_from_ldap"
          type="password"
          v-model="passwordForm.password"
        />
        <text-field
          autocomplete="new-password"
          :label="$t('people.fields.password_2')"
          :disabled="user.is_generated_from_ldap"
          type="password"
          v-model="passwordForm.password2"
        />
      </card>

      <card :title="$t('profile.two_factor_authentication.title')">
        <two-factor-authentication-setup />
      </card>
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

<script setup>
import moment from 'moment-timezone'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHead } from '@unhead/vue'
import { useStore } from 'vuex'

import lang from '@/lib/lang'

import ChangeAvatarModal from '@/components/modals/ChangeAvatarModal.vue'
import Card from '@/components/widgets/Card.vue'
import Checkbox from '@/components/widgets/Checkbox.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import TextField from '@/components/widgets/TextField.vue'
import TwoFactorAuthenticationSetup from '@/components/widgets/TwoFactorAuthenticationSetup.vue'

const { t } = useI18n()
const store = useStore()

// State

const form = ref({
  first_name: '',
  last_name: '',
  notifications_enabled: false,
  notifications_slack_enabled: false,
  notifications_slack_userid: '',
  notifications_mattermost_enabled: false,
  notifications_mattermost_userid: '',
  notifications_discord_enabled: false,
  notifications_discord_userid: '',
  email: '',
  phone: '',
  timezone: 'Europe/Paris',
  locale: 'en_US'
})

const passwordForm = ref({
  oldPassword: '',
  password: '',
  password2: ''
})

const changeAvatar = reactive({
  isModalShown: false,
  isLoading: false,
  isLoadingError: false,
  formData: null
})

const loading = reactive({ info: false, notifications: false })
const errors = reactive({ info: false, notifications: false })

// Locale list — alphabetical by the English name (as in the original page),
// with the native name in parentheses so it stays recognizable when the UI
// language doesn't match.
const localeOptions = [
  { label: 'Chinese (简体中文)', value: 'zh_Hans_CN' },
  { label: 'Chinese TC (繁體中文)', value: 'zh_Hant_TW' },
  { label: 'Danish (Dansk)', value: 'da_DA' },
  { label: 'Dutch (Nederlands)', value: 'nl_NL' },
  { label: 'English', value: 'en_US' },
  { label: 'French (Français)', value: 'fr_FR' },
  { label: 'German (Deutsch)', value: 'de_DE' },
  { label: 'Hungarian (Magyar)', value: 'hu_HU' },
  { label: 'Japanese (日本語)', value: 'ja_JP' },
  { label: 'Korean (한국어)', value: 'ko_KR' },
  { label: 'Portuguese Brazilian (Português)', value: 'pt_BR' },
  { label: 'Persian (فارسی)', value: 'fa_IR' },
  { label: 'Spanish (Español)', value: 'es_ES' },
  { label: 'Russian (Русский)', value: 'ru_RU' }
]

// Computed

const user = computed(() => store.getters.user)
const changePassword = computed(() => store.getters.changePassword)

const timezoneOptions = computed(() =>
  moment.tz
    .names()
    .filter(tz => tz.indexOf('/') > 0 && tz.indexOf('Etc') < 0)
    .map(tz => ({ label: tz, value: tz }))
)

// Functions

const syncFormFromUser = () => {
  Object.assign(form.value, user.value)
  form.value.notifications_enabled = Boolean(user.value.notifications_enabled)
  form.value.notifications_slack_enabled = Boolean(
    user.value.notifications_slack_enabled
  )
  form.value.notifications_mattermost_enabled = Boolean(
    user.value.notifications_mattermost_enabled
  )
  form.value.notifications_discord_enabled = Boolean(
    user.value.notifications_discord_enabled
  )
}

const saveSection = async section => {
  loading[section] = true
  errors[section] = false
  try {
    await store.dispatch('saveProfile', { form: form.value })
  } catch {
    errors[section] = true
  }
  loading[section] = false
}

const saveInfo = () => saveSection('info')
const saveNotifications = () => saveSection('notifications')

const localeChanged = value => {
  form.value.locale = value
  lang.setLocale(value)
}

const passwordChangeRequested = async () => {
  await store.dispatch('checkNewPasswordValidityAndSave', {
    form: passwordForm.value
  })
  if (changePassword.value.isSuccess) {
    passwordForm.value = { oldPassword: '', password: '', password2: '' }
  }
}

const selectFile = formData => {
  store.commit('CHANGE_AVATAR_FILE', formData)
}

const uploadAvatarFile = formData => {
  changeAvatar.isLoading = true
  changeAvatar.isLoadingError = false
  store
    .dispatch('uploadAvatar', formData)
    .catch(err => {
      console.error(err)
      changeAvatar.isLoadingError = true
    })
    .finally(() => {
      changeAvatar.isLoading = false
      hideAvatarModal()
    })
}

const hideAvatarModal = () => {
  changeAvatar.isModalShown = false
}

const showAvatarModal = () => {
  changeAvatar.isModalShown = true
}

const removeAvatar = () => {
  store.dispatch('clearAvatar')
}

// Watchers

watch(user, syncFormFromUser)

// Lifecycle

onMounted(syncFormFromUser)

// Head

useHead({ title: computed(() => `${t('profile.title')} - Kitsu`) })
</script>

<style lang="scss" scoped>
.profile {
  background: var(--background-page);
  color: var(--text);
  flex: 1 1 auto;
  height: 100%;
  width: 100%;
  overflow-y: auto;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin: 3rem auto;
  max-width: 720px;
  padding: 0 1.5rem;
}

.profile-header {
  align-items: center;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 0 0.5rem;
  text-align: center;
}

.profile-name {
  color: var(--text);
  font-size: 1.6rem;
  font-weight: 600;
  margin: 1rem 0 0.25rem;
}

.profile-role {
  color: var(--text-alt);
  font-size: 0.95rem;
  letter-spacing: 0.02em;
  margin: 0;
  text-transform: uppercase;
}

.profile-avatar-actions {
  align-items: center;
  display: flex;
  gap: 0.4rem;
  margin-top: 0.75rem;
}

.dot {
  color: var(--text-alt);
}

.link-button {
  background: none;
  border: none;
  color: $green;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0;

  &:hover {
    text-decoration: underline;
  }

  &.muted {
    color: var(--text-alt);
  }
}

// Combobox wraps its <select> in a Bulma .select span that is
// inline-block by default; force it block so the dropdown stretches to
// the same width as the TextField inputs above it.
.profile-content {
  :deep(.select) {
    display: block;
  }
  :deep(.combobox.select-input) {
    width: 100%;
  }
}

.grid-two {
  display: grid;
  gap: 0 1rem;
  grid-template-columns: 1fr 1fr;
}

.toggle-row {
  margin-bottom: 1rem;
}

.channel {
  border-top: 1px solid var(--border);
  padding-top: 1rem;
  margin-top: 0.5rem;
}

@media screen and (max-width: 768px) {
  .profile-content {
    margin: 1.5rem auto;
    padding: 0 0.75rem;
  }

  .grid-two {
    grid-template-columns: 1fr;
  }
}
</style>
