<template>
  <div class="modal" :class="{ 'is-active': active }">
    <div class="modal-background" @click="$emit('cancel')"></div>
    <div class="modal-content">
      <div class="box">
        <h1 class="title" v-if="isEditing">
          {{ $t('studios.edit_title') }} {{ studioToEdit.name }}
        </h1>
        <h1 class="title" v-else>
          {{ $t('studios.new_studios') }}
        </h1>
        <form @submit.prevent>
          <text-field
            ref="nameField"
            :label="$t('studios.fields.name')"
            :maxlength="30"
            v-model="form.name"
            v-focus
          />
          <color-field
            :label="$t('studios.fields.color')"
            v-model="form.color"
          />
          <combobox-boolean
            :label="$t('main.archived')"
            @enter="runConfirmation"
            v-model="form.archived"
            v-if="isEditing"
          />
        </form>
        <modal-footer
          :error-text="$t('studios.create_error')"
          :is-error="isError"
          :is-loading="isLoading"
          @confirm="runConfirmation"
          @cancel="$emit('cancel')"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { modalMixin } from '@/components/modals/base_modal'

import ColorField from '@/components/widgets/ColorField.vue'
import ComboboxBoolean from '@/components/widgets/ComboboxBoolean.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import TextField from '@/components/widgets/TextField.vue'

export default {
  name: 'edit-studios-modal',

  mixins: [modalMixin],

  components: {
    ColorField,
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
    studioToEdit: {
      type: Object,
      default: () => {}
    }
  },

  emits: ['cancel', 'confirm'],

  data() {
    return {
      form: {
        id: null,
        name: '',
        color: '',
        archived: 'false'
      }
    }
  },

  computed: {
    isEditing() {
      return this.studioToEdit?.id
    }
  },

  methods: {
    runConfirmation() {
      this.$emit('confirm', this.form)
    }
  },

  watch: {
    active() {
      if (this.active) {
        setTimeout(() => {
          this.$refs.nameField.focus()
        }, 100)
      }
    },

    studioToEdit() {
      if (this.isEditing) {
        this.form = {
          id: this.studioToEdit.id,
          name: this.studioToEdit.name,
          color: this.studioToEdit.color,
          archived: String(this.studioToEdit.archived === true)
        }
      } else {
        this.form = {
          id: null,
          name: '',
          color: '',
          archived: 'false'
        }
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
