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
        <h1 class="title" v-if="isEditing">
          {{ $t('task_status.edit_title') }} {{ taskStatusToEdit.name }}
        </h1>
        <h1 class="title" v-else>
          {{ $t('task_status.new_task_status') }}
        </h1>

        <form @submit.prevent>
          <text-field
            ref="nameField"
            input-class="task-status-name"
            :label="$t('task_status.fields.name')"
            @enter="confirmClicked"
            v-model="form.name"
            v-focus
            v-if="taskStatusToEdit?.short_name !== 'todo'"
          />
          <text-field
            ref="shortNameField"
            input-class="task-status-short-name"
            :label="$t('task_status.fields.short_name')"
            :maxlength="8"
            @enter="confirmClicked"
            v-model="form.short_name"
            v-if="taskStatusToEdit?.short_name !== 'todo'"
          />
          <textarea-field
            input-class="task-status-description"
            :label="$t('task_status.fields.description')"
            @enter="confirmClicked"
            v-model="form.description"
          />
          <boolean-field
            class="mr05 mb05"
            :label="$t('task_status.fields.is_default')"
            @enter="confirmClicked"
            v-model="form.is_default"
            :disabled="form.for_concept === 'true'"
          />
          <boolean-field
            class="mr05 mb05"
            :label="$t('task_status.fields.is_done')"
            @enter="confirmClicked"
            v-model="form.is_done"
            v-if="form.is_default === 'false'"
          />
          <boolean-field
            class="mr05 mb05"
            :label="$t('task_status.fields.is_retake')"
            @enter="confirmClicked"
            v-model="form.is_retake"
            v-if="form.is_default === 'false'"
          />
          <boolean-field
            class="mr05 mb05"
            :label="$t('task_status.fields.is_artist_allowed')"
            @enter="confirmClicked"
            v-model="form.is_artist_allowed"
          />
          <boolean-field
            class="mr05 mb05"
            :label="$t('task_status.fields.is_client_allowed')"
            @enter="confirmClicked"
            v-model="form.is_client_allowed"
            v-if="form.for_concept !== 'true'"
          />
          <boolean-field
            class="mr05 mb05"
            :label="$t('task_status.fields.is_feedback_request')"
            @enter="confirmClicked"
            v-model="form.is_feedback_request"
            v-if="form.is_default === 'false'"
          />
          <color-field
            class="mt2"
            :colors="colors"
            :column="5"
            :label="$t('task_status.fields.color')"
            v-model="form.color"
            v-if="taskStatusToEdit?.short_name !== 'todo'"
          />
          <combobox-boolean
            :label="$t('main.archived')"
            @enter="confirmClicked"
            v-model="form.archived"
            v-if="isEditing"
          />
        </form>

        <modal-footer
          :error-text="$t('task_status.create_error')"
          :is-error="isError"
          :is-loading="isLoading"
          @confirm="confirmClicked"
          @cancel="$emit('cancel')"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { modalMixin } from '@/components/modals/base_modal'

import BooleanField from '@/components/widgets/BooleanField.vue'
import ColorField from '@/components/widgets/ColorField.vue'
import ComboboxBoolean from '@/components/widgets/ComboboxBoolean.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import TextField from '@/components/widgets/TextField.vue'
import TextareaField from '@/components/widgets/TextareaField.vue'

export default {
  name: 'edit-task-status-modal',

  mixins: [modalMixin],

  components: {
    BooleanField,
    ColorField,
    ComboboxBoolean,
    ModalFooter,
    TextField,
    TextareaField
  },

  props: {
    active: {
      type: Boolean,
      default: false
    },
    isError: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    taskStatusToEdit: {
      type: Object,
      default: () => {}
    }
  },

  emits: ['cancel', 'confirm'],

  data() {
    return {
      form: {
        name: '',
        short_name: '',
        description: '',
        color: '#999999',
        is_done: 'false',
        is_feedback_request: 'false',
        is_default: 'false',
        archived: 'false'
      },
      colors: [
        '#999999',
        '#CCCCCC',
        '#F5F5F5',
        '#CC9999',
        '#FF3860',
        '#E81123',
        '#E74C3C',
        '#FF5722',
        '#FF7043',
        '#FFA000',
        '#FBC02D',
        '#AFB42B',
        '#8BC34A',
        '#66BB6A',
        '#22D160',
        '#4DB6AC',
        '#03A9F4',
        '#3273DC',
        '#3498DB',
        '#2980B9',
        '#607D8B',
        '#8764B8',
        '#AB26FF',
        '#E040FB',
        '#FF80AB'
      ]
    }
  },

  computed: {
    isEditing() {
      return this.taskStatusToEdit && this.taskStatusToEdit.id
    }
  },

  methods: {
    confirmClicked() {
      this.$emit('confirm', this.form)
    },

    resetForm() {
      if (this.taskStatusToEdit) {
        this.form = {
          name: this.taskStatusToEdit.name,
          short_name: this.taskStatusToEdit.short_name,
          description: this.taskStatusToEdit.description,
          color: this.taskStatusToEdit.color,
          is_done: String(this.taskStatusToEdit.is_done),
          is_retake: String(this.taskStatusToEdit.is_retake || false),
          is_artist_allowed: String(this.taskStatusToEdit.is_artist_allowed),
          is_client_allowed: String(this.taskStatusToEdit.is_client_allowed),
          is_default: String(this.taskStatusToEdit.is_default || false),
          is_feedback_request: String(
            this.taskStatusToEdit.is_feedback_request || false
          ),
          for_concept: String(this.taskStatusToEdit.for_concept || false),
          archived: String(this.taskStatusToEdit.archived || false)
        }
      }
    }
  },

  watch: {
    taskStatusToEdit() {
      this.resetForm()
    },

    active() {
      if (this.active) {
        this.resetForm()
        setTimeout(() => {
          this.$refs.nameField?.focus()
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
</style>
