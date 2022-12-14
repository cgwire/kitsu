<template>
  <div
    :class="{
      'two-factor-authentication': true,
      'two-factor-authentication-profile': isProfile
    }"
  >
    <div class="field">
      <p class="control has-icon">
        <input
            class="input is-medium password"
            type="text"
            :placeholder="placeholderInputText"
            @input="updatePayload"
            @keyup.enter="validate"
            v-model="OTPValue"
            v-focus
        >
        <span class="icon">
            <smartphone-icon
                v-if="chosenTwoFA === 'totp'"
                width=20
                height=20
            />
            <mail-icon
                v-else-if="chosenTwoFA === 'email_otp'"
                width=20
                height=20
            />
            <key-icon
                v-else-if="chosenTwoFA === 'recovery_code'"
                width=20
                height=20
            />
        </span>
      </p>

      <button-simple
          :class="{
            button: true,
            'main-button': true,
            'is-fullwidth': true,
            'is-loading': isLoading,
            'disable-button': isDisableButton
          }"
          :text="textValidateButtonOrVerify"
          @click="validate"
      />
      <p class="control error" v-if="isWrongOtp">
        {{ wrongOTPError }}
      </p>
      <p
          v-if="chosenTwoFA === 'email_otp'"
      >
        <a
            @click="requestSendEmailOTP"
        >
            {{ $t('login.send_email_otp')}}
        </a>
      </p>
      <p class="control">
        {{ informationTwoFA }}
      </p>
      <div
          v-if="(othersTwoFA.length >= 1)"
      >
          <p class="control">
              {{ unableToVerify }}
          </p>
          <ul>
              <li
                  v-for="twoFA in othersTwoFA"
                  :key="twoFA"
              >
                  <a
                      @click="changeTwoFA(twoFA)"
                  >
                      {{ changeTwoFAText(twoFA)}}
                  </a>
              </li>
          </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import { SmartphoneIcon, KeyIcon, MailIcon } from 'vue-feather-icons'

import ButtonSimple from '@/components/widgets/ButtonSimple'

export default {
  name: 'two-factor-authentication',
  components: {
    SmartphoneIcon,
    KeyIcon,
    MailIcon,
    ButtonSimple
  },

  data () {
    return {
      chosenTwoFA: '',
      OTPValue: '',
      twoFactorPayload: {},
      errorSendingEmail: true,
      textValidateButtonOrVerify: ''
    }
  },

  props: {
    preferredTwoFa: {
      required: true,
      validator: prop => typeof prop === 'string' || prop === null
    },
    twoFasEnabled: {
      required: true,
      type: Array
    },
    email: {
      required: true,
      type: String
    },
    isLoading: {
      default: false,
      type: Boolean
    },
    isWrongOtp: {
      default: false,
      type: Boolean
    },
    textValidateButton: {
      default: '',
      type: String
    },
    isDisableButton: {
      default: false,
      type: Boolean
    },
    isProfile: {
      default: false,
      type: Boolean
    }
  },

  mounted () {
    this.changeTwoFA(this.preferredTwoFa, false)
    if (this.textValidateButton) {
      this.textValidateButtonOrVerify = this.textValidateButton
    } else {
      this.textValidateButtonOrVerify = this.$t('login.verify')
    }
  },

  computed: {
    ...mapGetters([
    ]),

    placeholderInputText () {
      switch (this.chosenTwoFA) {
        case 'totp':
          return this.$t('login.fields.totp')
        case 'email_otp':
          return this.$t('login.fields.email_otp')
        case 'recovery_code':
          return this.$t('login.fields.recovery_code')
      }
      return ''
    },

    wrongOTPError () {
      switch (this.chosenTwoFA) {
        case 'totp':
          return this.$t('login.wrong_totp')
        case 'email_otp':
          return this.$t('login.wrong_email_otp')
        case 'recovery_code':
          return this.$t('login.wrong_recovery_code')
      }
      return ''
    },

    informationTwoFA () {
      switch (this.chosenTwoFA) {
        case 'totp':
          return this.$t('login.information_totp')
        case 'email_otp':
          return this.$t('login.information_email_otp')
        case 'recovery_code':
          return this.$t('login.information_recovery_code')
      }
      return ''
    },

    unableToVerify () {
      switch (this.chosenTwoFA) {
        case 'totp':
          return this.$t('login.unable_to_verify_totp')
        case 'email_otp':
          return this.$t('login.unable_to_verify_email_otp')
        case 'recovery_code':
          return this.$t('login.unable_to_verify_recovery_code')
      }
      return ''
    },

    othersTwoFA () {
      return this.twoFasEnabled.filter((val, _) => val !== this.chosenTwoFA)
    }
  },

  methods: {
    ...mapActions([
      'sendEmailOTP'
    ]),

    updatePayload () {
      this.twoFactorPayload = {}
      this.twoFactorPayload[this.chosenTwoFA] = this.OTPValue
    },

    validate () {
      this.$emit('validate', this.twoFactorPayload)
    },

    changeTwoFAText (twoFA) {
      switch (twoFA) {
        case 'totp':
          return this.$t('login.choose_totp')
        case 'email_otp':
          return this.$t('login.choose_email_otp')
        case 'recovery_code':
          return this.$t('login.choose_recovery_code')
      }
      return ''
    },

    changeTwoFA (twoFA, emitChanged = true) {
      this.chosenTwoFA = twoFA
      if (this.chosenTwoFA === 'email_otp') {
        this.requestSendEmailOTP()
      }
      if (emitChanged) this.$emit('changed-two-fa', this.chosenTwoFA)
    },

    requestSendEmailOTP () {
      this.sendEmailOTP(this.email).catch(this.errorSendingEmail = true)
    }
  }
}
</script>

<style lang="scss" scoped>
.button {
  margin-bottom: 1em;
  margin-top: 1em;
}

.input {
  padding: 1.5em;
}

.icon {
  padding: 0.25em;
}

.two-factor-authentication-profile {
  .button {
    border-radius: 2em;
    font-size: 1.25rem;
  }

  .input {
    padding: 1.5em;
    border-radius: 10px;
  }

  .icon {
    padding: 0.25em;
  }
}
</style>
