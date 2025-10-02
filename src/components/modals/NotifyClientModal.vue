<template>
  <base-modal
    :active="active"
    :title="$t('playlists.notify_clients')"
    @cancel="$emit('cancel')"
  >
    <p class="mb2">
      {{ $t('playlists.notify_clients_description') }}
    </p>

    <combobox-studio
      class="mt1"
      ref="studioField"
      :label="$t('main.studio')"
      :empty-choice-label="$t('playlists.all_studios')"
      v-model="form.studio_id"
      v-focus
    />

    <p>&nbsp;</p>

    <modal-footer
      :error-text="$t('playlists.notify_clients_error')"
      :is-error="isError"
      :is-loading="isLoading"
      :is-success="isSuccess"
      :success-text="$t('playlists.notify_clients_success')"
      @confirm="runConfirmation"
      @cancel="$emit('cancel')"
    />
  </base-modal>
</template>

<script>
import { modalMixin } from '@/components/modals/base_modal'

import BaseModal from '@/components/modals/BaseModal.vue'
import ComboboxStudio from '@/components/widgets/ComboboxStudio.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'

export default {
  name: 'edit-budget-modal',

  mixins: [modalMixin],

  components: {
    BaseModal,
    ComboboxStudio,
    ModalFooter
  },

  props: {
    active: {
      type: Boolean,
      default: false
    },
    playlist: {
      type: Object,
      default: () => {}
    },
    isError: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    isSuccess: {
      type: Boolean,
      default: false
    }
  },

  emits: ['cancel', 'confirm'],

  data() {
    return {
      form: {
        studio_id: ''
      }
    }
  },

  computed: {},

  methods: {
    runConfirmation() {
      this.$emit('confirm', {
        studio_id: this.form.studio_id
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.modal-content .box p.text {
  margin-bottom: 1em;
}

.revision-number {
  font-size: 1.4rem;
  font-weight: bold;
}
</style>
