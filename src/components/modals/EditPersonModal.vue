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
          v-model="form.first_name">
        </text-field>
        <text-field
          :label="$t('people.fields.last_name')"
          v-model="form.last_name">
        </text-field>
        <text-field
          :label="$t('people.fields.email')"
          v-model="form.email">
        </text-field>
        <text-field
          :label="$t('people.fields.phone')"
          v-model="form.phone">
        </text-field>
        <combobox
          :label="$t('people.fields.role')"
          :options="roleOptions"
          localeKeyPrefix="people.role."
          v-model="form.role">
        </combobox>
      </form>

      <p class="has-text-right">
        <a
          :class="{
            button: true,
            'is-primary': true,
            'is-loading': isLoading
          }"
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
  watch: {
    personToEdit () {
      this.form.first_name = this.personToEdit.first_name
      this.form.last_name = this.personToEdit.last_name
      this.form.phone = this.personToEdit.phone
      this.form.email = this.personToEdit.email
      this.form.role = this.personToEdit.role
    }
  },
  data () {
    return {
      form: {
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        role: 'user'
      },
      roleOptions: [
        {label: 'admin', value: 'admin'},
        {label: 'manager', value: 'manager'},
        {label: 'user', value: 'user'}
      ]
    }
  },
  components: {
    TextField,
    Combobox
  },
  computed: {
    ...mapGetters([
      'personToEdit'
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
    ...mapActions([
    ]),
    confirmClicked () {
      this.$emit('confirm', this.form)
    }
  }
}
</script>

<style scoped>
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
