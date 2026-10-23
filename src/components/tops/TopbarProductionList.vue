<template>
  <div
    class="topbar-menuitem"
    :class="{
      'topbar-menuitem-open': showProductionList
    }"
  >
    <div class="production-menu">
      <div
        class="flexrow"
        role="button"
        tabindex="0"
        @click="toggleProductionList"
        @keydown.enter.prevent="toggleProductionList"
        @keydown.space.prevent="toggleProductionList"
      >
        <div class="selected-production-line flexrow-item unselectable">
          <production-name
            :production="currentProduction"
            :no-link="true"
            :size="25"
            v-if="currentProduction"
          />
        </div>
        <chevron-down-icon class="down-icon flexrow-item" />
      </div>
      <div class="select-input" ref="select" v-show="showProductionList">
        <div
          class="production-line"
          :class="{
            selected: production.id === currentProduction.id
          }"
          :key="production.id"
          @click="showProductionList = false"
          v-for="production in productionList"
        >
          <router-link :to="productionPath(production)">
            <span class="name-wrapper">
              <production-name
                class="link"
                :size="25"
                :no-link="true"
                :production="production"
              />
            </span>
          </router-link>
        </div>
      </div>
    </div>
    <combobox-mask
      :displayed="showProductionList"
      @click="toggleProductionList"
    />
  </div>
</template>

<script setup>
// Imports
// --------------------------------------------------------------------------
import { ChevronDownIcon } from 'lucide-vue-next'
import { computed, nextTick, ref, useTemplateRef } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

import { getProductionPath } from '@/lib/path'

import ComboboxMask from '@/components/widgets/ComboboxMask.vue'
import ProductionName from '@/components/widgets/ProductionName.vue'

const route = useRoute()
const store = useStore()

// Props
// --------------------------------------------------------------------------
const props = defineProps({
  productionList: { type: Array, required: true },
  section: { type: String, default: 'assets' },
  episodeId: { type: String, default: '' }
})

// State
// --------------------------------------------------------------------------
const selectRef = useTemplateRef('select')
const showProductionList = ref(false)
let lastScrollPosition = 0

// Computed
// --------------------------------------------------------------------------
const currentProduction = computed(() => store.getters.currentProduction)

// Functions
// --------------------------------------------------------------------------
const toggleProductionList = async () => {
  if (showProductionList.value) {
    lastScrollPosition = selectRef.value.scrollTop
  }
  await nextTick()
  showProductionList.value = !showProductionList.value
  if (showProductionList.value) {
    selectRef.value.scrollTo({ top: lastScrollPosition, left: 0 })
  }
}

const productionPath = production =>
  getProductionPath(
    production,
    props.section,
    props.episodeId || 'all',
    route.params.plugin_id
  )
</script>

<style lang="scss" scoped>
.dark {
  .select-input,
  .selected-production-line,
  .production-line {
    background: $black;
    border-color: $dark-grey;
  }

  .select-input,
  .topbar-menuitem {
    border: 1px solid $dark-grey-light;
  }

  .production-line {
    .link {
      color: $white;
    }
  }
}

.selected-production-line {
  cursor: pointer;
  flex: 1;
  min-width: 150px;
  padding: 0.4em;
}

.production-line {
  background: $white;
  cursor: pointer;
  margin: 0;
  margin-left: 3px;
  margin-right: 3px;

  // The padding belongs to the link: on the line it would close the list
  // without navigating.
  a {
    display: block;
    padding: 0 0.2em;
  }

  &:first-child {
    margin-top: 7px;
  }

  .name-wrapper {
    border-radius: 5px;
    display: flex;
    padding: 0.5em;
    padding-right: 2em;
  }

  .link {
    color: $black;
  }

  &:hover {
    .name-wrapper {
      background: var(--background-hover);
    }
  }
}

.down-icon {
  cursor: pointer;
  color: $green;
  min-width: 15px;
  margin-right: 0.4em;
  width: 15px;
}

.select-input {
  background: $white;
  border: 1px solid $light-grey-light;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  margin-left: -6px;
  max-height: min(80vh, 600px);
  overflow-y: auto;
  position: absolute;
  top: 48px;
  min-width: 100px;
  z-index: 300;
}

.production-line:last-child {
  margin-bottom: 10px;
}

.production-menu {
  cursor: pointer;
}

.topbar-menuitem {
  border: 1px solid $light-grey-light;
  padding-left: 5px;
  padding-right: 5px;
  border-radius: 10px;

  &.topbar-menuitem-open {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
}

@media screen and (max-width: 768px) {
  .selected-production-line {
    min-width: auto;

    :deep(.avatar-name) {
      display: none;
    }
  }
}
</style>
