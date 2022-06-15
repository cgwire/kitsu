import Vue from 'vue'

import colors from '@/lib/colors'

import assetStore from '@/store/modules/assets'
import shotStore from '@/store/modules/shots'

export const entityListMixin = {

  created () {
    this.initHiddenColumns(this.validationColumns, this.hiddenColumns)
  },

  mounted () {
    if (this.resizeHeaders) this.resizeHeaders()
    window.addEventListener('keydown', this.onKeyDown, false)
    window.addEventListener('keyup', this.onKeyUp, false)
  },

  beforeDestroy () {
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
  },

  data () {
    return {
      columnSelectorDisplayed: false
    }
  },

  computed: {
    visibleMetadataDescriptors () {
      return this.metadataDescriptors.filter(
        descriptor => {
          const header = this.metadataDisplayHeaders[descriptor.field_name]
          return header === undefined || header
        }
      )
    },

    nonStickedVisibleMetadataDescriptors () {
      return this.visibleMetadataDescriptors.filter(
        descriptor => !this.stickedColumns[descriptor.id] &&
        this.metadataDescriptorIsInDepartmentFilter(descriptor)
      )
    },

    stickedVisibleMetadataDescriptors () {
      return this.visibleMetadataDescriptors.filter(
        descriptor => this.stickedColumns[descriptor.id] &&
        this.metadataDescriptorIsInDepartmentFilter(descriptor)
      )
    },

    nonStickedDisplayedValidationColumns () {
      return this.displayedValidationColumns.filter(
        columnId => !this.stickedColumns[columnId] &&
        this.validationColumnsIsInDepartmentFilter(columnId)
      )
    },

    stickedDisplayedValidationColumns () {
      return this.displayedValidationColumns.filter(
        columnId => this.stickedColumns[columnId] &&
        this.validationColumnsIsInDepartmentFilter(columnId)
      )
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
      if (validationColumns && hiddenColumns) {
        validationColumns.forEach((columnId) => {
          const key = this.buildHideKey(columnId)
          Vue.set(
            hiddenColumns,
            columnId,
            localStorage.getItem(key) === 'true'
          )
        })
      }
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

    getValidationStyle (columnId) {
      const taskType = this.taskTypeMap.get(columnId)
      return {
        'border-left': `1px solid ${taskType.color}`,
        background: this.getBackground(taskType.color)
      }
    },

    onTaskSelected (validationInfo, sticked) {
      const columnOffset = this.stickedDisplayedValidationColumns.length
      const selection = []
      if (!sticked) {
        validationInfo = { ...validationInfo }
        validationInfo.y += columnOffset
      }
      if (validationInfo.isShiftKey) {
        if (this.lastSelection) {
          let startX = this.lastSelection.x
          let endX = validationInfo.x
          let startY = this.lastSelection.y
          if (!sticked) startY += columnOffset
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
            if (!sticked) endY += columnOffset
          }

          for (let i = startX; i <= endX; i++) {
            for (let j = startY; j <= endY; j++) {
              const ref = 'validation-' + i + '-' + j
              const validationCell = this.$refs[ref][0]
              if (!grid[i][j]) {
                let y = validationCell.columnY
                if (!sticked) y += columnOffset

                // Add cell to selection
                if (validationCell.selectable) {
                  selection.push({
                    entity: validationCell.entity,
                    column: validationCell.column,
                    task: validationCell.task,
                    x: validationCell.rowX,
                    y
                  })
                }
              }
            }
          }
          this.$store.commit('ADD_SELECTED_TASK', validationInfo)
        }
      } else if (!validationInfo.isCtrlKey) {
        this.$store.commit('CLEAR_SELECTED_TASKS')
      }
      if (selection.length === 0) {
        this.$nextTick(() => {
          this.$store.commit('ADD_SELECTED_TASK', validationInfo)
        })
      } else {
        this.$store.commit('ADD_SELECTED_TASKS', selection)
      }

      if (!validationInfo.isShiftKey && validationInfo.isUserClick) {
        const x = validationInfo.x
        let y = validationInfo.y
        if (!sticked) y -= columnOffset
        this.lastSelection = { x, y }
        const ref = 'validation-' + x + '-' + y
        const validationCell = this.$refs[ref][0]
        this.$nextTick(() => {
          this.scrollToValidationCell(validationCell)
        })
      }
    },

    onTaskUnselected (validationInfo, sticked) {
      if (!sticked) {
        validationInfo = { ...validationInfo }
        validationInfo.y += this.stickedDisplayedValidationColumns.length
      }
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

    showHeaderMenu (columnId, columnIndexInGrid, event) {
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
        const left = headerBox.left
        const top = headerBox.bottom
        const width = Math.max(100, headerBox.width - 1)
        headerMenuEl.style.left = left + 'px'
        headerMenuEl.style.top = top + 'px'
        headerMenuEl.style.width = width + 'px'
      }
      this.lastHeaderMenuDisplayed = columnId
      this.lastHeaderMenuDisplayedIndexInGrid = columnIndexInGrid
    },

    onMinimizeColumnToggled () {
      this.hideColumn(this.lastHeaderMenuDisplayed)
      this.showHeaderMenu()
    },

    onDeleteAllTasksClicked () {
      this.$emit('delete-all-tasks', this.lastHeaderMenuDisplayed)
      this.showHeaderMenu()
    },

    onSortByTaskTypeClicked () {
      const taskTypeId = this.lastHeaderMenuDisplayed
      this.$emit('change-sort', {
        type: 'status',
        column: taskTypeId,
        name: this.taskTypeMap.get(taskTypeId).name
      })
      this.showHeaderMenu()
    },

    onSelectColumn () {
      const taskTypeId = this.lastHeaderMenuDisplayed
      const selection = []
      const entities = this.assetMap
        ? assetStore.cache.result
        : shotStore.cache.result
      entities.forEach((entity, i) => {
        selection.push({
          entity: entity,
          column: this.taskTypeMap.get(taskTypeId),
          task: this.taskMap.get(entity.validations.get(taskTypeId)),
          x: i,
          y: this.lastHeaderMenuDisplayedIndexInGrid
        })
      })

      this.$store.commit('CLEAR_SELECTED_TASKS')
      this.$nextTick(() => {
        this.$store.commit('ADD_SELECTED_TASKS', selection)
        this.showHeaderMenu()
      })
    },

    // i = line number in entity group and k is the index of the entity group
    getEntityLineNumber (entities, i, k) {
      this.$options.lineIndex = {}
      const key = `${i}-${k}`
      const cached = this.$options.lineIndex[key]
      if (!cached) {
        let j = 0
        let index = 0
        while (j < k) {
          index += entities[j].length
          j++
        }
        const val = i + index
        this.$options.lineIndex[key] = val
        return val
      } else {
        return cached
      }
    },

    getGroupKey (group, i, fieldName) {
      const key = group[0] ? group[0][fieldName] + group[0].canceled : ''
      return `${i}-${key}`
    },

    onDescriptionChanged (entry, value) {
      this.$emit('field-changed', {
        entry, fieldName: 'description', value
      })
    },

    onNumberFieldKeyDown (event) {
      if (['ArrowDown', 'ArrowUp'].includes(event.key)) {
        this.pauseEvent(event) // Requires dom mixin
      }
    },

    toggleColumnSelector () {
      this.columnSelectorDisplayed = !this.columnSelectorDisplayed
    },

    metadataDescriptorIsInDepartmentFilter (metadataDescriptor) {
      return this.departmentFilter.length === 0 ||
        metadataDescriptor.departments.length === 0 ||
        this.departmentFilter.some(d =>
          metadataDescriptor.departments.includes(d))
    },

    validationColumnsIsInDepartmentFilter (columnId) {
      return this.departmentFilter.length === 0 ||
        this.departmentFilter.includes(
          this.taskTypeMap.get(columnId).department_id)
    },

    isMetadataColumnEditAllowed (descriptorId) {
      if (typeof descriptorId === 'string') {
        if (this.isCurrentUserManager) {
          return true
        } else if (this.isCurrentUserSupervisor) {
          if (this.user.departments.length === 0) {
            return true
          } else {
            const metadataDescriptor = this.visibleMetadataDescriptors.find(
              descriptor => descriptor.id === descriptorId)
            if (metadataDescriptor.departments.length ===
            this.user.departments.length) {
              return this.user.departments.every(department =>
                metadataDescriptor.departments.includes(department))
            }
          }
        }
      }
      return false
    },

    isSupervisorInDepartments (departments = []) {
      if (!Array.isArray(departments)) {
        departments = [departments]
      }
      return this.isCurrentUserSupervisor &&
        (this.user.departments.length === 0 ||
        this.user.departments.some(department =>
          departments.includes(department)))
    }
  }
}
