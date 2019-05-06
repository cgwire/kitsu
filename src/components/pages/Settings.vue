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
          <button class="button" @click="showAvatarModal">
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
import TextField from '../widgets/TextField'

export default {
  name: 'settings',

  components: {
    ChangeAvatarModal,
    TextField
  },

  data () {
    return {
      organisationLogoKey: new Date().getUTCDate(),
      organisationLogoPath: '',
      form: {
        name: '',
        hours_by_day: 0
      },
      errors: {
        save: false,
        saveAvatar: false
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
    this.organisationLogoPath = `/api/pictures/thumbnails/organisations/` +
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

    hideAvatarModal () {
      this.modals.avatar = false
    },

    saveSettings () {
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
              `/api/pictures/thumbnails/organisations/` +
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
  },

  metaInfo () {
    return {
      title: `${this.$t('settings.title')} - Kitsu`
    }
  }
}
</script>

<style lang="scss" scoped>
.dark .settings {
  background: #36393F;
  color: $white-grey;
}

.dark .settings-content {
  background: $dark-grey-lighter;
  color: $white-grey;
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
  border-radius: 5px;
  width: 100%;
  background: $green;
  border-color: $green;
  color: white;
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
