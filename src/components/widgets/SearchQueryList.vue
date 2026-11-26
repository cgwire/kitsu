<template>
  <div class="search-queries" @dragover="onListDragOver" @drop="onListDrop">
    <span
      class="tag folder mr1"
      role="button"
      tabindex="0"
      @click="editGroup()"
      @keydown.enter.prevent="editGroup()"
      @keydown.space.prevent="editGroup()"
      :title="$t('main.filter_group_add')"
      v-if="isGroupEnabled"
    >
      <folder-plus-icon :size="12" />
    </span>
    <span
      class="tag folder add mr1"
      :class="{ disabled: !pageQuery }"
      role="button"
      tabindex="0"
      :aria-disabled="`${!pageQuery}`"
      @click="addPageSearch()"
      @keydown.enter.prevent="addPageSearch()"
      @keydown.space.prevent="addPageSearch()"
      :title="$t('main.search_query_add')"
      v-if="withRouteQuery"
    >
      <funnel-plus-icon :size="12" />
    </span>
    <span
      class="tag folder mr1"
      :class="{
        active: isEditing
      }"
      role="button"
      tabindex="0"
      @click="isEditing = !isEditing"
      @keydown.enter.prevent="isEditing = !isEditing"
      @keydown.space.prevent="isEditing = !isEditing"
      :title="$t('main.edit_mode_on')"
      v-if="hasChangeableRow"
    >
      <pencil-icon :size="12" />
    </span>
    <template v-if="isGroupEnabled">
      <span
        class="tag group"
        :class="{
          open: toggleGroupId === group.id,
          'is-shared': group.is_shared,
          'is-editing': isEditing
        }"
        :key="`group-${group.id}`"
        :style="{
          backgroundColor: `${group.color}23`
        }"
        role="button"
        tabindex="0"
        :aria-label="group.name"
        :aria-expanded="`${toggleGroupId === group.id}`"
        @click="onGroupClick(group, $event)"
        @keydown.enter.self.prevent="onGroupKey(group, $event)"
        @keydown.space.self.prevent="onGroupKey(group, $event)"
        v-bind="moveBindings(group, groupZone(group))"
        v-for="group in userFilterGroups"
      >
        <div class="group-header">
          <span
            class="dot"
            :style="{ borderColor: getDepartment(group)?.color }"
            :title="getDepartment(group)?.name"
            v-if="group.is_shared && group.department_id"
          ></span>
          <span class="filter-label" :title="group.name">
            {{ group.name }}
          </span>
          <chevron-down-icon
            class="chevron ml05"
            :size="12"
            v-if="toggleGroupId !== group.id"
          />
          <chevron-up-icon class="chevron ml05" :size="12" v-else />
          <button
            class="edit"
            :title="$t('main.filter_group_edit')"
            :style="{ backgroundColor: `${group.color}53` }"
            @click.stop="editGroup(group)"
            v-if="canChange(group)"
          >
            <edit2-icon :size="8" />
          </button>
          <button
            class="del"
            :title="$t('main.remove')"
            :style="{ backgroundColor: `${group.color}53` }"
            @click.stop="confirmRemoveGroup(group)"
            v-if="!group.queries.length && canChange(group)"
          >
            <trash2-icon :size="8" />
          </button>
        </div>
        <div class="group-list" v-if="toggleGroupId === group.id">
          <span class="tag empty" v-if="!group.queries.length">
            <em>{{ $t('main.filter_group_empty') }}</em>
          </span>
          <template v-else>
            <div
              class="tag"
              :class="{
                active: isActiveSearch(searchQuery),
                'is-shared': searchQuery.is_shared,
                'is-editing': isEditing
              }"
              :key="searchQuery.id"
              :style="{ backgroundColor: `${group.color}23` }"
              :title="getSearchQueryTitle(searchQuery)"
              @click="navigateToSearchQuery(searchQuery)"
              v-bind="moveBindings(searchQuery, filterZone(searchQuery))"
              v-for="searchQuery in group.queries"
            >
              <router-link
                class="flexrow filter-name"
                draggable="false"
                :to="queryPaths[searchQuery.id] || { name: 'open-productions' }"
              >
                <span class="filter-label">{{ searchQuery.name }}</span>
              </router-link>
              <button
                class="edit"
                :title="$t('main.search_query_edit')"
                :style="{
                  backgroundColor: `${group.color}53`
                }"
                @click.stop="editSearch(searchQuery)"
                v-if="canChange(searchQuery)"
              >
                <edit2-icon :size="8" />
              </button>
              <button
                class="del"
                :title="$t('main.remove')"
                :style="{ backgroundColor: `${group.color}53` }"
                @click.stop="confirmRemoveSearch(searchQuery)"
                v-if="canChange(searchQuery)"
              >
                <trash2-icon :size="8" />
              </button>
            </div>
          </template>
        </div>
      </span>
    </template>
    <span
      class="tag"
      :class="{
        active: isActiveSearch(searchQuery),
        'is-shared': searchQuery.is_shared,
        'is-editing': isEditing
      }"
      :key="searchQuery.id"
      :title="getSearchQueryTitle(searchQuery)"
      @click="navigateToSearchQuery(searchQuery)"
      v-bind="moveBindings(searchQuery, filterZone(searchQuery))"
      v-for="searchQuery in userFilters"
    >
      <router-link
        class="flexrow filter-name"
        draggable="false"
        :to="queryPaths[searchQuery.id] || { name: 'open-productions' }"
      >
        <span
          class="dot"
          :style="{ borderColor: getDepartment(searchQuery)?.color }"
          :title="getDepartment(searchQuery)?.name"
          v-if="searchQuery.is_shared && searchQuery.department_id"
        ></span>
        <span class="filter-label">{{ searchQuery.name }}</span>
      </router-link>
      <button
        class="edit"
        :title="$t('main.search_query_edit')"
        @click.stop="editSearch(searchQuery)"
        v-if="canChange(searchQuery)"
      >
        <edit2-icon :size="8" />
      </button>
      <button
        class="del"
        :title="$t('main.remove')"
        @click.stop="confirmRemoveSearch(searchQuery)"
        v-if="canChange(searchQuery)"
      >
        <trash2-icon :size="8" />
      </button>
    </span>

    <confirm-modal
      active
      is-danger
      :confirm-button-text="
        searchQueryToRemove.id
          ? $t('main.remove_search_query_button')
          : $t('main.remove_search_filter_group_button')
      "
      :is-loading="loading.remove"
      :is-error="errors.remove"
      :error-text="removeErrorText"
      :text="removeText"
      @cancel="modals.remove = false"
      @confirm="removeSearch"
      v-if="modals.remove"
    />

    <edit-search-filter-modal
      active
      :group-options="groupOptions"
      :is-loading="loading.edit"
      :is-error="errors.edit"
      :is-group-enabled="isGroupEnabled"
      :is-query-editable="!withRouteQuery"
      :production-id="productionId"
      :queries="sortedFilters"
      :search-query-to-edit="searchQueryToEdit"
      @cancel="modals.edit = false"
      @confirm="confirmEditSearch"
      v-if="modals.edit"
    />

    <edit-search-filter-group-modal
      active
      :is-loading="loading.group"
      :is-error="errors.group"
      :groups="userFilterGroups"
      :group-to-edit="groupToEdit"
      @cancel="modals.group = false"
      @confirm="confirmEditFilterGroup"
      v-if="modals.group"
    />
  </div>
