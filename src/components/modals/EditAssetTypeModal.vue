<template>
<div :class="{
  'modal': true,
  'is-active': active
}">
  <div class="modal-background" @click="$emit('cancel')" ></div>

  <div class="modal-content">

    <div class="box">
      <h1 class="title" v-if="assetTypeToEdit && assetTypeToEdit.id">
        {{ $t("asset_types.edit_title") }} {{ assetTypeToEdit.name }}
      </h1>
      <h1 class="title" v-else>
        {{ $t("asset_types.new_asset_type") }}
      </h1>

      <form v-on:submit.prevent>
        <text-field
          ref="nameField"
          :label="$t('asset_types.fields.name')"
          :maxlength="30"
          v-model="form.name"
          @enter="runConfirmation"
          v-focus
        />
      </form>

      <modal-footer
        :error-text="$t('asset_types.create_error')"
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
import ModalFooter from './ModalFooter'
import TextField from '../widgets/TextField'

export default {
  name: 'edit-asset-type-modal',
  components: {
    ModalFooter,
    TextField
  },

  props: [
    'onConfirmClicked',
    'text',
    'active',
    'cancelRoute',
    'isLoading',
    'isError',
    'assetTypeToEdit'
  ],

  data () {
    return {}
  },

  computed: {
    ...mapGetters([
      'assetTypes',
      'assetTypeStatusOptions'
    ]),
    form () {
      return {
        name: ''
      }
    }
  },

  methods: {
    ...mapActions([
    ]),

    runConfirmation () {
      this.$emit('confirm', this.form)
    }
  },

  watch: {
    active () {
      if (this.active) {
        setTimeout(() => {
          this.$refs.nameField.focus()
        }, 100)
      }
    },

    assetTypeToEdit () {
      if (this.assetTypeToEdit) {
        this.form.name = this.assetTypeToEdit.name
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
