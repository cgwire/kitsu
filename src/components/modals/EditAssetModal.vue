<template>
<div :class="{
  'modal': true,
  'is-active': active
}">
  <div class="modal-background"></div>
  <div class="modal-content">
    <div class="box">

      <h1 class="title" v-if="assetToEdit && this.assetToEdit.id">
        {{ $t("assets.edit_title") }} {{ assetToEdit.name }}
      </h1>
      <h1 class="title" v-else>
        {{ $t("assets.new_asset") }}
      </h1>

      <form v-on:submit.prevent>
        <combobox
          :label="$t('assets.fields.type')"
          :options="getAssetTypeOptions"
          v-model="form.entity_type_id"
        >
        </combobox>
        <text-field
          ref="nameField"
          :label="$t('assets.fields.name')"
          v-model="form.name"
          @enter="runConfirmation"
          v-focus
        >
        </text-field>
        <text-field
          ref="descriptionField"
          :label="$t('assets.fields.description')"
          v-model="form.description"
          @enter="runConfirmation"
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
          v-if="!assetToEdit || !assetToEdit.id"
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
          {{ $t("main.close") }}
        </router-link>
        <p class="error has-text-right info-message" v-if="isError">
          {{ $t("assets.edit_fail") }}
        </p>
        <p class="success has-text-right info-message">
          {{ assetSuccessText }}
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
  name: 'edit-asset-modal',
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
    'assetToEdit',
    'errorText'
  ],

  data () {
    if (this.assetToEdit && this.assetToEdit.id) {
      return {
        form: {
          name: this.assetToEdit.name,
          description: this.assetToEdit.description,
          entity_type_id: this.assetToEdit.entity_type_id,
          production_id: this.currentProduction.id
        },
        assetSuccessText: ''
      }
    } else {
      return {
        form: {
          name: '',
          description: '',
          entity_type_id: '',
          project_id: ''
        },
        assetSuccessText: ''
      }
    }
  },

  computed: {
    ...mapGetters([
      'assets',
      'assetCreated',

      'assetTypes',
      'openProductions',
      'getAssetTypeOptions',
      'getOpenProductionOptions',
      'currentProduction'
    ])
  },

  methods: {
    ...mapActions([
    ]),

    runConfirmation () {
      if (this.isEditing()) {
        this.confirmClicked()
      } else {
        this.confirmAndStayClicked()
      }
    },
    confirmAndStayClicked () {
      this.$emit('confirmAndStay', this.form)
    },
    confirmClicked () {
      this.$emit('confirm', this.form)
    },

    isEditing () {
      return this.assetToEdit && this.assetToEdit.id
    },

    resetForm () {
      this.assetSuccessText = ''
      if (!this.isEditing()) {
        if (this.assetTypes.length > 0) {
          this.form.entity_type_id = this.assetTypes[0].id
        }
        if (this.openProductions.length > 0) {
          this.form.project_id = this.currentProduction.id
        }
        this.form.name = ''
        this.form.description = ''
      } else {
        console.log(this.assetToEdit)
        this.form = {
          entity_type_id: this.assetToEdit.asset_type_id,
          project_id: this.assetToEdit.project_id,
          name: this.assetToEdit.name,
          description: this.assetToEdit.description
        }
      }
    }
  },

  mounted () {
    this.resetForm()
  },

  watch: {
    assetToEdit () {
      this.resetForm()
    },
    assetCreated () {
      if (this.isEditing()) {
        this.assetSuccessText = this.$t('assets.edit_success', {
          name: this.assetCreated
        })
      } else {
        this.assetSuccessText = this.$t('assets.new_success', {
          name: this.assetCreated
        })
      }
    },

    active () {
      if (this.active) {
        setTimeout(() => {
          this.$refs.nameField.focus()
        }, 100)
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
