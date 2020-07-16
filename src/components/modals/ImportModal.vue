<template>
<div :class="{
  'modal': true,
  'is-active': active
}">
  <div class="modal-background" @click="$emit('cancel')" ></div>

  <div class="modal-content">

    <div class="box content">
      <h1 class="title">
        {{ $t("main.csv.import_title") }}
      </h1>

      <p class="description">
        {{ $t("main.csv.required_fields") }}
        <ul>
          <li v-for="column in columns" :key="column">
            {{ column }}
          </li>
        </ul>
      </p>

      <tabs @update="onTabUpdate">
        <tab :name="$t('main.csv.tab_select_file')" :selected="true">
          <p>
            {{ $t("main.csv.select_file") }}
          </p>
          <file-upload
            @fileselected="onFileSelected"
            :label="$t('main.csv.upload_file')"
            ref="inputFile"
          />
        </tab>
        <tab :name="$t('main.csv.tab_paste_code')">
          <p>
            {{ $t("main.csv.paste_code") }}
          </p>
          <textarea
            class="paste-area"
            :placeholder="pasteAreaPlacholder"
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
import { mapGetters, mapActions } from 'vuex'
import { modalMixin } from './base_modal'
import FileUpload from '../widgets/FileUpload.vue'
import ModalFooter from './ModalFooter'
import Tabs from '../widgets/Tabs'
import Tab from '../widgets/Tab'

export default {
  name: 'import-people-modal',
  mixins: [modalMixin],
  components: {
    FileUpload,
    ModalFooter,
    Tabs,
    Tab
  },

  data () {
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
    isLoading: {
      type: Boolean,
      default: false
    },
    isError: {
      type: Boolean,
      default: false
    }
  },

  mounted () {
    this.formData = null
  },

  computed: {
    ...mapGetters([
    ]),
    pasteAreaPlacholder () {
      let placeholder = this.columns.toString()
      placeholder = placeholder.replace(/,/g, ';')
      return placeholder
    }
  },

  methods: {
    ...mapActions([
    ]),

    onTabUpdate (tabs) {
      this.tabs = tabs
    },

    onFileSelected (formData) {
      this.formData = formData
    },

    onConfirmClicked () {
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

    reset () {
      this.$refs.inputFile.reset()
      this.pastedCode = ''
    }
  },

  watch: {
    active () {
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

.description {
  margin-bottom: 1em;
}

.paste-area {
  margin: 0 0 1rem;
  width: 100%;
  min-height: 10rem;
  padding: .5rem;
  resize: vertical;
}
</style>
