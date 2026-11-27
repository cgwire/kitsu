<template>
  <div class="table-metadata-selector-host" ref="hostRef" aria-hidden="true" />
  <teleport to="#theme-popups">
    <template v-if="isOpen">
      <div class="column-menu__mask" aria-hidden="true" @click="closeMenu" />
      <div
        ref="menuRef"
        class="column-menu"
        :aria-labelledby="titleId"
        aria-modal="true"
        role="dialog"
        :style="menuStyle"
        tabindex="-1"
        @keydown="onMenuKeyDown"
      >
        <div class="column-menu__columns" tabindex="-1">
          <h2 class="column-menu__title" :id="titleId">
            {{ $t('main.column_visibility') }}
          </h2>
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
              @choose="onRowHeld"
              @end="onDragEnd"
              @start="onRowDragged"
              @unchoose="onRowReleased"
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
        <button
          class="column-menu__add"
          type="button"
          @click="onAddClicked"
          v-if="isAddAllowed"
        >
          <plus-icon class="column-menu__add-icon" :size="14" />
          {{ $t('productions.metadata.title') }}
        </button>
      </div>
    </template>
  </teleport>
</template>

<script setup>
import { GripVerticalIcon, PlusIcon } from 'lucide-vue-next'
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useId,
  watch
} from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import draggable from 'vuedraggable'

import { useDraggableRebuild } from '@/composables/draggableRebuild'
import { undoRedoCommand } from '@/lib/keyboard'
import { getOwnValue } from '@/lib/models'

const MODIFIER_KEYS = ['Alt', 'Control', 'Meta', 'Shift']
const SIDE_PAD = 8
const MENU_MAX_HEIGHT = 400
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
  // Offers a new metadata column, which the list then asks the page for.
  isAddAllowed: { type: Boolean, default: false },
  isOpen: { type: Boolean, default: false },
  // Production the displayed columns belong to. Left unset by
  // cross-production consumers (ProductionList.vue), which keep the
  // global role.
  productionId: { type: String, default: null }
})

const emit = defineEmits([
  'add-metadata',
  'update:model-value',
  'update:is-open'
])

// State

const hostRef = ref(null)
const menuRef = ref(null)
const menuStyle = ref({})
const titleId = useId()
// Where the focus was when the menu opened, given back when it closes.
let opener = null
const sortedMetadataDescriptors = ref([])

// Computed

const FIELD_TO_NAME = computed(() => ({
  difficulty: t('tasks.fields.difficulty'),
  doneDate: t('tasks.fields.done_date'),
  dueDate: t('tasks.fields.due_date'),
  duration: t('tasks.fields.duration'),
  estimation: t('main.estimation'),
  fps: t('main.fps'),
  frameIn: t('main.frame_in'),
  frameOut: t('main.frame_out'),
  frames: t('main.frames'),
  lastCommentDate: t('tasks.fields.last_comment_date'),
  maxRetakes: t('shots.fields.max_retakes'),
  readyFor: t('assets.fields.ready_for'),
  realEndDate: t('tasks.fields.real_end_date'),
  realStartDate: t('tasks.fields.real_start_date'),
  resolution: t('shots.fields.resolution'),
  retakeCount: t('tasks.fields.retake_count'),
  startDate: t('tasks.fields.start_date'),
  stdby: t('breakdown.fields.standby'),
  timeSpent: t('main.timeSpent')
}))

const isCurrentUserManager = computed(() =>
  props.productionId
    ? store.getters.isCurrentUserAdmin ||
      store.getters.currentUserRoleForProduction(props.productionId) ===
        'manager'
    : store.getters.isCurrentUserManager
)

const filteredFixedColumns = computed(() =>
  Object.keys(props.modelValue)
    .filter(
      name =>
        getOwnValue(FIELD_TO_NAME.value, name) &&
        !getOwnValue(props.exclude, name)
    )
    .map(name => ({ field_name: name, name: FIELD_TO_NAME.value[name] }))
)

const filteredMetadataDescriptors = computed(() =>
  props.descriptors
    .filter(descriptor => !getOwnValue(props.exclude, descriptor.field_name))
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
    menuStyle.value = {
      top: '5rem',
      right: `${SIDE_PAD}px`,
      maxHeight: `${MENU_MAX_HEIGHT}px`
    }
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
  // The menu scrolls its columns within this height: past the window bottom,
  // its last entries could never be scrolled into view.
  const maxHeightPx = Math.min(
    MENU_MAX_HEIGHT,
    window.innerHeight - SIDE_PAD - topPx
  )
  menuStyle.value = {
    top: `${topPx}px`,
    right: `${rightPx}px`,
    maxHeight: `${maxHeightPx}px`
  }
}

const closeMenu = () => emit('update:is-open', false)

const getEntries = () =>
  Array.from(menuRef.value?.querySelectorAll('input, button') ?? [])

const giveFocusBack = () => {
  if (opener?.isConnected) opener.focus()
}

// The menu moves the focus round its entries itself, from anywhere in the
// page while it is open: Safari leaves checkboxes out of Tab by default, the
// menu comes last in the page, before the browser bar, and the player of the
// side panel would take Shift+Tab to its comment box. A click between the
// entries, or a Tab from the browser bar, leaves the focus off them: Tab then
// goes to the first one and Shift+Tab to the last one.
const onKeyTab = event => {
  if (event.key === 'Tab' && props.isOpen) {
    const entries = getEntries()
    const index = entries.indexOf(document.activeElement)
    const next = event.shiftKey
      ? (entries[index - 1] ?? entries[entries.length - 1])
      : (entries[index + 1] ?? entries[0])
    if (next) {
      event.preventDefault()
      event.stopPropagation()
      next.focus()
    }
  }
}

