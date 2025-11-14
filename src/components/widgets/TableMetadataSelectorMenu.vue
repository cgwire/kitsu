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

<script>
import draggable from 'vuedraggable'
import { GripVerticalIcon } from 'lucide-vue-next'
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'table-metadata-selector-menu',

  components: {
    draggable,
    GripVerticalIcon
  },

  props: {
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
  },

  emits: ['update:modelValue'],

  data() {
    return {
      fieldToName: {
        estimation: this.$t('main.estimation'),
        fps: this.$t('main.fps'),
        frameIn: this.$t('main.frame_in'),
        frameOut: this.$t('main.frame_out'),
        frames: this.$t('main.frames'),
        readyFor: this.$t('assets.fields.ready_for'),
        timeSpent: this.$t('main.timeSpent'),
        resolution: this.$t('shots.fields.resolution'),
        stdby: this.$t('breakdown.fields.standby'),
        maxRetakes: this.$t('shots.fields.max_retakes')
      },
      sortedMetadataDescriptors: []
    }
  },

  created() {
    const metadataDisplayHeadersString = localStorage.getItem(
      this.localStorageKey
    )
    let localMetadataDisplayHeaders = { ...this.modelValue }
    if (metadataDisplayHeadersString) {
      localMetadataDisplayHeaders = {
        ...localMetadataDisplayHeaders,
        ...JSON.parse(metadataDisplayHeadersString)
      }
    }
    for (const descriptor of this.descriptors) {
      if (localMetadataDisplayHeaders[descriptor.field_name] === undefined) {
        localMetadataDisplayHeaders[descriptor.field_name] = true
      }
    }
    this.$emit('update:modelValue', localMetadataDisplayHeaders)
    this.sortedMetadataDescriptors = [...this.filteredMetadataDescriptors]
  },

  watch: {
    filteredMetadataDescriptors: {
      handler(newValue) {
        if (
          this.sortedMetadataDescriptors.length === 0 ||
          this.sortedMetadataDescriptors.length !== newValue.length
        ) {
          this.sortedMetadataDescriptors = [...newValue]
        }
      },
      immediate: true
    }
  },

  computed: {
    ...mapGetters(['currentProduction', 'isCurrentUserManager']),

    localStorageKey() {
      return `metadataDisplayHeaders:${this.namespace}`
    },

    fixedColumns() {
      const fixed = []
      for (const headerName in this.modelValue) {
        if (this.fieldToName[headerName]) {
          fixed.push({
            field_name: headerName,
            name: this.fieldToName[headerName],
            isFixed: true
          })
        }
      }
      return fixed
    },

    filteredFixedColumns() {
      return this.fixedColumns.filter(descriptor => {
        return !this.exclude[descriptor.field_name]
      })
    },

    filteredMetadataDescriptors() {
      const filtered = this.descriptors.filter(descriptor => {
        return !this.exclude[descriptor.field_name]
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
    },

    entityType() {
      const descriptorWithEntityType = this.descriptors.find(d => d.entity_type)
      return descriptorWithEntityType?.entity_type || null
    }
  },

  methods: {
    ...mapActions(['reorderMetadataDescriptors']),
    setMetadataDisplayValue(metadataName, isSelected) {
      const localMetadataDisplayHeaders = { ...this.modelValue }
      localMetadataDisplayHeaders[metadataName] = isSelected
      localStorage.setItem(
        this.localStorageKey,
        JSON.stringify(localMetadataDisplayHeaders)
      )
      this.$emit('update:modelValue', localMetadataDisplayHeaders)
    },

    onDragEnd() {
      const descriptorIds = this.sortedMetadataDescriptors
        .filter(d => d.id)
        .map(d => d.id)

      if (
        this.currentProduction?.id &&
        this.entityType &&
        descriptorIds.length > 0
      ) {
        this.reorderMetadataDescriptors({
          entityType: this.entityType,
          descriptorIds
        }).catch(err => {
          console.error('Failed to reorder metadata descriptors:', err)
        })
      }
    }
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
