<template>
<div :class="{
  'modal': true,
  'is-active': active
}">
  <div class="modal-background"></div>
  <div class="modal-content">

    <div class="box content">
      <h1 class="title">
        {{ $t("main.csv.import_title") }}
      </h1>

      <p class="description" v-on:submit.prevent>
        {{ $t("main.csv.required_fields") }}
        <ul>
          <li v-for="column in columns" :key="column">
            {{ column }}
          </li>
        </ul>
      </p>

      <p>
        {{ $t("main.csv.select_file") }}
      </p>

      <file-upload @fileselected="onFileSelected" />

      <modal-footer
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

export default {
  name: 'import-people-modal',
  mixins: [modalMixin],
  components: {
    FileUpload,
    ModalFooter
  },

  data () {
    return {
      formData: null
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
    ])
  },

  methods: {
    ...mapActions([
    ]),
    onFileSelected (formData) {
      this.formData = formData
      this.$emit('fileselected', formData)
    },
    onConfirmClicked () {
      this.$emit('confirm')
    }
  },

  watch: {
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
</style>
