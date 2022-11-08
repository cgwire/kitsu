<template>
  <div class="login hero is-fullheight">
    <div class="container has-text-centered">
      <div class="box has-text-left">
        <div class="has-text-centered login-header">
          <img src="../../assets/kitsu-text-dark.svg" v-if="isDarkTheme" />
          <img src="../../assets/kitsu-text.svg" v-else />
        </div>
        <form>
          <div class="field mt2">
            <p class="control has-icon">
              <input
                class="input is-medium email"
                type="text"
                v-model="email"
                :placeholder="$t('login.fields.email')"
                @input="updateEmail"
                @keyup.enter="confirmLogIn"
                v-focus >
              <span class="icon">
                <mail-icon width=20 height=20 />
              </span>
            </p>
          </div>
          <div class="field">
            <p class="control has-icon">
              <input
                class="input is-medium password"
                type="password"
                v-model="password"
                :placeholder="$t('login.fields.password')"
                @input="updatePassword"
                @keyup.enter="confirmLogIn"
              >
              <span class="icon">
                <lock-icon width=20 height=20 />
              </span>
            </p>
          </div>
        </form>
        <p class="control">
          <a
            :class="{
              button: true,
              'main-button': true,
              'is-fullwidth': true,
              'is-loading': isLoginLoading
            }"
            @click="confirmLogIn"
          >
            {{ $t("login.login") }}
          </a>
        </p>
        <p class="control error" v-show="isTooMuchLoginFailedAttemps">
          {{ $t("login.too_many_failed_login_attemps") }}
        </p>
        <p class="control error" v-show="isLoginError && !isTooMuchLoginFailedAttemps">
          {{ $t("login.login_failed") }}
        </p>

        <p
          class="has-text-centered"
        >
          <router-link
            :to="{name: 'reset-password'}"
          >
            {{ $t("login.forgot_password")}}
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { MailIcon, LockIcon } from 'vue-feather-icons'

export default {
  name: 'login',

  components: {
    MailIcon,
    LockIcon
  },

  data () {
    return {
      email: '',
      password: '',
      isTooMuchLoginFailedAttemps: false
    }
  },

  mounted () {
    this.email = this.$store.state.login.email
    this.password = this.$store.state.login.password
  },

  computed: {
    ...mapGetters([
      'isDarkTheme',
      'isLoginLoading',
      'isLoginError'
    ])
  },

  methods: {
    ...mapActions([
      'logIn'
    ]),

    updateEmail (e) {
      this.$store.dispatch('changeEmail', e.target.value)
    },

    updatePassword (e) {
      this.$store.dispatch('changePassword', e.target.value)
    },

    confirmLogIn () {
      this.isTooMuchLoginFailedAttemps = false
      this.logIn((err, success) => {
        if (err) {
          if (err.default_password) {
            this.$router.push({
              name: 'reset-change-password',
              query: { email: this.email, token: err.token }
            })
          } else if (err.too_many_failed_login_attemps) {
            this.isTooMuchLoginFailedAttemps = true
          } else {
            console.error(err)
          }
        }
        if (success) {
          if (this.$route.query.redirect) {
            this.$router.push(this.$route.query.redirect)
          } else {
            this.$router.push('/')
          }
        }
      })
    }
  },

  metaInfo () {
    return {
      title: this.$t('login.title')
    }
  }
}
</script>

<style lang="scss" scoped>
.dark {
  .login-header img {
  }
}

.box {
  border-radius: 1em;

  h1.title {
    color: #6a6a6a;
    font-weight: 300;
    font-size: 1.8em;
    margin-bottom: 1em;
  }

  h2.subtitle {
    color: #4a4a4a;
    margin-bottom: 1em;
  }
}

.login-header img {
  border-radius: 20%;
  padding: 1em;
  margin: 2.5em 0;
  width: 200px;
}

.field {
  margin-bottom: 1em;
}

.input {
  height: 3em;
  padding: 1.5em;
  border-radius: 4px;

  &::placeholder {
    color: #999;
  }

  &:focus {
    border: 1px solid $green;
  }
}

.icon {
  padding: 0.25em;
}

@media (max-width: 1600px) {
  .box {
    margin-top: 4em;
  }
}

@media (min-width: 500px) {
  .container {
    margin: 0 auto;
  }
}

@media (max-width: 500px) {
  .login .container {
    flex: 1;
    width: 100%;
    max-width: 100%;
    display: flex;
  }

  .login .box {
    flex: 1;
  }

  .hero {
    display: flex;
    flex-direction: column;
  }

  .box {
    margin: 0;
    width: 100%;
    min-width: 100%;
  }
}
</style>
