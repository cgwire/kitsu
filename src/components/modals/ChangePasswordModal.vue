<template>
  <div
    :class="{
      modal: true,
      'is-active': active
    }"
  >
    <div class="modal-background" @click="$emit('cancel')"></div>

    <div class="modal-content">
      <div class="box">
        <h1 class="title">
          {{ $t('people.change_password_for') }} {{ person.name }}
        </h1>

        <form @submit.prevent>
          <text-field
            autocomplete="new-password"
            :disabled="person.is_generated_from_ldap"
            :label="$t('people.fields.password')"
            ref="first-password"
            type="password"
            @enter="confirmClicked()"
            v-model="form.password"
          />
          <text-field
            autocomplete="new-password"
            :disabled="person.is_generated_from_ldap"
            :label="$t('people.fields.password_2')"
            type="password"
            @enter="confirmClicked()"
            v-model="form.password2"
          />
        </form>

        <div class="flexrow">
          <button
            :class="{
              button: true,
              'is-primary': true,
              'flexrow-item': true,
              'is-loading': isLoading
            }"
            :disabled="person.is_generated_from_ldap"
            @click="confirmClicked"
          >
            {{ $t('profile.change_password.button') }}
          </button>
          <button
            :class="{
              button: true,
              'flexrow-item': true,
              'is-loading': isLoading,
              'is-warning': true
            }"
            :disabled="!(person.totp_enabled || person.email_otp_enabled)"
            @click="disableTwoFactorAuthenticationClicked"
          >
            {{ $t('people.disable_2FA') }}
          </button>
          <div class="filler"></div>

          <button class="button is-link flexrow-item" @click="$emit('cancel')">
            {{ $t('main.cancel') }}
          </button>
        </div>

        <div class="error has-text-right mt1" v-if="!isValid">
          {{ $t('profile.change_password.unvalid') }}
        </div>
        <div class="error has-text-right mt1" v-if="isError">
          {{ $t('people.change_password_error') }}
        </div>
        <div
          class="error has-text-right mt1"
          v-if="isErrorDisableTwoFactorAuthentication"
        >
          {{ $t('people.disable_2FA_error') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

import { modalMixin } from '@/components/modals/base_modal'

import TextField from '@/components/widgets/TextField.vue'

export default {
  name: 'change-password-modal',

  mixins: [modalMixin],

  props: {
    active: {
      type: Boolean,
      default: false
    },
    person: {
      type: Object,
      default: () => {}
    }
  },

  emits: ['cancel', 'confirm'],

  data() {
    return {
      form: {
        password: '',
        password2: ''
      },
      isLoading: false,
      isError: false,
      isErrorDisableTwoFactorAuthentication: false,
      isValid: true
    }
  },

  components: {
    TextField
  },

  methods: {
    ...mapActions([
      'changePasswordPerson',
      'disableTwoFactorAuthenticationPerson'
    ]),

    confirmClicked() {
      this.isErrorDisableTwoFactorAuthentication = false
      this.isError = false
      this.isLoading = true
      this.changePasswordPerson({
        person: this.person,
        form: this.form
      })
        .then(() => {
          this.$emit('confirm')
        })
        .catch(err => {
          if (err.isValidPassword === false) this.isValid = false
          else this.isError = true
        })
        .finally(() => {
          this.isLoading = false
        })
    },

    disableTwoFactorAuthenticationClicked() {
      this.isErrorDisableTwoFactorAuthentication = false
      this.isError = false
      this.isLoading = true
      this.disableTwoFactorAuthenticationPerson(this.person)
        .catch(() => {
          this.isErrorDisableTwoFactorAuthentication = true
        })
        .finally(() => {
          this.isLoading = false
        })
    },

    resetForm() {
      if (this.person) {
        this.form = {
          password: '',
          password2: ''
        }
        this.isLoading = false
        this.isError = false
        this.isErrorDisableTwoFactorAuthentication = false
        this.isValid = true
      }
    }
  },

  watch: {
    person() {
      this.resetForm()
    },

    active() {
      if (this.active) {
        this.resetForm()
        setTimeout(() => {
          this.$refs['first-password'].focus()
        }, 100)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.modal-content .box p.text {
  margin-bottom: 1em;
}
.is-danger {
  color: #ff3860;
  font-style: italic;
}
</style>
