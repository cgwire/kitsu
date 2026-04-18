<template>
  <div class="bots page fixed-page">
    <div class="flexrow page-header">
      <page-title class="flexrow-item filler" :text="$t('bots.title')" />
      <button-simple
        class="flexrow-item mr0"
        :text="$t('bots.new_bot')"
        :is-responsive="true"
        icon="plus"
        @click="onNewClicked"
        v-if="isCurrentUserAdmin"
      />
    </div>

    <div class="flexrow search-options">
      <search-field
        ref="searchFieldRef"
        class="search flexrow-item"
        @change="onSearchChange"
        placeholder="ex: gazu bot"
      />
      <div class="flexrow filters">
        <combobox-department
          class="flexrow-item"
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
      </div>
    </div>

    <route-tabs class="mb0 mt1" :active-tab="activeTab" :tabs="tabs" />

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
        class="mt1"
        :text="$t('bots.new_bot')"
        :is-responsive="true"
        @click="onNewClicked"
        v-if="isCurrentUserAdmin"
      />
    </div>

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
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHead } from '@unhead/vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ComboboxDepartment from '@/components/widgets/ComboboxDepartment.vue'
import ComboboxStyled from '@/components/widgets/ComboboxStyled.vue'
import EditAvatarModal from '@/components/modals/EditAvatarModal.vue'
import EditPersonModal from '@/components/modals/EditPersonModal.vue'
import HardDeleteModal from '@/components/modals/HardDeleteModal.vue'
import NewTokenModal from '@/components/modals/NewTokenModal.vue'
import PageTitle from '@/components/widgets/PageTitle.vue'
import PeopleList from '@/components/lists/PeopleList.vue'
import RouteTabs from '@/components/widgets/RouteTabs.vue'
import SearchField from '@/components/widgets/SearchField.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore()

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

const people = computed(() => store.getters.people)
const displayedPeople = computed(() => store.getters.displayedPeople)
const isCurrentUserAdmin = computed(() => store.getters.isCurrentUserAdmin)
const isPeopleLoading = computed(() => store.getters.isPeopleLoading)
const isPeopleLoadingError = computed(() => store.getters.isPeopleLoadingError)

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

const setSearchFromUrl = () => {
  const searchQuery = searchFieldRef.value?.getValue()
  const searchFromUrl = route.query.search
  if (!searchQuery && searchFromUrl) {
    searchFieldRef.value?.setValue(searchFromUrl)
  }
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
  const search = searchFieldRef.value?.getValue()
  router.push({
    query: { search, department: selectedDepartment.value, role: role.value }
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

watch(
  () => route.query.tab,
  tab => {
    activeTab.value = tab || 'active'
  }
)

// Lifecycle

onMounted(async () => {
  activeTab.value = route.query.tab || 'active'
  role.value = route.query.role || 'all'
  selectedDepartment.value = route.query.department || ''
  setSearchFromUrl()
  await store.dispatch('loadPeople')
  onSearchChange()
})

// Head

useHead({ title: computed(() => `${t('bots.title')} - Kitsu`) })
</script>

<style lang="scss" scoped>
.page-header {
  align-items: center;
  margin-bottom: 1em;
}

.search {
  margin-top: 2em;
}
.search-options {
  align-items: flex-end;
}
.filter-button {
  margin-top: 0.3em;
}

@media screen and (max-width: 768px) {
  .search-options {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5em;
  }

  .search {
    margin-top: 0;
    order: 0;
  }

  .search-options :deep(.label) {
    display: none;
  }
}
</style>
