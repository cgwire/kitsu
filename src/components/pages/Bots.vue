<template>
  <panel-layout class="bots">
    <template #filters>
      <div class="flexrow filters">
        <search-field
          ref="searchFieldRef"
          class="search flexrow-item"
          @change="onSearchChange"
          placeholder="ex: gazu bot"
        />
        <combobox-department
          class="flexrow-item is-hidden-mobile"
          all-departments-label
          :label="$t('main.department')"
          v-model="selectedDepartment"
        />
        <combobox-styled
          class="flexrow-item"
          :label="$t('people.fields.role')"
          locale-key-prefix="people.role."
          :options="roleOptions"
          v-model="role"
        />
        <div class="flexrow filter-actions">
          <button-simple
            class="flexrow-item"
            :text="$t('bots.new_bot')"
            :is-responsive="true"
            icon="plus"
            @click="onNewClicked"
            v-if="isCurrentUserAdmin"
          />
          <button-simple
            class="flexrow-item reset-filters"
            icon="remove"
            :title="$t('main.clear_filters')"
            @click="resetFilters"
            v-if="hasFilters"
          />
        </div>
      </div>
    </template>
    <template #list>
      <search-query-list
        class="query-list"
        :kept-query-keys="KEPT_QUERY_KEYS"
        :queries="botsSearchQueries"
        type="bots"
        with-route-query
      />

      <route-tabs :active-tab="activeTab" :tabs="tabs" />

      <people-list
        :entries="activeTab === 'active' ? activePeople : unactivePeople"
        :is-bots="true"
        :is-loading="isPeopleLoading"
        :is-error="isPeopleLoadingError"
        @avatar-clicked="onAvatarClicked"
        @delete-clicked="onDeleteClicked"
        @edit-clicked="onEditClicked"
        @refresh-clicked="onRefreshClicked"
        v-if="isPeopleLoading || hasBots"
      />
      <div class="has-text-centered strong" v-else>
        <p>{{ $t('bots.no_bot') }}</p>
        <button-simple
          class="mt1 new-button"
          :text="$t('bots.new_bot')"
          @click="onNewClicked"
          v-if="isCurrentUserAdmin"
        />
      </div>
    </template>

    <edit-avatar-modal
      active
      :error-text="$t('bots.edit_avatar_error')"
      :is-deleting="loading.deletingAvatar"
      :is-error="errors.avatar"
      :is-updating="loading.updatingAvatar"
      :person="personToEdit"
      @close="modals.avatar = false"
      @delete="deleteAvatar"
      @update="updateAvatar"
      v-if="modals.avatar"
    />

    <edit-person-modal
      active
      is-bot
      :is-error="errors.edit"
      :is-loading="loading.edit"
      :is-user-limit-error="errors.userLimit"
      :person-to-edit="personToEdit"
      @cancel="modals.edit = false"
      @confirm="confirmEditPeople"
      v-if="modals.edit"
    />

    <new-token-modal
      active
      :person="personToEdit"
      @cancel="modals.newToken = false"
      @close="modals.newToken = false"
      @generate-token="confirmGenerateToken"
      v-if="modals.newToken"
    />

    <hard-delete-modal
      active
      :error-text="$t('people.delete_error')"
      :is-loading="loading.del"
      :is-error="errors.del"
      :lock-text="personToDelete ? personToDelete.full_name : ''"
      :text="deleteText"
      @cancel="modals.del = false"
      @confirm="confirmDeletePeople"
      v-if="modals.del"
    />
  </panel-layout>
</template>

<script setup>
import { ref, computed, reactive, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHead } from '@unhead/vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

import PanelLayout from '@/components/layouts/PanelLayout.vue'
import PeopleList from '@/components/lists/PeopleList.vue'
import EditAvatarModal from '@/components/modals/EditAvatarModal.vue'
import EditPersonModal from '@/components/modals/EditPersonModal.vue'
import HardDeleteModal from '@/components/modals/HardDeleteModal.vue'
import NewTokenModal from '@/components/modals/NewTokenModal.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ComboboxDepartment from '@/components/widgets/ComboboxDepartment.vue'
import ComboboxStyled from '@/components/widgets/ComboboxStyled.vue'
import RouteTabs from '@/components/widgets/RouteTabs.vue'
import SearchField from '@/components/widgets/SearchField.vue'
import SearchQueryList from '@/components/widgets/SearchQueryList.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore()

