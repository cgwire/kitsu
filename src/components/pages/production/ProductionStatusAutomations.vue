<template>
  <div>
    <p class="explanation mb1">
      {{ $t('status_automations.production_description') }}
    </p>
    <status-automation-settings
      :status-automations="productionStatusAutomations"
      :all-status-automations="allStatusAutomations"
      @add="onAdd"
      @remove="onRemove"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

import StatusAutomationSettings from '@/components/pages/production/StatusAutomationSettings.vue'

const store = useStore()

// Computed
// --------------------------------------------------------------------------
const productionStatusAutomations = computed(
  () => store.getters.productionStatusAutomations
)
const allStatusAutomations = computed(() => store.getters.statusAutomations)

// Functions
// --------------------------------------------------------------------------
const onAdd = statusAutomationId => {
  store.dispatch('addStatusAutomationToProduction', statusAutomationId)
}

const onRemove = statusAutomationId => {
  store.dispatch('removeStatusAutomationFromProduction', statusAutomationId)
}
</script>
