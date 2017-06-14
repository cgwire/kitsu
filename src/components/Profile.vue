<template>
  <div class="profile page">
    <div class="profile-content">
      <div class="has-text-centered profile-header">
        <div class="profile-header-content has-text-centered">
          <people-avatar :person="this.user" size="150">
          </people-avatar>
          <!--p>
            <a class="button is-link">
            change avatar
            </a>
          </p-->
          <h1>
          {{ $t('profile.title') }}
          </h1>
        </div>
      </div>
      <div class="profile-body">
        <text-field
          :label="$t('people.fields.first_name')"
          v-model="form.first_name">
        </text-field>
        <text-field
          :label="$t('people.fields.last_name')"
          v-model="form.last_name">
        </text-field>
        <text-field
          :label="$t('people.fields.email')"
          v-model="form.email">
        </text-field>
        <text-field
          :label="$t('people.fields.phone')"
          v-model="form.phone">
        </text-field>
        <div class="field">
          <label class="label">
            {{ $t('profile.timezone') }}
          </h1>
          </label>
          <span class="select is-medium">
            <select v-model="form.timezone">
              <option v-for="timezone in timezones">
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
            </select>
          </span>
        </div>

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
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment-timezone'
import { mapGetters, mapActions } from 'vuex'
import PeopleAvatar from './widgets/PeopleAvatar'
import TextField from './widgets/TextField'

export default {
  name: 'profile',
  data () {
    return {
      form: {
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        timezone: 'Europe/Paris',
        locale: 'French'
      }
    }
  },
  components: {
    PeopleAvatar,
    TextField
  },
  watch: {
    user () {
      Object.assign(this.form, this.user)
    }
  },
  computed: {
    ...mapGetters([
      'user',
      'isSaveProfileLoading',
      'isSaveProfileLoadingError'
    ]),
    departments () {
      return [{name: 'Animation'}, {name: 'Modeling'}]
    },
    timezones () {
      return moment.tz.names()
    }
  },
  methods: {
    ...mapActions([
      'saveProfile'
    ]),
    localeChanged () {
      this.$i18n.locale = this.form.locale.substring(0, 2)
    }
  },
  mounted () {
    this.form = Object.assign(this.form, this.user)
  }
}
</script>

<style scoped>
.profile.page {
  background: #EEEEEE;
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
  background: #67BE4B;
  padding: 2em;
  max-height:170px;
}

.profile-header-content {
  position: relative;
  top: -8em;
}

.profile-header h1 {
  font-size: 2em;
  margin-top: 0.5em;
}

.profile-header img {
  background: white;
  border-radius: 50%;
  border: 3px solid white;
  max-width: 200px;
	box-shadow: rgba(0,0,0,0.15) 0px 1px 4px 2px;
}
.profile-header, .profile-header a {
  color: white;
}

.profile-header .column {
}

.big-number {
  font-size: 3em;
}

.select:after {
  border-color: #67BE4B;
}

.save-button {
  border-radius: 2px;
  width: 100%;
  background: #00B242;
  border-color: #00B242;
  color: white;
}

.save-button:hover {
  background: #67BE4B;
  border-color: #67BE4B;
}

.avatar {
  margin: auto;
  font-size: 3em;
  border: 5px solid white;
}
</style>
