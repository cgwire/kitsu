<template>
  <div
    class="topbar-menuitem"
    :class="{
      'topbar-menuitem-open': showSectionList
    }"
  >
    <div class="section-menu">
      <div
        class="flexrow unselectable"
        role="button"
        tabindex="0"
        @click="toggleSectionList"
        @keydown.enter.prevent="toggleSectionList"
        @keydown.space.prevent="toggleSectionList"
      >
        <div
          class="selected-section-line flexrow-item flexrow"
          v-if="currentSection"
        >
          <icon
            class="section-icon"
            :name="currentSection.icon"
            :size="20"
            :stroke-width="1.5"
            v-if="currentSection.type === 'plugin'"
          />
          <kitsu-icon
            class="section-icon"
            :name="currentSection.value"
            v-else-if="currentSection.value !== 'budget'"
          />
          <hand-coins-icon class="section-icon" :stroke-width="1.5" v-else />
          <span class="section-label">{{ currentSection.label }}</span>
        </div>
        <chevron-down-icon class="down-icon flexrow-item" />
      </div>
      <div class="select-input" v-if="showSectionList">
        <div
          :key="`${section.value}-${index}`"
          class="section-line"
          @click="selectSection(section)"
          v-for="(section, index) in sectionList"
        >
          <router-link
            class="flexrow"
            :to="getSectionPath(section)"
            v-if="section.type === 'plugin'"
          >
            <icon
              class="section-icon"
              :name="section.icon"
              :size="20"
              :stroke-width="1.5"
            />
            <span class="flexrow-item">{{ section.label }}</span>
          </router-link>
          <router-link
            class="flexrow"
            :to="getSectionPath(section)"
            v-else-if="section.value !== 'separator'"
          >
            <kitsu-icon
              class="section-icon"
              :name="section.value"
              v-if="section.value !== 'budget'"
            />
            <hand-coins-icon class="section-icon" :stroke-width="1.5" v-else />
            <span class="flexrow-item">
              {{ section.label }}
            </span>
          </router-link>
          <hr v-else />
        </div>
      </div>
    </div>
    <combobox-mask :displayed="showSectionList" @click="toggleSectionList" />
  </div>
</template>

<script setup>
// Imports
// --------------------------------------------------------------------------
import { ChevronDownIcon, HandCoinsIcon } from 'lucide-vue-next'
import { computed, defineAsyncComponent, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

import { getProductionPath } from '@/lib/path'

import ComboboxMask from '@/components/widgets/ComboboxMask.vue'
import KitsuIcon from '@/components/widgets/KitsuIcon.vue'

const Icon = defineAsyncComponent(() => import('@/components/widgets/Icon.vue'))

const route = useRoute()
const store = useStore()

// Props
// --------------------------------------------------------------------------
const props = defineProps({
  sectionList: { type: Array, required: true },
  section: { type: String, default: 'assets' },
  episodeId: { type: String, default: '' }
})

// State
// --------------------------------------------------------------------------
const localSection = ref(null)
const showSectionList = ref(false)

// Computed
// --------------------------------------------------------------------------
const currentProduction = computed(() => store.getters.currentProduction)

const currentSection = computed(() =>
  props.sectionList.find(section => section.value === localSection.value)
)

// Functions
// --------------------------------------------------------------------------
const selectSection = section => {
  if (section.value !== 'separator') {
    localSection.value = section.value
    showSectionList.value = false
  }
}

const toggleSectionList = () => {
  showSectionList.value = !showSectionList.value
}

const getSectionPath = section => {
  const result = getProductionPath(
    currentProduction.value,
    section.value,
    props.episodeId,
    section.plugin_id
  )
  // The all pseudo-episode is typed on the playlists page: coming from
  // the shot side, stay on the shot side.
  const isShotContext =
    props.section === 'shots' || route.query.for_entity === 'shot'
  if (
    section.value === 'playlists' &&
    props.episodeId === 'all' &&
    isShotContext
  ) {
    result.query = { ...result.query, for_entity: 'shot' }
  }
  return result
}

// Watchers
// --------------------------------------------------------------------------
watch(
  () => props.section,
  section => {
    localSection.value = section
  }
)

watch(localSection, section => {
  store.dispatch('setCurrentSection', section)
  if (['assets', 'episodes', 'sequences', 'shots', 'edits'].includes(section)) {
    store.dispatch('setLastProductionScreen', section)
  }
})

// Lifecycle
// --------------------------------------------------------------------------
onMounted(() => {
  localSection.value = props.section
})
</script>

<style lang="scss" scoped>
.dark {
  .select-input,
  .selected-section-line,
  .section-line {
    background: $black;
    border-color: $dark-grey;
  }

  .select-input,
  .topbar-menuitem {
    border: 1px solid $dark-grey-light;
  }

  .section-line {
    a {
      color: $white;
    }
  }
}

.selected-section-line {
  background: $white;
  cursor: pointer;
  flex: 1;
  min-width: 100px;
  padding: 0.4em;
  text-align: left;
}

.section-menu {
  cursor: pointer;
}

.section-line {
  background: $white;
  cursor: pointer;
  margin: 0;
  border-radius: 5px;

  a {
    color: $black;
    padding: 0.2em 0.4em;
    padding-right: 0.8em;
    width: 100%;
  }

  &:hover {
    background: var(--background-hover);
  }
}

.down-icon {
  width: 15px;
  min-width: 15px;
  margin-right: 0.4em;
  color: $green;
  cursor: pointer;
}

.select-input {
  background: $white;
  border: 1px solid $light-grey-light;
  border-top-right-radius: 5px;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  margin-left: -6px;
  max-height: min(80vh, 600px);
  min-width: 200px;
  overflow-y: auto;
  padding: 5px;
  padding-bottom: 10px;
  position: absolute;
  text-align: left;
  top: 49px;
  z-index: 300;
}

hr {
  margin: 8px 8px 8px 6px;
  height: 1px;
  background: var(--border-alt);
}

.topbar-menuitem {
  height: 40px;
  padding-top: 2px;
  border: 1px solid $light-grey-light;
  padding-left: 5px;
  padding-right: 5px;
  border-radius: 10px;

  &.topbar-menuitem-open {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
}

.section-icon {
  cursor: pointer;
  margin-right: 0.8em;
  min-width: 20px;
  width: 20px;
}

svg.section-icon {
  color: #515151;
}

.dark svg.section-icon {
  color: #ffffff;
}

@media screen and (max-width: 768px) {
  .selected-section-line {
    min-width: auto;

    .section-icon {
      margin-right: 0;
    }

    .section-label {
      display: none;
    }
  }
}
</style>