</template>

<script setup>
// Imports
// --------------------------------------------------------------------------
import {
  ChevronDownIcon,
  ChevronUpIcon,
  Edit2Icon,
  FolderPlusIcon,
  FunnelPlusIcon,
  PencilIcon,
  Trash2Icon
} from 'lucide-vue-next'
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

import { toSortedQueryString } from '@/lib/query'
import { sortByName } from '@/lib/sorting'
import stringHelpers from '@/lib/string'

import ConfirmModal from '@/components/modals/ConfirmModal.vue'
import EditSearchFilterGroupModal from '@/components/modals/EditSearchFilterGroupModal.vue'
import EditSearchFilterModal from '@/components/modals/EditSearchFilterModal.vue'

// The lists whose search saving action is not save<Type>Search.
const SAVE_SEARCH_ACTIONS = {
  person: 'savePersonTasksSearch',
  sequenceStat: 'saveSequenceSearch',
  taskType: 'saveTaskSearch'
}

// The lists whose search removal action is not remove<Type>Search.
const REMOVE_SEARCH_ACTIONS = {
  person: 'removePersonTasksSearch',
  sequenceStat: 'removeSequenceSearch',
  taskType: 'removeTaskSearch'
}

// Composables
// --------------------------------------------------------------------------
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore()

