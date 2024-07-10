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
        <h1 class="title" v-if="groupToEdit.id">
          {{ $t('main.filter_group_edit') }} "{{ groupToEdit.name }}"
        </h1>
        <h1 class="title" v-else>
          {{ $t('main.filter_group_add') }}
        </h1>

        <form @submit.prevent>
          <text-field
            ref="nameField"
            :label="$t('assets.fields.name')"
            v-model.trim="form.name"
            @enter="runConfirmation"
            v-focus
          />
          <color-field
            ref="colorField"
            :label="$t('main.color')"
            v-model="form.color"
          />

          <boolean-field
            :label="$t('main.is_shared')"
            v-model="form.is_shared"
            v-if="isCurrentUserManager && currentProduction"
          />
        </form>

        <modal-footer
          :error-text="$t('main.filter_group_error')"
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
/*
 * Modal used to edit filter group information.
 */
import { mapGetters } from 'vuex'
import { modalMixin } from '@/components/modals/base_modal'
import ModalFooter from '@/components/modals/ModalFooter'
import ColorField from '@/components/widgets/ColorField'
import TextField from '@/components/widgets/TextField'
import BooleanField from '@/components/widgets/BooleanField'

export default {
  name: 'edit-search-filter-group-modal',
  mixins: [modalMixin],
  components: {
    BooleanField,
    ColorField,
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
    groupToEdit: {
      type: Object,
      default: () => {}
    }
  },

  data() {
    return {
      form: {
        color: '',
        name: '',
        is_shared: 'false'
      }
    }
  },

  computed: {
    ...mapGetters(['currentProduction', 'isCurrentUserManager'])
  },

  methods: {
    runConfirmation(event) {
      if (!this.form.name.length) {
        this.$refs.nameField.focus()
        return
      }

      if (!event || event.keyCode === 13 || !event.keyCode) {
        const data = {
          ...this.form,
          is_shared: this.form.is_shared === 'true'
        }
        this.$emit('confirm', data)
      }
    }
  },

  watch: {
    groupToEdit() {
      const {
        id,
        color = '',
        name = '',
        is_shared = false
      } = this.groupToEdit?.id ? this.groupToEdit : {}
      this.form = {
        id,
        color,
        name,
        is_shared: is_shared ? 'true' : 'false'
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
