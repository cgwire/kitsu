<template>
<div :class="{
  'modal': true,
  'is-active': active
}">
  <div class="modal-background" @click="$emit('cancel')" ></div>

  <div class="modal-content">

    <div class="box">

      <h1 class="title" v-if="isEditing()">
        {{ $t("custom_actions.edit_title") }} {{ customActionToEdit.name }}
      </h1>
      <h1 class="title" v-else>
        {{ $t("custom_actions.new_custom_action") }}
      </h1>

      <form v-on:submit.prevent>
        <text-field
          ref="nameField"
          :label="$t('custom_actions.fields.name')"
          v-model="form.name"
          v-focus
        />

        <text-field
          ref="urlField"
          :label="$t('custom_actions.fields.url')"
          v-model="form.url"
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
        :is-error="isError"
        @confirm="confirmClicked"
        @cancel="$emit('cancel')"
      />
    </div>
  </div>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { modalMixin } from './base_modal'
import Combobox from '../widgets/Combobox'
import ComboboxBoolean from '../widgets/ComboboxBoolean'
import ModalFooter from './ModalFooter'
import TextField from '../widgets/TextField'

export default {
  name: 'edit-custom-action-modal',
  mixins: [modalMixin],
  components: {
    Combobox,
    ComboboxBoolean,
    ModalFooter,
    TextField
  },

  props: [
    'onConfirmClicked',
    'text',
    'active',
    'isLoading',
    'isError',
    'errorText',
    'customActionToEdit'
  ],

  data () {
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

  computed: {
    ...mapGetters([
      'customActions',
      'customActionStatusOptions'
    ])
  },

  methods: {
    ...mapActions([
    ]),
    confirmClicked () {
      this.$emit('confirm', this.form)
    },
    isEditing () {
      return this.customActionToEdit && this.customActionToEdit.id
    }
  },

  watch: {
    customActionToEdit () {
      if (this.customActionToEdit) {
        this.form = {
          name: this.customActionToEdit.name,
          url: this.customActionToEdit.url,
          entityType: this.customActionToEdit.entity_type,
          isAjax: Boolean(this.customActionToEdit.is_ajax).toString()
        }
      }
    },

    active () {
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
