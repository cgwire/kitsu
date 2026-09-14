<template>
  <div class="brief fixed-page">
    <div class="wrapper">
      <production-brief />
    </div>
  </div>
</template>

<script setup>
// Imports
// --------------------------------------------------------------------------
import { useHead } from '@unhead/vue'
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

import ProductionBrief from '@/components/pages/production/ProductionBrief.vue'

const { t } = useI18n()
const router = useRouter()
const store = useStore()

// Computed
// --------------------------------------------------------------------------
const currentProduction = computed(() => store.getters.currentProduction)
const isCurrentUserClient = computed(() => store.getters.isCurrentUserClient)

// Lifecycle
// --------------------------------------------------------------------------
onMounted(() => {
  if (isCurrentUserClient.value) router.push({ name: 'not-found' })
})

// Head
// --------------------------------------------------------------------------
useHead({
  title: computed(
    () =>
      `${currentProduction.value?.name} | ${t('productions.brief.title')} - Kitsu`
  )
})
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
