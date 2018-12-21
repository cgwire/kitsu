import colors from '../../lib/colors'
import Vue from 'vue'

export const entityListMixin = {
  computed: {
    sortedValidationColumns () {
      let columns = [...this.validationColumns]
      if (this.assetFilledColumns) {
        columns = columns.filter(c => this.assetFilledColumns[c])
      } else if (this.shotFilledColumns) {
        columns = columns.filter(c => this.shotFilledColumns[c])
      }

      return columns.sort((a, b) => {
        const taskTypeA = this.taskTypeMap[a]
        const taskTypeB = this.taskTypeMap[b]
        if (taskTypeA.priority === taskTypeB.priority) {
          return taskTypeA.name.localeCompare(taskTypeB)
        } else if (taskTypeA.priority > taskTypeB.priority) {
          return 1
        } else {
          return -1
        }
      })
    }
  },

  methods: {
    getBackground (color) {
      return colors.hexToRGBa(color, 0.08)
    },

    buildHideKey (columnId) {
      return `column-${this.currentProduction.id}-${columnId}`
    },

    initHiddenColumns (validationColumns, hiddenColumns) {
      validationColumns.forEach((columnId) => {
        const key = this.buildHideKey(columnId)
        Vue.set(
          hiddenColumns,
          columnId,
          localStorage.getItem(key) === 'true'
        )
      })
    },

    hideColumn (columnId) {
      const key = this.buildHideKey(columnId)
      let isColumnHidden = true
      if (localStorage.getItem(key) === 'true') {
        isColumnHidden = false
      }
      localStorage.setItem(key, isColumnHidden)
      Vue.set(this.hiddenColumns, columnId, isColumnHidden)
      this.hiddenColumns[columnId] = isColumnHidden
      return isColumnHidden
    },

    setScrollPosition (scrollPosition) {
      if (this.$refs.body) {
        this.$refs.body.scrollTop = scrollPosition
      }
    },

    getValidationStyle (columnId) {
      const taskType = this.taskTypeMap[columnId]
      return {
        'border-left': `1px solid ${taskType.color}`,
        'background': this.getBackground(taskType.color)
      }
    }
  }
}
