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
        <h1 class="title">
          {{ $t('shots.get_frames_from_previews') }}
        </h1>

        <p class="description">
          {{ $t('shots.get_frames_from_previews_description') }}
        </p>

        <combobox-task-type
          :task-type-list="productionShotTaskTypes"
          :placeholder="$t('task_types.select_task_type')"
          add-placeholder
          v-model="taskTypeId"
        />

        <modal-footer
          :error-text="$t('shots.get_frames_from_previews_error')"
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
import { mapGetters } from 'vuex'

import { modalMixin } from '@/components/modals/base_modal'

import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'

export default {
  name: 'set-frames-from-task-type-previews-modal',

  mixins: [modalMixin],

  components: {
    ComboboxTaskType,
    ModalFooter
  },

  props: {
    active: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    isError: {
      type: Boolean,
      default: false
    },
    errorText: {
      type: String,
      default: ''
    }
  },

  emits: ['cancel', 'confirm'],

  data() {
    return {
      taskTypeId: null
    }
  },

  mounted() {
    this.reset()
  },

  computed: {
    ...mapGetters(['productionShotTaskTypes']),

    isFormFilled() {
      return this.taskTypeId !== null && this.taskTypeId !== ''
    }
  },

  methods: {
    confirm() {
      return this.$emit('confirm', this.taskTypeId)
    },

    reset() {
      this.taskType = null
    }
  },

  watch: {
    active() {
      if (this.active) {
        this.reset()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
p.description {
  font-size: 1.2rem;
}
</style>
