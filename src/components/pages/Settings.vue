<template>
  <div class="settings page">
    <div class="settings-form">
      <form class="settings-header" @submit.prevent>
        <h2>
          {{ $t('main.studio') }}
        </h2>
        <div class="field">
          <label class="label">
            {{ $t('settings.logo') }}
          </label>
          <div class="logo-wrapper" v-if="form.has_avatar">
            <img :src="organisationLogoPath" />
          </div>
          <p class="no-logo" v-else>
            <em>{{ $t('settings.no_logo') }}</em>
          </p>
          <p>
            <button
              type="button"
              class="button set-logo-button"
              @click="showAvatarModal"
            >
              {{ $t('settings.set_logo') }}
            </button>
          </p>
          <p v-if="form.has_avatar">
            <button
              type="button"
              class="button is-link remove-logo-button"
              @click="removeAvatar"
            >
              {{ $t('settings.remove_logo') }}
            </button>
          </p>
        </div>
      </form>
      <form ref="formRef" @submit.prevent="saveSettings">
        <h2>
          {{ $t('settings.title') }}
        </h2>
        <text-field
          class="mt2"
          :label="$t('settings.fields.name')"
          :required="true"
          v-model.trim="form.name"
        />
        <text-field
          :label="$t('settings.fields.hours_by_day')"
          :min="1"
          :max="24"
          :required="true"
          type="number"
          v-model="form.hours_by_day"
        />
        <combobox-boolean
          :label="$t('settings.fields.use_original_name')"
          v-model="form.use_original_file_name"
        />
        <combobox-boolean
          :label="$t('settings.fields.show_hd_default')"
          v-model="form.hd_by_default"
        />
        <combobox-boolean
          :label="$t('settings.fields.timesheets_locked')"
          v-model="form.timesheets_locked"
        />
        <combobox-boolean
          :label="$t('settings.fields.format_duration_in_hours')"
          v-model="form.format_duration_in_hours"
        />
        <combobox-boolean
          :label="$t('settings.fields.dark_theme_by_default')"
          v-model="form.dark_theme_by_default"
        />
        <h2>
          {{ $t('settings.integrations') }}
        </h2>
        <text-field
          :label="$t('settings.fields.slack_token')"
          v-model.trim="form.chat_token_slack"
        />
        <text-field
          :label="$t('settings.fields.discord_token')"
          v-model.trim="form.chat_token_discord"
        />
        <div class="mattermost_integrations">
          <text-field
            :label="$t('settings.fields.mattermost_webhook')"
            v-model.trim="form.chat_webhook_mattermost"
          />
          <div
            class="error has-text-centered"
            v-if="errors.webhook_error === true"
          >
            <em>{{ $t('settings.webhook_error') }}</em>
          </div>
        </div>
        <button
          class="button save-button is-medium"
          :class="{
            'is-loading': loading.save
          }"
          :disabled="loading.save || !formRef?.checkValidity()"
        >
          {{ $t('settings.save.button') }}
        </button>
        <p class="error has-text-centered mt2" v-if="errors.save">
          <em>{{ $t('settings.save.error') }}</em>
        </p>
      </form>
    </div>

    <change-avatar-modal
      :active="modals.avatar"
      :is-loading="loading.saveAvatar"
      :is-error="errors.saveAvatar"
      :title="$t('settings.change_logo')"
      @confirm="uploadAvatarFile"
      @cancel="hideAvatarModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHead } from '@unhead/vue'
import { useStore } from 'vuex'

import ChangeAvatarModal from '@/components/modals/ChangeAvatarModal.vue'
import ComboboxBoolean from '@/components/widgets/ComboboxBoolean.vue'
import TextField from '@/components/widgets/TextField.vue'

const { t } = useI18n()
const store = useStore()

// State

const form = reactive({
  chat_token_discord: '',
  chat_token_slack: '',
  chat_webhook_mattermost: '',
  has_avatar: false,
  hd_by_default: 'false',
  hours_by_day: 0,
  name: '',
  timesheets_locked: 'false',
  use_original_file_name: 'false',
  format_duration_in_hours: 'false',
  dark_theme_by_default: 'false'
})
const errors = reactive({
  save: false,
  saveAvatar: false,
  webhook_error: false
})
const loading = reactive({
  save: false,
  saveAvatar: false
})
const modals = reactive({
  avatar: false
})

const formRef = ref(null)
const organisationLogoPath = ref('')

// Computed

const organisation = computed(() => store.getters.organisation)

// Functions

