<template>
<div :class="{
  'modal': true,
  'is-active': active
}">
  <div class="modal-background"></div>
  <div class="modal-content">
    <div class="box">
      <h1 class="title">Edit Person: {{ personName }}</h1>
      <form>
        <text-field label="First Name" v-model="form.first_name"></text-field>
        <text-field label="Last Name" v-model="form.last_name"></text-field>
        <text-field label="Phone" v-model="form.phone"></text-field>
      </form>
      <p class="has-text-right">
        <a
          :class="{
            button: true,
            'is-primary': true,
            'is-loading': isLoading
          }"
          @click="confirmClicked">
          Confirm
        </a>
        <router-link
          :to="cancelRoute"
          class="button is-link">
          Cancel
        </router-link>
      </p>
    </div>
  </div>
  <button class="modal-close"></button>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import TextField from '../widgets/TextField'
/*
      <multi-field label="skills" choices="departments"></multi-field>
      <boolean-field label="active" choices="departments"></multi-field>
*/

export default {
  name: 'delete-modal',
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
    }
  },
  data () {
    return {
      form: {
        first_name: '',
        last_name: '',
        phone: ''
      }
    }
  },
  components: {
    TextField
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
      this.onConfirmClicked(this.form)
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
