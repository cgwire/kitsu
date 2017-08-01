<template>
<div :class="{
  'modal': true,
  'is-active': active
}">
  <div class="modal-background"></div>
  <div class="modal-content">
    <div class="box">

      <h1 class="title" v-if="assetToEdit">
        {{ $t("assets.edit_title") }} {{ assetToEdit.name }}
      </h1>
      <h1 class="title" v-else>
        {{ $t("assets.new_asset") }}
      </h1>

      <form v-on:submit.prevent>
        <combobox
          :label="$t('assets.fields.production')"
          :options="getOpenProductionOptions"
          v-model="form.project_id"
        >
        </combobox>
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
          {{ $t("main.cancel") }}
        </router-link>
        <p class="error has-text-right info-message" v-if="isError">
          {{ $t("assets.edit_fail") }}
        </p>
        <p class="success has-text-right info-message" v-if="isSuccess">
          {{ $t("assets.new_success", {name: assetCreated}) }}
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
    'assetCreated',
    'assetToEdit',
    'errorText'
  ],

  watch: {
    assetToEdit () {
      this.resetForm()
      if (this.assetToEdit) {
        this.form.asset_type_id = this.assetToEdit.entity_type_id
        this.form.production_id = this.assetToEdit.project_id
      } else {
        if (this.assetTypes.length > 0) {
          this.form.entity_type_id = this.assetTypes[0].id
        }
        if (this.openProductions.length > 0) {
          this.form.project_id = this.openProductions[0].id
        }
      }
    }
  },

  data () {
    if (this.assetToEdit && this.assetToEdit.id) {
      return {
        form: {
          name: this.assetToEdit.name,
          asset_type_id: this.assetToEdit.entity_type_id,
          production_id: this.assetToEdit.project_id
        }
      }
    } else {
      return {
        form: {
          name: '',
          entity_type_id: '',
          project_id: ''
        }
      }
    }
  },

  computed: {
    ...mapGetters([
      'assets',
      'assetTypes',
      'openProductions',
      'getAssetTypeOptions',
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
    },
    resetForm () {
      if (!this.assetToEdit || !this.assetToEdit.id) {
        if (this.assetTypes.length > 0) {
          this.form.entity_type_id = this.assetTypes[0].id
        }
        if (this.openProductions.length > 0) {
          this.form.project_id = this.openProductions[0].id
        }
        this.form.name = ''
      } else {
        this.form = {
          entity_type_id: this.assetToEdit.entity_type_id,
          project_id: this.assetToEdit.project_id,
          name: this.assetToEdit.name
        }
      }
    }
  },

  mounted () {
    this.resetForm()
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