// Props / Emits
// --------------------------------------------------------------------------
const props = defineProps({
  queries: {
    type: Array,
    default: () => []
  },
  groups: {
    type: Array,
    default: () => []
  },
  isGroupEnabled: {
    type: Boolean,
    default: false
  },
  // Entity type of a list that saves its searches per entity type.
  entityType: {
    type: String,
    default: null
  },
  type: {
    type: String,
    required: true
  },
  // Production the listed searches belong to. Left unset by
  // cross-production consumers (Todos, People, Person), which keep the
  // global role.
  productionId: {
    type: String,
    default: null
  },
  // A search holds the whole URL query of the page, its filters and view,
  // rather than a search text: the list saves the current one and a search
  // replaces it.
  withRouteQuery: {
    type: Boolean,
    default: false
  },
  // The keys of the route query a search neither holds nor changes: what
  // the page shows beside its filters, as a folder or a selection.
  keptQueryKeys: {
    type: Array,
    default: () => []
  }
})

// State
// --------------------------------------------------------------------------
// the row a drag moves, with the order of its zone when the drag started,
// and the place of each row of that zone if it were dropped now
const dragged = ref(null)
const draggedPlaces = ref(null)
const groupToEdit = ref({})
const groupToRemove = ref({})
const isEditing = ref(false)
const queryPaths = ref({})
const searchQueryToEdit = ref({})
const searchQueryToRemove = ref({})
const errors = reactive({
  edit: false,
  group: false,
  remove: false
})
const loading = reactive({
  edit: false,
  group: false,
  remove: false
})
const modals = reactive({
  edit: false,
  group: false,
  remove: false
})
// Each opening of a modal starts a session of its own: a request still running
// for a closed one keeps the next one waiting, then leaves it alone unless it
// changed the row of that one.
const sessions = { edit: 0, group: 0, remove: 0 }
const toggleGroupId = ref(null)

// Computed
// --------------------------------------------------------------------------
const departmentMap = computed(() => store.getters.departmentMap)
const isCurrentUserAdmin = computed(() => store.getters.isCurrentUserAdmin)
const isCurrentUserClient = computed(() => store.getters.isCurrentUserClient)
const isCurrentUserManager = computed(() =>
  props.productionId
    ? isCurrentUserAdmin.value ||
      store.getters.currentUserRoleForProduction(props.productionId) ===
        'manager'
    : store.getters.isCurrentUserManager
)
const personMap = computed(() => store.getters.personMap)
const user = computed(() => store.getters.user)

const sortedFilters = computed(() => {
  const queries = props.queries.filter(
    query => !isCurrentUserClient.value || !query.is_shared
  )
  return sortRows(queries)
})

const userFilters = computed(() =>
  sharedFirst(
    sortedFilters.value.filter(query => !query.search_filter_group_id)
  )
)

const userFilterGroups = computed(() => {
  const groups = props.groups.filter(
    group => !isCurrentUserClient.value || !group.is_shared
  )
  return sharedFirst(sortRows(groups)).map(group => ({
    ...group,
    queries: sortedFilters.value.filter(
      query => query.search_filter_group_id === group.id
    )
  }))
})

