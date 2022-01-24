<template>
  <div class="settings page">
    <div class="settings-content">

      <div class="settings-body">
        <h2>
          {{ $t('settings.title') }}
        </h2>
        <p>
        <strong>
          {{ $t('settings.logo') }}
        </strong>
        </p>
        <div class="logo-wrapper" v-if="organisation.has_avatar">
          <img :src="organisationLogoPath" />
        </div>
        <p class="no-logo" v-else>
          {{ $t('settings.no_logo') }}
        </p>
        <p>
          <button class="button set-logo-button" @click="showAvatarModal">
            {{ $t('settings.set_logo') }}
          </button>
        </p>
        <text-field
          class="mt2"
          :label="$t('settings.fields.name')"
          @enter="saveSettings()"
          v-model="form.name"
        />
        <text-field
          :label="$t('settings.fields.hours_by_day')"
          type="number"
          @enter="saveSettings()"
          v-model="form.hours_by_day"
        />
        <combobox-boolean
          :label="$t('settings.fields.use_original_name')"
          @enter="saveSettings()"
          v-model="form.use_original_file_name"
        />
        <combobox-boolean
          :label="$t('settings.fields.show_hd_preview')"
          @enter="saveSettings()"
          v-model="form.hd_by_default"
        />
        <combobox-boolean
          :label="$t('settings.fields.timesheets_locked')"
          @enter="saveSettings()"
          v-model="form.timesheets_locked"
        />
        <h2>
          {{ $t('settings.integrations') }}
        </h2>
        <text-field
          :label="$t('settings.fields.slack_token')"
          @enter="saveSettings()"
          v-model="form.chat_token_slack"
        />

        <div id="mattermost_integrations">
          <text-field
          :label="$t('settings.fields.mattermost_webhook')"
          @enter="saveSettings()"
          v-model="form.chat_webhook_mattermost"
          />
          <div
            class="error pull-right"
            v-if="this.errors.webhook_error === true"
          >
          <em>{{ $t('settings.webhook_error') }}</em>
      </div>
        </div>

        <button
          :class="{
            button: true,
            'save-button': true,
            'is-medium': true,
            'is-loading': loading.save
          }"
          @click="saveSettings()"
        >
          {{ $t('settings.save.button') }}
        </button>
        <p
          :class="{
            error: true,
            'is-hidden': !errors.save
          }"
        >
          {{ $t('settings.save.error') }}
        </p>

      </div>
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

<script>
import { mapGetters, mapActions } from 'vuex'

import ChangeAvatarModal from '../modals/ChangeAvatarModal'
import ComboboxBoolean from '../widgets/ComboboxBoolean'
import TextField from '../widgets/TextField'

export default {
  name: 'settings',

  components: {
    ChangeAvatarModal,
    ComboboxBoolean,
    TextField
  },

  data () {
    return {
      organisationLogoKey: new Date().getUTCDate(),
      organisationLogoPath: '',
      form: {
        name: '',
        hours_by_day: 0,
        original_file_name: 'false',
        hd_by_default: 'false',
        chat_token_slack: '',
        chat_webhook_mattermost: ''
      },
      errors: {
        save: false,
        saveAvatar: false,
        webhook_error: false
      },
      loading: {
        save: false,
        saveAvatar: false
      },
      modals: {
        avatar: false
      }
    }
  },

  mounted () {
    this.form = Object.assign(this.form, this.organisation)
    this.organisationLogoKey = 'key' + new Date().toISOString()
    this.organisationLogoPath = '/api/pictures/thumbnails/organisations/' +
                                `${this.organisation.id}.png`
  },

  computed: {
    ...mapGetters([
      'organisation'
    ])
  },

  methods: {
    ...mapActions([
      'changeAvatar',
      'uploadOrganisationLogo',
      'saveOrganisation'
    ]),

    checkWebhook () {
      if (this.form.chat_webhook_mattermost === '') {
        this.errors.webhook_error = false
        return true
      } else if (!this.form.chat_webhook_mattermost.match('/hooks/[a-zA-Z0-9]+$')) {
        this.errors.webhook_error = true
        return false
      } else {
        this.errors.webhook_error = false
        return true
      }
    },

    hideAvatarModal () {
      this.modals.avatar = false
    },

    saveSettings () {
      if (this.checkWebhook()) {
        this.loading.save = true
        this.errors.save = false
        this.saveOrganisation(this.form)
          .then(() => {
            this.loading.save = false
            this.errors.save = false
          })
          .catch((err) => {
            console.error(err)
            this.loading.save = false
            this.errors.save = true
          })
      }
    },

    uploadAvatarFile (formData) {
      this.loading.saveAvatar = true
      this.errors.saveAvatar = false
      this.uploadOrganisationLogo(formData)
        .then(() => {
          setTimeout(() => {
            this.loading.saveAvatar = false
            this.modals.avatar = false
            this.organisationLogoPath =
              '/api/pictures/thumbnails/organisations/' +
              `${this.organisation.id}.png?t=` + new Date().toISOString()
          }, 500)
        })
        .catch((err) => {
          console.error(err)
          this.loading.saveAvatar = false
          this.errors.saveAvatar = true
        })
    },

    showAvatarModal () {
      this.modals.avatar = true
    }
  },

  watch: {
    organisation () {
      this.form = {
        name: this.organisation.name,
        hours_by_day: this.organisation.hours_by_day,
        use_original_file_name:
          this.organisation.use_original_file_name ? 'true' : 'false',
        timesheets_locked:
          this.organisation.timesheets_locked ? 'true' : 'false',
        hd_by_default:
          this.organisation.hd_by_default ? 'true' : 'false',
        chat_token_slack: this.organisation.chat_token_slack,
        chat_webhook_mattermost: this.organisation.chat_webhook_mattermost
      }
    }
  },

  metaInfo () {
    return {
      title: `${this.$t('settings.title')} - Kitsu`
    }
  }
}
</script>

<style lang="scss" scoped>
.dark {
  .settings {
    background: #36393F;
    color: $white-grey;
  }

  .settings-content {
    background: $dark-grey-lighter;
    color: $white-grey;
  }

  .set-logo-button {
    background-color: $grey;
    color: $dark-grey
  }
}

#mattermost_integrations{
  margin-bottom: 4em;
}

#mattermost_integrations .field{
  margin-bottom: 0em;
}

strong {
  text-transform: uppercase;
}

.settings {
  background: $white-grey;
  height: 100vh;
}

.settings-content {
  background: white;
  max-width: 500px;
  margin: auto;
  margin-top: 2em;
  margin-bottom: 2em;
  box-shadow: rgba(0,0,0,0.15) 0px 1px 4px 2px;
  border-radius: 1em;
}

.settings-body {
  padding: 2em;
}

input, select, span.select {
  width: 100%;
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

.save-button {
  background: $green;
  border-radius: 2em;
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
</style>
