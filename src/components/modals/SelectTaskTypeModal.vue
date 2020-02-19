<template>
<div :class="{
  'modal': true,
  'is-active': active
}">
  <div class="modal-background"></div>
  <div class="modal-content">
    <div class="box">
      <h1 class="title">
        {{ $t('playlists.select_task_type') }}
      </h1>

      <form v-on:submit.prevent>
        <combobox-task-type
          :task-type-list="taskTypeList"
          :value="taskTypeId"
          @input="onTaskTypeChanged"
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
          @click="runConfirmation">
          {{ $t("main.confirmation") }}
        </a>
        <button
          @click="$emit('cancel')"
          class="button is-link">
          {{ $t("main.cancel") }}
        </button>
      </p>

      <p class="error has-text-right info-message" v-if="isError">
        {{ $t("playlist.change_task_type_fails") }}
      </p>
    </div>
  </div>
</div>
</template>

<script>
import ComboboxTaskType from '../widgets/ComboboxTaskType'

import { modalMixin } from './base_modal'

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

  data () {
    return {
      taskTypeId: ''
    }
  },

  methods: {
    onTaskTypeChanged (taskTypeId) {
      this.taskTypeId = taskTypeId
    },

    runConfirmation () {
      this.$emit('confirm', this.taskTypeId)
    }
  },

  watch: {
    active () {
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