// The rows that are ordered together, by zone: a shared row stays among the
// shared ones, and a search stays in its group.
const zones = computed(() =>
  [
    ...userFilterGroups.value.map(group => [groupZone(group), group]),
    ...sortedFilters.value.map(query => [filterZone(query), query])
  ].reduce(
    (rowsByZone, [zone, row]) => ({
      ...rowsByZone,
      [zone]: [...(rowsByZone[zone] || []), row]
    }),
    {}
  )
)

const hasChangeableRow = computed(() =>
  [
    ...userFilters.value,
    ...userFilterGroups.value.flatMap(group => [group, ...group.queries])
  ].some(canChange)
)

const groupOptions = computed(() => {
  return [
    { label: '', value: null },
    ...userFilterGroups.value.map(group => ({
      label: group.name,
      value: group.id,
      is_shared: group.is_shared
    }))
  ]
})

const removeText = computed(() => {
  if (searchQueryToRemove.value.id) {
    return t('main.remove_search_query', {
      name: searchQueryToRemove.value.name
    })
  } else {
    return t('main.remove_search_filter_group', {
      name: groupToRemove.value.name
    })
  }
})

const removeErrorText = computed(() =>
  searchQueryToRemove.value.id
    ? t('main.remove_search_query_error')
    : t('main.remove_search_filter_group_error')
)

const pageQuery = computed(() =>
  props.withRouteQuery
    ? new URLSearchParams(pickQueryKeys(false)).toString()
    : ''
)

const sortedPageQuery = computed(() =>
  toSortedQueryString(pickQueryKeys(false))
)

// Functions
// --------------------------------------------------------------------------
// Zou takes a change only from the owner of a row or an admin. A row can be in
// the list of someone else: a filter of a shared group that turned private
// stays there until a reload.
const canChange = row =>
  isCurrentUserAdmin.value ||
  (row.person_id === user.value?.id &&
    (!row.is_shared || isCurrentUserManager.value))

const pickQueryKeys = isKept =>
  Object.fromEntries(
    Object.entries(route.query).filter(
      ([key]) => props.keptQueryKeys.includes(key) === isKept
    )
  )

const isActiveSearch = searchQuery =>
  props.withRouteQuery &&
  toSortedQueryString(searchQuery.search_query) === sortedPageQuery.value

// The rows their owner placed come first, in that order, then the others by
// name. A drag shows its zone as the drop would leave it.
const sortRows = rows => sortByName(rows).sort((a, b) => rank(a) - rank(b))

const rank = row =>
  draggedPlaces.value?.[row.id] ?? row.position ?? Number.MAX_SAFE_INTEGER

const sharedFirst = rows => [
  ...rows.filter(row => row.is_shared),
  ...rows.filter(row => !row.is_shared)
]

const setQueryPaths = () => {
  props.queries.forEach(query => {
    queryPaths.value[query.id] = queryRoute(query)
  })
}

const queryRoute = searchQuery => {
  return {
    ...route,
    query: props.withRouteQuery
      ? {
          ...pickQueryKeys(true),
          ...Object.fromEntries(new URLSearchParams(searchQuery.search_query))
        }
      : { ...route.query, search: searchQuery.search_query }
  }
}

const openModal = kind => {
  sessions[kind]++
  errors[kind] = false
  modals[kind] = true
}

// One request at a time for each kind of modal, so that nothing is saved or
// removed twice. Its end closes or marks its modal only if it was not opened
// again since; onLateSuccess handles a modal opened again on the same row.
const runInModal = async (kind, request, onLateSuccess) => {
  if (loading[kind]) return
  const session = sessions[kind]
  const isCurrent = () => session === sessions[kind]
  loading[kind] = true
  errors[kind] = false
  try {
    await request()
    if (isCurrent()) modals[kind] = false
    else onLateSuccess?.()
  } catch (err) {
    console.error(err)
    if (isCurrent()) errors[kind] = true
  } finally {
    loading[kind] = false
  }
}

const editGroup = (group = {}) => {
  groupToEdit.value = group
  openModal('group')
}

const editSearch = searchQuery => {
  searchQueryToEdit.value = searchQuery
  openModal('edit')
}

