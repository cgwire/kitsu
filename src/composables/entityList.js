/*
 * Shared logic of the entity lists (assets, shots, sequences, episodes,
 * edits): column menus, sticky columns, task selection grid, metadata
 * edition and drag browsing. Composition API counterpart of the former
 * entity_list, selection and descriptors mixins.
 *
 * The list template owns the refs this composable reads: `body`,
 * `th-name`, `th-episode`, the header menus (`headerMenu`,
 * `headerMetadataMenu`, `headerFieldMenu`), the sticky headers
 * (`editor-${j}`, `validation-${j}`) and the validation cells
 * (`validation-${i}-${j}`).
 */
import {
  computed,
  getCurrentInstance,
  nextTick,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  provide,
  reactive,
  ref,
  watch
} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

import {
  addEvents,
  getClientX,
  getClientY,
  pauseEvent,
  removeEvents
} from '@/composables/dom'
import colors from '@/lib/colors'
import { getMetadataEventValue, getMetadataFieldValue } from '@/lib/descriptors'
import preferences from '@/lib/preferences'
import stringHelpers from '@/lib/string'
import assetStore from '@/store/modules/assets'
import editStore from '@/store/modules/edits'
import episodeStore from '@/store/modules/episodes'
import sequenceStore from '@/store/modules/sequences'
import shotStore from '@/store/modules/shots'

const ENTITY_STORES = {
  asset: assetStore,
  edit: editStore,
  episode: episodeStore,
  sequence: sequenceStore,
  shot: shotStore
}

const HEADER_MENUS = ['headerMenu', 'headerMetadataMenu', 'headerFieldMenu']

const HEADER_MENU_OFFSET = { left: -3, top: 4 }

const getHeaderCell = event => event.target.closest('th')

const getWidth = element => element.getBoundingClientRect().width

export const hideHeaderMenus = (menus, exceptName = null) => {
  Object.entries(menus)
    .filter(([name]) => name !== exceptName)
    .forEach(([, menuEl]) => menuEl?.classList.add('hidden'))
}

/*
 * Shows the named menu under the header of the event, or hides it when
 * the same column is clicked again. `menus` maps each menu name to its
 * element.
 */
export const showHeaderMenuAt = (
  menus,
  name,
  event,
  getHeaderElement,
  offset = {},
  isSameColumn = false
) => {
  const menuEl = menus[name]
  if (!menuEl) return
  if (!event || (!menuEl.classList.contains('hidden') && isSameColumn)) {
    menuEl.classList.add('hidden')
    return
  }

  hideHeaderMenus(menus, name)
  menuEl.classList.remove('hidden')

  const headerBox = getHeaderElement(event).getBoundingClientRect()
  const left = headerBox.left + (offset.left || 0)
  const top = headerBox.bottom + (offset.top || 0)
  const width = Math.max(100, headerBox.width - 1)
  menuEl.style.left = `${left}px`
  menuEl.style.top = `${top}px`
  menuEl.style.width = `${width}px`
}

/*
 * Left offset of each sticky column: the full width of the columns before
 * it, from the template refs of the headers.
 */
export const getStickyOffsets = (
  refs,
  { showInfos, metadataCount, validationCount }
) => {
  const nameWidth = refs['th-name'] ? getWidth(refs['th-name']) : 0
  let offset = nameWidth
  if (refs['th-episode']) offset += getWidth(refs['th-episode'])
  const offsets = {}
  const place = (prefix, count) => {
    Array.from({ length: count }).forEach((_, index) => {
      const key = `${prefix}-${index}`
      offsets[key] = offset
      offset += getWidth(refs[key][0].$el)
    })
  }
  if (showInfos) place('editor', metadataCount)
  place('validation', validationCount)
  return { nameWidth, offsets }
}

const EDITABLE_SELECTOR = 'input:not([type="checkbox"]), select, textarea'

const getEditor = cell => cell.querySelector(EDITABLE_SELECTOR)

// The items after `start`, in steps of `step` and wrapping around.
const cycleFrom = (items, start, step) =>
  Array.from({ length: items.length - 1 }, (_, n) => {
    const distance = step * (n + 1)
    return items[(start + distance + items.length * (n + 1)) % items.length]
  })

