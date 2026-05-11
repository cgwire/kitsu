<template>
  <div class="settings page">
    <div class="settings-content">
      <header class="settings-header">
        <div class="logo-frame" v-if="form.has_avatar">
          <img class="logo-image" :src="organisationLogoPath" alt="" />
        </div>
        <div class="logo-frame logo-frame--empty" v-else>
          <span class="logo-initial">{{ logoInitial }}</span>
        </div>
        <h1 class="settings-name">
          {{ organisation.name || $t('main.studio') }}
        </h1>
        <div class="settings-logo-actions">
          <button class="link-button" type="button" @click="showAvatarModal">
            {{
              form.has_avatar
                ? $t('settings.change_logo')
                : $t('settings.set_logo')
            }}
          </button>
          <template v-if="form.has_avatar">
            <span class="dot">·</span>
            <button
              class="link-button muted"
              type="button"
              @click="removeAvatar"
            >
              {{ $t('settings.remove_logo') }}
            </button>
          </template>
        </div>
      </header>

      <form ref="formRef" @submit.prevent="saveSettings">
        <section class="card">
          <h2 class="card-title">{{ $t('settings.title') }}</h2>
          <text-field
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
          <div class="card-actions">
            <p class="error" v-if="errors.save">
              {{ $t('settings.save.error') }}
            </p>
            <button
              class="button save-button"
              :class="{ 'is-loading': loading.save }"
              :disabled="loading.save || !formRef?.checkValidity()"
              type="submit"
            >
              {{ $t('settings.save.button') }}
            </button>
          </div>
        </section>

        <section class="card">
          <h2 class="card-title">{{ $t('settings.preferences_title') }}</h2>
          <div class="toggle-row">
            <checkbox
              :toggle="true"
              :label="$t('settings.fields.use_original_name')"
              v-model="form.use_original_file_name"
            />
          </div>
          <div class="toggle-row">
            <checkbox
              :toggle="true"
              :label="$t('settings.fields.show_hd_default')"
              v-model="form.hd_by_default"
            />
          </div>
          <div class="toggle-row">
            <checkbox
              :toggle="true"
              :label="$t('settings.fields.timesheets_locked')"
              v-model="form.timesheets_locked"
            />
          </div>
          <div class="toggle-row">
            <checkbox
              :toggle="true"
              :label="$t('settings.fields.format_duration_in_hours')"
              v-model="form.format_duration_in_hours"
            />
          </div>
          <div class="toggle-row">
            <checkbox
              :toggle="true"
              :label="$t('settings.fields.dark_theme_by_default')"
              v-model="form.dark_theme_by_default"
            />
          </div>
          <div class="card-actions">
            <button
              class="button save-button"
              :class="{ 'is-loading': loading.save }"
              :disabled="loading.save || !formRef?.checkValidity()"
              type="submit"
            >
              {{ $t('settings.save.button') }}
            </button>
          </div>
        </section>

        <section class="card">
          <h2 class="card-title">{{ $t('settings.integrations') }}</h2>
          <text-field
            :label="$t('settings.fields.slack_token')"
            v-model.trim="form.chat_token_slack"
          />
          <text-field
            :label="$t('settings.fields.discord_token')"
            v-model.trim="form.chat_token_discord"
          />
          <text-field
            :label="$t('settings.fields.mattermost_webhook')"
            v-model.trim="form.chat_webhook_mattermost"
          />
          <p class="error" v-if="errors.webhook_error">
            {{ $t('settings.webhook_error') }}
          </p>
          <div class="card-actions">
            <button
              class="button save-button"
              :class="{ 'is-loading': loading.save }"
              :disabled="loading.save || !formRef?.checkValidity()"
              type="submit"
            >
              {{ $t('settings.save.button') }}
            </button>
          </div>
        </section>
      </form>
    </div>

    <change-avatar-modal
      :active="modals.avatar"
      :is-loading="loading.saveAvatar"
      :is-error="errors.saveAvatar"
      shape="rounded"
      :title="$t('settings.change_logo')"
      @confirm="uploadAvatarFile"
      @cancel="hideAvatarModal"
    />
  </div>
