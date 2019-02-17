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
        <combobox v-if="productionToEdit && productionToEdit.id"
          :label="$t('productions.fields.status')"
          :options="productionStatusOptions"
          localeKeyPrefix="productions.status."
          @enter="runConfirmation"
          v-model="form.project_status_id"
        />
        <combobox
          :label="$t('productions.fields.type')"
          :options="productionTypeOptions"
          localeKeyPrefix="productions.type."
          @enter="runConfirmation"
          v-model="form.production_type"
        />
        <text-field v-if="productionToEdit && productionToEdit.id"
          ref="fpsField"
          :label="$t('productions.fields.fps')"
          v-model="form.fps"
          @enter="runConfirmation"
          v-focus
        />
        <text-field v-if="productionToEdit && productionToEdit.id"
          ref="ratioField"
          :label="$t('productions.fields.ratio')"
          v-model="form.ratio"
          @enter="runConfirmation"
          v-focus
        />
        <text-field v-if="productionToEdit && productionToEdit.id"
          ref="resolutionField"
          :label="$t('productions.fields.resolution')"
          v-model="form.resolution"
          @enter="runConfirmation"
          v-focus
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
          class="button is-link"
          v-if="cancelRoute"
        >
          {{ $t("main.cancel") }}
        </router-link>
        <button
          @click="$emit('cancel')"
          class="button is-link"
          v-else
        >
          {{ $t("main.cancel") }}
        </button>
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
import { modalMixin } from './base_modal'

import Combobox from '../widgets/Combobox'
import FileUpload from '../widgets/FileUpload'
import TextField from '../widgets/TextField'

export default {
  name: 'edit-production-modal',
  mixins: [modalMixin],
  components: {
    Combobox,
    FileUpload,
    TextField
  },

  props: [
    'text',
    'active',
    'cancelRoute',
    'isLoading',
    'isError',
    'errorText',
    'productionToEdit'
  ],

  data () {
    const data = {
      formData: null,
      productionTypeOptions: [
        {
          label: 'short',
          value: 'short'
        },
        {
          label: 'featurefilm',
          value: 'featurefilm'
        },
        {
          label: 'tvshow',
          value: 'tvshow'
        }
      ]
    }

    if (this.productionToEdit && this.productionToEdit.id) {
      data.form = {
        name: this.productionToEdit.name,
        project_status_id: this.productionToEdit.project_status_id,
        fps: this.productionToEdit.fps,
        ratio: this.productionToEdit.ratio,
        resolution: this.productionToEdit.resolution,
        production_type: this.productionToEdit.production_type || 'short'
      }
    } else {
      data.form = {
        name: '',
        project_status_id: this.productionStatus ? this.productionStatus[0].id : null,
        fps: '',
        ratio: '',
        resolution: '',
        production_type: 'short'
      }
    }

    return data
  },

  created () {
    this.resetForm()

    this.productionTypeOptions = [
      {
        label: 'short',
        value: 'short'
      },
      {
        label: 'featurefilm',
        value: 'featurefilm'
      },
      {
        label: 'tvshow',
        value: 'tvshow'
      }
    ]
  },

  mounted () {
    if (this.productionStatus.length > 0) {
      this.form.project_status_id = this.productionStatus[0].id
    }
  },

  computed: {
    ...mapGetters([
      'productions',
      'productionStatus',
      'productionStatusOptions'
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
    },

    resetForm () {
      if (this.productionToEdit && this.productionToEdit.id) {
        this.form = {
          name: this.productionToEdit.name,
          project_status_id: this.productionToEdit.project_status_id,
          fps: this.productionToEdit.fps,
          ratio: this.productionToEdit.ratio,
          resolution: this.productionToEdit.resolution,
          production_type: this.productionToEdit.production_type || 'short'
        }
        this.form.project_status_id = null
        this.$nextTick(() => {
          this.form.project_status_id = this.productionToEdit.project_status_id
        })
      } else {
        this.form = {
          name: '',
          project_status_id: this.productionStatusOptions[0].value,
          fps: '',
          ratio: '',
          resolution: '',
          production_type: 'short'
        }
      }
    }
  },

  watch: {
    productionToEdit () {
      this.resetForm()
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
  }
}
</script>

<style lang="scss" scoped>
.title {
  border-bottom: 2px solid #DDD;
  padding-bottom: 0.5em;
  margin-bottom: 1.2em;
}
</style>
