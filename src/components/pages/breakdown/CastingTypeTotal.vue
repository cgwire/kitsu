<template>
  <div class="casting-type-total">
    <span>{{ $t('breakdown.nb_assets', { count: assets }) }}</span>
    -
    <span>{{ $t('breakdown.nb_occurrences', { count: occurrences }) }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const props = defineProps({
  assetType: { type: String, default: '' },
  entities: { type: Array, default: () => [] }
})

// Read from the store here, not in the page: a casting change then renders
// this total and its line, not the page and its whole list.
const links = computed(() =>
  props.entities
    .flatMap(entity => store.getters.castingByType[entity.id] || [])
    .filter(typeGroup => typeGroup[0]?.asset_type_name === props.assetType)
    .flat()
)

const assets = computed(
  () => new Set(links.value.map(link => link.asset_id)).size
)

const occurrences = computed(() =>
  links.value.reduce((total, link) => total + link.nb_occurences, 0)
)
</script>

<style lang="scss" scoped>
.casting-type-total {
  color: var(--text-alt);
  font-size: 0.9em;
  font-weight: normal;
  letter-spacing: 0;
  text-transform: none;
}
</style>
