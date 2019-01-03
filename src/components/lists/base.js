import colors from '../../lib/colors'
import Vue from 'vue'

export const entityListMixin = {

  created () {
    this.initHiddenColumns(this.validationColumns, this.hiddenColumns)
  },

  mounted () {
    this.resizeHeaders()
    window.addEventListener('keydown', this.onKeyDown, false)
  },

  beforeDestroy () {
    window.removeEventListener('keydown', this.onKeyDown)
  },

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

    setScrollLeftPosition (scrollPosition) {
      if (this.$refs.body) {
        this.$refs.body.scrollLeft = scrollPosition
      }
    },

    scrollToValidationCell (validationCell) {
      if (validationCell) {
        const margin = 20
        const rect = validationCell.$el.getBoundingClientRect()
        const listRect = this.$refs.body.getBoundingClientRect()
        const isBelow = rect.bottom > listRect.bottom - margin
        const isAbove = rect.top < listRect.top + margin
        const isRight = rect.right > listRect.right - margin
        const isLeft = rect.left < listRect.left + margin

        if (isBelow) {
          const scrollingRequired = rect.bottom - listRect.bottom + margin
          this.setScrollPosition(
            this.$refs.body.scrollTop + scrollingRequired
          )
        } else if (isAbove) {
          const scrollingRequired = listRect.top - rect.top + margin
          this.setScrollPosition(
            this.$refs.body.scrollTop - scrollingRequired
          )
        }

        if (isRight) {
          const scrollingRequired = rect.right - listRect.right + margin
          this.setScrollLeftPosition(
            this.$refs.body.scrollLeft + scrollingRequired
          )
        } else if (isLeft) {
          const scrollingRequired = listRect.left - rect.left + margin
          this.setScrollLeftPosition(
            this.$refs.body.scrollLeft - scrollingRequired
          )
        }
      }
    },

    getValidationStyle (columnId) {
      const taskType = this.taskTypeMap[columnId]
      return {
        'border-left': `1px solid ${taskType.color}`,
        'background': this.getBackground(taskType.color)
      }
    },

    onTaskSelected (validationInfo) {
      const selection = []
      if (validationInfo.isShiftKey) {
        if (this.lastSelection) {
          let startX = this.lastSelection.x
          let endX = validationInfo.x
          let startY = this.lastSelection.y
          let endY = validationInfo.y
          let grid = this.assetSelectionGrid
          if (!grid) grid = this.shotSelectionGrid

          if (validationInfo.x < this.lastSelection.x) {
            startX = validationInfo.x
            endX = this.lastSelection.x
          }
          if (validationInfo.y < this.lastSelection.y) {
            startY = validationInfo.y
            endY = this.lastSelection.y
          }

          for (let i = startX; i <= endX; i++) {
            for (let j = startY; j <= endY; j++) {
              const ref = 'validation-' + i + '-' + j
              const validationCell = this.$refs[ref][0]
              if (!grid[i][j]) {
                selection.push({
                  entity: validationCell.entity,
                  column: validationCell.column,
                  task: validationCell.task,
                  x: validationCell.rowX,
                  y: validationCell.columnY
                })
              }
            }
          }
          this.$store.commit('ADD_SELECTED_TASK', validationInfo)
        }
      } else if (!validationInfo.isCtrlKey) {
        this.$store.commit('CLEAR_SELECTED_TASKS')
      }
      if (selection.length === 0) {
        this.$store.commit('ADD_SELECTED_TASK', validationInfo)
      } else {
        this.$store.commit('ADD_SELECTED_TASKS', selection)
      }

      if (!validationInfo.isShiftKey && validationInfo.isUserClick) {
        const x = validationInfo.x
        const y = validationInfo.y
        this.lastSelection = { x, y }
        const ref = 'validation-' + x + '-' + y
        const validationCell = this.$refs[ref][0]
        this.$nextTick(() => {
          this.scrollToValidationCell(validationCell)
        })
      }
    },

    onTaskUnselected (validationInfo) {
      if (!validationInfo.isCtrlKey) {
        if (this.nbSelectedTasks === 1) {
          this.$store.commit('REMOVE_SELECTED_TASK', validationInfo)
        } else {
          this.$store.commit('CLEAR_SELECTED_TASKS')
          this.$store.commit('ADD_SELECTED_TASK', validationInfo)
        }
      } else {
        this.$store.commit('REMOVE_SELECTED_TASK', validationInfo)
      }
    },

    onKeyDown (event) {
      const lastSelection =
        this.lastSelection ? this.lastSelection : { x: 0, y: 0 }
      const i = lastSelection.x
      const j = lastSelection.y
      let validationCell = null
      if (event.ctrlKey) {
        if (event.keyCode === 37) {
          validationCell = this.select(i, j - 1)
        } else if (event.keyCode === 38) {
          validationCell = this.select(i - 1, j)
        } else if (event.keyCode === 39) {
          validationCell = this.select(i, j + 1)
        } else if (event.keyCode === 40) {
          validationCell = this.select(i + 1, j)
        }
        this.scrollToValidationCell(validationCell)
      }
    },

    select (i, j) {
      const ref = 'validation-' + i + '-' + j
      const validationCell = this.$refs[ref]
      if (validationCell) validationCell[0].$el.click()
      return validationCell ? validationCell[0] : 0
    },

    showHeaderMenu (columnId, event) {
      const headerMenuEl = this.$refs.headerMenu.$el
      if (headerMenuEl.className === 'header-menu') {
        headerMenuEl.className = 'header-menu hidden'
      } else {
        headerMenuEl.className = 'header-menu'
        let headerElement = event.srcElement.parentNode.parentNode
        if (headerElement.tagName !== 'TH') {
          headerElement = headerElement.parentNode
        }
        const headerBox = headerElement.getBoundingClientRect()
        const left = headerBox.left + 11
        const top = headerBox.bottom + 10
        const width = Math.max(100, headerBox.width - 1)
        headerMenuEl.style.left = left + 'px'
        headerMenuEl.style.top = top + 'px'
        headerMenuEl.style.width = width + 'px'
      }
      this.lastHeaderMenuDisplayed = columnId
    },

    onMinimizeColumnToggled () {
      this.hideColumn(this.lastHeaderMenuDisplayed)
      this.showHeaderMenu()
    },

    onDeleteAllTasksClicked () {
      this.$emit('delete-all-tasks', this.lastHeaderMenuDisplayed)
      this.showHeaderMenu()
    }
  }
}
