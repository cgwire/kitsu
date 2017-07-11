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
      <form>
        <text-field
          ref="nameField"
          :label="$t('assets.fields.name')"
          v-model="form.name"
          v-focus
        >
        </text-field>
        <combobox
          :label="$t('assets.fields.type')"
          :options="getAssetTypeOptions"
          v-model="form.asset_type_id"
        >
        </combobox>
        <combobox
          :label="$t('assets.fields.production')"
          :options="getOpenProductionOptions"
          v-model="form.project_id"
        >
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
    'isLoading',
    'isError',
    'errorText',
    'assetToEdit'
  ],

  watch: {
    assetToEdit () {
      if (this.assetToEdit) {
        this.form.name = this.assetToEdit.name
        this.form.asset_type_id = this.assetToEdit.asset_type_id
        this.form.production_id = this.assetToEdit.production_id
      }
    }
  },

  data () {
    if (this.assetToEdit) {
      return {
        form: {
          name: this.assetToEdit.name,
          asset_type_id: this.assetToEdit.asset_type_id,
          production_id: this.assetToEdit.production_id
        }
      }
    } else {
      return {
        form: {
          name: '',
          asset_type_id: '',
          production_id: ''
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
    confirmClicked () {
      console.log(this.form)
      this.$emit('confirm', this.form)
    }
  },

  mounted () {
    if (this.assetTypes.length > 0) {
      this.form.asset_type_id = this.assetTypes[0].id
    }
    if (this.openProductions.length > 0) {
      this.form.production_id = this.openProductions[0].id
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
