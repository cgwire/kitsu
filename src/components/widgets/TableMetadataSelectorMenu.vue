z<template>
  <div class="column-menu">
    <h2>{{ $t('main.column_visibility') }}</h2>
    <div
      class="field is-marginless"
      v-for="descriptor in filteredMetadataDescriptors"
      :key="descriptor.field_name"
    >
      <label
        class="checkbox"
        :for="descriptor.field_name"
      >
        <input
          type="checkbox"
          :id="descriptor.field_name"
          :checked="metadataDisplayHeaders[descriptor.field_name] !== false"
          @change="setMetadataDisplayValue(
            descriptor.field_name, $event.target.checked
          )"
        >
        {{ descriptor.name }}
      </label>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'table-metadata-selector-menu',

  props: {
    metadataDisplayHeaders: {
      type: Object,
      required: true
    },
    descriptors: {
      type: Array,
      required: true
    },
    namespace: {
      type: String,
      required: true
    },
    exclude: {
      type: Object,
      default: () => {}
    }
  },

  data () {
    return {
      fieldToName: {
        estimation: this.$t('main.estimation'),
        fps: this.$t('main.fps'),
        frameIn: this.$t('main.frameIn'),
        frameOut: this.$t('main.frameOut'),
        frames: this.$t('main.frames'),
        readyFor: this.$t('assets.fields.ready_for'),
        timeSpent: this.$t('main.timeSpent'),
        resolution: this.$t('shots.fields.resolution'),
        maxRetakes: this.$t('shots.fields.max_retakes')
      }
    }
  },

  created () {
    const metadataDisplayHeadersString =
      localStorage.getItem(this.localStorageKey)
    let localMetadataDisplayHeaders = { ...this.metadataDisplayHeaders }
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
    this.$emit('update:metadataDisplayHeaders', localMetadataDisplayHeaders)
  },

  computed: {
    ...mapGetters([
    ]),

    localStorageKey () {
      return `metadataDisplayHeaders:${this.namespace}`
    },

    metadataDescriptors () {
      const descriptors = [...this.descriptors]
      for (const headerName in this.metadataDisplayHeaders) {
        if (this.fieldToName[headerName]) {
          descriptors.push({
            field_name: headerName,
            name: this.fieldToName[headerName]
          })
        }
      }
      return descriptors
    },

    filteredMetadataDescriptors () {
      return this.metadataDescriptors
        .filter(descriptor => {
          return !this.exclude[descriptor.field_name]
        })
    }
  },

  methods: {
    ...mapActions([
    ]),

    setMetadataDisplayValue (metadataName, isSelected) {
      const localMetadataDisplayHeaders = { ...this.metadataDisplayHeaders }
      localMetadataDisplayHeaders[metadataName] = isSelected
      localStorage.setItem(
        this.localStorageKey, JSON.stringify(localMetadataDisplayHeaders)
      )
      this.$emit('update:metadataDisplayHeaders', localMetadataDisplayHeaders)
    }
  }
}
</script>

<style lang="scss" scoped>
.dark .column-menu {
  background-color: $dark-grey-light;
  box-shadow: 0 2px 6px $dark-grey-light;

 .checkbox:hover {
   color: $white;
 }
}

.column-menu {
  background: white;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  box-shadow: 0 2px 6px $light-grey;
  max-height: 300px;
  overflow: auto;
  position: absolute;
  right: 0;
  top: 40px;
  width: 200px;
  z-index: 100;

  h2 {
    color: $grey;
    padding: 0.8em;
    text-transform: uppercase;
  }

  div {
    padding: 0.8em;
  }
}

span.checkbox {
  width: 100%;
}
</style>
