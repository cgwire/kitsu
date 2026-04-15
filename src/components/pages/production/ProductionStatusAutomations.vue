<template>
  <status-automation-settings
    :status-automations="productionStatusAutomations"
    :all-status-automations="allStatusAutomations"
    @add="onAdd"
    @remove="onRemove"
  />
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

import StatusAutomationSettings from '@/components/pages/production/StatusAutomationSettings.vue'

const store = useStore()

const productionStatusAutomations = computed(
  () => store.getters.productionStatusAutomations
)
const allStatusAutomations = computed(() => store.getters.statusAutomations)

const onAdd = statusAutomationId => {
  store.dispatch('addStatusAutomationToProduction', statusAutomationId)
}

const onRemove = statusAutomationId => {
  store.dispatch('removeStatusAutomationFromProduction', statusAutomationId)
}
</script>
