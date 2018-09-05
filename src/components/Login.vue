<template>
  <div class="login hero is-fullheight">
    <div class="container has-text-centered">
      <div class="box has-text-left">
        <div class="has-text-centered login-header">
          <img src="../assets/kitsu.png" />
          <h1 class="title">
            {{ $t("login.title") }}
          </h1>
        </div>
        <div class="field mt2">
          <p class="control has-icon">
            <input
              class="input is-medium email"
              type="text"
              :placeholder="$t('login.fields.email')"
              @input="updateEmail"
              @keyup.enter="logIn"
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
              :placeholder="$t('login.fields.password')"
              @input="updatePassword"
              @keyup.enter="logIn">
            <span class="icon">
              <lock-icon width=20 height=20 />
            </span>
          </p>
        </div>
        <p class="control">
          <a v-bind:class="{
            'main-button': true,
            'is-fullwidth': true,
            'is-loading': isLoginLoading
          }"
            @click="logIn">
              {{ $t("login.login") }}
          </a>
        </p>
        <p class="control error" v-show="isLoginError">
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

  computed: {
    ...mapGetters([
      'isLoginLoading',
      'isLoginError'
    ])
  },

  methods: {
    ...mapActions([
    ]),
    updateEmail (e) {
      this.$store.dispatch('changeEmail', e.target.value)
    },
    updatePassword (e) {
      this.$store.dispatch('changePassword', e.target.value)
    },
    logIn () {
      this.$store.dispatch('logIn', (err, success) => {
        if (err) console.log(err)
        if (success) this.$router.push('/')
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

<style scoped>
.box h1.title {
  color: #6a6a6a;
  font-weight: 500;
  font-size: 1.8em;
}

.box h2.subtitle {
  color: #4a4a4a;
  margin-bottom: 1em;
}

.field {
  margin-bottom: 1em;
}

.input {
  height: 2.4em;
}

.input:focus {
  border: 1px solid #00B242;
}

img {
  margin-bottom: 2em;
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
