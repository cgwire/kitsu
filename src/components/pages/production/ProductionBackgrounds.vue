<template>
  <background-settings
    :backgrounds="productionBackgrounds"
    :all-backgrounds="backgrounds"
    :default-background-id="
      currentProduction.default_preview_background_file_id
    "
    @add="onAdd"
    @remove="onRemove"
    @set-default="onSetDefault"
  />
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

import BackgroundSettings from '@/components/pages/production/BackgroundSettings.vue'

const store = useStore()

const backgrounds = computed(() => store.getters.backgrounds)
const currentProduction = computed(() => store.getters.currentProduction)
const productionBackgrounds = computed(
  () => store.getters.productionBackgrounds
)

const onAdd = backgroundId => {
  store.dispatch('addBackgroundToProduction', backgroundId)
}

const onRemove = backgroundId => {
  store.dispatch('removeBackgroundFromProduction', backgroundId)
}

const onSetDefault = backgroundId => {
  store.dispatch('setDefaultBackgroundToProduction', backgroundId)
}
</script>