const addSearch = searchQuery => {
  editSearch({ name: searchQuery, search_query: searchQuery })
}

const addPageSearch = () => {
  if (pageQuery.value) {
    editSearch({ name: '', search_query: pageQuery.value })
  }
}

const navigateToSearchQuery = searchQuery => {
  router.push(queryPaths.value[searchQuery.id] || { name: 'open-productions' })
}

const confirmEditFilterGroup = filterGroup =>
  runInModal(
    'group',
    () => {
      const group = { ...filterGroup, project_id: props.productionId }
      return store.dispatch(
        group.id
          ? 'updateSearchFilterGroup'
          : `save${stringHelpers.capitalize(props.type)}SearchFilterGroup`,
        group
      )
    },
    // The modal opened again on this group shows it as saved.
    () => {
      const saved = props.groups.find(({ id }) => id === filterGroup.id)
      if (saved && groupToEdit.value.id === saved.id) {
        groupToEdit.value = { ...saved }
      }
    }
  )

const confirmEditSearch = searchFilter =>
  runInModal(
    'edit',
    () => {
      if (searchFilter.id) {
        return store.dispatch('updateSearchFilter', {
          ...searchFilter,
          project_id: props.productionId
        })
      }
      const type = stringHelpers.capitalize(props.type)
      return store.dispatch(
        SAVE_SEARCH_ACTIONS[props.type] || `save${type}Search`,
        { ...searchFilter, entity_type: props.entityType }
      )
    },
    // The modal opened again on this filter shows it as saved: the store
    // changed the row in place, and the modal fills its form from a new one.
    () => {
      const saved = props.queries.find(({ id }) => id === searchFilter.id)
      if (saved && searchQueryToEdit.value.id === saved.id) {
        searchQueryToEdit.value = { ...saved }
      }
    }
  )

const confirmRemoveSearch = searchQuery => {
  searchQueryToRemove.value = searchQuery
  groupToRemove.value = {}
  openModal('remove')
}

const confirmRemoveGroup = filterGroup => {
  groupToRemove.value = filterGroup
  searchQueryToRemove.value = {}
  openModal('remove')
}

// The confirmation stays open until the removal ends, with its error when it
// fails.
const removeSearch = () => {
  const type = stringHelpers.capitalize(props.type)
  const isSearch = Boolean(searchQueryToRemove.value.id)
  const row = isSearch ? searchQueryToRemove.value : groupToRemove.value
  return runInModal(
    'remove',
    () =>
      isSearch
        ? store.dispatch(
            REMOVE_SEARCH_ACTIONS[props.type] || `remove${type}Search`,
            row
          )
        : store.dispatch(`remove${type}SearchFilterGroup`, row),
    // A confirmation opened again for this row has nothing left to remove.
    () => {
      const shown = searchQueryToRemove.value.id || groupToRemove.value.id
      if (shown === row.id) modals.remove = false
    }
  )
}

const toggleFilterGroup = group => {
  toggleGroupId.value = toggleGroupId.value !== group.id ? group.id : null
}

// A click on a filter of an open group also closes the group, under the
// filter that held the focus: the focus goes back to the group, or it would
// fall to the page.
const onGroupClick = (group, event) => {
  const groupElement = event.currentTarget
  const isFocusInList = Boolean(
    groupElement.querySelector('.group-list')?.contains(document.activeElement)
  )
  toggleFilterGroup(group)
  if (isFocusInList && toggleGroupId.value !== group.id) {
    nextTick(() => groupElement.focus())
  }
}

// A held key repeats its keydown: only the first one toggles the group.
const onGroupKey = (group, event) => {
  if (!event.repeat) toggleFilterGroup(group)
}

// Functions (order)
// --------------------------------------------------------------------------
const groupZone = group => `groups:${group.is_shared}`

const filterZone = query =>
  query.search_filter_group_id
    ? `held:${query.search_filter_group_id}`
    : `filters:${query.is_shared}`

