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
        <h1 class="title" v-if="departmentToEdit && departmentToEdit.id">
          {{ $t('departments.edit_title') }} {{ departmentToEdit.name }}
        </h1>
        <h1 class="title" v-else>
          {{ $t('departments.new_departments') }}
        </h1>
        <form v-on:submit.prevent>
          <text-field
            ref="nameField"
            :label="$t('departments.fields.name')"
            :maxlength="30"
            v-model="form.name"
            v-focus
          />
          <color-field
            ref="colorField"
            :label="$t('departments.fields.color')"
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
          :error-text="$t('departments.create_error')"
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
import { mapGetters, mapActions } from 'vuex'
import { modalMixin } from '@/components/modals/base_modal'

import ColorField from '@/components/widgets/ColorField'
import ComboboxBoolean from '@/components/widgets/ComboboxBoolean'
import ModalFooter from '@/components/modals/ModalFooter'
import TextField from '@/components/widgets/TextField'

export default {
  name: 'edit-departments-modal',
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
    departmentToEdit: {
      type: Object,
      default: () => {}
    }
  },

  data() {
    return {
      form: {
        name: '',
        color: '',
        id: null
      }
    }
  },

  computed: {
    ...mapGetters(['assetTypes', 'assetTypeStatusOptions']),

    isEditing() {
      return this.departmentToEdit && this.departmentToEdit.id
    }
  },

  methods: {
    ...mapActions([]),

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

    departmentToEdit() {
      if (this.isEditing) {
        this.form.name = this.departmentToEdit.name
        this.form.color = this.departmentToEdit.color
        this.form.id = this.departmentToEdit.id
        this.form.archived = this.departmentToEdit.archive
      } else {
        this.form = {
          name: '',
          color: '',
          id: null,
          archived: String(this.departmentToEdit.archive === true)
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
