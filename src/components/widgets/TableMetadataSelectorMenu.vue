z<template>
  <div class="column-menu">
    <h2>{{ $t('main.column_visibility') }}</h2>
    <div
      class="field is-marginless"
      v-for="metadataDescriptor in descriptors"
      :key="metadataDescriptor.field_name"
    >
      <span
        class="checkbox"
        :for="metadataDescriptor.field_name"
      >
        <input
          type="checkbox"
          :id="metadataDescriptor.field_name"
          :checked="metadataDisplayHeaders[metadataDescriptor.field_name]"
          @change="setMetadataDisplayValue(
            metadataDescriptor.field_name, $event.target.checked
          )"
        >
        {{ metadataDescriptor.name }}
      </span>
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
    }
  },

  data () {
    return {
    }
  },

  computed: {
    ...mapGetters([
    ]),
    localStorageKey () {
      return `metadataDisplayHeaders:${this.namespace}`
    }
  },

  methods: {
    ...mapActions([
    ]),
    shallowCopy (object) {
      const newObject = {}
      for (const key in object) {
        newObject[key] = object[key]
      }
      return newObject
    },
    setMetadataDisplayValue (metadataName, isSelected) {
      const localMetadataDisplayHeaders =
        this.shallowCopy(this.metadataDisplayHeaders)
      localMetadataDisplayHeaders[metadataName] = isSelected
      localStorage.setItem(
        this.localStorageKey, JSON.stringify(localMetadataDisplayHeaders)
      )
      this.$emit('update:metadataDisplayHeaders', localMetadataDisplayHeaders)
    }
  },

  created () {
    const metadataDisplayHeadersString = localStorage.getItem(this.localStorageKey)
    let localMetadataDisplayHeaders = {}
    if (metadataDisplayHeadersString) {
      localMetadataDisplayHeaders = JSON.parse(metadataDisplayHeadersString)
    }
    for (const descriptor of this.descriptors) {
      if (localMetadataDisplayHeaders[descriptor.field_name] === undefined) {
        localMetadataDisplayHeaders[descriptor.field_name] = true
      }
    }
    this.$emit('update:metadataDisplayHeaders', localMetadataDisplayHeaders)
  }
}
</script>

<style lang="scss" scoped>
.dark .column-menu {
  background-color: $dark-grey-light;
  box-shadow: 0 2px 6px $dark-grey-light;
}

.column-menu {
  position: absolute;
  background: white;
  width: 200px;
  box-shadow: 0 2px 6px $light-grey;
  top: 40px;
  right: 0;
  z-index: 100;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  overflow: auto;

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