// A move changes the position of the neighbours of the row too: Zou takes
// them only from who can change every row of the zone.
const canReorder = zone =>
  isEditing.value &&
  zones.value[zone].length > 1 &&
  zones.value[zone].every(canChange)

// A group holds the tags of its searches: their events reach it too.
const isOwnEvent = event => event.target.closest('.tag') === event.currentTarget

const placeRow = (rows, id, targetId, isAfter) => {
  const others = rows.filter(row => row.id !== id)
  const index = others.findIndex(row => row.id === targetId) + (isAfter ? 1 : 0)
  return [
    ...others.slice(0, index),
    rows.find(row => row.id === id),
    ...others.slice(index)
  ]
}

const saveOrder = (zone, rows) =>
  store
    .dispatch('saveSearchPositions', {
      rows,
      isGroup: zone.startsWith('groups')
    })
    .catch(console.error)

const resetDrag = () => {
  dragged.value = null
  draggedPlaces.value = null
}

const onDragStart = (event, row, zone) => {
  if (!isOwnEvent(event) || !canReorder(zone)) return
  dragged.value = {
    id: row.id,
    zone,
    ids: zones.value[zone].map(({ id }) => id)
  }
  event.dataTransfer.effectAllowed = 'move'
  // Firefox starts no drag without data
  event.dataTransfer.setData('text/plain', row.name)
}

// The dragged tag takes the place it would get, and marks it.
const onDragOver = (event, row, zone) => {
  if (dragged.value?.zone !== zone || dragged.value.id === row.id) return
  const tag = event.currentTarget.getBoundingClientRect()
  // the searches of a group are listed in a column
  const isAfter = zone.startsWith('held')
    ? event.clientY > tag.top + tag.height / 2
    : event.clientX > tag.left + tag.width / 2
  const rows = placeRow(zones.value[zone], dragged.value.id, row.id, isAfter)
  draggedPlaces.value = Object.fromEntries(
    rows.map(({ id }, index) => [id, index])
  )
}

// The list takes the drop: the tags leave gaps between them, and the dragged
// one is often under the pointer.
const onListDragOver = event => {
  if (dragged.value) event.preventDefault()
}

const onListDrop = event => {
  if (!dragged.value) return
  event.preventDefault()
  const { ids, zone } = dragged.value
  const rows = zones.value[zone]
  // the store places the rows before the drag forgets where they were shown
  if (rows.some((row, index) => row.id !== ids[index])) saveOrder(zone, rows)
  resetDrag()
}

const onMoveKey = (event, row, zone) => {
  const step = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }[
    event.key
  ]
  if (!step || !event.shiftKey || !isOwnEvent(event) || !canReorder(zone)) {
    return
  }
  event.preventDefault()
  const rows = zones.value[zone]
  const target = rows[rows.findIndex(({ id }) => id === row.id) + step]
  if (!target) return
  // the tag moves in the page and loses the focus
  const focused = document.activeElement
  saveOrder(zone, placeRow(rows, row.id, target.id, step > 0))
  nextTick(() => focused?.focus())
}

// What lets a row move among the rows of its zone, by a drag or by Shift and
// an arrow.
const moveBindings = (row, zone) => ({
  class: { dragged: dragged.value?.id === row.id },
  draggable: `${canReorder(zone)}`,
  onDragstart: event => onDragStart(event, row, zone),
  onDragover: event => onDragOver(event, row, zone),
  onDragend: resetDrag,
  onKeydown: event => onMoveKey(event, row, zone)
})

const getSearchQueryTitle = searchQuery => {
  if (!searchQuery.is_shared) {
    return searchQuery.name
  }
  const person = personMap.value.get(searchQuery.person_id)
  const sharedBy = t('main.shared_by', { name: person?.full_name })
  return `${searchQuery.name}\n${sharedBy}`
}

const getDepartment = group => {
  return departmentMap.value.get(group.department_id)
}

// Watchers
// --------------------------------------------------------------------------
watch(
  () => props.queries.map(query => query.search_query),
  () => {
    nextTick(() => {
      setQueryPaths()
    })
  }
)

