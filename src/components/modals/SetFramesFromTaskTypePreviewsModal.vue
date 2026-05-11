<template>
  <base-modal
    :active="active"
    :title="$t('shots.get_frames_from_previews')"
    @cancel="$emit('cancel')"
  >
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
  </base-modal>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'

import BaseModal from '@/components/modals/BaseModal.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'

const store = useStore()

const props = defineProps({
  active: { type: Boolean, default: false },
  errorText: { type: String, default: '' },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false }
})

const emit = defineEmits(['cancel', 'confirm'])

const taskTypeId = ref(null)

const productionShotTaskTypes = computed(
  () => store.getters.productionShotTaskTypes
)

const isFormFilled = computed(
  () => taskTypeId.value !== null && taskTypeId.value !== ''
)

const confirm = () => {
  emit('confirm', taskTypeId.value)
}

const reset = () => {
  taskTypeId.value = null
}

watch(
  () => props.active,
  active => {
    if (active) reset()
  }
)

onMounted(reset)
</script>

<style lang="scss" scoped>
p.description {
  font-size: 1.2rem;
}
</style>
