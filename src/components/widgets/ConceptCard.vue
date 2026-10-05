<template>
  <div
    class="concept-item"
    :class="{ compact, selected }"
    role="button"
    tabindex="0"
    @click="$emit('click', $event)"
    @keydown.enter.prevent="$emit('click', $event)"
  >
    <entity-preview
      :entity="concept"
      :height="previewSize.height"
      :width="previewSize.width"
      is-rounded-top-border
    />
    <div class="description">
      <ul class="links">
        <li
          :key="entity.id"
          class="tag"
          @click.stop
          v-for="entity in shownLinks"
        >
          <router-link :to="entityPath(entity, 'asset')">
            {{ entity.name }}
          </router-link>
        </li>
        <li class="more-links" :title="hiddenLinkNames" v-if="nbHidden > 0">
          +{{ nbHidden }}
        </li>
      </ul>
      <div class="status" v-if="hasTask">
        <span
          class="status-chip"
          :style="{
            background: `${taskStatus.color}26`,
            '--status-color': taskStatus.color
          }"
        >
          {{ taskStatus.short_name }}
        </span>
        <people-avatar
          :font-size="12"
          :is-link="false"
          :person="personMap.get(concept.created_by)"
          :size="24"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
// Imports
// --------------------------------------------------------------------------
import { computed } from 'vue'
import { useStore } from 'vuex'

import { getEntityPath } from '@/lib/path'
import assetsStore from '@/store/modules/assets'

import EntityPreview from '@/components/widgets/EntityPreview.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'

const store = useStore()

// Props / Emits
// --------------------------------------------------------------------------
const props = defineProps({
  compact: {
    type: Boolean,
    default: false
  },
  concept: {
    type: Object,
    required: true
  },
  selected: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])

// Keeps the card height stable whatever the number of links.
const MAX_LINKS = 3

// Computed
// --------------------------------------------------------------------------
const currentProduction = computed(() => store.getters.currentProduction)
const isTVShow = computed(() => store.getters.isTVShow)
const personMap = computed(() => store.getters.personMap)
const taskStatusMap = computed(() => store.getters.taskStatusMap)

// Only drives the video viewer: pictures fill the card width through CSS.
const previewSize = computed(() =>
  props.compact ? { width: 150, height: 100 } : { width: 300, height: 200 }
)

const linkedEntities = computed(() =>
  props.concept.entity_concept_links
    .map(id => assetsStore.cache.assetMap.get(id))
    .filter(Boolean)
)

const shownLinks = computed(() => linkedEntities.value.slice(0, MAX_LINKS))
const nbHidden = computed(() => linkedEntities.value.length - MAX_LINKS)
const hiddenLinkNames = computed(() =>
  linkedEntities.value
    .slice(MAX_LINKS)
    .map(entity => entity.name)
    .join(', ')
)

const hasTask = computed(() => props.concept.tasks?.length)

const taskStatus = computed(() =>
  taskStatusMap.value.get(props.concept.tasks[0].task_status_id)
)

// Functions
// --------------------------------------------------------------------------
const entityPath = (entity, section) => {
  const episodeId = isTVShow.value ? entity.episode_id || 'main' : null
  return getEntityPath(
    entity.id,
    currentProduction.value.id,
    section,
    episodeId,
    { section: 'concepts' }
  )
}
</script>

<style lang="scss" scoped>
.concept-item {
  // background-alt-2 is white in light theme, so the card stands out from
  // the page; the dark override below adds the edge dark mode relies on
  background: var(--background-alt-2);
  border: 1px solid transparent;
  border-radius: 12px;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  // the box-shadow rings below replace the square native focus outline
  outline: none;
  transition:
    transform 150ms ease-out,
    box-shadow 150ms ease-out;

  &:hover {
    box-shadow:
      0 2px 6px rgba(0, 0, 0, 0.14),
      0 6px 16px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }

  // :focus-visible keeps the ring for keyboard focus only: a mouse click
  // focuses the card too and would flash the ring on every selection.
  &:focus-visible {
    box-shadow:
      0 0 0 3px var(--background-selectable),
      0 4px 12px rgba(0, 0, 0, 0.05);
  }

  &.selected {
    box-shadow:
      0 0 0 3px var(--background-selected),
      0 4px 12px rgba(0, 0, 0, 0.05);
  }
}

.dark .concept-item {
  // solid color: an alpha border would let the preview bleed through
  border-color: #55585d;
}

// EntityPreview sizes itself for the other pages (inline picture size,
// 300px video box); here both branches fill a fixed box so every card has
// the same height. The wrapper is the EntityPreview root, so the rule
// anchors on the card: a class on the root would only reach descendants.
.concept-item :deep(.preview-wrapper) {
  border-radius: 11px 11px 0 0;
  height: 200px;
  min-height: 0;
  overflow: hidden;
  width: 100%;

  .thumbnail-picture {
    height: 100%;
    max-height: none !important;
    object-fit: cover;
    width: 100% !important;
  }
}

.description {
  display: flex;
  flex-direction: column;
  gap: 8px;
  // links row + status row + padding: fixed whatever the concept carries
  height: 78px;
  padding: 10px 12px 12px;
}

.links {
  display: flex;
  gap: 6px;
  height: 24px;
  list-style: none;
  margin: 0;
  overflow: hidden;

  .tag,
  .more-links {
    border-radius: 6px;
    font-size: 0.85em;
    height: 24px;
    line-height: 24px;
    margin: 0;
    padding: 0 8px;
  }

  .tag {
    background: var(--background-tag);
    color: var(--text);
    min-width: 0;

    a {
      color: inherit;
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &:hover {
      background: var(--background-selectable);
    }
  }

  .more-links {
    background: var(--background-tag);
    color: var(--text-alt);
    cursor: default;
  }
}

.status {
  align-items: center;
  display: flex;
  height: 24px;
  justify-content: space-between;
}

.status-chip {
  border-radius: 6px;
  color: var(--text-strong);
  font-size: 0.8em;
  font-weight: 600;
  letter-spacing: 0.5px;
  padding: 3px 8px 3px 12px;
  position: relative;
  text-transform: uppercase;

  // inset rounded rail: a border-left would square the left corners
  &::before {
    background: var(--status-color);
    border-radius: 2px;
    bottom: 4px;
    content: '';
    left: 4px;
    position: absolute;
    top: 4px;
    width: 3px;
  }
}

.compact {
  :deep(.preview-wrapper) {
    height: 100px;
  }

  .description {
    gap: 4px;
    height: 66px;
    padding: 6px 8px 8px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .concept-item {
    transition: none;

    &:hover {
      transform: none;
    }
  }
}
</style>