/*
 * Arrow key navigation between the editors of a table: the next cell of
 * the row holding an editor, or the cell of the same column in the next
 * row holding one, wrapping around. Null when there is none.
 */
export const getNextEditableCell = (cell, key) => {
  const row = cell.parentElement
  const cells = Array.from(row.children)
  const column = cells.indexOf(cell)
  if (['ArrowLeft', 'ArrowRight'].includes(key)) {
    const step = key === 'ArrowRight' ? 1 : -1
    return cycleFrom(cells, column, step).find(getEditor) || null
  }
  if (['ArrowUp', 'ArrowDown'].includes(key)) {
    const rows = Array.from(row.parentElement.children)
    const step = key === 'ArrowDown' ? 1 : -1
    return (
      cycleFrom(rows, rows.indexOf(row), step)
        .map(nextRow => nextRow.children[column])
        .find(nextCell => nextCell && getEditor(nextCell)) || null
    )
  }
  return null
}

/*
 * Options:
 * - type: 'asset' | 'edit' | 'episode' | 'sequence' | 'shot'
 * - props: the list props (displaySettings, validationColumns, isLoading,
 *   departmentFilter)
 * - emit: the list emit
 * - entities: ref of the displayed entities, grouped for assets and shots
 * - filledColumns: ref of the columns holding at least one task
 * - metadataDescriptors: ref of the production descriptors of the type
 * - metadataDisplayHeaders: the initial column display switches
 * - isEmptyList: ref
 * - onScrollEnd: called when the body is scrolled near its end
 */
