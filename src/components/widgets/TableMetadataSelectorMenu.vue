<template>
  <div class="table-metadata-selector-host" ref="hostRef" aria-hidden="true" />
  <teleport to=".theme">
    <template v-if="isOpen">
      <div class="column-menu__mask" aria-hidden="true" @click="closeMenu" />
      <div class="column-menu" :style="menuStyle">
        <h2 class="column-menu__title">{{ $t('main.column_visibility') }}</h2>
        <ul>
          <li
            class="immutable-column"
            :key="descriptor.field_name"
            v-for="descriptor in filteredFixedColumns"
          >
            <label class="checkbox">
              <input
                type="checkbox"
                :checked="isColumnVisible(descriptor.field_name)"
                @change="
                  setMetadataDisplayValue(
                    descriptor.field_name,
                    $event.target.checked
                  )
                "
              />
              {{ descriptor.name }}
            </label>
          </li>

          <draggable
            v-if="isCurrentUserManager"
            v-model="sortedMetadataDescriptors"
            item-key="field_name"
            handle=".drag-handle"
            @end="onDragEnd"
          >
            <template #item="{ element: descriptor }">
              <li>
                <div class="flexrow">
                  <span class="drag-handle">
                    <grip-vertical-icon />
                  </span>
                  <label class="checkbox">
                    <input
                      type="checkbox"
                      :checked="isColumnVisible(descriptor.field_name)"
                      @change="
                        setMetadataDisplayValue(
                          descriptor.field_name,
                          $event.target.checked
                        )
                      "
                    />
                    {{ descriptor.name }}
                  </label>
                </div>
              </li>
            </template>
          </draggable>
          <template v-else>
            <li
              :key="descriptor.field_name"
              v-for="descriptor in filteredMetadataDescriptors"
            >
              <label class="checkbox">
                <input
                  type="checkbox"
                  :checked="isColumnVisible(descriptor.field_name)"
                  @change="
                    setMetadataDisplayValue(
                      descriptor.field_name,
                      $event.target.checked
                    )
                  "
                />
                {{ descriptor.name }}
              </label>
            </li>
          </template>
        </ul>
      </div>
    </template>
  </teleport>
</template>

<script setup>
import { GripVerticalIcon } from 'lucide-vue-next'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import draggable from 'vuedraggable'

const SIDE_PAD = 8
const MENU_WIDTH = 200

const { t } = useI18n()
const store = useStore()

// Props / Emits

const props = defineProps({
  descriptors: { type: Array, required: true },
  exclude: { type: Object, default: () => ({}) },
  modelValue: { type: Object, required: true },
  namespace: { type: String, required: true },
  externalReorder: { type: Function, default: null },
  isOpen: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'update:isOpen'])

// Constants (require t())

const FIELD_TO_NAME = {
  estimation: t('main.estimation'),
  fps: t('main.fps'),
  frameIn: t('main.frame_in'),
  frameOut: t('main.frame_out'),
  frames: t('main.frames'),
  maxRetakes: t('shots.fields.max_retakes'),
  readyFor: t('assets.fields.ready_for'),
  resolution: t('shots.fields.resolution'),
  stdby: t('breakdown.fields.standby'),
  timeSpent: t('main.timeSpent')
}

// State

const hostRef = ref(null)
const menuStyle = ref({})
const sortedMetadataDescriptors = ref([])

// Computed

const isCurrentUserManager = computed(() => store.getters.isCurrentUserManager)

const filteredFixedColumns = computed(() =>
  Object.keys(props.modelValue)
    .filter(name => FIELD_TO_NAME[name] && !props.exclude[name])
    .map(name => ({ field_name: name, name: FIELD_TO_NAME[name] }))
)

const filteredMetadataDescriptors = computed(() =>
  props.descriptors
    .filter(descriptor => !props.exclude[descriptor.field_name])
    .sort((a, b) => {
      const positionDiff = (a.position ?? 1000) - (b.position ?? 1000)
      if (positionDiff !== 0) return positionDiff
      return (a.name || '').localeCompare(b.name || '')
    })
)

// Functions

const isColumnVisible = name => props.modelValue?.[name] !== false

const positionMenu = () => {
  if (!props.isOpen) return
  if (!hostRef.value) {
    menuStyle.value = { top: '5rem', right: `${SIDE_PAD}px` }
    return
  }
  const rect = hostRef.value.getBoundingClientRect()
  const topOffset = props.namespace === 'breakdown' ? 30 : 40
  const rightPx = Math.min(
    Math.max(SIDE_PAD, window.innerWidth - rect.right),
    window.innerWidth - SIDE_PAD - MENU_WIDTH
  )
  const topPx = Math.min(
    Math.max(SIDE_PAD, rect.top + topOffset),
    window.innerHeight - SIDE_PAD - 64
  )
  menuStyle.value = { top: `${topPx}px`, right: `${rightPx}px` }
}

