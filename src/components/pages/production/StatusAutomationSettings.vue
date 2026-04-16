<template>
  <div class="status-automation-settings">
    <div class="columns">
      <div class="column">
        <div
          class="flexrow mt1 mb1 add-status-automation"
          v-if="remainingAutomations.length > 0"
        >
          <combobox-status-automation
            class="flexrow-item selector"
            :status-automations-list="remainingAutomations"
            v-model="automationToAdd"
          />
          <button class="button flexrow-item" @click="onAdd">
            {{ $t('main.add') }}
          </button>
        </div>

        <div class="box" v-if="statusAutomations.length === 0">
          {{ $t('settings.production.empty_automation_list') }}
        </div>

        <status-automation-list
          :entries="statusAutomations"
          @remove-clicked="onRemove"
          v-else
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

import ComboboxStatusAutomation from '@/components/widgets/ComboboxStatusAutomation.vue'
import StatusAutomationList from '@/components/lists/StatusAutomationList.vue'

const props = defineProps({
  statusAutomations: { type: Array, default: () => [] },
  allStatusAutomations: { type: Array, default: () => [] }
})

const emit = defineEmits(['add', 'remove'])

const automationToAdd = ref(null)

const linkedIds = computed(
  () => new Set(props.statusAutomations.map(a => a.id))
)

const remainingAutomations = computed(() =>
  props.allStatusAutomations.filter(a => !linkedIds.value.has(a.id))
)

const resetSelection = () => {
  automationToAdd.value = remainingAutomations.value[0]?.id || null
}

watch(
  () => props.statusAutomations,
  () => {
    resetSelection()
  },
  { immediate: true }
)

watch(remainingAutomations, () => {
  resetSelection()
})

const onAdd = () => {
  if (!automationToAdd.value) return
  emit('add', automationToAdd.value)
  resetSelection()
}

const onRemove = id => {
  emit('remove', id)
}
</script>

<style lang="scss" scoped>
.column {
  overflow-y: initial;
}

.field {
  margin-bottom: 0;
}
</style>
