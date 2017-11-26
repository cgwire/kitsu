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
        <div class="field">
          <p class="control has-icon">
            <input
              class="input is-medium"
              type="text"
              :placeholder="$t('login.fields.email')"
              @input="updateEmail"
              @keyup.enter="logIn"
              v-focus >
            <span class="icon">
              <i class="fa fa-envelope"></i>
            </span>
          </p>
        </div>
        <div class="field">
          <p class="control has-icon">
            <input
              class="input is-medium"
              type="password"
              :placeholder="$t('login.fields.password')"
              @input="updatePassword"
              @keyup.enter="logIn">
            <span class="icon">
              <i class="fa fa-lock"></i>
            </span>
          </p>
        </div>
        <p class="control">
          <a v-bind:class="{
            button: true,
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
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'login',
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
.login {
  background-color: #CFCFCF;
}

.login-header {
  margin-bottom: 2em;
}

.container {
  max-width: 400px;
  color: #4a4a4a;
}

.box {
  margin-top: 30%;
	padding: 3em 2em 2em 2em;
  border-radius: 2px;
	box-shadow: rgba(0,0,0,0.14902) 0px 1px 1px 0px,rgba(0,0,0,0.09804) 0px 1px 2px 0px;
}

.box h1.title {
  color: #6a6a6a;
  font-weight: 500;
  font-size: 1.8em;
}

.box h2.subtitle {
  color: #4a4a4a;
  margin-bottom: 1em;
}

.main-button {
  background: #5e60ba;
  border-radius: 2px;
	min-height: 2.8em;
  color: white;
  border-color: #5e60ba;
}

.main-button:hover {
  background: #67BE4B;
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

.button {
  padding: 24px 24px 24px 12px;
  margin: .3em 0 0em 0;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 1px;
  background: #00B242;
  color: #fff;
  border: 0;
  border-bottom: 3px solid #008732;
  transition: all 0.15s ease;
}
.button:focus { outline: 0; }

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
