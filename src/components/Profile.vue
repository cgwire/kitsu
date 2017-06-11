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
          Your Profile
          </h1>
        </div>
      </div>
      <div class="profile-body">
        <div class="field">
          <label class="label">
            First name
          </label>
          <input class="input is-medium" type="text" :value="user.first_name" />
        </div>
        <div class="field">
          <label class="label">
            Last name
          </label>
          <input class="input is-medium" type="text" :value="user.last_name" />
        </div>
        <div class="field">
          <label class="label">
            Email
          </label>
          <input class="input is-medium" type="text" :value="user.email" />
        </div>
        <div class="field">
          <label class="label">
            Phone Number
          </label>
          <input class="input is-medium" type="text" :value="user.phone" />
        </div>
        <div class="field">
          <label class="label">
            Timezone
          </label>
          <span class="select is-medium" >
            <select>
              <option
                v-for="timezone in timezones"
                :selected="timezone === 'Europe/Paris'"
              >
                {{ timezone }}
              </option>
            </select>
          </span>
        </div>
        <div class="field">
          <label class="label">
            Language
          </label>
          <span class="select is-medium" >
            <select>
              <option value="en">English</option>
              <option value="fr">French</option>
            </select>
          </span>
        </div>

        <button class="button save-button is-medium">
        Save changes
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment-timezone'
import { mapGetters, mapActions } from 'vuex'
import PeopleAvatar from './widgets/PeopleAvatar'

export default {
  name: 'profile',
  components: {
    PeopleAvatar
  },
  computed: {
    ...mapGetters([
      'user'
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
    ])
  },
  mounted () {
    console.log(this.user)
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
