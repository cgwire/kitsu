<template>
  <div
    :class="{
      modal: true,
      'is-active': active
    }"
  >
    <div class="modal-background" @click="$emit('cancel')"></div>

    <div class="modal-content">
      <div class="box content">
        <h1 class="title" v-if="!isEdit">
          {{ $t('schedule.milestone.add_milestone') }}:
          {{ milestoneToEdit.date.format('YYYY-MM-DD') }}
        </h1>
        <h1 class="title" v-else>
          {{ $t('schedule.milestone.edit_milestone') }}:
          {{ milestoneToEdit.date.format('YYYY-MM-DD') }}
        </h1>
        <text-field
          ref="nameField"
          :label="$t('schedule.milestone.name')"
          :maxlength="40"
          v-model.trim="form.name"
          @enter="confirm"
          v-focus
        />
        <button-simple
          class="button is-link error"
          :text="$t('schedule.milestone.delete_milestone')"
          @click="$emit('remove-milestone', milestoneToEdit)"
          v-if="isEdit"
        />
        <modal-footer
          :error-text="$t('schedule.milestone.error')"
          :is-error="isError"
          :is-loading="isLoading"
          :is-disabled="!isFormFilled"
          @confirm="confirm"
          @cancel="$emit('cancel')"
        />
      </div>
    </div>
  </div>
</template>

<script>
/*
 * Modal used to edit and create milestones.
 */
import { mapActions } from 'vuex'
import { modalMixin } from '@/components/modals/base_modal'

import ButtonSimple from '@/components/widgets/ButtonSimple'
import ModalFooter from '@/components/modals/ModalFooter'
import TextField from '@/components/widgets/TextField'

export default {
  name: 'edit-milestone-modal',
  mixins: [modalMixin],

  components: {
    ButtonSimple,
    ModalFooter,
    TextField
  },

  props: {
    active: {
      type: Boolean,
      default: false
    },
    milestoneToEdit: {
      type: Object,
      default: () => {}
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

  data() {
    return {
      form: {
        name: ''
      }
    }
  },

  mounted() {
    this.reset()
  },

  computed: {
    isEdit() {
      return this.milestoneToEdit.id !== undefined
    },

    isFormFilled() {
      return this.form.name.length > 0
    }
  },

  methods: {
    ...mapActions([]),

    confirm() {
      return this.$emit('confirm', this.form)
    },

    reset() {
      this.form = {
        id: this.milestoneToEdit.id || undefined,
        name: this.milestoneToEdit.name || '',
        date: this.milestoneToEdit.date
      }
    }
  },

  watch: {
    active() {
      if (this.active) {
        this.reset()
        this.$nextTick(() => {
          this.$refs.nameField.focus()
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped></style>
