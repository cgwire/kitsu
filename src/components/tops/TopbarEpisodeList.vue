<template>
  <div
    class="topbar-menuitem"
    :class="{
      'topbar-menuitem-open': showEpisodeList
    }"
  >
    <div class="episode-menu">
      <div
        class="flexrow unselectable"
        role="button"
        tabindex="0"
        @click="toggleEpisodeList"
        @keydown.enter.prevent="toggleEpisodeList"
        @keydown.space.prevent="toggleEpisodeList"
      >
        <div class="selected-production-line flexrow-item">
          {{ episodeLabel }}
        </div>
        <chevron-down-icon class="down-icon flexrow-item" />
      </div>
      <div class="select-input" ref="select" v-if="showEpisodeList">
        <div v-for="(group, index) in episodeGroups" :key="`group-${index}`">
          <div
            class="group-name"
            v-if="showAllMode && group.name && group.name !== 'running'"
          >
            {{ $t('episodes.status.' + group.name) }}
          </div>
          <template v-if="showAllMode || ['', 'running'].includes(group.name)">
            <div
              :key="optionKey(episode)"
              class="episode-line"
              @click="showEpisodeList = false"
              v-for="episode in group.episodeList"
            >
              <router-link :to="getEpisodePath(episode)">
                {{ episode.label }}
              </router-link>
            </div>
          </template>
        </div>
        <div
          class="group-name episode-line has-text-centered more-button"
          role="button"
          tabindex="0"
          @click="showAllMode = true"
          @keydown.enter.prevent="showAllMode = true"
          @keydown.space.prevent="showAllMode = true"
          v-if="!showAllMode"
        >
          +
        </div>
        <div
          class="group-name episode-line has-text-centered more-button"
          role="button"
          tabindex="0"
          @click="showAllMode = false"
          @keydown.enter.prevent="showAllMode = false"
          @keydown.space.prevent="showAllMode = false"
          v-else
        >
          -
        </div>
      </div>
    </div>
    <combobox-mask :displayed="showEpisodeList" @click="toggleEpisodeList" />
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

const route = useRoute()
const store = useStore()

// Props
// --------------------------------------------------------------------------
const props = defineProps({
  episodeGroups: { type: Array, required: true },
  section: { type: String, default: '' },
  episodeId: { type: String, default: '' }
})

// State
// --------------------------------------------------------------------------
const selectRef = useTemplateRef('select')
const showAllMode = ref(false)
const showEpisodeList = ref(false)
let lastScrollPosition = 0

// Computed
// --------------------------------------------------------------------------
const currentProduction = computed(() => store.getters.currentProduction)

const episodeLabel = computed(() => {
  const options = props.episodeGroups.flatMap(group =>
    group.episodeList.filter(option => option.value === props.episodeId)
  )
  // Several options can share a value (All assets / All shots): the
  // route query tells them apart.
  const forEntity = route.query.for_entity
  const option =
    options.find(o => o.query?.for_entity === forEntity) ||
    options.find(o => !o.query) ||
    options[0]
  return option ? option.label : ''
})

// Functions
// --------------------------------------------------------------------------
const getEpisodePath = episode => {
  const path = getProductionPath(
    currentProduction.value,
    props.section,
    episode.value,
    route.params.plugin_id
  )
  if (props.section === 'schedule') {
    // The production schedule keeps its view state (mode, version, ...) in
    // the URL query.
    path.query = { ...route.query }
  }
  if (episode.query) {
    path.query = { ...path.query, ...episode.query }
  }
  return path
}

const optionKey = episode =>
  episode.query
    ? `${episode.value}-${Object.values(episode.query).join('-')}`
    : episode.value

const toggleEpisodeList = async () => {
  if (showEpisodeList.value) {
    lastScrollPosition = selectRef.value.scrollTop
  }
  showEpisodeList.value = !showEpisodeList.value
  if (showEpisodeList.value) {
    await nextTick()
    selectRef.value.scrollTo({ top: lastScrollPosition, left: 0 })
  }
}
</script>

<style lang="scss" scoped>
.dark {
  .select-input,
  .episode-line {
    background: $black;
    border-color: $dark-grey;
  }

  .select-input,
  .topbar-menuitem {
    border: 1px solid $dark-grey-light;
  }

  .episode-line {
    a {
      color: $white;
    }
  }
}

.episode-menu {
  cursor: pointer;
}

.episode-line {
  background: $white;
  cursor: pointer;
  margin: 0;
  border-radius: 5px;

  a {
    color: $black;
    padding: 0.5em;
    padding-right: 0.8em;
    display: inline-block;
    width: 100%;
  }

  &:hover {
    background: var(--background-hover);
  }
}

.group-name {
  color: $grey;
  font-size: 0.9em;
  margin-top: 1em;
  padding-left: 0.5em;
  text-transform: uppercase;

  &:first-child {
    margin-top: 0.5em;
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
  position: absolute;
  border: 1px solid $light-grey-light;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  text-align: left;
  margin-left: -11px;
  max-height: min(80vh, 600px);
  min-width: 120px;
  overflow-y: auto;
  padding: 5px;
  padding-bottom: 10px;
  top: 49px;
  z-index: 300;
}

.topbar-menuitem {
  height: 42px;
  border: 1px solid $light-grey-light;
  padding-top: 7px;
  padding-left: 10px;
  padding-right: 10px;
  border-radius: 10px;

  &.topbar-menuitem-open {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
}

.more-button {
  margin-top: 0;
}
</style>
