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
              <th
                v-for="(cell, index) in parsedCSV[0]"
                :key="`header-${index}`"
              >
              {{ cell || '-' }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(line, index) in startFrom(parsedCSV, 1)"
              :key="`line-${index}`"
            >
              <td
                v-for="(cell, index) in line"
                :key="`cell-${index}`"
              >
                {{ cell || '-' }}
              </td>
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
import ButtonSimple from '../widgets/ButtonSimple'
import ModalFooter from './ModalFooter'

export default {
  name: 'preview-modal',
  mixins: [modalMixin],
  components: {
    ButtonSimple,
    TextField,
    ModalFooter
  },

  data () {
    return {
      columnOptions: [
        { label: 'Choose', value: 'none' },
        { label: 'Name', value: 'name' },
        { label: 'Sequence', value: 'sequence' },
        { label: 'Description', value: 'description' },
        { label: 'Time', value: 'time' },
        { label: 'Frames', value: 'frames' },
        { label: 'Frame IN', value: 'frame_in' },
        { label: 'Frame OUT', value: 'frame_out' },
        { label: 'Storyboard', value: 'storyboard' },
        { label: 'Layout', value: 'layout' },
        { label: 'Animation', value: 'animation' },
        { label: 'Render', value: 'render' },
        { label: 'Compositing', value: 'compositing' }
      ],
      formData: null,
      form: {
        name: ''
      }
    }
  },

  props: {
    active: {
      type: Boolean,
      default: false
    },
    parsedCSV: {
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
    onConfirmClicked () {
      this.$emit('confirm')
    },
    onReupload () {
      this.$emit('reupload')
    },
    startFrom (arr, index) {
      return arr.slice(index)
    }
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
  margin: 6rem auto 1.4rem;
  max-width: calc(100vw - 4rem);
  max-height: calc(100% - 6rem);
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