export const useEntityList = ({
  type,
  props,
  emit,
  entities,
  filledColumns,
  metadataDescriptors,
  metadataDisplayHeaders: initialDisplayHeaders = {},
  isEmptyList,
  onScrollEnd = null
}) => {
  const instance = getCurrentInstance()
  const route = useRoute()
  const router = useRouter()
  const store = useStore()

  const Type = stringHelpers.capitalize(type)
  // The refs object is replaced on the first ref set: read it each time.
  const getRef = name => instance.refs[name]
  const getBody = () => getRef('body')
  const getMenus = () =>
    Object.fromEntries(HEADER_MENUS.map(name => [name, getRef(name)?.$el]))

  // State
  // --------------------------------------------------------------------------

  const columnSelectorDisplayed = ref(false)
  const hiddenColumns = reactive({})
  const lastHeaderMenuDisplayed = ref(null)
  const lastMetadataHeaderMenuDisplayed = ref(null)
  const metadataDisplayHeaders = ref({ ...initialDisplayHeaders })
  const nameWidth = ref(0)
  const offsets = ref({})
  const shiftKeyPressed = ref(false)
  const stickedColumns = ref({})

  let lastFieldHeaderMenuDisplayed = null
  let lastFieldHeaderMenuLabel = null
  let lastHeaderMenuDisplayedIndexInGrid = null
  let lastSelection = null
  let lineIndex = {}
  let lineIndexRef = null
  let isBrowsingX = false
  let isBrowsingY = false
  let initialClientX = null
  let initialClientY = null
  let stickyHeaders = new Set()
  let stickyHeadersObserver = null

  // Computed
  // --------------------------------------------------------------------------

  const currentProduction = computed(() => store.getters.currentProduction)
  const isCurrentUserManager = computed(
    () => store.getters.isCurrentUserProductionManager
  )
  const isCurrentUserSupervisor = computed(
    () => store.getters.isCurrentUserProductionSupervisor
  )
  const nbSelectedTasks = computed(() => store.getters.nbSelectedTasks)
  const selectedTasks = computed(() => store.getters.selectedTasks)
  const taskMap = computed(() => store.getters.taskMap)
  const taskTypeMap = computed(() => store.getters.taskTypeMap)
  const user = computed(() => store.getters.user)
  const sorting = computed(() => store.getters[`${type}Sorting`])
  const selectionGrid = computed(() => store.getters[`${type}SelectionGrid`])
  const selectedEntities = computed(() => store.getters[`selected${Type}s`])

  const localStorageStickKey = computed(
    () => `stick-${type}s-${currentProduction.value?.id}`
  )

  const activeFieldSort = computed(() => {
    const current = sorting.value?.[0]
    return current && current.type === 'field' ? current : null
  })
  provide('activeFieldSort', activeFieldSort)

  const visibleMetadataDescriptors = computed(() =>
    metadataDescriptors.value.filter(descriptor => {
      const header = metadataDisplayHeaders.value[descriptor.field_name]
      return header === undefined || header
    })
  )

  const nonStickedVisibleMetadataDescriptors = computed(() =>
    visibleMetadataDescriptors.value.filter(
      descriptor =>
        !stickedColumns.value[descriptor.id] &&
        metadataDescriptorIsInDepartmentFilter(descriptor)
    )
  )

  const stickedVisibleMetadataDescriptors = computed(() =>
    visibleMetadataDescriptors.value.filter(
      descriptor =>
        stickedColumns.value[descriptor.id] &&
        metadataDescriptorIsInDepartmentFilter(descriptor)
    )
  )

  const displayedValidationColumns = computed(() =>
    props.validationColumns.filter(
      columnId =>
        filledColumns.value[columnId] &&
        (!hiddenColumns[columnId] || props.displaySettings.showInfos)
    )
  )

  const nonStickedDisplayedValidationColumns = computed(() =>
    displayedValidationColumns.value.filter(
      columnId =>
        !stickedColumns.value[columnId] &&
        validationColumnsIsInDepartmentFilter(columnId)
    )
  )

  const stickedDisplayedValidationColumns = computed(() =>
    displayedValidationColumns.value.filter(
      columnId =>
        stickedColumns.value[columnId] &&
        validationColumnsIsInDepartmentFilter(columnId)
    )
  )

  // The sticky columns can change without any loading state: the task
  // types of the sequence and episode pages arrive once they have loaded.
  const stickyColumnIds = computed(() =>
    [
      ...stickedVisibleMetadataDescriptors.value.map(({ id }) => id),
      ...stickedDisplayedValidationColumns.value
    ].join()
  )

  const isEmptyTask = computed(
    () =>
      !isEmptyList.value &&
      !props.isLoading &&
      props.validationColumns &&
      props.validationColumns.length === 0
  )

  // Columns
  // --------------------------------------------------------------------------

  const metadataDescriptorIsInDepartmentFilter = descriptor =>
    props.departmentFilter.length === 0 ||
    descriptor.departments.length === 0 ||
    props.departmentFilter.some(d => descriptor.departments.includes(d))

  const validationColumnsIsInDepartmentFilter = columnId => {
    const departmentId = taskTypeMap.value.get(columnId)?.department_id
    return (
      props.departmentFilter.length === 0 ||
      departmentId === null ||
      props.departmentFilter.includes(departmentId)
    )
  }

  const buildHideKey = columnId =>
    `column-${currentProduction.value.id}-${columnId}`

  const initHiddenColumns = () => {
    props.validationColumns.forEach(columnId => {
      hiddenColumns[columnId] =
        localStorage.getItem(buildHideKey(columnId)) === 'true'
    })
  }

  const hideColumn = columnId => {
    const key = buildHideKey(columnId)
    const isColumnHidden = localStorage.getItem(key) !== 'true'
    localStorage.setItem(key, isColumnHidden)
    hiddenColumns[columnId] = isColumnHidden
    return isColumnHidden
  }

  const toggleStickedColumns = columnId => {
    stickedColumns.value = {
      ...stickedColumns.value,
      [columnId]: !stickedColumns.value[columnId]
    }
    preferences.setObjectPreference(
      localStorageStickKey.value,
      stickedColumns.value
    )
  }

  const getBackground = color => colors.hexToRGBa(color, 0.08)

  const getValidationStyle = columnId => {
    const taskType = taskTypeMap.value.get(columnId)
    if (!taskType) return {}
    return {
      'border-left': `1px solid ${taskType.color}`,
      background: getBackground(taskType.color)
    }
  }

  const toggleColumnSelector = () => {
    columnSelectorDisplayed.value = !columnSelectorDisplayed.value
  }

  const isMetadataColumnEditAllowed = descriptorId => {
    if (typeof descriptorId !== 'string') return false
    if (isCurrentUserManager.value) return true
    if (!isCurrentUserSupervisor.value) return false

    const descriptor = visibleMetadataDescriptors.value.find(
      descriptor => descriptor.id === descriptorId
    )
    if (!descriptor) return false
    const departments = user.value.departments
    if (!departments.length) return true
    if (descriptor.departments.length !== departments.length) return false
    return departments.every(department =>
      descriptor.departments.includes(department)
    )
  }

  // Sticky offsets
  // --------------------------------------------------------------------------

  const updateOffsets = () => {
    if (props.isLoading) return
    nextTick(() => {
      const sticky = getStickyOffsets(instance.refs, {
        showInfos: props.displaySettings.showInfos,
        metadataCount: stickedVisibleMetadataDescriptors.value.length,
        validationCount: stickedDisplayedValidationColumns.value.length
      })
      nameWidth.value = sticky.nameWidth
      offsets.value = sticky.offsets
    })
  }

  // A sticky header resized by a drag or by its content moves the next
  // sticky columns.
  const observeStickyHeaders = () => {
    if (!stickyHeadersObserver) return
    const headers = new Set(
      [
        getRef('th-name'),
        getRef('th-episode'),
        ...stickedVisibleMetadataDescriptors.value.map(
          (descriptor, j) => getRef(`editor-${j}`)?.[0]?.$el
        ),
        ...stickedDisplayedValidationColumns.value.map(
          (columnId, j) => getRef(`validation-${j}`)?.[0]?.$el
        )
      ].filter(Boolean)
    )
    stickyHeaders.forEach(header => {
      if (!headers.has(header)) stickyHeadersObserver.unobserve(header)
    })
    headers.forEach(header => {
      if (!stickyHeaders.has(header)) stickyHeadersObserver.observe(header)
    })
    stickyHeaders = headers
  }

  // Scroll
  // --------------------------------------------------------------------------

  const setScrollPosition = scrollPosition => {
    if (getBody()) getBody().scrollTop = scrollPosition
  }

  const setScrollLeftPosition = scrollPosition => {
    if (getBody()) getBody().scrollLeft = scrollPosition
  }

  const onBodyScroll = event => {
    const body = getBody()
    if (!body) return
    const position = event.target
    emit('scroll', position.scrollTop)
    const maxHeight = body.scrollHeight - body.offsetHeight
    if (onScrollEnd && maxHeight < position.scrollTop + 100) onScrollEnd()
  }

  // Header menus
  // --------------------------------------------------------------------------

  const showHeaderMenu = (columnId, columnIndexInGrid, event) => {
    showHeaderMenuAt(
      getMenus(),
      'headerMenu',
      event,
      getHeaderCell,
      HEADER_MENU_OFFSET,
      lastHeaderMenuDisplayed.value === columnId
    )
    lastHeaderMenuDisplayed.value = columnId
    lastHeaderMenuDisplayedIndexInGrid = columnIndexInGrid
  }

  const showMetadataHeaderMenu = (columnId, event) => {
    showHeaderMenuAt(
      getMenus(),
      'headerMetadataMenu',
      event,
      getHeaderCell,
      HEADER_MENU_OFFSET,
      lastMetadataHeaderMenuDisplayed.value === columnId
    )
    lastMetadataHeaderMenuDisplayed.value = columnId
  }

  const showFieldHeaderMenu = (fieldName, label, event) => {
    showHeaderMenuAt(
      getMenus(),
      'headerFieldMenu',
      event,
      getHeaderCell,
      HEADER_MENU_OFFSET,
      lastFieldHeaderMenuDisplayed === fieldName
    )
    lastFieldHeaderMenuDisplayed = fieldName
    if (label !== undefined) lastFieldHeaderMenuLabel = label
  }

  const onHeaderMenuDocumentClick = event => {
    if (
      event.target.closest('.header-menu') ||
      event.target.closest('.header-icon')
    ) {
      return
    }
    hideHeaderMenus(getMenus())
  }

  const onHeaderMenuDocumentKeyDown = event => {
    if (event.key === 'Escape') hideHeaderMenus(getMenus())
  }

  const onSortByFieldClicked = () => {
    const column = lastFieldHeaderMenuDisplayed
    const current = sorting.value?.[0]
    const ascending =
      current && current.type === 'field' && current.column === column
        ? !current.ascending
        : true
    emit('change-sort', {
      type: 'field',
      column,
      name: lastFieldHeaderMenuLabel,
      ascending
    })
    showFieldHeaderMenu(column)
  }

  const onSortByTaskTypeClicked = () => {
    const taskTypeId = lastHeaderMenuDisplayed.value
    emit('change-sort', {
      type: 'status',
      column: taskTypeId,
      name: taskTypeMap.value.get(taskTypeId)?.name || ''
    })
    showHeaderMenu()
  }

  const onSortByMetadataClicked = () => {
    const column = currentProduction.value.descriptors.find(
      descriptor => descriptor.id === lastMetadataHeaderMenuDisplayed.value
    )
    emit('change-sort', {
      type: 'metadata',
      column: column.field_name,
      name: column.name,
      data_type: column.data_type
    })
    showMetadataHeaderMenu()
  }

  const onMinimizeColumnToggled = () => {
    hideColumn(lastHeaderMenuDisplayed.value)
    showHeaderMenu()
  }

  const onDeleteAllTasksClicked = () => {
    emit('delete-all-tasks', lastHeaderMenuDisplayed.value)
    showHeaderMenu()
  }

  const stickColumnClicked = () => {
    toggleStickedColumns(lastHeaderMenuDisplayed.value)
    showHeaderMenu()
  }

  const metadataStickColumnClicked = event => {
    toggleStickedColumns(lastMetadataHeaderMenuDisplayed.value)
    showMetadataHeaderMenu(lastMetadataHeaderMenuDisplayed.value, event)
  }

  const onAddMetadataClicked = () => emit('add-metadata')

  const onEditMetadataClicked = () => {
    emit('edit-metadata', lastMetadataHeaderMenuDisplayed.value)
    showMetadataHeaderMenu()
  }

  const onDeleteMetadataClicked = () => {
    emit('delete-metadata', lastMetadataHeaderMenuDisplayed.value)
    showMetadataHeaderMenu()
  }

  // Task selection
  // --------------------------------------------------------------------------

  const getValidationCell = (x, y) => getRef(`validation-${x}-${y}`)?.[0]

  /*
   * Writes the selected task id in the url query string, or removes it
   * when 0 or more than 1 task is selected.
   */
  const updateTaskInQuery = () => {
    const taskId =
      nbSelectedTasks.value === 1
        ? Array.from(selectedTasks.value.keys())[0]
        : undefined
    router.push({ query: { ...route.query, task_id: taskId } })
  }

  const scrollToValidationCell = validationCell => {
    if (!validationCell || nbSelectedTasks.value <= 0) return
    nextTick(() => {
      const margin = 20
      const headers = document.querySelectorAll(
        '.datatable-head .datatable-row-header'
      )
      const stickyHeaderWidth = Array.from(headers).reduce(
        (width, header) => width + header.offsetWidth,
        0
      )
      const body = getBody()
      const rect = validationCell.$el.getBoundingClientRect()
      const listRect = body.getBoundingClientRect()
      const isBelow = rect.bottom > listRect.bottom - margin
      const isAbove = rect.top < listRect.top + margin
      const isRight = rect.x + rect.width > listRect.width
      const isLeft = rect.x < stickyHeaderWidth + margin

      if (isBelow) {
        const scrollingRequired = rect.bottom - listRect.bottom + margin
        setScrollPosition(body.scrollTop + scrollingRequired)
      } else if (isAbove) {
        const scrollingRequired = listRect.top - rect.top + 2 * margin
        setScrollPosition(body.scrollTop - scrollingRequired)
      }

      if (isRight) {
        const scrollingRequired = rect.right - listRect.right + margin
        setScrollLeftPosition(body.scrollLeft + scrollingRequired)
      } else if (isLeft) {
        const scrollingRequired = stickyHeaderWidth - rect.left + 2 * margin
        setScrollLeftPosition(body.scrollLeft - scrollingRequired)
      }
    })
  }

  const onTaskSelected = (info, sticked) => {
    const columnOffset = stickedDisplayedValidationColumns.value.length
    const validationInfo = sticked
      ? info
      : { ...info, y: info.y + columnOffset }
    const selection = []
    emit('keep-task-panel-open', true)
    if (validationInfo.isShiftKey) {
      if (lastSelection) {
        let startX = lastSelection.x
        let endX = validationInfo.x
        let startY = lastSelection.y
        if (!sticked) startY += columnOffset
        let endY = validationInfo.y
        if (validationInfo.x < lastSelection.x) {
          startX = validationInfo.x
          endX = lastSelection.x
        }
        if (validationInfo.y < lastSelection.y) {
          startY = validationInfo.y
          endY = lastSelection.y
          if (!sticked) endY += columnOffset
        }

        for (let i = startX; i <= endX; i++) {
          for (let j = startY; j <= endY; j++) {
            const validationCell = getValidationCell(i, j)
            const isSelectedCell = selectionGrid.value?.has(`${i}-${j}`)
            if (validationCell?.selectable && !isSelectedCell) {
              selection.push({
                entity: validationCell.entity,
                column: validationCell.column,
                task: validationCell.task,
                x: validationCell.rowX,
                y: sticked
                  ? validationCell.columnY
                  : validationCell.columnY + columnOffset
              })
            }
          }
        }
        store.commit('ADD_SELECTED_TASK', validationInfo)
      }
    } else if (!validationInfo.isCtrlKey) {
      store.commit('CLEAR_SELECTED_TASKS')
    }
    if (selection.length === 0) {
      store.commit('ADD_SELECTED_TASK', validationInfo)
    } else {
      store.commit('ADD_SELECTED_TASKS', selection)
    }
    updateTaskInQuery()

    if (!validationInfo.isShiftKey && validationInfo.isUserClick) {
      const x = validationInfo.x
      const y = sticked ? validationInfo.y : validationInfo.y - columnOffset
      lastSelection = { x, y }
      const validationCell = getValidationCell(x, y)
      nextTick(() => {
        scrollToValidationCell(validationCell)
      })
    }

    nextTick(() => {
      emit('keep-task-panel-open', false)
    })
  }

  const onTaskUnselected = (info, sticked) => {
    const validationInfo = sticked
      ? info
      : { ...info, y: info.y + stickedDisplayedValidationColumns.value.length }
    if (validationInfo.isCtrlKey || nbSelectedTasks.value === 1) {
      store.commit('REMOVE_SELECTED_TASK', validationInfo)
    } else {
      store.commit('CLEAR_SELECTED_TASKS')
      store.commit('ADD_SELECTED_TASK', validationInfo)
    }
    updateTaskInQuery()
  }

  const onSelectColumn = () => {
    const taskTypeId = lastHeaderMenuDisplayed.value
    const selection = ENTITY_STORES[type].cache.result
      .filter(entity => !entity.canceled)
      .map((entity, i) => ({
        entity,
        column: taskTypeMap.value.get(taskTypeId),
        task: taskMap.value.get(entity.validations.get(taskTypeId)),
        x: i,
        y: lastHeaderMenuDisplayedIndexInGrid
      }))

    store.commit('CLEAR_SELECTED_TASKS')
    nextTick(() => {
      store.commit('ADD_SELECTED_TASKS', selection)
      updateTaskInQuery()
      showHeaderMenu()
    })
  }

  /*
   * Selects the task listed in the url query string (task_id field) if
   * present.
   */
  const selectTaskFromQuery = () => {
    const task = taskMap.value.get(route.query.task_id)
    if (!task) return
    const entity = ENTITY_STORES[type].cache[`${type}Map`].get(task.entity_id)
    if (!entity) return

    const list = ['asset', 'shot'].includes(type)
      ? entities.value.flat()
      : entities.value
    const x = list.findIndex(e => e.id === entity.id)
    let y = stickedDisplayedValidationColumns.value.indexOf(task.task_type_id)
    if (y === -1) {
      const nonStickedIndex =
        nonStickedDisplayedValidationColumns.value.indexOf(task.task_type_id)
      if (nonStickedIndex > -1) {
        y = nonStickedIndex + stickedDisplayedValidationColumns.value.length
      }
    }
    if (y > -1) {
      store.commit('ADD_SELECTED_TASK', {
        task,
        entity,
        column: taskTypeMap.value.get(task.task_type_id),
        x,
        y
      })
    }
  }

  const select = (i, j) => {
    const validationCell = getValidationCell(i, j)
    validationCell?.$el.click()
    return validationCell
  }

  const stopEvent = event => {
    const e = event || window.event
    e.stopPropagation()
    e.cancelBubble = true
    e.returnValue = false
  }

  const onKeyUp = event => {
    shiftKeyPressed.value = event.shiftKey
  }

  const onKeyDown = event => {
    shiftKeyPressed.value = event.shiftKey
    if (!event.altKey || ![37, 38, 39, 40].includes(event.keyCode)) return
    const { x: i, y: j } = lastSelection || { x: 0, y: 0 }
    const moves = {
      37: [i, j - 1],
      38: [i - 1, j],
      39: [i, j + 1],
      40: [i + 1, j]
    }
    scrollToValidationCell(select(...moves[event.keyCode]))
    stopEvent(event)
  }

  // Rows
  // --------------------------------------------------------------------------

  // i = line number in entity group and k is the index of the entity group
  const getEntityLineNumber = (groups, i, k) => {
    if (lineIndexRef !== groups) {
      lineIndex = {}
      lineIndexRef = groups
    }
    const key = `${i}-${k}`
    if (lineIndex[key] === undefined) {
      lineIndex[key] =
        i + groups.slice(0, k).reduce((sum, group) => sum + group.length, 0)
    }
    return lineIndex[key]
  }

  const getGroupKey = (group, i, fieldName) => {
    const key = group[0] ? group[0][fieldName] + group[0].canceled : ''
    return `${i}-${key}`
  }

  const onDescriptionChanged = (entry, value) => {
    emit('field-changed', { entry, fieldName: 'description', value })
  }

  const onNumberFieldKeyDown = event => {
    if (['ArrowDown', 'ArrowUp'].includes(event.key)) pauseEvent(event)
  }

  const isValidResolution = entity => {
    if (!entity) return true
    const res = getMetadataFieldValue({ field_name: 'resolution' }, entity)
    if (!res || res.length === 0) return true
    return /\d{3,4}x\d{3,4}/.test(res)
  }

  // Metadata edition
  // --------------------------------------------------------------------------

  const emitMetadataChanged = (entry, descriptor, value) => {
    emit('metadata-changed', { entry, descriptor, value })
  }

  // A change on a selected line applies to every selected line.
  const onMetadataFieldChanged = (entry, descriptor, event) => {
    const value = getMetadataEventValue(descriptor, entry, event)
    if (value === undefined) return
    if (selectedEntities.value?.has(entry.id)) {
      selectedEntities.value.forEach(selected => {
        emitMetadataChanged(selected, descriptor, value)
      })
    } else {
      emitMetadataChanged(entry, descriptor, value)
    }
  }

  // Ctrl + arrow in an editor focuses the editor of the neighbouring cell.
  const onInputKeyUp = event => {
    const cell = event.target.closest('td, th')
    const nextCell = cell && getNextEditableCell(cell, event.key)
    if (!nextCell) return
    getEditor(nextCell).focus()
    return pauseEvent(event)
  }

  // Drag browsing
  // --------------------------------------------------------------------------

  const startBrowsing = event => {
    if (event.target.tagName === 'INPUT') return
    document.body.style.cursor = 'grabbing'
    isBrowsingX = true
    isBrowsingY = true
    initialClientX = getClientX(event)
    initialClientY = getClientY(event)
  }

  const stopBrowsing = () => {
    document.body.style.cursor = 'default'
    isBrowsingX = false
    isBrowsingY = false
    initialClientX = null
    initialClientY = null
  }

  const onMouseMove = event => {
    const body = getBody()
    if (isBrowsingX) {
      const movementX = event.movementX || getClientX(event) - initialClientX
      initialClientX = getClientX(event)
      body.scrollLeft -= movementX
    }
    if (isBrowsingY) {
      const movementY = event.movementY || getClientY(event) - initialClientY
      initialClientY = getClientY(event)
      body.scrollTop -= movementY
    }
  }

  // Firefox starts a native drag of the task links and thumbnails under
  // the pointer, which swallows the mouse moves the grab scrolls with.
  const onDragStart = event => {
    if (isBrowsingX || isBrowsingY) event.preventDefault()
  }

  const domEvents = [
    ['dragstart', onDragStart],
    ['mousemove', onMouseMove],
    ['touchmove', onMouseMove],
    ['mouseup', stopBrowsing],
    ['mouseleave', stopBrowsing],
    ['touchend', stopBrowsing],
    ['touchcancel', stopBrowsing],
    ['keyup', stopBrowsing]
  ]

  // Watchers
  // --------------------------------------------------------------------------

  watch(nbSelectedTasks, updateTaskInQuery)
  watch(stickyColumnIds, updateOffsets)
  watch(stickedColumns, updateOffsets)
  watch(() => props.isLoading, updateOffsets)
  watch(() => props.displaySettings.bigThumbnails, updateOffsets)
  // The infos add or remove sticky columns (metadata, TV show episodes).
  watch(() => props.displaySettings.showInfos, updateOffsets)
  watch(() => props.validationColumns, initHiddenColumns, { deep: true })

  // Lifecycle
  // --------------------------------------------------------------------------

  initHiddenColumns()

  onMounted(() => {
    window.addEventListener('keydown', onKeyDown, false)
    window.addEventListener('keyup', onKeyUp, false)
    document.addEventListener('click', onHeaderMenuDocumentClick)
    document.addEventListener('keydown', onHeaderMenuDocumentKeyDown)
    addEvents(domEvents)
    stickedColumns.value =
      preferences.getObjectPreference(localStorageStickKey.value) || {}
    if (typeof ResizeObserver !== 'undefined') {
      stickyHeadersObserver = new ResizeObserver(() => updateOffsets())
      observeStickyHeaders()
    }
  })

  // Sticky headers come and go with the stick menu and the display settings.
  onUpdated(observeStickyHeaders)

  onBeforeUnmount(() => {
    stickyHeadersObserver?.disconnect()
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup', onKeyUp)
    document.removeEventListener('click', onHeaderMenuDocumentClick)
    document.removeEventListener('keydown', onHeaderMenuDocumentKeyDown)
    removeEvents(domEvents)
    document.body.style.cursor = 'default'
  })

  return {
    columnSelectorDisplayed,
    hiddenColumns,
    lastHeaderMenuDisplayed,
    lastMetadataHeaderMenuDisplayed,
    metadataDisplayHeaders,
    nameWidth,
    offsets,
    shiftKeyPressed,
    stickedColumns,

    displayedValidationColumns,
    isEmptyTask,
    nonStickedDisplayedValidationColumns,
    nonStickedVisibleMetadataDescriptors,
    stickedDisplayedValidationColumns,
    stickedVisibleMetadataDescriptors,
    visibleMetadataDescriptors,

    getEntityLineNumber,
    getGroupKey,
    getValidationStyle,
    isMetadataColumnEditAllowed,
    isValidResolution,
    metadataStickColumnClicked,
    onAddMetadataClicked,
    onBodyScroll,
    onDeleteAllTasksClicked,
    onDeleteMetadataClicked,
    onDescriptionChanged,
    onEditMetadataClicked,
    onInputKeyUp,
    onMetadataFieldChanged,
    onMinimizeColumnToggled,
    onNumberFieldKeyDown,
    onSelectColumn,
    onSortByFieldClicked,
    onSortByMetadataClicked,
    onSortByTaskTypeClicked,
    onTaskSelected,
    onTaskUnselected,
    selectTaskFromQuery,
    setScrollPosition,
    showFieldHeaderMenu,
    showHeaderMenu,
    showMetadataHeaderMenu,
    startBrowsing,
    stickColumnClicked,
    toggleColumnSelector,
    updateOffsets
  }
}
