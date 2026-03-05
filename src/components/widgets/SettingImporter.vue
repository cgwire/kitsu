<template>
  <div>
    <div
      class="project-import flexcolumn"
      v-if="availableProductions.length > 0"
    >
      <combobox-production
        class="flexrow-item"
        :label="$t('settings.import_from_production')"
        :production-list="availableProductions"
        :with-margin="false"
        v-model="importProductionId"
      />
      <button-simple
        class="flexrow-item mt05"
        :disabled="!importProductionId"
        :is-loading="loadingImport"
        :text="$t('main.import')"
        @click="$emit('import-from-production', importProductionId)"
      />
    </div>
    <div>
      <p
        :class="{
          label: true,
          mt2: availableProductions.length > 0
        }"
      >
        {{ $t('settings.available_items') }}
      </p>
      <div class="import-list" v-if="items.length > 0">
        <div
          :key="`unlisted-item-${item.id}`"
          class="flexrow item-to-add mb05"
          @click="$emit('import-item', item)"
          v-for="item in items"
        >
          <slot name="item-line" :item="item" />
        </div>
      </div>
      <p class="infos mt05">
        {{ $t('settings.no_more_available_items') }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useStore } from 'vuex'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ComboboxProduction from '@/components/widgets/ComboboxProduction.vue'

const store = useStore()

defineProps({
  items: {
    type: Array,
    default: () => []
  },
  loadingImport: {
    type: Boolean,
    default: true
  }
})

defineEmits(['import-from-production', 'import-item'])

const importProductionId = ref(null)

const currentProduction = computed(() => store.getters.currentProduction)
const openProductions = computed(() => store.getters.openProductions)

const availableProductions = computed(() => {
  return openProductions.value.filter(
    production => production.id !== currentProduction.value.id
  )
})

const sizeStyle = computed(() => {
  return {
    width: 'auto'
  }
})

onMounted(() => {
  if (availableProductions.value.length > 0) {
    importProductionId.value = availableProductions.value[0].id
  }
})
</script>

<style lang="scss" scoped>
.import-list {
  border: 1px solid var(--border);
  border-radius: 5px;
  cursor: pointer;
  flex: 1;
  margin-top: 0.5em;
  padding: 0.5em;
  overflow-y: auto;
}

.label {
  color: #999;
  font-size: 0.8em;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 0;

  .dark & {
    color: var(--text);
  }
}

.infos {
  font-style: italic;
}
</style>
