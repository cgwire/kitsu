<template>
  <div class="hero is-fullheight">
    <div class="container has-text-centered">
      <div class="box has-text-left">
        <div class="has-text-centered">
          <h1 class="title">
            {{ $t('login.reset_password_title') }}
          </h1>
        </div>

        <div class="field mt2">
          <p class="control has-icon">
            <input
              class="input is-medium email"
              type="email"
              :placeholder="$t('login.fields.email')"
              @keyup.enter="confirmResetPassword"
              v-model.trim="email"
              v-focus
            />
            <span class="icon">
              <mail-icon :size="20" />
            </span>
          </p>
        </div>

        <p class="control" v-if="!isSuccess">
          <a
            class="button main-button is-fullwidth"
            :class="{
              'is-loading': isLoading
            }"
            @click="confirmResetPassword"
          >
            {{ $t('login.reset_password') }}
          </a>
        </p>
        <p class="success" v-if="isSuccess">
          {{ $t('login.reset_password_succeed') }}
        </p>
        <p class="error" v-else-if="isInactive">
          {{ $t('login.reset_password_inactive') }}
        </p>
        <p class="error" v-else-if="isError">
          {{ $t('login.reset_password_failed') }}
        </p>
        <p class="has-text-centered">
          <router-link :to="{ name: 'login' }">
            {{ isSuccess ? $t('login.back_to_login') : $t('login.login_page') }}
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

import { MailIcon } from 'lucide-vue-next'

export default {
  name: 'reset-password',

  components: {
    MailIcon
  },

  data() {
    return {
      email: '',
      isLoading: false,
      isInactive: false,
      isError: false,
      isSuccess: false
    }
  },

  mounted() {
    this.email = this.$store.state.login.email
  },

  methods: {
    ...mapActions(['resetPassword']),

    async confirmResetPassword() {
      this.isLoading = true
      this.isInactive = false
      this.isError = false
      this.isSuccess = false
      try {
        await this.resetPassword(this.email)
        this.isSuccess = true
      } catch (error) {
        if (error.body?.message?.includes('inactive')) {
          this.isInactive = true
        } else {
          this.isError = true
        }
      } finally {
        this.isLoading = false
      }
    }
  },

  head() {
    return {
      title: this.$t('login.reset_password_title')
    }
  }
}
</script>

<style lang="scss" scoped>
.input {
  height: 3em;
  padding: 1.5em;
  border-radius: 4px;

  &::placeholder {
    color: $grey;
  }

  &:focus {
    border: 1px solid $green;
  }
}

.icon {
  padding: 0.25em;
}
</style>
