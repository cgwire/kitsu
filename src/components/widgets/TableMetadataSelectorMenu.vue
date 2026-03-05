<template>
  <div
    class="column-menu"
    :style="{
      top: namespace === 'breakdown' ? '30px' : '40px'
    }"
  >
    <h2>{{ $t('main.column_visibility') }}</h2>
    <ul>
      <li
        :key="descriptor.field_name"
        class="immutable-column"
        v-for="descriptor in filteredFixedColumns"
      >
        <label class="checkbox">
          <input
            type="checkbox"
            :checked="modelValue && modelValue[descriptor.field_name] !== false"
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
      <li
        class="column-separator immutable-column"
        v-if="filteredMetadataDescriptors.length > 0"
      >
        <hr />
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
                  :checked="
                    modelValue && modelValue[descriptor.field_name] !== false
                  "
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
              :checked="
                modelValue && modelValue[descriptor.field_name] !== false
              "
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

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import draggable from 'vuedraggable'
import { GripVerticalIcon } from 'lucide-vue-next'

const { t } = useI18n()
const store = useStore()

const props = defineProps({
  descriptors: {
    type: Array,
    required: true
  },
  exclude: {
    type: Object,
    default: () => {}
  },
  modelValue: {
    type: Object,
    required: true
  },
  namespace: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const fieldToName = {
  estimation: t('main.estimation'),
  fps: t('main.fps'),
  frameIn: t('main.frame_in'),
  frameOut: t('main.frame_out'),
  frames: t('main.frames'),
  readyFor: t('assets.fields.ready_for'),
  timeSpent: t('main.timeSpent'),
  resolution: t('shots.fields.resolution'),
  stdby: t('breakdown.fields.standby'),
  maxRetakes: t('shots.fields.max_retakes')
}
const sortedMetadataDescriptors = ref([])

const currentProduction = computed(() => store.getters.currentProduction)
const isCurrentUserManager = computed(() => store.getters.isCurrentUserManager)

const localStorageKey = computed(() => {
  return `metadataDisplayHeaders:${props.namespace}`
})

const fixedColumns = computed(() => {
  const fixed = []
  for (const headerName in props.modelValue) {
    if (fieldToName[headerName]) {
      fixed.push({
        field_name: headerName,
        name: fieldToName[headerName],
        isFixed: true
      })
    }
  }
  return fixed
})

const filteredFixedColumns = computed(() => {
  return fixedColumns.value.filter(descriptor => {
    return !props.exclude[descriptor.field_name]
  })
})

const filteredMetadataDescriptors = computed(() => {
  const filtered = props.descriptors.filter(descriptor => {
    return !props.exclude[descriptor.field_name]
  })
  return filtered.sort((a, b) => {
    const positionA = a.position ?? 1000
    const positionB = b.position ?? 1000
    if (positionA !== positionB) {
      return positionA - positionB
    }
    const nameA = a.name || ''
    const nameB = b.name || ''
    return nameA.localeCompare(nameB)
  })
})

const entityType = computed(() => {
  const descriptorWithEntityType = props.descriptors.find(d => d.entity_type)
  return descriptorWithEntityType?.entity_type || null
})

const metadataDisplayHeadersString = localStorage.getItem(
  localStorageKey.value
)
let localMetadataDisplayHeaders = { ...props.modelValue }
if (metadataDisplayHeadersString) {
  localMetadataDisplayHeaders = {
    ...localMetadataDisplayHeaders,
    ...JSON.parse(metadataDisplayHeadersString)
  }
}
for (const descriptor of props.descriptors) {
  if (localMetadataDisplayHeaders[descriptor.field_name] === undefined) {
    localMetadataDisplayHeaders[descriptor.field_name] = true
  }
}
emit('update:modelValue', localMetadataDisplayHeaders)
sortedMetadataDescriptors.value = [...filteredMetadataDescriptors.value]

watch(filteredMetadataDescriptors, (newValue) => {
  if (
    sortedMetadataDescriptors.value.length === 0 ||
    sortedMetadataDescriptors.value.length !== newValue.length
  ) {
    sortedMetadataDescriptors.value = [...newValue]
  }
}, { immediate: true })

function setMetadataDisplayValue(metadataName, isSelected) {
  const headers = { ...props.modelValue }
  headers[metadataName] = isSelected
  localStorage.setItem(
    localStorageKey.value,
    JSON.stringify(headers)
  )
  emit('update:modelValue', headers)
}

function onDragEnd() {
  const descriptorIds = sortedMetadataDescriptors.value
    .filter(d => d.id)
    .map(d => d.id)

  if (
    currentProduction.value?.id &&
    entityType.value &&
    descriptorIds.length > 0
  ) {
    store.dispatch('reorderMetadataDescriptors', {
      entityType: entityType.value,
      descriptorIds
    }).catch(err => {
      console.error('Failed to reorder metadata descriptors:', err)
    })
  }
}
</script>

<style lang="scss" scoped>
.dark .column-menu {
  background-color: $dark-grey-light;
  box-shadow: 0 2px 6px $dark-grey;

  .checkbox:hover {
    color: $white;
  }
}

.column-menu {
  background: $white;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  box-shadow: 0 2px 6px $light-grey;
  max-height: 400px;
  overflow: auto;
  position: absolute;
  right: 0;
  text-align: left;
  top: 40px;
  width: 200px;
  z-index: 100;

  h2 {
    border-bottom: 0;
    color: var(--text);
    margin-bottom: 0;
    margin-top: 0;
    padding: 0.6em;
    text-align: center;
    text-transform: capitalize;
  }

  ul {
    list-style-type: none;
    margin: 0;
  }

  li {
    padding: 0.8em;
    transition: background-color 0.2s ease;

    &.immutable-column {
      cursor: default;

      &:hover {
        background-color: rgba(0, 0, 0, 0.05);
      }
    }

    &.column-separator {
      hr {
        margin: 0;
      }
    }

    &:not(.immutable-column) {
      &:hover {
        background-color: rgba(0, 0, 0, 0.05);
      }
    }

    .drag-handle {
      cursor: grab;
      display: inline-flex;
      align-items: center;
      color: var(--text);
      opacity: 0.5;
      margin-right: 0.5em;
      flex-shrink: 0;
      user-select: none;
      transition: opacity 0.2s ease;

      &:hover {
        opacity: 1;
      }

      &:active {
        cursor: grabbing;
      }

      svg {
        pointer-events: none;
      }
    }

    .flexrow {
      display: flex;
      align-items: center;
      width: 100%;
    }
  }

  .checkbox {
    width: 100%;
    cursor: pointer;

    input {
      cursor: pointer;
    }
  }
}

.dark .column-menu {
  li {
    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
}
</style>
