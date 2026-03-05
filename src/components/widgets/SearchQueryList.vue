<template>
  <div class="search-queries">
    <span
      class="tag folder mr1"
      @click="editGroup()"
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
      @click="isEditing = !isEditing"
      :title="$t('main.edit_mode_on')"
      v-if="
        userFilters.length > 0 ||
        (isGroupEnabled && userFilterGroups.length > 0)
      "
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
        @click="toggleFilterGroup(group)"
        v-for="group in userFilterGroups"
      >
        <div class="group-header">
          <span
            class="dot"
            :style="{ borderColor: getDepartment(group).color }"
            :title="getDepartment(group).name"
            v-if="group.is_shared && group.department_id"
          ></span>
          <span>{{ group.name }}</span>
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
            v-if="!group.is_shared || isCurrentUserManager"
          >
            <edit2-icon :size="8" />
          </button>
          <button
            class="del"
            :style="{ backgroundColor: `${group.color}53` }"
            @click.stop="confirmRemoveGroup(group)"
            v-if="
              !group.queries.length &&
              (!group.is_shared || isCurrentUserManager)
            "
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
              v-for="searchQuery in group.queries"
            >
              <router-link
                class="flexrow filter-name"
                :to="queryPaths[searchQuery.id] || { name: 'open-productions' }"
              >
                {{ searchQuery.name }}
              </router-link>
              <button
                class="edit"
                :style="{
                  backgroundColor: `${group.color}53`
                }"
                @click.stop="editSearch(searchQuery)"
                v-if="!searchQuery.is_shared || isCurrentUserManager"
              >
                <edit2-icon :size="8" />
              </button>
              <button
                class="del"
                :style="{ backgroundColor: `${group.color}53` }"
                @click.stop="confirmRemoveSearch(searchQuery)"
                v-if="!searchQuery.is_shared || isCurrentUserManager"
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
      v-for="searchQuery in userFilters"
    >
      <router-link
        class="flexrow filter-name"
        :to="queryPaths[searchQuery.id] || { name: 'open-productions' }"
      >
        <span
          class="dot"
          :style="{ borderColor: getDepartment(searchQuery).color }"
          :title="getDepartment(searchQuery).name"
          v-if="searchQuery.is_shared && searchQuery.department_id"
        ></span>
        {{ searchQuery.name }}
      </router-link>
      <button
        class="edit"
        @click.stop="editSearch(searchQuery)"
        v-if="!searchQuery.is_shared || isCurrentUserManager"
      >
        <edit2-icon :size="8" />
      </button>
      <button
        class="del"
        @click.stop="confirmRemoveSearch(searchQuery)"
        v-if="!searchQuery.is_shared || isCurrentUserManager"
      >
        <trash2-icon :size="8" />
      </button>
    </span>

    <confirm-modal
      :active="modals.remove"
      :is-loading="loading.remove"
      :is-error="errors.remove"
      :text="removeText"
      @cancel="modals.remove = false"
      @confirm="removeSearch"
    />

    <edit-search-filter-modal
      :active="modals.edit"
      :group-options="groupOptions"
      :is-loading="loading.edit"
      :is-error="errors.edit"
      :is-group-enabled="isGroupEnabled"
      :search-query-to-edit="searchQueryToEdit"
      @cancel="modals.edit = false"
      @confirm="confirmEditSearch"
    />

    <edit-search-filter-group-modal
      :active="modals.group"
      :is-loading="loading.group"
      :is-error="errors.group"
      :group-to-edit="groupToEdit"
      @cancel="modals.group = false"
      @confirm="confirmEditFilterGroup"
    />
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
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

const { t } = useI18n()
const route = useRoute()
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
  type: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['change-search', 'remove-search'])

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
const toggleGroupId = ref(null)

const currentProduction = computed(() => store.getters.currentProduction)
const departmentMap = computed(() => store.getters.departmentMap)
const isCurrentUserClient = computed(() => store.getters.isCurrentUserClient)
const isCurrentUserManager = computed(() => store.getters.isCurrentUserManager)
const personMap = computed(() => store.getters.personMap)

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

const setQueryPaths = () => {
  props.queries.forEach(query => {
    queryPaths.value[query.id] = queryRoute(query)
  })
}

const queryRoute = (searchQuery) => {
  return {
    ...route,
    query: {
      ...route.query,
      search: searchQuery.search_query
    }
  }
}

const changeSearch = (searchQuery) => {
  emit('change-search', searchQuery)
}

const editGroup = (group = {}) => {
  groupToEdit.value = group
  modals.group = true
}

const editSearch = (searchQuery) => {
  searchQueryToEdit.value = searchQuery
  modals.edit = true
}

const confirmEditFilterGroup = async (filterGroup) => {
  try {
    loading.group = true
    errors.group = false
    filterGroup.project_id = currentProduction.value
      ? currentProduction.value.id
      : null
    if (!filterGroup.id) {
      await store.dispatch(
        `save${stringHelpers.capitalize(props.type)}SearchFilterGroup`,
        filterGroup
      )
    } else {
      await store.dispatch('updateSearchFilterGroup', filterGroup)
    }
    modals.group = false
  } catch (err) {
    console.error(err)
    errors.group = true
  } finally {
    loading.group = false
  }
}

const confirmEditSearch = async (searchFilter) => {
  try {
    loading.edit = true
    errors.edit = false
    searchFilter.project_id = currentProduction.value
      ? currentProduction.value.id
      : null
    await store.dispatch('updateSearchFilter', searchFilter)
    modals.edit = false
  } catch (err) {
    console.error(err)
    errors.edit = true
  } finally {
    loading.edit = false
  }
}

const closeFilterGroupModal = () => {
  modals.group = false
}

const confirmRemoveSearch = (searchQuery) => {
  searchQueryToRemove.value = searchQuery
  groupToRemove.value = {}
  modals.remove = true
}

const removeSearch = () => {
  if (searchQueryToRemove.value.id) {
    emit('remove-search', searchQueryToRemove.value)
  } else {
    removeGroup()
  }
  modals.remove = false
  searchQueryToRemove.value = {}
  groupToRemove.value = {}
}

const confirmRemoveGroup = (filterGroup) => {
  groupToRemove.value = filterGroup
  searchQueryToRemove.value = {}
  modals.remove = true
}

const removeGroup = async () => {
  try {
    await store.dispatch(
      `remove${stringHelpers.capitalize(props.type)}SearchFilterGroup`,
      groupToRemove.value
    )
    modals.remove = false
  } catch (err) {
    console.error(err)
    errors.remove = true
  } finally {
    loading.remove = false
  }
}

const toggleFilterGroup = (group) => {
  toggleGroupId.value = toggleGroupId.value !== group.id ? group.id : null
}

const getSearchQueryTitle = (searchQuery) => {
  if (!searchQuery.is_shared) {
    return
  }
  const person = personMap.value.get(searchQuery.person_id)
  return t('main.shared_by', { name: person?.full_name })
}

const getDepartment = (group) => {
  return departmentMap.value.get(group.department_id)
}

onMounted(() => {
  nextTick(() => {
    setQueryPaths()
  })
})

watch(() => props.queries.length, () => {
  nextTick(() => {
    setQueryPaths()
  })
})

watch(route, () => {
  setQueryPaths()
})
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

.search-queries .tag.active {
  box-shadow: inset 0 0 4px 2px #ddd;

  .dark & {
    box-shadow: inset 0 0 4px 2px #444;
  }
}
</style>
