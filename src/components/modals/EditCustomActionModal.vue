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
        <h1 class="title" v-if="isEditing()">
          {{ $t('custom_actions.edit_title') }} {{ customActionToEdit.name }}
        </h1>
        <h1 class="title" v-else>
          {{ $t('custom_actions.new_custom_action') }}
        </h1>

        <form @submit.prevent>
          <text-field
            ref="nameField"
            :label="$t('custom_actions.fields.name')"
            v-model="form.name"
            v-focus
            @enter="confirmClicked"
          />

          <text-field
            :label="$t('custom_actions.fields.url')"
            placeholder="https://..."
            type="url"
            v-model.trim="form.url"
            @enter="confirmClicked"
          />

          <combobox
            :label="$t('custom_actions.fields.entity_type')"
            :options="entityTypeOptions"
            v-model="form.entityType"
            locale-key-prefix="custom_actions.entity_types."
            @enter="confirmClicked"
          />

          <combobox-boolean
            :label="$t('custom_actions.fields.is_ajax')"
            v-model="form.isAjax"
            @enter="confirmClicked"
          />
        </form>

        <modal-footer
          :error-text="$t('custom_actions.create_error')"
          :is-loading="isLoading"
          :is-error="isError"
          @confirm="confirmClicked"
          @cancel="$emit('cancel')"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { modalMixin } from '@/components/modals/base_modal'

import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxBoolean from '@/components/widgets/ComboboxBoolean.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import TextField from '@/components/widgets/TextField.vue'

export default {
  name: 'edit-custom-action-modal',

  mixins: [modalMixin],

  components: {
    Combobox,
    ComboboxBoolean,
    ModalFooter,
    TextField
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
    customActionToEdit: {
      type: Object,
      default: () => {}
    }
  },

  emits: ['cancel', 'confirm'],

  data() {
    return {
      form: {
        name: '',
        url: '',
        entityType: 'all',
        isAjax: 'false'
      },
      entityTypeOptions: [
        {
          label: 'all',
          value: 'all'
        },
        {
          label: 'asset',
          value: 'asset'
        },
        {
          label: 'shot',
          value: 'shot'
        }
      ]
    }
  },

  methods: {
    confirmClicked() {
      this.$emit('confirm', this.form)
    },

    isEditing() {
      return Boolean(this.customActionToEdit?.id)
    }
  },

  watch: {
    customActionToEdit() {
      if (this.customActionToEdit) {
        this.form = {
          name: this.customActionToEdit.name,
          url: this.customActionToEdit.url,
          entityType: this.customActionToEdit.entity_type,
          isAjax: Boolean(this.customActionToEdit.is_ajax).toString()
        }
      }
    },

    active() {
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
</style>
