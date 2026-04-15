<template>
  <status-automation-settings
    :status-automations="productionStatusAutomations"
    :all-status-automations="allStatusAutomations"
    @add="onAdd"
    @remove="onRemove"
  />
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import StatusAutomationSettings from '@/components/pages/production/StatusAutomationSettings.vue'

export default {
  name: 'production-status-automations',

  components: {
    StatusAutomationSettings
  },

  computed: {
    ...mapGetters(['productionStatusAutomations', 'statusAutomations']),

    allStatusAutomations() {
      return this.statusAutomations
    }
  },

  methods: {
    ...mapActions([
      'addStatusAutomationToProduction',
      'removeStatusAutomationFromProduction'
    ]),

    onAdd(statusAutomationId) {
      this.addStatusAutomationToProduction(statusAutomationId)
    },

    onRemove(statusAutomationId) {
      this.removeStatusAutomationFromProduction(statusAutomationId)
    }
  }
}
</script>
