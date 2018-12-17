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
        />
        <combobox
          :label="$t('assets.fields.episode')"
          :options="episodeOptions"
          v-model="form.source_id"
          v-if="isTVShow"
        />
        <text-field
          ref="nameField"
          :label="$t('assets.fields.name')"
          v-model="form.name"
          @enter="runConfirmation"
          v-focus
        />
        <textarea-field
          ref="descriptionField"
          :label="$t('assets.fields.description')"
          v-model="form.description"
          v-focus
        />
      </form>

      <div class="has-text-right">
        <a
          :class="{
            button: true,
            'is-primary': true,
            'is-loading': isLoadingStay
          }"
          :disabled="this.form.name && this.form.name.length === 0"
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
          :disabled="this.form.name && this.form.name.length === 0"
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
      </div>
    </div>
  </div>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import TextField from '../widgets/TextField'
import TextareaField from '../widgets/TextareaField'
import Combobox from '../widgets/Combobox'

export default {
  name: 'edit-asset-modal',
  components: {
    TextField,
    TextareaField,
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
          production_id: this.currentProduction.id,
          source_id: this.assetToEdit.source_id || this.assetToEdit.episode_id
        },
        assetSuccessText: ''
      }
    } else {
      return {
        form: {
          name: '',
          description: '',
          entity_type_id: '',
          project_id: '',
          source_id: this.currentEpisode ? this.currentEpisode.id : null
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
      'currentProduction',
      'currentEpisode',
      'episodes',
      'getAssetTypeOptions',
      'getOpenProductionOptions',
      'isTVShow',
      'openProductions'
    ]),

    episodeOptions () {
      let options = this.episodes.map((episode) => {
        return {
          label: episode.name,
          value: episode.id
        }
      })
      options.unshift({
        label: this.$t('main.all'),
        value: 'null'
      })
      return options
    }
  },

  mounted () {
    this.resetForm()
    this.assetSuccessText = ''
  },

  methods: {
    ...mapActions([
    ]),

    runConfirmation () {
      if (this.form.name.length > 0) {
        if (this.isEditing()) {
          this.confirmClicked()
        } else {
          this.confirmAndStayClicked()
        }
      }
    },

    focusName () {
      this.$refs.nameField.focus()
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
      if (!this.isEditing()) {
        if (!this.form.entity_type_id && this.assetTypes.length > 0) {
          this.form.entity_type_id = this.assetTypes[0].id
        }
        if (this.openProductions.length > 0) {
          this.form.project_id =
            this.currentProduction.id ? this.currentProduction.id : ''
        }
        this.form.name = ''
        this.form.description = ''
        this.form.source_id =
          this.currentEpisode ? this.currentEpisode.id : null
      } else {
        this.form = {
          entity_type_id: this.assetToEdit.asset_type_id,
          project_id: this.assetToEdit.project_id,
          name: this.assetToEdit.name,
          description: this.assetToEdit.description,
          source_id: this.assetToEdit.source_id || this.assetToEdit.episode_id
        }
      }
    }
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
      this.assetSuccessText = ''
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
