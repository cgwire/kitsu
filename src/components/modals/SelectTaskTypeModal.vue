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
        <h1 class="title">
          {{ $t('playlists.select_task_type') }}
        </h1>

        <form @submit.prevent>
          <combobox-task-type
            :task-type-list="taskTypeList"
            :value="taskTypeId"
            @update:model-value="onTaskTypeChanged"
          />
        </form>

        <p>
          {{ $t('playlists.apply_task_type_change') }}
        </p>

        <p class="has-text-right mt2">
          <a
            :class="{
              button: true,
              'is-primary': true,
              'is-loading': isLoading
            }"
            @click="runConfirmation"
          >
            {{ $t('main.confirmation') }}
          </a>
          <button @click="$emit('cancel')" class="button is-link">
            {{ $t('main.cancel') }}
          </button>
        </p>

        <p class="error has-text-right info-message" v-if="isError">
          {{ $t('playlist.change_task_type_fails') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { modalMixin } from '@/components/modals/base_modal'

import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'

export default {
  name: 'select-task-type-modal',

  mixins: [modalMixin],

  components: {
    ComboboxTaskType
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
    taskTypeList: {
      type: Array,
      default: () => {}
    }
  },

  emits: ['cancel', 'confirm'],

  data() {
    return {
      taskTypeId: ''
    }
  },

  methods: {
    onTaskTypeChanged(taskTypeId) {
      this.taskTypeId = taskTypeId
    },

    runConfirmation() {
      this.$emit('confirm', this.taskTypeId)
    }
  },

  watch: {
    active() {
      this.taskTypeId = this.taskTypeList[0].id
    }
  }
}
</script>

<style lang="scss" scoped>
.is-danger {
  color: #ff3860;
  font-style: italic;
}
</style>
