import colors from '@/lib/colors'
import stringHelpers from '@/lib/string'

import assetStore from '@/store/modules/assets'
import editStore from '@/store/modules/edits'
import episodeStore from '@/store/modules/episodes'
import sequenceStore from '@/store/modules/sequences'
import shotStore from '@/store/modules/shots'

const entityMaps = {
  asset: assetStore.cache.assetMap,
  shot: shotStore.cache.shotMap,
  sequence: sequenceStore.cache.sequenceMap,
  episode: episodeStore.cache.episodeMap,
  edit: editStore.cache.editMap
}

export const entityListMixin = {
  emits: [
    'change-sort',
    'delete-all-tasks',
    'field-changed',
    'keep-task-panel-open',
    'scroll'
  ],

  created() {
    this.initHiddenColumns(this.validationColumns, this.hiddenColumns)
  },

  mounted() {
    if (this.resizeHeaders) this.resizeHeaders()
    window.addEventListener('keydown', this.onKeyDown, false)
    window.addEventListener('keyup', this.onKeyUp, false)
    this.stickedColumns =
      JSON.parse(localStorage.getItem(this.localStorageStickKey)) || {}
  },

  beforeUnmount() {
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
  },

  data() {
    return {
      columnSelectorDisplayed: false
    }
  },

  computed: {
    visibleMetadataDescriptors() {
      return this.metadataDescriptors.filter(descriptor => {
        const header = this.metadataDisplayHeaders[descriptor.field_name]
        return header === undefined || header
      })
    },

    nonStickedVisibleMetadataDescriptors() {
      return this.visibleMetadataDescriptors.filter(
        descriptor =>
          !this.stickedColumns[descriptor.id] &&
          this.metadataDescriptorIsInDepartmentFilter(descriptor)
      )
    },

    stickedVisibleMetadataDescriptors() {
      return this.visibleMetadataDescriptors.filter(
        descriptor =>
          this.stickedColumns[descriptor.id] &&
          this.metadataDescriptorIsInDepartmentFilter(descriptor)
      )
    },

    nonStickedDisplayedValidationColumns() {
      return this.displayedValidationColumns.filter(
        columnId =>
          !this.stickedColumns[columnId] &&
          this.validationColumnsIsInDepartmentFilter(columnId)
      )
    },

    stickedDisplayedValidationColumns() {
      return this.displayedValidationColumns.filter(
        columnId =>
          this.stickedColumns[columnId] &&
          this.validationColumnsIsInDepartmentFilter(columnId)
      )
    },

    isEmptyTask() {
      return (
        !this.isEmptyList &&
        !this.isLoading &&
        this.validationColumns &&
        this.validationColumns.length === 0
      )
    }
  },

  methods: {
    onBodyScroll(event) {
      const position = event.target
      this.$emit('scroll', position.scrollTop)
    },

    updateOffsets() {
      if (this.isLoading) {
        return
      }
      this.$nextTick(() => {
        let offset = this.$refs['th-episode']
          ? this.$refs['th-episode'].clientWidth
          : 0
        this.offsets = {}

        if (this.isShowInfos) {
          for (
            let metadataCol = 0;
            metadataCol < this.stickedVisibleMetadataDescriptors.length;
            metadataCol++
          ) {
            this.offsets[`editor-${metadataCol}`] = offset
            offset += this.$refs[`editor-${metadataCol}`][0].$el.clientWidth
          }
        }
        for (
          let validationCol = 0;
          validationCol < this.stickedDisplayedValidationColumns.length;
          validationCol++
        ) {
          this.offsets[`validation-${validationCol}`] = offset
          offset += this.$refs[`validation-${validationCol}`][0].$el.clientWidth
        }
      })
    },

    onInputKeyUp(event, i, j) {
      const listWidth = this.visibleMetadataDescriptors.length + 4
      const listHeight = this.displayedEpisodesLength
      this.keyMetadataNavigation(listWidth, listHeight, i, j, event.key)
      return this.pauseEvent(event)
    },

    getBackground(color) {
      return colors.hexToRGBa(color, 0.08)
    },

    buildHideKey(columnId) {
      return `column-${this.currentProduction.id}-${columnId}`
    },

    initHiddenColumns(validationColumns, hiddenColumns) {
      if (validationColumns && hiddenColumns) {
        validationColumns.forEach(columnId => {
          const key = this.buildHideKey(columnId)
          hiddenColumns[columnId] = localStorage.getItem(key) === 'true'
        })
      }
    },

    hideColumn(columnId) {
      const key = this.buildHideKey(columnId)
      let isColumnHidden = true
      if (localStorage.getItem(key) === 'true') {
        isColumnHidden = false
      }
      localStorage.setItem(key, isColumnHidden)
      this.hiddenColumns[columnId] = isColumnHidden
      return isColumnHidden
    },

    setScrollPosition(scrollPosition) {
      if (this.$refs.body) {
        this.$refs.body.scrollTop = scrollPosition
      }
    },

    setScrollLeftPosition(scrollPosition) {
      if (this.$refs.body) {
        this.$refs.body.scrollLeft = scrollPosition
      }
    },

    getValidationStyle(columnId) {
      const taskType = this.taskTypeMap.get(columnId)
      if (!taskType) return {}
      return {
        'border-left': `1px solid ${taskType.color}`,
        background: this.getBackground(taskType.color)
      }
    },

    onTaskSelected(validationInfo, sticked) {
      const columnOffset = this.stickedDisplayedValidationColumns.length
      const selection = []
      if (!sticked) {
        validationInfo = { ...validationInfo }
        validationInfo.y += columnOffset
      }
      this.$emit('keep-task-panel-open', true)
      if (validationInfo.isShiftKey) {
        if (this.lastSelection) {
          let startX = this.lastSelection.x
          let endX = validationInfo.x
          let startY = this.lastSelection.y
          if (!sticked) startY += columnOffset
          let endY = validationInfo.y
          const grid = this[`${this.type}SelectionGrid`]
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
              const ref = `validation-${i}-${j}`
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
          this.updateTaskInQuery()
        }
      } else if (!validationInfo.isCtrlKey) {
        this.$store.commit('CLEAR_SELECTED_TASKS')
        this.updateTaskInQuery()
      }
      if (selection.length === 0) {
        this.$store.commit('ADD_SELECTED_TASK', validationInfo)
        this.updateTaskInQuery()
      } else {
        this.$store.commit('ADD_SELECTED_TASKS', selection)
        this.updateTaskInQuery()
      }

      if (!validationInfo.isShiftKey && validationInfo.isUserClick) {
        const x = validationInfo.x
        let y = validationInfo.y
        if (!sticked) y -= columnOffset
        this.lastSelection = { x, y }
        const ref = `validation-${x}-${y}`
        const validationCell = this.$refs[ref][0]
        this.$nextTick(() => {
          this.scrollToValidationCell(validationCell)
        })
      }

      this.$nextTick(() => {
        this.$emit('keep-task-panel-open', false)
      })
    },

    onTaskUnselected(validationInfo, sticked) {
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
      this.updateTaskInQuery()
    },

    showHeaderMenu(columnId, columnIndexInGrid, event) {
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
        headerMenuEl.style.left = `${left}px`
        headerMenuEl.style.top = `${top}px`
        headerMenuEl.style.width = `${width}px`
      }
      this.lastHeaderMenuDisplayed = columnId
      this.lastHeaderMenuDisplayedIndexInGrid = columnIndexInGrid
    },

    onMinimizeColumnToggled() {
      this.hideColumn(this.lastHeaderMenuDisplayed)
      this.showHeaderMenu()
    },

    onDeleteAllTasksClicked() {
      this.$emit('delete-all-tasks', this.lastHeaderMenuDisplayed)
      this.showHeaderMenu()
    },

    onSortByTaskTypeClicked() {
      const taskTypeId = this.lastHeaderMenuDisplayed
      this.$emit('change-sort', {
        type: 'status',
        column: taskTypeId,
        name: this.taskTypeMap.get(taskTypeId).name
      })
      this.showHeaderMenu()
    },

    onSelectColumn(type) {
      const taskTypeId = this.lastHeaderMenuDisplayed
      const selection = []

      let entities
      switch (type) {
        case 'asset':
          entities = assetStore.cache.result
          break
        case 'edit':
          entities = editStore.cache.result
          break
        case 'episode':
          entities = episodeStore.cache.result
          break
        case 'sequence':
          entities = sequenceStore.cache.result
          break
        case 'shot':
          entities = shotStore.cache.result
          break
        default:
          throw new Error(`Invalid entity type: ${type}`)
      }

      entities.forEach((entity, i) => {
        selection.push({
          entity,
          column: this.taskTypeMap.get(taskTypeId),
          task: this.taskMap.get(entity.validations.get(taskTypeId)),
          x: i,
          y: this.lastHeaderMenuDisplayedIndexInGrid
        })
      })

      this.$store.commit('CLEAR_SELECTED_TASKS')
      this.$nextTick(() => {
        this.$store.commit('ADD_SELECTED_TASKS', selection)
        this.updateTaskInQuery()
        this.showHeaderMenu()
      })
    },

    // i = line number in entity group and k is the index of the entity group
    getEntityLineNumber(entities, i, k) {
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

    getGroupKey(group, i, fieldName) {
      const key = group[0] ? group[0][fieldName] + group[0].canceled : ''
      return `${i}-${key}`
    },

    onDescriptionChanged(entry, value) {
      this.$emit('field-changed', {
        entry,
        fieldName: 'description',
        value
      })
    },

    onNumberFieldKeyDown(event) {
      if (['ArrowDown', 'ArrowUp'].includes(event.key)) {
        this.pauseEvent(event) // Requires dom mixin
      }
    },

    toggleColumnSelector() {
      this.columnSelectorDisplayed = !this.columnSelectorDisplayed
    },

    metadataDescriptorIsInDepartmentFilter(metadataDescriptor) {
      return (
        this.departmentFilter.length === 0 ||
        metadataDescriptor.departments.length === 0 ||
        this.departmentFilter.some(d =>
          metadataDescriptor.departments.includes(d)
        )
      )
    },

    validationColumnsIsInDepartmentFilter(columnId) {
      return (
        this.departmentFilter.length === 0 ||
        this.taskTypeMap.get(columnId)?.department_id === null ||
        this.departmentFilter.includes(
          this.taskTypeMap.get(columnId).department_id
        )
      )
    },

    isMetadataColumnEditAllowed(descriptorId) {
      if (typeof descriptorId === 'string') {
        if (this.isCurrentUserManager) {
          return true
        } else if (this.isCurrentUserSupervisor) {
          if (this.user.departments.length === 0) {
            return true
          } else {
            const metadataDescriptor = this.visibleMetadataDescriptors.find(
              descriptor => descriptor.id === descriptorId
            )
            if (
              metadataDescriptor.departments.length ===
              this.user.departments.length
            ) {
              return this.user.departments.every(department =>
                metadataDescriptor.departments.includes(department)
              )
            }
          }
        }
      }
      return false
    },

    isValidResolution(shot) {
      if (!shot) return true
      const res = this.getMetadataFieldValue({ field_name: 'resolution' }, shot)
      if (!res || res.length === 0) return true
      const isValid = new RegExp(/\d{3,4}x\d{3,4}/).test(res)
      return isValid
    },

    toggleStickedColumns(columnId) {
      const sticked = !this.stickedColumns[columnId]
      this.stickedColumns = {
        ...this.stickedColumns,
        [columnId]: sticked
      }
      localStorage.setItem(
        this.localStorageStickKey,
        JSON.stringify(this.stickedColumns)
      )
    },

    stickColumnClicked() {
      this.toggleStickedColumns(this.lastHeaderMenuDisplayed)
      this.showHeaderMenu()
    },

    metadataStickColumnClicked(event) {
      this.toggleStickedColumns(this.lastMetadaDataHeaderMenuDisplayed)
      this.showMetadataHeaderMenu(this.lastMetadaDataHeaderMenuDisplayed, event)
    },

    /*
     * Update the url query string with the currently selected task id.
     * (set a task_id field in the query string)
     * If 0 or more than 1 task is selected, remove the task_id field.
     */
    updateTaskInQuery() {
      if (this.nbSelectedTasks === 1) {
        const selectedTaskIds = Array.from(this.selectedTasks.keys())
        const taskId = selectedTaskIds[0]
        this.$router.push({
          query: {
            ...this.$route.query,
            task_id: taskId
          }
        })
      } else {
        this.$router.push({
          query: {
            ...this.$route.query,
            task_id: undefined
          }
        })
      }
    },

    /*
     * Select the task listed in the url query string (task_id field) if
     * present.
     */
    selectTaskFromQuery() {
      const taskId = this.$route.query.task_id
      const task = this.taskMap.get(taskId)
      if (task) {
        const entityMap = entityMaps[this.type]
        const entity = entityMap.get(task.entity_id)

        if (entity) {
          const taskType = this.taskTypeMap.get(task.task_type_id)

          let list = this[`displayed${stringHelpers.capitalize(this.type)}s`]
          if (['asset', 'shot'].includes(this.type)) {
            list = list.flat()
          }
          const x = list.findIndex(e => e.id === entity.id)
          const y = this.validationColumns.indexOf(task.task_type_id)

          this.$store.commit('ADD_SELECTED_TASK', {
            task,
            entity,
            column: taskType,
            x,
            y
          })
        }
      }
    }
  },

  watch: {
    nbSelectedTasks() {
      this.updateTaskInQuery()
    }
  }
}
