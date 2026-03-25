<template>
  <div class="hero is-fullheight">
    <div class="container has-text-centered">
      <div class="box has-text-left">
        <div class="has-text-centered">
          <h1 class="title">
            {{
              isNew
                ? $t('login.set_password_title')
                : $t('login.reset_change_password_title')
            }}
          </h1>
        </div>

        <div class="field mt2">
          <p class="control has-icon">
            <input
              class="input is-medium email"
              type="password"
              autocomplete="new-password"
              :placeholder="$t('login.fields.password')"
              @keyup.enter="confirmResetChangePassword"
              v-model="password"
              v-focus
            />
            <span class="icon">
              <lock-icon :size="20" />
            </span>
          </p>
          <p class="control has-icon">
            <input
              class="input is-medium email"
              type="password"
              autocomplete="new-password"
              :placeholder="$t('login.fields.password2')"
              @keyup.enter="confirmResetChangePassword"
              v-model="password2"
            />
            <span class="icon">
              <lock-icon :size="20" />
            </span>
          </p>
        </div>

        <p class="control">
          <a
            :class="{
              'main-button': true,
              'is-fullwidth': true,
              'is-loading': isLoading
            }"
            @click="confirmResetChangePassword"
            v-if="!isSuccess"
          >
            {{
              isNew
                ? $t('login.set_password')
                : $t('login.reset_change_password')
            }}
          </a>
        </p>
        <p class="error" v-if="isFormError">
          {{ $t('login.reset_change_password_form_failed') }}
        </p>
        <p class="error" v-else-if="isTokenError">
          {{ $t('login.reset_change_password_token_failed') }}
        </p>
        <p class="error" v-else-if="isError">
          {{ $t('login.reset_change_password_failed') }}
        </p>
        <p class="success" v-if="isSuccess">
          {{ $t('login.reset_change_password_succeed') }}
        </p>
        <p class="has-text-centered mt2" v-if="isSuccess">
          {{ $t('login.redirecting', { secondsLeft }) }}
        </p>
        <p class="has-text-centered mt2">
          <router-link :to="{ name: 'login' }">
            <span v-if="isSuccess">
              {{ $t('login.back_to_login') }}
            </span>
            <span v-else>
              {{ $t('login.login_page') }}
            </span>
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { LockIcon } from 'lucide-vue-next'
import { mapActions } from 'vuex'

import auth from '@/lib/auth'

export default {
  name: 'reset-change-password',

  components: {
    LockIcon
  },

  data() {
    return {
      password: '',
      password2: '',
      isLoading: false,
      isError: false,
      isFormError: false,
      isTokenError: false,
      isSuccess: false,
      secondsLeft: 5
    }
  },

  mounted() {
    this.$store.commit('LOGIN_SUCCESS')
    this.isLoading = false
    this.isError = false
    this.secondsLeft = 5
  },

  computed: {
    isNew() {
      return this.$route.query.type === 'new'
    }
  },

  methods: {
    ...mapActions(['resetChangePassword']),

    confirmResetChangePassword() {
      this.isError = false
      this.isFormError = false
      this.isTokenError = false
      if (auth.isPasswordValid(this.password, this.password2)) {
        this.isLoading = true
        this.isSuccess = false
        this.resetChangePassword({
          email: this.$route.query.email,
          token: this.$route.query.token,
          password: this.password,
          password2: this.password2
        })
          .then(() => {
            this.isSuccess = true
            const interval = setInterval(() => {
              this.secondsLeft--
              if (this.secondsLeft === 0) {
                this.$router.push({ name: 'login' })
                clearInterval(interval)
              }
            }, 1000)
          })
          .catch(error => {
            if (error.body?.message?.includes('Wrong or expired token')) {
              this.isTokenError = true
            } else {
              this.isError = true
            }
          })
          .finally(() => {
            this.isLoading = false
          })
      } else {
        this.isFormError = true
      }
    }
  },

  head() {
    return {
      title: this.$t('login.reset_change_password_title')
    }
  }
}
</script>

<style lang="scss" scoped>
.box {
  border-radius: 1em;
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
</style>
