<template>
<div :class="{
  'modal': true,
  'is-active': active
}">
  <div class="modal-background"></div>
  <div class="modal-content">
    <div class="box">

      <h1 class="title" v-if="shotToEdit">
        {{ $t("shots.edit_title") }} {{ shotToEdit.name }}
      </h1>
      <h1 class="title" v-else>
        {{ $t("shots.new_shot") }}
      </h1>

      <form v-on:submit.prevent>
        <combobox
          :label="$t('shots.fields.production')"
          :options="getOpenProductionOptions"
          v-model="form.project_id"
        >
        </combobox>
        <combobox
          :label="$t('shots.fields.type')"
          :options="getSequenceOptions"
          v-model="form.shot_type_id"
        >
        </combobox>
        <text-field
          ref="nameField"
          :label="$t('shots.fields.name')"
          v-model="form.name"
          @enter="confirmAndStayClicked"
          v-focus
        >
        </text-field>
      </form>

      <p class="has-text-right">
        <a
          :class="{
            button: true,
            'is-primary': true,
            'is-loading': isLoadingStay
          }"
          @click="confirmAndStayClicked"
          v-if="!shotToEdit || !shotToEdit.id"
        >
          {{ $t("main.confirmation_and_stay") }}
        </a>
        <a
          :class="{
            button: true,
            'is-primary': true,
            'is-loading': isLoading
          }"
          @click="confirmClicked"
        >
          {{ $t("main.confirmation") }}
        </a>
        <router-link
          :to="cancelRoute"
          class="button is-link">
          {{ $t("main.cancel") }}
        </router-link>
        <p class="error has-text-right info-message" v-if="isError">
          {{ $t("shots.edit_fail") }}
        </p>
        <p class="success has-text-right info-message" v-if="isSuccess">
          {{ $t("shots.new_success", {name: shotCreated}) }}
        </p>
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
  name: 'edit-shot-modal',
  components: {
    TextField,
    Combobox
  },

  props: [
    'onConfirmClicked',
    'text',
    'active',
    'cancelRoute',
    'isError',
    'isLoading',
    'isLoadingStay',
    'isSuccess',
    'shotCreated',
    'shotToEdit',
    'errorText'
  ],

  watch: {
    shotToEdit () {
      if (this.shotToEdit) {
        this.form.name = this.shotToEdit.name
        this.form.shot_type_id = this.shotToEdit.entity_type_id
        this.form.production_id = this.shotToEdit.project_id
      }
    }
  },

  data () {
    if (this.shotToEdit && this.shotToEdit.id) {
      return {
        form: {
          name: this.shotToEdit.name,
          shot_type_id: this.shotToEdit.shot_type_id,
          production_id: this.shotToEdit.production_id
        }
      }
    } else {
      return {
        form: {
          name: '',
          shot_type_id: '',
          production_id: ''
        }
      }
    }
  },

  computed: {
    ...mapGetters([
      'shots',
      'sequences',
      'openProductions',
      'getSequenceOptions',
      'getOpenProductionOptions'
    ])
  },

  methods: {
    ...mapActions([
    ]),
    confirmAndStayClicked () {
      this.$emit('confirmAndStay', this.form)
    },
    confirmClicked () {
      this.$emit('confirm', this.form)
    }
  },

  mounted () {
    if (!this.shotToEdit || !this.shotToEdit.id) {
      if (this.sequences.length > 0) {
        this.form.sequence_id = this.sequences[0].id
      }
      if (this.openProductions.length > 0) {
        this.form.production_id = this.openProductions[0].id
      }
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
.info-message {
  margin-top: 1em;
}
</style>
