<template>
  <div
    :class="{
      modal: true,
      'is-active': active
    }"
  >
    <div class="modal-background" @click="$emit('cancel')"></div>

    <div class="modal-content">
      <div class="box content">
        <h1 class="title">
          {{ $t('main.csv.import_title') }}
        </h1>

        <div v-if="columns.length > 0" class="mb1">
          {{ $t('main.csv.required_fields') }}
          <ul>
            <li v-for="column in columns" :key="column">
              {{ column }}
            </li>
          </ul>
        </div>
        <div v-if="optionalColumns.length > 0" class="mb1">
          {{ $t('main.csv.optional_fields') }}
          <ul>
            <li v-for="optionalColumn in optionalColumns" :key="optionalColumn">
              {{ optionalColumn }}
            </li>
          </ul>
        </div>
        <div v-if="genericColumns.length > 0" class="mb1">
          {{ $t('main.csv.generic_fields') }}
          <ul>
            <li v-for="genericColumn in genericColumns" :key="genericColumn">
              {{ genericColumn }}
            </li>
          </ul>
        </div>

        <tabs @update="onTabUpdate">
          <tab :name="$t('main.csv.tab_select_file')" :selected="true">
            <p>
              {{ $t('main.csv.select_file') }}
            </p>
            <file-upload
              @fileselected="onFileSelected"
              :label="$t('main.csv.upload_file')"
              ref="inputFile"
            />
          </tab>
          <tab :name="$t('main.csv.tab_paste_code')">
            <p>
              {{ $t('main.csv.paste_code') }}
            </p>
            <textarea
              class="paste-area"
              :placeholder="pasteAreaPlaceholder"
              v-model="pastedCode"
            ></textarea>
          </tab>
        </tabs>

        <modal-footer
          :confirm-label="$t('main.csv.preview')"
          :error-text="$t('main.csv.error_upload')"
          :is-loading="isLoading"
          :is-disabled="formData === undefined"
          :is-error="isError"
          @confirm="onConfirmClicked"
          @cancel="$emit('cancel')"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { modalMixin } from '@/components/modals/base_modal'
import FileUpload from '@/components/widgets/FileUpload.vue'
import ModalFooter from '@/components/modals/ModalFooter'
import Tabs from '@/components/widgets/Tabs'
import Tab from '@/components/widgets/Tab'

export default {
  name: 'import-people-modal',
  mixins: [modalMixin],
  components: {
    FileUpload,
    ModalFooter,
    Tabs,
    Tab
  },

  data() {
    return {
      formData: null,
      pastedCode: '',
      tabs: []
    }
  },

  props: {
    active: {
      type: Boolean,
      default: false
    },
    columns: {
      type: Array,
      default: () => []
    },
    optionalColumns: {
      type: Array,
      default: () => []
    },
    genericColumns: {
      type: Array,
      default: () => []
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    isError: {
      type: Boolean,
      default: false
    }
  },

  mounted() {
    this.formData = null
  },

  computed: {
    pasteAreaPlaceholder() {
      let placeholder = this.columns.toString()
      placeholder = placeholder.replace(/,/g, ';')
      return placeholder
    }
  },

  methods: {
    onTabUpdate(tabs) {
      this.tabs = tabs
    },

    onFileSelected(formData) {
      this.formData = formData
    },

    onConfirmClicked() {
      let mode = ''
      let data = null
      if (this.tabs[0].isActive === true) {
        data = this.formData
        mode = 'file'
      } else if (this.tabs[1].isActive === true) {
        data = this.pastedCode
        mode = 'text'
      }
      this.$emit('confirm', data, mode)
    },

    reset() {
      this.$refs.inputFile.reset()
      this.pastedCode = ''
    }
  },

  watch: {
    active() {
      this.reset()
    }
  }
}
</script>

<style lang="scss" scoped>
.modal-content .box p.text {
  margin-bottom: 1em;
}

.error {
  margin-top: 1em;
}

.paste-area {
  margin: 0 0 1rem;
  width: 100%;
  min-height: 10rem;
  padding: 0.5rem;
  resize: vertical;
}
</style>
