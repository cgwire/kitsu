<template>
<div :class="{
  'modal': true,
  'is-active': active
}">
  <div class="modal-background"></div>
  <div class="modal-content">

    <div class="box content">
      <h1 class="title">
        {{ $t("main.csv.preview_title") }}
      </h1>

      <div class="description">
        <div class="flex-item">
          <p>
            {{ $t("main.csv.preview_description") }}
          </p>
          <p>
            {{ $t("main.csv.preview_required") }}
          </p>
        </div>
        <div class="flex-item">
          <text-field
            ref="nameField"
            input-class="task-status-name"
            :label="$t('main.csv.preview_episode_name')"
            v-model="form.name"
            v-focus
          />
        </div>
      </div>

      <div class="preview-container">
        <table class="preview">
          <thead>
            <tr class="preview-headers">
              <th>
                <combobox
                  :options="columnOptions"
                />
              </th>
              <th>
                <combobox
                  :options="columnOptions"
                />
              </th>
              <th>
                <combobox
                  :options="columnOptions"
                />
              </th>
              <th>
                <combobox
                  :options="columnOptions"
                />
              </th>
              <th>
                <combobox
                  :options="columnOptions"
                />
              </th>
              <th>
                <combobox
                  :options="columnOptions"
                />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>data</td>
              <td>data</td>
              <td>data</td>
              <td>data</td>
              <td>data</td>
              <td>data</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="preview-footer">
        <button-simple
          :text="$t('main.csv.preview_reupload')"
          @click="onReupload"
        />
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
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { modalMixin } from './base_modal'
import TextField from '../widgets/TextField'
import Combobox from '../widgets/Combobox'
import ButtonSimple from '../widgets/ButtonSimple'
import ModalFooter from './ModalFooter'

export default {
  name: 'preview-modal',
  mixins: [modalMixin],
  components: {
    ButtonSimple,
    TextField,
    Combobox,
    ModalFooter
  },

  data () {
    return {
      formData: null,
      form: {
        name: ''
      },
      columnOptions: [
        { label: 'Episodes', value: 'episodes' },
        { label: 'Sequences', value: 'sequences' },
        { label: 'Shots', value: 'shots' },
        { label: 'Description', value: 'description' },
        { label: 'Frame IN', value: 'frame_in' },
        { label: 'Frame OUT', value: 'frame_out' }
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
    isLoading: {
      type: Boolean,
      default: false
    },
    isError: {
      type: Boolean,
      default: false
    },
    parsedCSV: {
      type: Array,
      default: () => []
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
    },
    onReupload () {
      this.$emit('reupload')
    }
  },

  watch: {
  }
}
</script>

<style lang="scss" scoped>
.dark {
  .preview-container {
    .preview {
      border: 1px solid $dark-grey-light;
      th, td {
        color: $white;
      }
      tr:not(.preview-headers):hover {
        background-color: $dark-grey-lightmore;
      }
    }
  }
}
.modal-content {
  max-width: calc(100vw - 4rem);
  width: auto;
}
.modal-content .box p.text {
  margin-bottom: 1em;
}
.error {
  margin-top: 1em;
}
.description {
  display: flex;
  margin-bottom: 1em;
  align-items: center;
  .flex-item {
    flex: 1 1 50%;
  }
}
.preview-container {
  overflow: auto;
  .preview-headers {
    .field {
      margin: 0;
    }
  }
  .preview {
    width: 100%;
    border: 1px solid $light-grey-light;
    th, td {
      color: $dark-grey;
      border: 1px solid $light-grey-light;
      padding: .75rem;
    }
    tr:hover {
      background: none;
    }
    tr:not(.preview-headers):hover {
      background-color: $white-grey-light;
    }
  }
}
.preview-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 2rem;
}
</style>
