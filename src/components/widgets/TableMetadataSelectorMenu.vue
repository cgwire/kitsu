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
        v-for="descriptor in filteredMetadataDescriptors"
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
    </ul>
  </div>
</template>

<script>
export default {
  name: 'table-metadata-selector-menu',

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
      }
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
  },

  computed: {
    localStorageKey() {
      return `metadataDisplayHeaders:${this.namespace}`
    },

    metadataDescriptors() {
      const fixedColumns = []
      for (const headerName in this.modelValue) {
        if (this.fieldToName[headerName]) {
          fixedColumns.push({
            field_name: headerName,
            name: this.fieldToName[headerName]
          })
        }
      }
      return [...fixedColumns, ...this.descriptors]
    },

    filteredMetadataDescriptors() {
      return this.metadataDescriptors.filter(descriptor => {
        return !this.exclude[descriptor.field_name]
      })
    }
  },

  methods: {
    setMetadataDisplayValue(metadataName, isSelected) {
      const localMetadataDisplayHeaders = { ...this.modelValue }
      localMetadataDisplayHeaders[metadataName] = isSelected
      localStorage.setItem(
        this.localStorageKey,
        JSON.stringify(localMetadataDisplayHeaders)
      )
      this.$emit('update:modelValue', localMetadataDisplayHeaders)
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
  }

  .checkbox {
    width: 100%;
  }
}
</style>