watch(route, () => {
  setQueryPaths()
})

// The pencil hides once no row is left to change: the edit mode goes with it,
// rather than coming back on with the next row saved.
watch(hasChangeableRow, isChangeable => {
  if (!isChangeable) isEditing.value = false
})

// Lifecycle
// --------------------------------------------------------------------------
onMounted(() => {
  nextTick(() => {
    setQueryPaths()
  })
})

defineExpose({ addSearch })
</script>

<style lang="scss" scoped>
.tag {
  border-radius: 1em;
  cursor: pointer;
}

.search-queries .group {
  position: relative;

  &.open {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }

  .chevron {
    position: relative;
    top: 3px;
  }

  .group-list {
    align-items: flex-start;
    background-color: var(--background-alt);
    border: inherit;
    border-top-right-radius: 1em;
    border-bottom-left-radius: 1em;
    border-bottom-right-radius: 1em;
    display: flex;
    flex-direction: column;
    left: 0;
    max-height: 200px;
    min-width: calc(100% + 1em);
    overflow-x: hidden;
    overflow-y: auto;
    padding: 0.5rem 0;
    position: absolute;
    top: 100%;
    z-index: 2000;

    .tag {
      margin: 0 0.5em;
    }
    .tag + .tag {
      margin-top: 0.5em;
    }
  }
}

// the list of a shared group starts under its 1px border
.search-queries .group.is-shared .group-list {
  left: -1px;
  min-width: calc(100% + 2px + 1em);
}

.search-queries .tag {
  margin: 0 1em 0.2em 0;

  &.empty {
    background-color: transparent;
  }
}

.search-queries .tag:hover {
  transform: scale(1.03);
}

.search-queries .tag.disabled {
  cursor: default;
  opacity: 0.5;

  &:hover {
    transform: none;
  }
}

.search-queries .group.tag:hover, // avoid bug (overflow)
.search-queries .tag.empty:hover {
  transform: none;
}

.search-queries .edit,
.search-queries .del {
  background: var(--background-tag-action);
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: none;
  height: 14px;
  width: 14px;
  line-height: 8px;

  &:hover {
    transform: scale(1.05);
  }
}

.search-queries .is-editing {
  .edit,
  .del {
    display: inline-block;
  }
}

.search-queries .edit {
  margin-left: 1em;
  margin-right: 0;
}

.search-queries .del {
  margin-left: 0.5em;
}

.tag.is-shared {
  border: 1px solid $blue;
}

.search-queries .tag[draggable='true'] {
  cursor: grab;
}

.dot {
  display: inline-block;
  border: 4px solid;
  border-radius: 50%;
  margin-right: 0.5em;
}

.filter-name {
  color: var(--text);
}

.filter-label {
  display: inline-block;
  max-width: 30em;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: bottom;
  white-space: nowrap;
}

.search-queries .tag.active {
  box-shadow: inset 0 0 4px 2px var(--box-shadow);
}

// the search the page runs. The tags sit between two pixels (em sizes): a
// box-shadow ring smears over two rows there, where a border keeps the same
// width on every side.
.search-queries .tag.active:not(.folder) {
  // green, where the blue of a shared tag made a private search look shared
  border: 2px solid $green;
  box-shadow: none;
}

.search-queries .tag.active:not(.folder),
.search-queries .tag.dragged:not(.folder) {
  // the padding gives up the width of the border, so that the tags after it
  // stay in place
  padding-left: calc(0.75em - 2px);
  padding-right: calc(0.75em - 2px);

  // a shared tag already has a 1px border
  &.is-shared {
    padding-left: calc(0.75em - 1px);
    padding-right: calc(0.75em - 1px);
  }
}

// the place a dragged row would take: its outline alone
.search-queries .tag.dragged:not(.folder) {
  // a group sets its color on the tag
  background-color: transparent !important;
  border: 2px dashed var(--text);
  box-shadow: none;

  > :not(.group-list) {
    opacity: 0.4;
  }
}
</style>
