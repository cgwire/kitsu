<template>
<div :class="{
  'modal': true,
  'is-active': active
}">
  <div class="modal-background" @click="$emit('cancel')" ></div>

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
        <div
          :key="descriptor.id"
          v-for="descriptor in assetMetadataDescriptors"
        >
          <div
            class="field"
            v-if="descriptor.choices.length > 0 && getDescriptorChecklistValues(descriptor).length > 0"
            :key="`${descriptor.id}-checklist-wrapper`"
          >
            <label
              class="label"
              v-html="descriptor.name"
              :key="`${descriptor.id}-${descriptor.name}`"
            />
            <div
              class="checkbox-wrapper"
              v-for="(option, i) in getDescriptorChecklistValues(descriptor)"
              :key="`${descriptor.id}-${i}-${option.text}-wrapper`"
            >
              <input
                type="checkbox"
                @change="event => onMetadataCheckboxChanged(descriptor, option.text, event)"
                :id="`${descriptor.id}-${i}-${option.text}-checkbox`"
                :checked="getMetadataChecklistValues(descriptor, assetToEdit)[option.text]"
                :disabled="!(isCurrentUserManager
                  || isSupervisorInDepartments(descriptor.departments))"
                :style="[isCurrentUserManager
                  || isSupervisorInDepartments(descriptor.departments) ?
                    {cursor: 'pointer'} : {cursor: 'auto'}]"
              />
              <label
                class="checkbox-label"
                :for="`${descriptor.id}-${i}-${option.text}-checkbox`"
                :style="[isCurrentUserManager
                  || isSupervisorInDepartments(descriptor.departments) ?
                    {cursor: 'pointer'} : {cursor: 'auto'}]"
              >
                <span>{{ option.text }}</span>
              </label>
            </div>
          </div>
          <combobox
            v-else-if="descriptor.choices.length > 0"
            :label="descriptor.name"
            :options="getDescriptorChoicesOptions(descriptor)"
            v-model="form.data[descriptor.field_name]"
          />
          <text-field
            :label="descriptor.name"
            v-model="form.data[descriptor.field_name]"
            @enter="runConfirmation"
            v-else
          />
        </div>
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
        <button
          class="button is-link"
          @click="$emit('cancel')"
        >
          {{ $t("main.close") }}
        </button>
        <p class="error has-text-right info-message" v-if="isError">
          {{ $t("assets.edit_fail") }}
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
import { mapGetters, mapActions } from 'vuex'
import { modalMixin } from '@/components/modals/base_modal'
import { descriptorMixin } from '@/components/mixins/descriptors'

import TextField from '@/components/widgets/TextField'
import TextareaField from '@/components/widgets/TextareaField'
import Combobox from '@/components/widgets/Combobox'

export default {
  name: 'edit-asset-modal',
  mixins: [descriptorMixin, modalMixin],

  components: {
    TextField,
    TextareaField,
    Combobox
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
    },
    errorText: {
      type: String,
      default: ''
    }
  },

  data () {
    return {
      form: {
        name: '',
        description: '',
        source_id: null,
        data: {}
      },
      assetSuccessText: ''
    }
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
      'isCurrentUserManager',
      'isTVShow',
      'isSupervisorInDepartments',
      'productionAssetTypes',
      'productionAssetTypeOptions',
      'openProductions'
    ]),

    episodeOptions () {
      const options = this.episodes.map((episode) => {
        return {
          label: episode.name,
          value: episode.id
        }
      })
      options.unshift({
        label: this.$t('main.main_pack'),
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

    onMetadataCheckboxChanged (descriptor, option, event) {
      var values = {}
      try {
        values = JSON.parse(this.form.data[descriptor.field_name])
      } catch {
        values = {}
      }
      values[option] = event.target.checked
      this.form.data[descriptor.field_name] = JSON.stringify(values)
    },

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
        if (!this.form.entity_type_id &&
            this.productionAssetTypes.length > 0) {
          this.form.entity_type_id = this.productionAssetTypes[0].id
        }
        if (this.openProductions.length > 0) {
          this.form.project_id =
            this.currentProduction ? this.currentProduction.id : ''
        }
        this.form.name = ''
        this.form.description = ''
        this.form.source_id =
          this.currentEpisode ? this.currentEpisode.id : null
        this.form.data = {}
      } else {
        this.form = {
          entity_type_id: this.assetToEdit.asset_type_id,
          project_id: this.assetToEdit.project_id,
          name: this.assetToEdit.name,
          description: this.assetToEdit.description,
          source_id: this.assetToEdit.source_id || this.assetToEdit.episode_id,
          data: { ...this.assetToEdit.data } || {}
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
      this.resetForm()
      if (this.active) {
        setTimeout(() => {
          this.$refs.nameField.focus()
        }, 100)
      }
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

.checkbox-wrapper {
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.checkbox-label {
  display: inline-flex;
  position: relative;
  padding-left: .5rem;
  padding-right: .5rem;
  white-space: normal;
  cursor: pointer;
}

</style>