const checkWebhook = () => {
  if (
    !form.chat_webhook_mattermost ||
    form.chat_webhook_mattermost.match('/hooks/[a-zA-Z0-9]+$')
  ) {
    errors.webhook_error = false
    return true
  } else {
    errors.webhook_error = true
    return false
  }
}

const hideAvatarModal = () => {
  modals.avatar = false
}

const showAvatarModal = () => {
  modals.avatar = true
}

const saveSettings = () => {
  if (!checkWebhook()) return
  loading.save = true
  errors.save = false
  const data = {
    ...form,
    hd_by_default: form.hd_by_default === 'true',
    timesheets_locked: form.timesheets_locked === 'true',
    use_original_file_name: form.use_original_file_name === 'true',
    format_duration_in_hours: form.format_duration_in_hours === 'true',
    dark_theme_by_default: form.dark_theme_by_default === 'true'
  }
  store
    .dispatch('saveOrganisation', data)
    .catch(err => {
      console.error(err)
      errors.save = true
    })
    .finally(() => {
      loading.save = false
    })
}

const uploadAvatarFile = formData => {
  loading.saveAvatar = true
  errors.saveAvatar = false
  store
    .dispatch('uploadOrganisationLogo', formData)
    .then(() => {
      setTimeout(() => {
        modals.avatar = false
        const timestamp = Date.now()
        organisationLogoPath.value = `/api/pictures/thumbnails/organisations/${organisation.value.id}.png?t=${timestamp}`
      }, 500)
    })
    .catch(err => {
      console.error(err)
      errors.saveAvatar = true
    })
    .finally(() => {
      loading.saveAvatar = false
    })
}

const removeAvatar = () => {
  loading.save = true
  errors.save = false
  store
    .dispatch('deleteOrganisationLogo')
    .catch(err => {
      console.error(err)
      errors.save = true
    })
    .finally(() => {
      loading.save = false
    })
}

// Watchers

watch(
  organisation,
  () => {
    Object.assign(form, {
      chat_token_discord: organisation.value.chat_token_discord,
      chat_token_slack: organisation.value.chat_token_slack,
      chat_webhook_mattermost: organisation.value.chat_webhook_mattermost,
      has_avatar: organisation.value.has_avatar,
      hd_by_default: organisation.value.hd_by_default ? 'true' : 'false',
      hours_by_day: organisation.value.hours_by_day,
      name: organisation.value.name,
      timesheets_locked: organisation.value.timesheets_locked
        ? 'true'
        : 'false',
      use_original_file_name: organisation.value.use_original_file_name
        ? 'true'
        : 'false',
      format_duration_in_hours: organisation.value.format_duration_in_hours
        ? 'true'
        : 'false',
      dark_theme_by_default: organisation.value.dark_theme_by_default
        ? 'true'
        : 'false'
    })
  },
  { immediate: true }
)

// Lifecycle

onMounted(() => {
  organisationLogoPath.value = `/api/pictures/thumbnails/organisations/${organisation.value.id}.png`
})

// Head

useHead({ title: computed(() => `${t('settings.title')} - Kitsu`) })
</script>

<style lang="scss" scoped>
.dark {
  .settings {
    background: $dark-grey-2;
    color: $white-grey;
  }

  .settings-form {
    background: $dark-grey-lighter;
    color: $white-grey;
  }

  .set-logo-button {
    background-color: $grey;
    color: $dark-grey;
  }
}

.mattermost_integrations {
  margin-bottom: 4em;
  .field {
    margin-bottom: 0;
  }
}

.settings {
  background: $white-grey;
  height: 100%;
}

.settings-form {
  background: white;
  max-width: 500px;
  margin: auto;
  margin-top: 2em;
  margin-bottom: 2em;
  padding: 2em;
  box-shadow: rgba(0, 0, 0, 0.15) 0 1px 4px 2px;
  border-radius: 1em;
}

@media screen and (max-width: 768px) {
  .settings-form {
    margin: 1em 0.5em;
    padding: 1em;
  }
}

input,
select,
span.select {
  width: 100%;
}

h2:first-child {
  margin-top: 0;
}

.save-button {
  background: $green;
  border-radius: 10px;
  border-color: $green;
  color: white;
  width: 100%;
}

.save-button:hover {
  background: $light-green;
  border-color: $light-green;
}

.logo-wrapper {
  padding: 0;

  img {
    width: 100px;
  }
}

.no-logo {
  margin-bottom: 1em;
}

.remove-logo-button {
  margin-top: 0.5rem;
  font-size: 0.7em;
}
</style>
