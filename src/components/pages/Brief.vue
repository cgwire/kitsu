<template>
  <div class="brief fixed-page">
    <div class="wrapper">
      <production-brief />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import ProductionBrief from '@/components/pages/production/ProductionBrief.vue'

export default {
  name: 'brief',

  components: {
    ProductionBrief
  },

  computed: {
    ...mapGetters(['currentProduction', 'isCurrentUserClient'])
  },

  mounted() {
    if (this.isCurrentUserClient) {
      this.$router.push({ name: 'not-found' })
      return
    }
  },

  head() {
    return {
      title: `${this.currentProduction?.name} | ${this.$t('productions.brief.title')} - Kitsu`
    }
  }
}
</script>

<style lang="scss" scoped>
.fixed-page {
  display: flex;
}

.wrapper {
  margin-top: 0;
  overflow-y: scroll;
  padding: 2em;
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
