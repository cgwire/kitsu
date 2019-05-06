<template>

<div :class="{
  'modal': true,
  'is-active': active
}">
  <div class="modal-background"></div>
  <div class="modal-content">
    <div class="box">

      <h1 class="title" v-if="personToEdit.id !== undefined">
        {{ $t("people.edit_title") }} {{ personName }}
      </h1>
      <h1 class="title" v-else>
        {{ $t("people.new_person") }}
      </h1>

      <form v-on:submit.prevent>
        <text-field
          :label="$t('people.fields.first_name')"
          :disabled="isLdap"
          ref="name-field"
          @enter="confirmClicked()"
          v-model="form.first_name"
        />
        <text-field
          :label="$t('people.fields.last_name')"
          :disabled="isLdap"
          @enter="confirmClicked()"
          v-model="form.last_name"
        />
        <text-field
          :label="$t('people.fields.email')"
          :disabled="isLdap"
          @enter="confirmClicked()"
          v-model="form.email"
        />
        <text-field
          :label="$t('people.fields.phone')"
          @enter="confirmClicked()"
          v-model="form.phone"
        />
        <combobox
          :label="$t('people.fields.role')"
          :options="roleOptions"
          localeKeyPrefix="people.role."
          @enter="confirmClicked()"
          v-model="form.role"
        />
        <combobox
          :label="$t('people.fields.active')"
          :options="activeOptions"
          @enter="confirmClicked()"
          v-model="form.active"
        />
      </form>

      <p class="has-text-right">
        <a
          :class="{
            button: true,
            'is-primary': true,
            'is-loading': isLoading
          }"
          :disabled="!isValidEmail"
          @click="confirmClicked">
          {{ $t("main.confirmation") }}
        </a>
        <router-link
          :to="cancelRoute"
          class="button is-link">
          {{ $t("main.cancel") }}
        </router-link>
      </p>
    </div>
  </div>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import TextField from '../widgets/TextField'
import Combobox from '../widgets/Combobox'

export default {
  name: 'edit-modal',
  props: [
    'onConfirmClicked',
    'text',
    'active',
    'cancelRoute',
    'isLoading',
    'isError',
    'errorText'
  ],

  data () {
    return {
      isValidEmail: false,
      form: {
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        role: 'user',
        active: 'true'
      },

      roleOptions: [
        { label: 'user', value: 'user' },
        { label: 'manager', value: 'manager' },
        { label: 'admin', value: 'admin' },
        { label: 'client', value: 'client' }
      ],
      activeOptions: [
        { label: this.$t('main.yes'), value: 'true' },
        { label: this.$t('main.no'), value: 'false' }
      ]
    }
  },

  components: {
    TextField,
    Combobox
  },

  computed: {
    ...mapGetters([
      'isLdap',
      'personToEdit',
      'people'
    ]),

    personName () {
      if (this.personToEdit !== undefined) {
        return this.personToEdit.first_name + ' ' + this.personToEdit.last_name
      } else {
        return ''
      }
    }
  },

  methods: {
    ...mapActions([]),

    confirmClicked () {
      this.form.active =
        this.form.active === 'true' || this.form.active === true
      if (this.form.email) {
        this.$emit('confirm', this.form)
      }
    },

    resetForm () {
      if (this.personToEdit) {
        this.form = {
          first_name: this.personToEdit.first_name,
          last_name: this.personToEdit.last_name,
          phone: this.personToEdit.phone,
          email: this.personToEdit.email,
          role: this.personToEdit.role,
          active: !this.personToEdit.id || this.personToEdit.active ? 'true' : 'false'
        }
      }
      this.checkEmailValidity()
    },

    checkEmailValidity () {
      const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      const isExist = this.people.some((p) => {
        return p.email === this.form.email && (
          !this.personToEdit || this.personToEdit.email !== p.email
        )
      })
      this.isValidEmail =
        this.form.email &&
        regex.test(this.form.email) &&
        !isExist
    }
  },

  watch: {
    personToEdit () {
      this.resetForm()
    },

    active () {
      if (this.active) {
        this.resetForm()
        setTimeout(() => {
          this.$refs['name-field'].focus()
        }, 100)
      }
    },

    'form.email' () {
      this.checkEmailValidity()
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
.title {
  border-bottom: 2px solid #DDD;
  padding-bottom: 0.5em;
  margin-bottom: 1.2em;
}
</style>
