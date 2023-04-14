/*
 * Set of function to facilitate the display and edition of metadata in
 * entity lists.
 */
import { mapGetters } from 'vuex'

export const descriptorMixin = {
  created() {},

  mounted() {},

  beforeDestroy() {},

  computed: {
    ...mapGetters(['selectedAssets', 'selectedShots', 'selectedEdits']),
    descriptorLength() {
      if (this.shotMetadataDescriptors.length !== undefined) {
        return this.shotMetadataDescriptors.length
      }
      if (this.assetMetadataDescriptors.length !== undefined) {
        return this.assetMetadataDescriptors.length
      }
      if (this.editMetadataDescriptors.length !== undefined) {
        return this.editMetadataDescriptors.length
      }
      return 0
    }
  },

  methods: {
    onAddMetadataClicked() {
      this.$emit('add-metadata')
    },

    emitMetadataChanged(entry, descriptor, value) {
      this.$emit('metadata-changed', {
        entry,
        descriptor,
        value
      })
    },

    onMetadataFieldChanged(entry, descriptor, event) {
      if (!event.target.validity.valid) {
        return
      }

      let value
      if (descriptor.data_type === 'boolean') {
        value = event.target.checked ? 'true' : 'false'
      } else {
        value = event.target.value
      }

      if (this.selectedShots.has(entry.id)) {
        // if the line is selected, also modify the cells of the other selected
        // lines.
        this.selectedShots.forEach(shot => {
          this.emitMetadataChanged(shot, descriptor, value)
        })
      } else if (this.selectedAssets.has(entry.id)) {
        // if the line is selected, also modify the cells of the other selected
        // lines.
        this.selectedAssets.forEach(asset => {
          this.emitMetadataChanged(asset, descriptor, value)
        })
      } else if (this.selectedEdits.has(entry.id)) {
        // if the line is selected, also modify the cells of the other selected
        // lines.
        this.selectedEdits.forEach(edit => {
          this.emitMetadataChanged(edit, descriptor, value)
        })
      } else if (this.selectedEpisodes && this.selectedEpisodes.has(entry.id)) {
        // if the line is selected, also modify the cells of the other selected
        // lines.
        this.selectedEpisodes.forEach(episode => {
          this.emitMetadataChanged(episode, descriptor, value)
        })
      } else {
        this.emitMetadataChanged(entry, descriptor, value)
      }
    },

    onMetadataChecklistChanged(entry, descriptor, option, event) {
      const values = this.getMetadataChecklistValues(descriptor, entry)
      values[option] = event.target.checked
      event.target.value = JSON.stringify(values)
      this.onMetadataFieldChanged(entry, descriptor, event)
    },

    onSortByMetadataClicked() {
      const columnId = this.lastMetadaDataHeaderMenuDisplayed
      const column = this.currentProduction.descriptors.find(
        d => d.id === columnId
      )
      this.$emit('change-sort', {
        type: 'metadata',
        column: column.field_name,
        name: column.name
      })
      this.showMetadataHeaderMenu()
    },

    onEditMetadataClicked() {
      this.$emit('edit-metadata', this.lastMetadaDataHeaderMenuDisplayed)
      this.showMetadataHeaderMenu()
    },

    onDeleteMetadataClicked() {
      this.$emit('delete-metadata', this.lastMetadaDataHeaderMenuDisplayed)
      this.showMetadataHeaderMenu()
    },

    showMetadataHeaderMenu(columnId, event) {
      const headerMenuEl = this.$refs.headerMetadataMenu.$el
      if (headerMenuEl.className === 'header-menu') {
        headerMenuEl.className = 'header-menu hidden'
      } else {
        headerMenuEl.className = 'header-menu'
        const headerElement = event.srcElement.parentNode.parentNode
        const headerBox = headerElement.getBoundingClientRect()
        const left = headerBox.left - 3
        const top = headerBox.bottom + 11
        const width = Math.max(100, headerBox.width - 1)
        headerMenuEl.style.left = left + 'px'
        headerMenuEl.style.top = top + 'px'
        headerMenuEl.style.width = width + 'px'
      }
      this.lastMetadaDataHeaderMenuDisplayed = columnId
    },

    getDescriptorChoicesOptions(descriptor) {
      const values = descriptor.choices.map(c => ({ label: c, value: c }))
      return [{ label: '', value: '' }, ...values]
    },

    getMetadataFieldValue(descriptor, entity) {
      if (entity.data) {
        return entity.data[descriptor.field_name] || ''
      } else if (entity.entity_data) {
        return entity.entity_data[descriptor.field_name] || ''
      } else {
        return ''
      }
    },

    getDescriptorChecklistValues(descriptor) {
      const values = descriptor.choices.reduce((result, choice) => {
        if (choice && typeof choice === 'string' && choice.startsWith('[x] ')) {
          result.push({ text: choice.slice(4), checked: true })
        } else if (
          choice &&
          typeof choice === 'string' &&
          choice.startsWith('[ ] ')
        ) {
          result.push({ text: choice.slice(4), checked: false })
        }
        return result
      }, [])
      return values.length === descriptor.choices.length ? values : []
    },

    getMetadataChecklistValues(descriptor, entity) {
      let values
      try {
        values = JSON.parse(this.getMetadataFieldValue(descriptor, entity))
      } catch {
        values = {}
      }
      this.getDescriptorChecklistValues(descriptor).forEach(function (option) {
        if (!(option.text in values)) {
          values[option.text] = option.checked
        }
      })
      return values
    },

    /*
     * Determine what is the next input by building a reference key and
     * retrieve it from the main reference array.
     * The next input is determined from the arrow key used. If the key is
     * not an arrow nothing is done.
     */
    keyMetadataNavigation(listWidth, listHeight, i, j, key) {
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
      if (this.$refs[ref][0]) {
        const input = this.$refs[ref][0]
        input.focus()
      }
    }
  }
}
