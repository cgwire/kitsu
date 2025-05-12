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

        <div class="tabs">
          <ul>
            <li
              :class="{ 'is-active': activeTab === tab.id }"
              :key="`tab-${tab.id}`"
              v-for="tab in tabs"
            >
              <a @click="activeTab = tab.id">{{ tab.name }}</a>
            </li>
          </ul>
        </div>
        <div v-show="activeTab === 'file'">
          <p>{{ $t('main.csv.select_file') }}</p>
          <file-upload
            @fileselected="onFileSelected"
            :label="$t('main.csv.upload_file')"
            ref="inputFile"
          />
        </div>
        <div v-show="activeTab === 'text'">
          <p>{{ $t('main.csv.paste_code') }}</p>
          <textarea
            class="paste-area"
            :placeholder="pasteAreaPlaceholder"
            v-model="pastedCode"
          ></textarea>
        </div>

        <modal-footer
          :confirm-label="$t('main.csv.preview')"
          :error-text="$t('main.csv.error_upload')"
          :is-loading="isLoading"
          :is-disabled="!isValid"
          :is-error="isError"
          @confirm="onConfirmClicked"
          @cancel="$emit('cancel')"
        />
      </div>
    </div>
  </div>
</template>

<script>
import FileUpload from '@/components/widgets/FileUpload.vue'
import { modalMixin } from '@/components/modals/base_modal'
import ModalFooter from '@/components/modals/ModalFooter.vue'

export default {
  name: 'import-modal',

  mixins: [modalMixin],

  components: {
    FileUpload,
    ModalFooter
  },

  emits: ['cancel', 'confirm'],

  data() {
    return {
      formData: null,
      pastedCode: '',
      activeTab: 'file',
      tabs: [
        {
          id: 'file',
          name: this.$t('main.csv.tab_select_file')
        },
        {
          id: 'text',
          name: this.$t('main.csv.tab_paste_code')
        }
      ]
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

  computed: {
    isValid() {
      return (
        (this.activeTab === 'file' && this.formData) ||
        (this.activeTab === 'text' && this.pastedCode)
      )
    },

    pasteAreaPlaceholder() {
      return this.columns.join(';')
    }
  },

  methods: {
    onFileSelected(formData) {
      this.formData = formData
    },

    onConfirmClicked() {
      const mode = this.activeTab
      const data = mode === 'file' ? this.formData : this.pastedCode
      this.$emit('confirm', data, mode)
    },

    reset() {
      this.$refs.inputFile.reset()
      this.activeTab = 'file'
      this.formData = null
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
.tabs ul {
  margin-left: 0;
}

.paste-area {
  margin: 0 0 1rem;
  width: 100%;
  min-height: 10rem;
  padding: 0.5rem;
  resize: vertical;
}
</style>