// the tab is where the list is read, not one of its filters
const KEPT_QUERY_KEYS = ['tab']

// State

const activeTab = ref('active')
const role = ref('all')
const selectedDepartment = ref('')
const personToDelete = ref({})
const personToEdit = ref({ role: 'user' })

const roleOptions = [
  { label: 'all', value: 'all' },
  { label: 'admin', value: 'admin' },
  { label: 'client', value: 'client' },
  { label: 'manager', value: 'manager' },
  { label: 'supervisor', value: 'supervisor' },
  { label: 'user', value: 'user' },
  { label: 'vendor', value: 'vendor' }
]

const errors = reactive({
  avatar: false,
  del: false,
  edit: false,
  userLimit: false
})
const loading = reactive({
  del: false,
  deletingAvatar: false,
  edit: false,
  updatingAvatar: false
})
const modals = reactive({
  avatar: false,
  del: false,
  edit: false,
  newToken: false
})

const searchFieldRef = ref(null)

// Computed

const botsSearchQueries = computed(() => store.getters.botsSearchQueries)
const people = computed(() => store.getters.people)
const displayedPeople = computed(() => store.getters.displayedPeople)
const isCurrentUserAdmin = computed(() => store.getters.isCurrentUserAdmin)
const isPeopleLoading = computed(() => store.getters.isPeopleLoading)
const isPeopleLoadingError = computed(() => store.getters.isPeopleLoadingError)

const hasFilters = computed(() =>
  Boolean(
    route.query.search || selectedDepartment.value || role.value !== 'all'
  )
)

const hasBots = computed(() => people.value.some(person => person.is_bot))

const currentPeople = computed(() => {
  let people = displayedPeople.value.filter(person => person.is_bot)
  if (role.value !== 'all') {
    people = people.filter(person => person.role === role.value)
  }
  if (selectedDepartment.value) {
    people = people.filter(person =>
      person.departments.includes(selectedDepartment.value)
    )
  }
  return people
})

const activePeople = computed(() =>
  currentPeople.value.filter(person => person.active)
)

const unactivePeople = computed(() =>
  currentPeople.value.filter(person => !person.active)
)

const tabs = computed(() => [
  {
    name: 'active',
    label: `${t('main.active')} (${activePeople.value.length})`
  },
  {
    name: 'unactive',
    label: `${t('people.unactive')} (${unactivePeople.value.length})`
  }
])

const deleteText = computed(() => {
  const personName = personToDelete.value?.full_name
  return personName ? t('people.delete_text', { personName }) : ''
})

// Functions

const applyRouteQuery = () => {
  activeTab.value = route.query.tab || 'active'
  role.value = route.query.role || 'all'
  selectedDepartment.value = route.query.department || ''
  const search = route.query.search || ''
  if ((searchFieldRef.value?.getValue() || '') !== search) {
    searchFieldRef.value?.setValue(search)
    onSearchChange()
  }
}

const resetFilters = () => {
  router.push({ query: { tab: route.query.tab } })
}

const setSearchInUrl = query => {
  const searchQuery = query || searchFieldRef.value?.getValue()
  router.push({
    query: {
      ...route.query,
      search: searchQuery || undefined
    }
  })
}

const onSearchChange = () => {
  if (!searchFieldRef.value) return
  const searchQuery = searchFieldRef.value.getValue()
  if (searchQuery?.length !== 1) {
    store.dispatch('setPeopleSearch', searchQuery)
  }
  setSearchInUrl()
}

const updatePersonToEdit = person => {
  personToEdit.value = {
    ...person,
    expiration_date: person.expiration_date
      ? new Date(person.expiration_date)
      : null
  }
}

const deleteAvatar = async () => {
  loading.deletingAvatar = true
  try {
    await store.dispatch('clearPersonAvatar', personToEdit.value)
    modals.avatar = false
    onSearchChange()
  } catch (err) {
    errors.avatar = true
  }
  loading.deletingAvatar = false
}

