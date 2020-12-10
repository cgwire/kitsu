/*
 * Set of function to facilitate the display and edition of metadata in
 * entity lists.
 */
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
    },

    keyMetadataNavigation (listWidth, listHeight, i, j, key) {
      console.log(listWidth, listHeight, i, j, key)
      if (key === 'ArrowDown') {
        i = i + 1
        if (i >= listHeight) i = 0
      } else if (key === 'ArrowLeft') {
        j = j - 1
        if (j < 0) j = listWidth - 1
      } else if (key === 'ArrowRight') {
        j = j + 1
        if (j >= listWidth) j = 0
      } else if (key === 'ArrowUp') {
        i = i - 1
        if (i < 0) i = listHeight - 1
      } else {
        return
      }
      const ref = `editor-${i}-${j}`
      const input = this.$refs[ref][0]
      input.focus()
    }
  }
}
