<template>
  <div
    :class="{
      modal: true,
      'is-active': active
    }"
  >
    <div class="modal-background" @click="$emit('cancel')"></div>

    <div class="modal-content">
      <div class="box">
        <h1 class="title" v-if="assetToEdit && assetToEdit.id">
          {{ $t('assets.edit_title') }} {{ assetToEdit.name }}
        </h1>
        <h1 class="title" v-else>
          {{ $t('assets.new_asset') }}
        </h1>

        <form @submit.prevent>
          <combobox
            :label="$t('assets.fields.type')"
            :options="productionAssetTypeOptions"
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
            v-model.trim="form.name"
            @enter="runConfirmation"
            v-focus
          />
          <textarea-field
            ref="descriptionField"
            :label="$t('assets.fields.description')"
            v-model="form.description"
            @keyup.ctrl.enter="runConfirmation"
            @keyup.meta.enter="runConfirmation"
          />
          <text-field
            ref="resolutionField"
            :label="$t('shots.fields.resolution')"
            v-model="form.data.resolution"
            @enter="runConfirmation"
          />
          <template v-if="assetToEdit">
            <metadata-field
              :key="descriptor.id"
              :descriptor="descriptor"
              :entity="assetToEdit"
              @enter="runConfirmation"
              v-model="form.data[descriptor.field_name]"
              v-for="descriptor in assetMetadataDescriptors"
            />
          </template>
          <combobox-boolean
            :label="$t('assets.fields.shared')"
            v-model="form.is_shared"
            @enter="runConfirmation"
          />
        </form>

        <div class="has-text-right">
          <a
            :class="{
              button: true,
              'is-primary': true,
              'is-loading': isLoadingStay
            }"
            @click="confirmAndStayClicked"
            v-if="!assetToEdit || !assetToEdit.id"
          >
            {{ $t('main.confirmation_and_stay') }}
          </a>
          <a
            :class="{
              button: true,
              'is-primary': true,
              'is-loading': isLoading
            }"
            @click="confirmClicked"
          >
            {{ $t('main.confirmation') }}
          </a>
          <button class="button is-link" @click="$emit('cancel')">
            {{ $t('main.close') }}
          </button>
          <p class="error has-text-right info-message" v-if="isError">
            {{ $t('assets.edit_fail') }}
          </p>
          <p class="success has-text-right info-message" v-if="isSuccess">
            {{ assetSuccessText }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import { modalMixin } from '@/components/modals/base_modal'

import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxBoolean from '@/components/widgets/ComboboxBoolean.vue'
import MetadataField from '@/components/widgets/MetadataField.vue'
import TextField from '@/components/widgets/TextField.vue'
import TextareaField from '@/components/widgets/TextareaField.vue'

export default {
  name: 'edit-asset-modal',

  mixins: [modalMixin],

  components: {
    Combobox,
    ComboboxBoolean,
    MetadataField,
    TextField,
    TextareaField
  },

  props: {
    active: {
      type: Boolean,
      default: false
    },
    text: {
      type: String,
      default: ''
    },
    isError: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    isLoadingStay: {
      type: Boolean,
      default: false
    },
    isSuccess: {
      type: Boolean,
      default: false
    },
    assetToEdit: {
      type: Object,
      default: () => {}
    }
  },

  emits: ['cancel', 'confirm', 'confirm-and-stay'],

  data() {
    return {
      form: {
        name: '',
        description: '',
        source_id: null,
        data: {
          resolution: ''
        },
        is_shared: 'false'
      },
      assetSuccessText: ''
    }
  },

  mounted() {
    this.resetForm()
    this.assetSuccessText = ''
  },

  computed: {
    ...mapGetters([
      'assets',
      'assetCreated',
      'assetMetadataDescriptors',
      'assetTypes',
      'currentProduction',
      'currentEpisode',
      'episodes',
      'isTVShow',
      'productionAssetTypes',
      'productionAssetTypeOptions',
      'openProductions'
    ]),

    resolution() {
      return this.assetToEdit.data?.resolution || ''
    },

    episodeOptions() {
      const options = this.episodes.map(episode => {
        return {
          label: episode.name,
          value: episode.id
        }
      })
      if (this.currentProduction.production_style !== 'video-game') {
        options.unshift({
          label: this.$t('main.main_pack'),
          value: 'null'
        })
      }
      return options
    }
  },

  methods: {
    runConfirmation() {
      if (this.form.name.length > 0) {
        if (this.isEditing()) {
          this.confirmClicked()
        } else {
          this.confirmAndStayClicked()
        }
      }
    },

    focusName() {
      this.$refs.nameField.focus()
    },

    confirmAndStayClicked() {
      this.$emit('confirm-and-stay', {
        ...this.form,
        is_shared: this.form.is_shared === 'true'
      })
    },

    confirmClicked() {
      this.$emit('confirm', {
        ...this.form,
        is_shared: this.form.is_shared === 'true'
      })
    },

    isEditing() {
      return this.assetToEdit && this.assetToEdit.id
    },

    getEntityTypeIdDefaultValue() {
      let entityTypeId = this.assetToEdit.asset_type_id
      if (!entityTypeId) {
        entityTypeId = this.productionAssetTypeOptions[0].value
      }
      const isInOptions = this.productionAssetTypeOptions.find(
        option => option.value === entityTypeId
      )
      if (!isInOptions) {
        entityTypeId = this.productionAssetTypeOptions[0].value
      }
      return entityTypeId
    },

    resetForm() {
      if (!this.isEditing()) {
        if (!this.form.entity_type_id && this.productionAssetTypeOptions[0]) {
          this.form.entity_type_id = this.productionAssetTypeOptions[0].value
        }
        if (this.openProductions.length > 0) {
          this.form.project_id = this.currentProduction
            ? this.currentProduction.id
            : ''
        }
        this.form.name = ''
        this.form.description = ''
        this.form.source_id = this.currentEpisode
          ? this.currentEpisode.id
          : null
        this.form.data = {}
        this.form.is_shared = 'false'
      } else {
        const entityTypeId = this.getEntityTypeIdDefaultValue()
        this.form = {
          entity_type_id: entityTypeId,
          project_id: this.assetToEdit.project_id,
          name: this.assetToEdit.name,
          description: this.assetToEdit.description,
          source_id: this.assetToEdit.source_id || this.assetToEdit.episode_id,
          data:
            {
              ...this.assetToEdit.data,
              resolution: this.assetToEdit.data.resolution || ''
            } || {},
          is_shared: String(this.assetToEdit.is_shared === true)
        }
      }
    }
  },

  watch: {
    assetToEdit() {
      this.resetForm()
    },

    assetCreated() {
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

    active() {
      this.assetSuccessText = ''
      this.resetForm()
      if (this.active) {
        setTimeout(() => {
          this.$refs.nameField.focus()
        }, 100)
      }
    },

    currentProduction() {
      this.form.entity_type_id = null
      this.resetForm()
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

.info-message {
  margin-top: 1em;
}
</style>
