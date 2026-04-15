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

<script>
import { mapGetters, mapActions } from 'vuex'

import BackgroundSettings from '@/components/pages/production/BackgroundSettings.vue'

export default {
  name: 'production-backgrounds',

  components: {
    BackgroundSettings
  },

  computed: {
    ...mapGetters(['backgrounds', 'currentProduction', 'productionBackgrounds'])
  },

  methods: {
    ...mapActions([
      'addBackgroundToProduction',
      'removeBackgroundFromProduction',
      'setDefaultBackgroundToProduction'
    ]),

    onAdd(backgroundId) {
      this.addBackgroundToProduction(backgroundId)
    },

    onRemove(backgroundId) {
      this.removeBackgroundFromProduction(backgroundId)
    },

    onSetDefault(backgroundId) {
      this.setDefaultBackgroundToProduction(backgroundId)
    }
  }
}
</script>