const closeMenu = () => emit('update:isOpen', false)

const onKeyEscape = event => {
  if (event.key === 'Escape' && props.isOpen) closeMenu()
}

const setMetadataDisplayValue = (metadataName, isSelected) => {
  const headers = { ...props.modelValue, [metadataName]: isSelected }
  localStorage.setItem(
    `metadataDisplayHeaders:${props.namespace}`,
    JSON.stringify(headers)
  )
  emit('update:modelValue', headers)
}

const onDragEnd = () => {
  const ordered = sortedMetadataDescriptors.value
  if (props.externalReorder) {
    props.externalReorder(ordered)
    return
  }
  const descriptorIds = ordered.filter(d => d.id).map(d => d.id)
  const entityType = props.descriptors.find(d => d.entity_type)?.entity_type
  if (!entityType || descriptorIds.length === 0) return
  store
    .dispatch('reorderMetadataDescriptors', { entityType, descriptorIds })
    .catch(err => {
      console.error('Failed to reorder metadata descriptors:', err)
    })
}

// Initialization: merge defaults from descriptors with localStorage overrides
// then push the result up so the parent v-model reflects what is actually
// displayed.

const stored = localStorage.getItem(`metadataDisplayHeaders:${props.namespace}`)
const initialHeaders = {
  ...props.modelValue,
  ...(stored ? JSON.parse(stored) : {})
}
props.descriptors.forEach(descriptor => {
  if (initialHeaders[descriptor.field_name] === undefined) {
    initialHeaders[descriptor.field_name] = true
  }
})
emit('update:modelValue', initialHeaders)
sortedMetadataDescriptors.value = [...filteredMetadataDescriptors.value]

// Watchers

watch(filteredMetadataDescriptors, newValue => {
  if (
    sortedMetadataDescriptors.value.length === 0 ||
    sortedMetadataDescriptors.value.length !== newValue.length
  ) {
    sortedMetadataDescriptors.value = [...newValue]
  }
})

watch(
  () => props.isOpen,
  isOpen => {
    if (isOpen) nextTick(positionMenu)
  }
)

// Lifecycle

onMounted(() => {
  if (props.isOpen) nextTick(positionMenu)
  window.addEventListener('resize', positionMenu)
  window.addEventListener('scroll', positionMenu, true)
  window.addEventListener('keydown', onKeyEscape, true)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', positionMenu)
  window.removeEventListener('scroll', positionMenu, true)
  window.removeEventListener('keydown', onKeyEscape, true)
})
</script>

<style lang="scss" scoped>
.column-menu {
  background: var(--background);
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  box-shadow: 0 2px 6px var(--box-shadow);
  color: var(--text);
  max-height: 400px;
  overflow: auto;
  position: fixed;
  text-align: left;
  width: 200px;
  z-index: 9999;

  .checkbox {
    color: var(--text);
    cursor: pointer;
    width: 100%;

    input {
      cursor: pointer;
    }
  }

  .column-menu__title + ul {
    margin-top: 0;
  }

  li {
    padding: 0.8em;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: var(--background-hover);
    }

    &.immutable-column {
      cursor: default;
    }

    .drag-handle {
      align-items: center;
      color: var(--text);
      cursor: grab;
      display: inline-flex;
      flex-shrink: 0;
      margin-right: 0.5em;
      opacity: 0.5;
      transition: opacity 0.2s ease;
      user-select: none;

      &:active {
        cursor: grabbing;
      }

      &:hover {
        opacity: 1;
      }

      svg {
        pointer-events: none;
      }
    }

    .flexrow {
      align-items: center;
      display: flex;
      width: 100%;
    }
  }

  ul {
    list-style-type: none;
    margin: 0;
  }
}

.column-menu__mask {
  inset: 0;
  position: fixed;
  z-index: 9998;
}

.column-menu__title {
  border-bottom: 1px solid transparent;
  color: var(--text);
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0;
  padding: 0.6em 0.6em 0 1.2em;
  text-align: left;
  text-transform: capitalize;
}

.table-metadata-selector-host {
  height: 0;
  pointer-events: none;
  position: absolute;
  right: 0;
  top: 0;
  width: 0;
}
</style>
