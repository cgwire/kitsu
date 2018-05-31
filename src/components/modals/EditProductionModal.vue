<template>
<div :class="{
  'modal': true,
  'is-active': active
}">
  <div class="modal-background"></div>
  <div class="modal-content">
    <div class="box">
      <h1 class="title" v-if="productionToEdit && productionToEdit.id">
        {{ $t("productions.edit_title") }} {{ productionToEdit.name }}
      </h1>
      <h1 class="title" v-else>
        {{ $t("productions.new_production") }}
      </h1>

      <form v-on:submit.prevent>
        <text-field
          ref="nameField"
          :label="$t('productions.fields.name')"
          v-model="form.name"
          @enter="runConfirmation"
          v-focus
        />
        <combobox
          :label="$t('productions.fields.status')"
          :options="getProductionStatusOptions"
          localeKeyPrefix="productions.status."
          @enter="runConfirmation"
          v-model="form.project_status_id"
        />

        <div v-if="productionToEdit && productionToEdit.id">
          <span class="label">{{ $t("productions.picture") }}</span>
          <file-upload
            ref="fileField"
            accept=".png"
            @fileselected="onFileSelected"
          />
        </div>
      </form>

      <p class="has-text-right">
        <a
          :class="{
            button: true,
            'is-primary': true,
            'is-loading': isLoading
          }"
          @click="runConfirmation">
          {{ $t("main.confirmation") }}
        </a>
        <router-link
          :to="cancelRoute"
          class="button is-link">
          {{ $t("main.cancel") }}
        </router-link>
      </p>
      <p class="error has-text-right info-message" v-if="isError">
        {{ $t("assets.edit_fail") }}
      </p>
    </div>
  </div>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import TextField from '../widgets/TextField'
import FileUpload from '../widgets/FileUpload'
import Combobox from '../widgets/Combobox'

export default {
  name: 'edit-production-modal',
  components: {
    TextField,
    FileUpload,
    Combobox
  },

  props: [
    'onConfirmClicked',
    'text',
    'active',
    'cancelRoute',
    'isLoading',
    'isError',
    'errorText',
    'productionToEdit'
  ],

  watch: {
    productionToEdit () {
      if (this.productionToEdit && this.productionToEdit.id) {
        this.form.name = this.productionToEdit.name
        this.form.project_status_id = this.productionToEdit.project_status_id
      } else {
        this.form = {
          name: '',
          project_status_id: this.getProductionStatusOptions[0].value
        }
      }
    },

    active () {
      if (this.active) {
        setTimeout(() => {
          this.$refs.nameField.focus()
          this.formData = null
          if (this.$refs.fileField) this.$refs.fileField.reset()
        }, 100)
      }
    }
  },

  data () {
    if (this.productionToEdit && this.productionToEdit.id) {
      return {
        form: {
          name: this.productionToEdit.name,
          project_status_id: this.productionToEdit.project_status_id
        },
        formData: null
      }
    } else {
      return {
        form: {
          name: '',
          project_status_id: ''
        },
        formData: null
      }
    }
  },

  computed: {
    ...mapGetters([
      'productions',
      'productionStatus',
      'getProductionStatusOptions'
    ])
  },

  methods: {
    ...mapActions([
    ]),

    runConfirmation () {
      this.$emit('confirm', this.form)
    },

    onFileSelected (formData) {
      this.formData = formData
      this.$emit('fileselected', formData)
    }
  },

  mounted () {
    if (this.productionStatus.length > 0) {
      this.form.project_status_id = this.productionStatus[0].id
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