// The page under the mask keeps out of the keys of the menu, but for a
// modifier alone, which the list follows for its Shift range selection: the
// player of the side panel takes Space and the left and right arrows, and the
// list Alt+arrows. The menu keeps from the browser what they kept from it:
// Alt+Left and Alt+Right go back or forward in the history, and undo and
// redo, whose Chromium stack belongs to the page, would edit a text field
// under the mask. Its own Escape and Tab listeners, on the window, run first.
const onMenuKeyDown = event => {
  if (!MODIFIER_KEYS.includes(event.key)) {
    event.stopPropagation()
    const isHistoryMove =
      event.altKey && ['ArrowLeft', 'ArrowRight'].includes(event.key)
    if (isHistoryMove || undoRedoCommand(event)) {
      event.preventDefault()
    }
  }
}

const onAddClicked = () => {
  // The modal gives the focus back to where it was when it opened, and this
  // button goes with the menu.
  giveFocusBack()
  closeMenu()
  emit('add-metadata')
}

const onKeyEscape = event => {
  if (event.key === 'Escape' && props.isOpen) {
    // Tells isFreeEscape the key is taken: the menu is closed by the time
    // the page listener runs.
    event.preventDefault()
    closeMenu()
  }
}

const setMetadataDisplayValue = (metadataName, isSelected) => {
  const headers = { ...props.modelValue, [metadataName]: isSelected }
  localStorage.setItem(
    `metadataDisplayHeaders:${props.namespace}`,
    JSON.stringify(headers)
  )
  emit('update:model-value', headers)
}

const buildSortedMetadataDescriptors = () => {
  sortedMetadataDescriptors.value = [...filteredMetadataDescriptors.value]
}

const {
  rebuild: resetSortedMetadataDescriptors,
  onRowHeld,
  onRowDragged,
  onRowReleased
} = useDraggableRebuild(buildSortedMetadataDescriptors)

const saveOrder = () => {
  const ordered = sortedMetadataDescriptors.value
  if (props.externalReorder) return props.externalReorder(ordered)
  // A row held during a reload may be a descriptor deleted meanwhile: Zou
  // refuses the whole order for a single unknown descriptor.
  const knownIds = new Set(props.descriptors.map(descriptor => descriptor.id))
  const descriptorIds = ordered
    .map(descriptor => descriptor.id)
    .filter(id => id && knownIds.has(id))
  const entityType = props.descriptors.find(d => d.entity_type)?.entity_type
  if (!entityType || descriptorIds.length === 0) return
  return store
    .dispatch('reorderMetadataDescriptors', { entityType, descriptorIds })
    .catch(err => {
      console.error('Failed to reorder metadata descriptors:', err)
    })
}

// The answer moves the descriptors in place: when it leaves their order as
// it was, nothing else applies a rebuild held during the drag.
const onDragEnd = async () => {
  try {
    await saveOrder()
  } finally {
    resetSortedMetadataDescriptors()
  }
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
  if (getOwnValue(initialHeaders, descriptor.field_name) === undefined) {
    initialHeaders[descriptor.field_name] = true
  }
})
emit('update:model-value', initialHeaders)
buildSortedMetadataDescriptors()

// Watchers

// The lists pass a new exclude object on each of their renders, which
// recomputes the descriptors: a rebuild then would put the stored order back
// over a drop not saved yet.
watch(filteredMetadataDescriptors, (descriptors, previousDescriptors) => {
  const isSameOrder =
    descriptors.length === previousDescriptors.length &&
    descriptors.every(
      (descriptor, index) => descriptor === previousDescriptors[index]
    )
  if (!isSameOrder) resetSortedMetadataDescriptors()
})

watch(
  () => props.isOpen,
  isOpen => {
    if (isOpen) {
      opener = document.activeElement
      nextTick(() => {
        positionMenu()
        getEntries()[0]?.focus()
      })
    } else {
      // A click out of the menu leaves the focus where it went.
      if (menuRef.value?.contains(document.activeElement)) giveFocusBack()
      // An Escape can close the menu during a press: its list then goes
      // without reporting the release.
      onRowReleased()
    }
  }
)

// Lifecycle

onMounted(() => {
  if (props.isOpen) nextTick(positionMenu)
  window.addEventListener('resize', positionMenu)
  window.addEventListener('scroll', positionMenu, true)
  window.addEventListener('keydown', onKeyEscape, true)
  window.addEventListener('keydown', onKeyTab, true)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', positionMenu)
  window.removeEventListener('scroll', positionMenu, true)
  window.removeEventListener('keydown', onKeyEscape, true)
  window.removeEventListener('keydown', onKeyTab, true)
})
</script>

<style lang="scss" scoped>
.column-menu {
  background: var(--background);
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  box-shadow: 0 2px 6px var(--box-shadow);
  color: var(--text);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: fixed;
  text-align: left;
  width: 200px;
  z-index: 9999;

  // A click between its entries focuses the menu or the box of its columns,
  // a key never does.
  &:focus,
  .column-menu__columns:focus {
    outline: none;
  }

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

.column-menu__add {
  align-items: center;
  background: var(--background);
  border: 0;
  border-top: 1px solid var(--border);
  color: var(--text);
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  font: inherit;
  gap: 0.6em;
  padding: 0.8em;
  text-align: left;
  width: 100%;

  &:hover {
    background: var(--background-hover);
  }

  &:focus-visible {
    outline: 2px solid $green;
    outline-offset: -2px;
  }
}

.column-menu__add-icon {
  flex-shrink: 0;
  opacity: 0.7;
}

// The new column button stays under the columns, out of their scroll. The box
// takes the focus of a click on its title, so that the keys scroll it.
.column-menu__columns {
  min-height: 0;
  overflow-y: auto;
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