</template>

<script setup>
import { useHead } from '@unhead/vue'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import ChangeAvatarModal from '@/components/modals/ChangeAvatarModal.vue'
import Checkbox from '@/components/widgets/Checkbox.vue'
import TextField from '@/components/widgets/TextField.vue'

const { t } = useI18n()
const store = useStore()

// State

const form = reactive({
  chat_token_discord: '',
  chat_token_slack: '',
  chat_webhook_mattermost: '',
  has_avatar: false,
  hd_by_default: false,
  hours_by_day: 0,
  name: '',
  timesheets_locked: false,
  use_original_file_name: false,
  format_duration_in_hours: false,
  dark_theme_by_default: false
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

const logoInitial = computed(
  () => organisation.value?.name?.slice(0, 1).toUpperCase() || '?'
)

// Functions

const checkWebhook = () => {
  if (
    !form.chat_webhook_mattermost ||
    form.chat_webhook_mattermost.match('/hooks/[a-zA-Z0-9]+$')
  ) {
    errors.webhook_error = false
    return true
  }
  errors.webhook_error = true
  return false
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
  store
    .dispatch('saveOrganisation', { ...form })
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
      hd_by_default: Boolean(organisation.value.hd_by_default),
      hours_by_day: organisation.value.hours_by_day,
      name: organisation.value.name,
      timesheets_locked: Boolean(organisation.value.timesheets_locked),
      use_original_file_name: Boolean(
        organisation.value.use_original_file_name
      ),
      format_duration_in_hours: Boolean(
        organisation.value.format_duration_in_hours
      ),
      dark_theme_by_default: Boolean(organisation.value.dark_theme_by_default)
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
.settings {
  background: var(--background-page);
  color: var(--text);
  flex: 1 1 auto;
  height: 100%;
  overflow-y: auto;
  width: 100%;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin: 3rem auto;
  max-width: 720px;
  padding: 0 1.5rem;
}

.settings-header {
  align-items: center;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 0 0.5rem;
  text-align: center;
}

.logo-frame {
  align-items: center;
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 16px;
  display: flex;
  height: 120px;
  justify-content: center;
  overflow: hidden;
  padding: 0.75rem;
  width: 120px;
}

.dark .logo-frame {
  background: var(--background-alt);
}

.logo-image {
  display: block;
  height: 100%;
  object-fit: cover;
  width: 100%;
}

.logo-frame--empty {
  border-style: dashed;
}

.logo-initial {
  color: var(--text-alt);
  font-size: 3rem;
  font-weight: 600;
}

.settings-name {
  color: var(--text);
  font-size: 1.6rem;
  font-weight: 600;
  margin: 1rem 0 0.25rem;
}

.settings-logo-actions {
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

.card {
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 12px;
  color: var(--text);
  padding: 1.75rem 2rem;

  :deep(label.label) {
    color: var(--text);
  }

  &:not(:last-child) {
    margin-bottom: 1.5rem;
  }
}

.dark .card {
  background: var(--background-alt);
}

.card-title {
  border-bottom: none;
  color: var(--text);
  font-size: 1.2rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  margin: 0 0 2.5rem;
  text-transform: uppercase;
}

.toggle-row {
  margin-bottom: 1rem;
}

.card-actions {
  align-items: center;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;

  .error {
    flex: 1;
    margin: 0;
  }
}

.save-button {
  background: $green;
  border-color: $green;
  color: $white;
  min-width: 8rem;

  &:hover:not([disabled]) {
    background: $light-green;
    border-color: $light-green;
  }
}

@media screen and (max-width: 768px) {
  .settings-content {
    margin: 1.5rem auto;
    padding: 0 0.75rem;
  }

  .card {
    padding: 1.25rem;
  }
}
</style>
