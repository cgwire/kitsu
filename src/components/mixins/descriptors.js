/*
 * Set of function to facilitate the display and edition of metadata in
 * entity lists.
 */
import { mapGetters } from 'vuex'

import {
  getDescriptorChecklistValues,
  getDescriptorChoicesOptions,
  getMetadataChecklistValues,
  getMetadataEventValue,
  getMetadataFieldValue
} from '@/composables/descriptors'

export { getDescriptorChecklistValues }

export const descriptorMixin = {
  emits: [
    'add-metadata',
    'change-sort',
    'delete-metadata',
    'edit-metadata',
    'metadata-changed'
  ],

  computed: {
    ...mapGetters([
      'isCurrentUserSupervisor',
      'selectedAssets',
      'selectedShots',
      'selectedEdits',
      'user'
    ]),

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
      const value = getMetadataEventValue(descriptor, entry, event)
      if (value === undefined) return

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
      const columnId = this.lastMetadataHeaderMenuDisplayed
      const column = this.currentProduction.descriptors.find(
        d => d.id === columnId
      )
      this.$emit('change-sort', {
        type: 'metadata',
        column: column.field_name,
        name: column.name,
        data_type: column.data_type
      })
      this.showMetadataHeaderMenu()
    },

    onEditMetadataClicked() {
      this.$emit('edit-metadata', this.lastMetadataHeaderMenuDisplayed)
      this.showMetadataHeaderMenu()
    },

    onDeleteMetadataClicked() {
      this.$emit('delete-metadata', this.lastMetadataHeaderMenuDisplayed)
      this.showMetadataHeaderMenu()
    },

    showMetadataHeaderMenu(columnId, event) {
      this.showHeaderMenuAt(
        'headerMetadataMenu',
        event,
        event => event.target.closest('th'),
        { left: -3, top: 4 },
        this.lastMetadataHeaderMenuDisplayed === columnId
      )
      this.lastMetadataHeaderMenuDisplayed = columnId
    },

    getDescriptorChoicesOptions,

    getMetadataFieldValue,

    getDescriptorChecklistValues,

    getMetadataChecklistValues,

    isSupervisorInDepartments(departments = []) {
      if (!Array.isArray(departments)) {
        departments = [departments]
      }
      return (
        this.isCurrentUserSupervisor &&
        (this.user.departments.length === 0 ||
          this.user.departments.some(department =>
            departments.includes(department)
          ))
      )
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
