<template>
  <div class="search-queries">
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
        @click="toggleFilterGroup(group)"
        @keydown.enter.prevent="toggleFilterGroup(group)"
        @keydown.space.prevent="toggleFilterGroup(group)"
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
            :style="{ backgroundColor: `${group.color}53` }"
            @click.stop="editGroup(group)"
            v-if="canChange(group)"
          >
            <edit2-icon :size="8" />
          </button>
          <button
            class="del"
            :style="{ backgroundColor: `${group.color}53` }"
            @click.stop="confirmRemoveGroup(group)"
            v-if="!group.queries.length && canChange(group)"
          >
            <trash2-icon :size="8" />
          </button>
        </div>
        <div
          :ref="`group-${group.id}`"
          class="group-list"
          v-if="toggleGroupId === group.id"
        >
          <span class="tag empty" v-if="!group.queries.length">
            <em>{{ $t('main.filter_group_empty') }}</em>
          </span>
          <template v-else>
            <div
              class="tag"
              :class="{
                'is-shared': searchQuery.is_shared,
                'is-editing': isEditing
              }"
              :key="searchQuery.id"
              :style="{ backgroundColor: `${group.color}23` }"
              :title="getSearchQueryTitle(searchQuery)"
              @click="navigateToSearchQuery(searchQuery)"
              v-for="searchQuery in group.queries"
            >
              <router-link
                class="flexrow filter-name"
                :to="queryPaths[searchQuery.id] || { name: 'open-productions' }"
              >
                <span class="filter-label">{{ searchQuery.name }}</span>
              </router-link>
              <button
                class="edit"
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
        'is-shared': searchQuery.is_shared,
        'is-editing': isEditing
      }"
      :key="searchQuery.id"
      :title="getSearchQueryTitle(searchQuery)"
      @click="navigateToSearchQuery(searchQuery)"
      v-for="searchQuery in userFilters"
    >
      <router-link
        class="flexrow filter-name"
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
        @click.stop="editSearch(searchQuery)"
        v-if="canChange(searchQuery)"
      >
        <edit2-icon :size="8" />
      </button>
      <button
        class="del"
        @click.stop="confirmRemoveSearch(searchQuery)"
        v-if="canChange(searchQuery)"
      >
        <trash2-icon :size="8" />
      </button>
    </span>

    <confirm-modal
      active
      is-danger
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
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import {
  ChevronDownIcon,
  ChevronUpIcon,
  Edit2Icon,
  FolderPlusIcon,
  PencilIcon,
  Trash2Icon
} from 'lucide-vue-next'

import { sortByName } from '@/lib/sorting'
import stringHelpers from '@/lib/string'

import ConfirmModal from '@/components/modals/ConfirmModal.vue'
import EditSearchFilterModal from '@/components/modals/EditSearchFilterModal.vue'
import EditSearchFilterGroupModal from '@/components/modals/EditSearchFilterGroupModal.vue'

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

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore()

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
  }
})

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
    query =>
      !isCurrentUserClient.value ||
      (isCurrentUserClient.value && !query.is_shared)
  )
  return sortByName(queries)
})

const userFilters = computed(() => {
  return sortedFilters.value
    .filter(query => !query.search_filter_group_id)
    .sort((a, b) => {
      if (a.is_shared && !b.is_shared) {
        return -1
      } else if (!a.is_shared && b.is_shared) {
        return 1
      } else {
        return 0
      }
    })
})

const userFilterGroups = computed(() => {
  const groups = props.groups.filter(
    group =>
      !isCurrentUserClient.value ||
      (isCurrentUserClient.value && !group.is_shared)
  )
  return sortByName(groups).map(group => ({
    ...group,
    queries: sortedFilters.value.filter(
      query => query.search_filter_group_id === group.id
    )
  }))
})

// Zou takes a change only from the owner of a row or an admin. A row can be in
// the list of someone else: a filter of a shared group that turned private
// stays there until a reload.
const canChange = row =>
  isCurrentUserAdmin.value ||
  (row.person_id === user.value?.id &&
    (!row.is_shared || isCurrentUserManager.value))

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

const setQueryPaths = () => {
  props.queries.forEach(query => {
    queryPaths.value[query.id] = queryRoute(query)
  })
}

const queryRoute = searchQuery => {
  return {
    ...route,
    query: {
      ...route.query,
      search: searchQuery.search_query
    }
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

const navigateToSearchQuery = searchQuery => {
  router.push(queryPaths.value[searchQuery.id] || { name: 'open-productions' })
}

const confirmEditFilterGroup = filterGroup =>
  runInModal(
    'group',
    () => {
      filterGroup.project_id = props.productionId
      if (filterGroup.id) {
        return store.dispatch('updateSearchFilterGroup', filterGroup)
      }
      return store.dispatch(
        `save${stringHelpers.capitalize(props.type)}SearchFilterGroup`,
        filterGroup
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
        searchFilter.project_id = props.productionId
        return store.dispatch('updateSearchFilter', searchFilter)
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

onMounted(() => {
  nextTick(() => {
    setQueryPaths()
  })
})

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

defineExpose({ addSearch })
</script>

<style lang="scss" scoped>
.dark {
  .search-queries .del,
  .search-queries .edit {
    background: $dark-grey-light;
    color: white;
  }
}

.tag {
  border-radius: 1em;
  margin-left: 0;
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
    left: -1px;
    max-height: 200px;
    min-width: calc(100% + 2px + 1em);
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

.search-queries .tag {
  margin: 0 1em 0.2em 0;

  &.empty {
    background-color: transparent;
  }
}

.search-queries .tag:hover {
  transform: scale(1.03);
}

.search-queries .group.tag:hover, // avoid bug (overflow)
.search-queries .tag.empty:hover {
  transform: none;
}

.search-queries .del {
  display: none;
}

.search-queries .edit,
.search-queries .del {
  background: $light-grey;
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
  box-shadow: inset 0 0 4px 2px #ddd;

  .dark & {
    box-shadow: inset 0 0 4px 2px #444;
  }
}
</style>
