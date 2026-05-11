<template>
  <base-modal
    :active="active"
    :title="$t('playlists.select_task_type')"
    @cancel="$emit('cancel')"
  >
    <form @submit.prevent>
      <combobox-task-type :task-type-list="taskTypeList" v-model="taskTypeId" />
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
  </base-modal>
</template>

<script setup>
import { ref, watch } from 'vue'

import BaseModal from '@/components/modals/BaseModal.vue'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'

const props = defineProps({
  active: { type: Boolean, default: false },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  taskTypeList: { type: Array, default: () => [] }
})

const emit = defineEmits(['cancel', 'confirm'])

const taskTypeId = ref('')

const runConfirmation = () => {
  emit('confirm', taskTypeId.value)
}

watch(
  () => props.active,
  () => {
    taskTypeId.value = props.taskTypeList[0]?.id || ''
  }
)
</script>
