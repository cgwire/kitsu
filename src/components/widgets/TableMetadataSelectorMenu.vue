<template>
  <div class="header-menu hidden">
    <div
      class="field is-marginless"
      v-for="metadataDescriptor in descriptors"
      :key="metadataDescriptor.field_name"
    >
      <label
        class="checkbox"
        :for="metadataDescriptor.field_name"
      >
        <input
          type="checkbox"
          :id="metadataDescriptor.field_name"
          :checked="metadataDisplayHeaders[metadataDescriptor.field_name]"
          @change="setMetadataDisplayValue(metadataDescriptor.field_name, $event.target.checked)"
        >
        {{ metadataDescriptor.name }}
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
      return `metadataDisplayHeaders.${this.namespace}`
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
      const localMetadataDisplayHeaders = this.shallowCopy(this.metadataDisplayHeaders)
      localMetadataDisplayHeaders[metadataName] = isSelected
      localStorage.setItem(this.localStorageKey, JSON.stringify(localMetadataDisplayHeaders))
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
.dark .header-menu {
  background-color: $dark-grey-light;
  box-shadow: 0 2px 6px $dark-grey-light;
}

.header-menu {
  position: absolute;
  background: white;
  width: 118px;
  box-shadow: 0 2px 6px $light-grey;
  top: 90px;
  z-index: 100;
}

.header-menu div {
  padding: 0.5em;
}

label.checkbox {
  width: 100%;
}
</style>
