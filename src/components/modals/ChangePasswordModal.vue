<template>

    <div :class="{
      'modal': true,
      'is-active': active
    }">
      <div class="modal-background" @click="$emit('cancel')" ></div>

      <div class="modal-content">
        <div class="box">

          <h1 class="title">
            {{ $t('people.change_password_for') }} {{ person.name }}
          </h1>

          <form v-on:submit.prevent>
            <text-field
                :label="$t('people.fields.password')"
                ref="first-password"
                type="password"
                @enter="confirmClicked()"
                v-model="form.password"
            />
            <text-field
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
              :disabled="false"
              @click="confirmClicked"
            >
              {{ $t('profile.change_password.button') }}
            </button>
            <div class="filler"></div>

             <button
                class="button is-link flexrow-item"
                @click="$emit('cancel')"
              >
                {{ $t("main.cancel") }}
              </button>
          </div>

          <div
            class="error has-text-right mt1"
            v-if="!isValid"
          >
            {{ $t('profile.change_password.unvalid') }}
          </div>
          <div
            class="error has-text-right mt1"
            v-if="isError"
          >
            {{ $t('profile.change_password.error') }}
          </div>
        </div>
      </div>
    </div>
    </template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { modalMixin } from '@/components/modals/base_modal'

import TextField from '@/components/widgets/TextField'

import auth from '@/lib/auth'

export default {
  name: 'change-password-modal',
  mixins: [modalMixin],
  props: [
    'active',
    'person'
  ],

  data () {
    return {
      form: {
        password: '',
        password2: ''
      },
      isLoading: false,
      isError: false,
      isValid: true
    }
  },

  components: {
    TextField
  },

  computed: {
    ...mapGetters([
    ])
  },

  methods: {
    ...mapActions([
      'changePasswordPerson'
    ]),

    confirmClicked () {
      if (auth.isPasswordValid(this.form.password, this.form.password2)) {
        this.changePasswordPerson({
          person: this.person,
          form: this.form,
          callback: (err) => {
            if (err) this.isError = true
            else this.$emit('confirm')
          }
        }
        )
      } else {
        this.isValid = false
      }
    },

    resetForm () {
      if (this.person) {
        this.form = {
          password: '',
          password2: ''
        }
        this.isLoading = false
        this.isError = false
        this.isValid = true
      }
    }

  },

  watch: {
    person () {
      this.resetForm()
    },

    active () {
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
