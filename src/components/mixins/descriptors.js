export const descriptorMixin = {

  created () {
  },

  mounted () {
  },

  beforeDestroy () {
  },

  computed: {
  },

  methods: {
    getMetadataFieldValue (descriptor, entity) {
      return entity.data ? entity.data[descriptor.field_name] || '' : ''
    },

    getDescriptorChoicesOptions (descriptor) {
      const values = descriptor.choices.map(c => ({ label: c, value: c }))
      return [{ label: '', value: '' }, ...values]
    }
  }
}