const updateAvatar = async formData => {
  loading.updatingAvatar = true
  try {
    await store.dispatch('uploadPersonAvatar', {
      person: personToEdit.value,
      formData
    })
    modals.avatar = false
    onSearchChange()
  } catch (err) {
    errors.avatar = true
  }
  loading.updatingAvatar = false
}

const confirmGenerateToken = form => {
  store
    .dispatch('generateToken', form)
    .then(person => {
      updatePersonToEdit(person)
    })
    .catch(console.error)
}

const confirmEditPeople = form => {
  const action =
    personToEdit.value.id === undefined ? 'newPerson' : 'editPerson'
  if (action === 'editPerson') form.id = personToEdit.value.id
  loading.edit = true
  errors.edit = false
  errors.userLimit = false
  store
    .dispatch(action, form)
    .then(person => {
      loading.edit = false
      modals.edit = false
      if (person.access_token?.length) {
        updatePersonToEdit(person)
        modals.newToken = true
      }
      onSearchChange()
    })
    .catch(err => {
      console.error(err)
      const isUserLimitReached = err.body?.message?.includes('limit') ?? false
      if (isUserLimitReached) {
        errors.userLimit = true
      } else {
        errors.edit = true
      }
      loading.edit = false
    })
}

const confirmDeletePeople = () => {
  loading.del = true
  errors.del = false
  store
    .dispatch('deletePeople', personToDelete.value)
    .then(() => {
      loading.del = false
      modals.del = false
      onSearchChange()
    })
    .catch(err => {
      console.error(err)
      loading.del = false
      errors.del = true
    })
}

const onAvatarClicked = person => {
  updatePersonToEdit(person)
  errors.avatar = false
  modals.avatar = true
}

const onDeleteClicked = person => {
  personToDelete.value = person
  errors.del = false
  modals.del = true
}

const onEditClicked = person => {
  updatePersonToEdit(person)
  modals.edit = true
}

const onRefreshClicked = person => {
  updatePersonToEdit(person)
  modals.newToken = true
}

const onNewClicked = () => {
  updatePersonToEdit({ role: 'user' })
  modals.edit = true
}

const updateRoute = () => {
  router.push({
    query: {
      ...route.query,
      search: searchFieldRef.value?.getValue() || undefined,
      department: selectedDepartment.value || undefined,
      role: role.value === 'all' ? undefined : role.value
    }
  })
}

// Watchers

watch(
  () => modals.edit,
  isOpen => {
    if (isOpen) {
      errors.edit = false
      errors.userLimit = false
      loading.edit = false
    }
  }
)

watch(selectedDepartment, updateRoute)
watch(role, updateRoute)

// A saved search, or the back button, sets a query the page did not write.
watch(
  () => route.query,
  () => {
    if (route.name === 'bots') applyRouteQuery()
  }
)

// Lifecycle

onMounted(async () => {
  applyRouteQuery()
  await store.dispatch('loadPeople')
  onSearchChange()
})

// Head

useHead({ title: computed(() => `${t('bots.title')} - Kitsu`) })
</script>

<style lang="scss" scoped>
// Controls of unequal height (pill input, select under its label, buttons)
// only line up on their bottom edge.
.filters {
  align-items: flex-end;
  flex-wrap: wrap;
  row-gap: 1em;

  > .flexrow-item {
    margin-bottom: 0;
  }

  .button {
    height: 42px;
  }
}

.search {
  flex: 1 1 200px;
  max-width: 420px;
}

.filter-actions {
  margin-left: auto;

  > :last-child {
    margin-right: 0;
  }
}

// One label height and one control height for the whole row, as on the
// People page.
.filters :deep(.label) {
  margin-bottom: 5px;
  padding-top: 0;
}

.filters :deep(.department-combo),
.filters :deep(.combo) {
  display: flex;
  flex-direction: column;
  height: 42px;
  justify-content: center;
}

.reset-filters {
  color: var(--text);
  padding: 0 14px;
}

// Bulma sets the tabs apart from what follows: the panel already does
.bots .tabs {
  margin-bottom: 0;
}

@media screen and (max-width: 768px) {
  // Mobile is read-only: no creation.
  .filter-actions,
  .new-button {
    display: none;
  }
}
</style>
