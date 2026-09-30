<template>
  <div class="people page fixed-page">
    <div class="flexrow page-header">
      <button-simple
        class="flexrow-item"
        :title="$t('main.csv.import_file')"
        :is-responsive="true"
        icon="import"
        @click="showImportModal"
        v-if="isCurrentUserAdmin"
      />
      <button-href-link
        class="flexrow-item"
        :title="$t('main.csv.export_file')"
        icon="export"
        path="/api/export/csv/persons.csv"
      />
      <button-simple
        class="flexrow-item"
        :text="$t('people.new_person')"
        :is-responsive="true"
        icon="plus"
        @click="onNewClicked"
        v-if="isCurrentUserAdmin"
      />
    </div>

    <div class="flexrow search-options">
      <search-field
        ref="people-search-field"
        class="search flexrow-item"
        :can-save="true"
        @change="onSearchChange"
        @save="saveSearchQuery"
        placeholder="ex: John Doe"
      />
      <combobox-studio
        class="flexrow-item"
        all-studios-label
        :label="$t('main.studio')"
        v-model="selectedStudio"
      />
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

    <div class="query-list">
      <search-query-list
        :queries="peopleSearchQueries"
        type="people"
        @remove-search="removeSearchQuery"
        v-if="!isPeopleLoading"
      />
    </div>

    <route-tabs class="mb0" :active-tab="activeTab" :tabs="tabs" />

    <people-list
      :entries="listEntries"
      :is-guests="isGuestTab"
      :is-archived-guests="activeTab === 'archived-guests'"
      :is-loading="isListLoading"
      :is-error="isListError"
      :seats-remaining="activeTab === 'active' ? seatsRemaining : null"
      @archive-clicked="onArchiveClicked"
      @avatar-clicked="onAvatarClicked"
      @delete-clicked="onDeleteClicked"
      @edit-clicked="onEditClicked"
      @restore-clicked="onRestoreClicked"
      @change-password-clicked="onChangePasswordClicked"
    />

    <import-render-modal
      active
      :is-loading="isImportPeopleLoading"
      :is-error="isImportPeopleLoadingError"
      :import-error="errors.importingError"
      :parsed-csv="parsedCSV"
      :form-data="personCsvFormData"
      :columns="[...dataMatchers, ...csvColumns, ...optionalCsvColumns]"
      :data-matchers="dataMatchers"
      :database="filteredPeople"
      @reupload="resetImport"
      @cancel="hideImportRenderModal"
      @confirm="uploadImportFile"
      v-if="modals.isImportRenderDisplayed"
    />

    <import-modal
      active
      :is-loading="isImportPeopleLoading"
      :is-error="isImportPeopleLoadingError"
      :form-data="personCsvFormData"
      :columns="[...dataMatchers, ...csvColumns]"
      :optional-columns="optionalCsvColumns"
      @cancel="hideImportModal"
      @confirm="renderImport"
      v-if="modals.importModal"
    />

    <edit-avatar-modal
      active
      :error-text="$t('people.edit_avatar_error')"
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
      :is-create-invite-loading="loading.createAndInvite"
      :is-error="errors.edit"
      :is-email-domain-error="errors.invalidEmailDomain"
      :is-invite-loading="loading.invite"
      :is-invitation-success="success.invite"
      :is-invitation-error="errors.invite"
      :is-invite-link-loading="loading.inviteLink"
      :is-invite-link-copied="success.inviteLinkCopied"
      :is-invite-link-error="errors.inviteLink"
      :is-loading="loading.edit"
      :is-user-limit-error="errors.userLimit"
      :person-to-edit="personToEdit"
      @cancel="modals.edit = false"
      @confirm="confirmEditPeople"
      @confirm-invite="confirmCreateAndInvite"
      @copy-invite-link="confirmCopyInviteLink"
      @invite="confirmInvite"
      @reset-error="resetError"
      v-if="modals.edit"
    />

    <change-password-modal
      active
      :person="personToChangePassword"
      @cancel="modals.changePassword = false"
      @confirm="modals.changePassword = false"
      v-if="modals.changePassword"
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

    <confirm-modal
      active
      :text="selfRoleDowngradeText"
      @cancel="cancelSelfRoleDowngrade"
      @confirm="confirmSelfRoleDowngrade"
      v-if="modals.selfRoleDowngrade"
    />

    <confirm-modal
      active
      :error-text="$t('people.archive_guest_error')"
      :is-error="errors.archiveGuest"
      :is-loading="loading.archiveGuest"
      :text="$t('people.archive_guest_confirm')"
      @cancel="modals.archiveGuest = false"
      @confirm="confirmArchiveGuest"
      v-if="modals.archiveGuest"
    />
  </div>
</template>

<script setup>
import { useHead } from '@unhead/vue'
import { computed, onMounted, reactive, ref, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

import csv from '@/lib/csv'

/* eslint-disable no-unused-vars */
import PeopleList from '@/components/lists/PeopleList.vue'
import ChangePasswordModal from '@/components/modals/ChangePasswordModal.vue'
import ConfirmModal from '@/components/modals/ConfirmModal.vue'
import EditAvatarModal from '@/components/modals/EditAvatarModal.vue'
import EditPersonModal from '@/components/modals/EditPersonModal.vue'
import HardDeleteModal from '@/components/modals/HardDeleteModal.vue'
import ImportModal from '@/components/modals/ImportModal.vue'
import ImportRenderModal from '@/components/modals/ImportRenderModal.vue'
import ButtonHrefLink from '@/components/widgets/ButtonHrefLink.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ComboboxDepartment from '@/components/widgets/ComboboxDepartment.vue'
import ComboboxStudio from '@/components/widgets/ComboboxStudio.vue'
import ComboboxStyled from '@/components/widgets/ComboboxStyled.vue'
import RouteTabs from '@/components/widgets/RouteTabs.vue'
import SearchField from '@/components/widgets/SearchField.vue'
import SearchQueryList from '@/components/widgets/SearchQueryList.vue'
/* eslint-enable no-unused-vars */

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore()

const csvColumns = ['First Name', 'Last Name']
const optionalCsvColumns = [
  'Phone',
  'Role',
  'Departments',
  'Studio',
  'Country',
  'Contract Type',
  'Position',
  'Seniority',
  'Daily Salary',
  'Active'
]
const dataMatchers = ['Email']
const roleOptions = [
  'all',
  'admin',
  'client',
  'manager',
  'supervisor',
  'user',
  'vendor'
].map(name => ({ label: name, value: name }))

// State
// --------------------------------------------------------------------------

const searchFieldRef = useTemplateRef('people-search-field')

const activeTab = ref('active')
const parsedCSV = ref([])
const pendingEditForm = ref(null)
const personToArchive = ref(null)
const personToChangePassword = ref({})
const personToDelete = ref({})
const personToEdit = ref({ role: 'user' })
const role = ref('all')
const selectedDepartment = ref('')
const selectedStudio = ref('')

const errors = reactive({
  archiveGuest: false,
  avatar: false,
  del: false,
  edit: false,
  importingError: null,
  invite: false,
  inviteLink: false,
  invalidEmailDomain: false,
  userLimit: false
})
const loading = reactive({
  archiveGuest: false,
  createAndInvite: false,
  del: false,
  deletingAvatar: false,
  edit: false,
  invite: false,
  inviteLink: false,
  savingSearch: false,
  updatingAvatar: false
})
const modals = reactive({
  archiveGuest: false,
  avatar: false,
  changePassword: false,
  del: false,
  edit: false,
  importModal: false,
  isImportRenderDisplayed: false,
  selfRoleDowngrade: false
})
const success = reactive({
  invite: false,
  inviteLinkCopied: false
})

// Computed
// --------------------------------------------------------------------------

const activePeopleWithoutBot = computed(
  () => store.getters.activePeopleWithoutBot
)
const displayedPeople = computed(() => store.getters.displayedPeople)
const guests = computed(() => store.getters.guests)
const isCurrentUserAdmin = computed(() => store.getters.isCurrentUserAdmin)
const isGuestsLoaded = computed(() => store.getters.isGuestsLoaded)
const isGuestsLoading = computed(() => store.getters.isGuestsLoading)
const isGuestsLoadingError = computed(() => store.getters.isGuestsLoadingError)
const isImportPeopleLoading = computed(
  () => store.getters.isImportPeopleLoading
)
const isImportPeopleLoadingError = computed(
  () => store.getters.isImportPeopleLoadingError
)
const isPeopleLoading = computed(() => store.getters.isPeopleLoading)
const isPeopleLoadingError = computed(() => store.getters.isPeopleLoadingError)
const mainConfig = computed(() => store.getters.mainConfig)
const peopleSearchQueries = computed(() => store.getters.peopleSearchQueries)
const personCsvFormData = computed(() => store.getters.personCsvFormData)
const studioMap = computed(() => store.getters.studioMap)
const user = computed(() => store.getters.user)
const userLimit = computed(() => store.getters.userLimit)

const selfRoleDowngradeText = computed(() => {
  if (!pendingEditForm.value) return ''
  return t('people.self_role_downgrade_confirm', {
    currentRole: t(`people.role.${personToEdit.value.role}`),
    newRole: t(`people.role.${pendingEditForm.value.role}`)
  })
})

const seatsRemaining = computed(() => {
  if (mainConfig.value.is_self_hosted) return null
  return Math.max(0, userLimit.value - activePeopleWithoutBot.value.length)
})

const currentPeople = computed(() =>
  applyToolbarFilters(displayedPeople.value.filter(person => !person.is_bot))
)
const activePeople = computed(() =>
  currentPeople.value.filter(person => person.active)
)
const unactivePeople = computed(() =>
  currentPeople.value.filter(person => !person.active)
)

// The guests tabs honour the toolbar controls, search text included, as
// the people tabs do.
const filteredGuests = computed(() => {
  const keyword = (searchFieldRef.value?.getValue() || '').toLowerCase().trim()
  return applyToolbarFilters(
    keyword
      ? guests.value.filter(person =>
          (person.name || '').toLowerCase().includes(keyword)
        )
      : guests.value
  )
})
const currentGuests = computed(() =>
  filteredGuests.value.filter(person => person.active)
)
const archivedGuests = computed(() =>
  filteredGuests.value.filter(person => !person.active)
)

const tabs = computed(() => {
  const withCount = (label, count) =>
    count === null ? label : `${label} (${count})`
  const guestCount = list => (isGuestsLoaded.value ? list.length : null)
  return [
    {
      name: 'active',
      label: withCount(t('main.active'), activePeople.value.length)
    },
    {
      name: 'unactive',
      label: withCount(t('people.unactive'), unactivePeople.value.length)
    },
    {
      name: 'guests',
      label: withCount(
        t('people.guests', { count: 2 }),
        guestCount(currentGuests.value)
      )
    },
    {
      name: 'archived-guests',
      label: withCount(
        t('people.archived_guests'),
        guestCount(archivedGuests.value)
      )
    }
  ]
})

const deleteText = computed(() => {
  const personName = personToDelete.value?.full_name
  return personName ? t('people.delete_text', { personName }) : ''
})

const filteredPeople = computed(() =>
  Object.fromEntries(displayedPeople.value.map(person => [person.email, true]))
)

const isGuestTab = computed(() =>
  ['guests', 'archived-guests'].includes(activeTab.value)
)

const listEntries = computed(() => {
  if (activeTab.value === 'guests') return currentGuests.value
  if (activeTab.value === 'archived-guests') return archivedGuests.value
  if (activeTab.value === 'unactive') return unactivePeople.value
  return activePeople.value
})

const isListLoading = computed(() =>
  isGuestTab.value ? isGuestsLoading.value : isPeopleLoading.value
)

const isListError = computed(() =>
  isGuestTab.value ? isGuestsLoadingError.value : isPeopleLoadingError.value
)

// Functions
// --------------------------------------------------------------------------

const applyToolbarFilters = people =>
  people
    .filter(
      person =>
        (role.value === 'all' || person.role === role.value) &&
        (!selectedDepartment.value ||
          person.departments?.includes(selectedDepartment.value)) &&
        (!selectedStudio.value || person.studio_id === selectedStudio.value)
    )
    .map(person => ({
      ...person,
      studio: studioMap.value.get(person.studio_id)
    }))

const ensureGuestsLoaded = () => {
  if (!isGuestTab.value) return
  store.dispatch('loadGuests').catch(console.error)
}

// Search

const setSearchInUrl = () => {
  router.push({
    query: {
      ...route.query,
      search: searchFieldRef.value?.getValue() || undefined
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

const saveSearchQuery = async searchQuery => {
  if (loading.savingSearch) return
  loading.savingSearch = true
  try {
    await store.dispatch('savePeopleSearch', searchQuery)
  } catch (err) {
    console.error(err)
  } finally {
    loading.savingSearch = false
  }
}

const removeSearchQuery = searchQuery => {
  store.dispatch('removePeopleSearch', searchQuery).catch(console.error)
}

const updateRoute = () => {
  router.push({
    query: {
      search: searchFieldRef.value.getValue(),
      department: selectedDepartment.value,
      studio: selectedStudio.value,
      role: role.value
    }
  })
}

// Import

const showImportModal = () => {
  modals.importModal = true
}

const hideImportModal = () => {
  modals.importModal = false
}

const hideImportRenderModal = () => {
  modals.isImportRenderDisplayed = false
}

const renderImport = async (data, mode) => {
  parsedCSV.value = await csv.processCSV(
    mode === 'file' ? data.get('file') : data
  )
  hideImportModal()
  modals.isImportRenderDisplayed = true
}

const uploadImportFile = async (data, toUpdate) => {
  const formData = new FormData()
  const csvContent = csv.turnEntriesToCsvString(data)
  formData.append(
    'file',
    new File([csvContent], 'import.csv', { type: 'text/csv' })
  )
  store.commit('PERSON_CSV_FILE_SELECTED', formData)

  errors.importingError = null
  try {
    await store.dispatch('uploadPersonFile', toUpdate)
    hideImportRenderModal()
    await store.dispatch('loadPeople')
  } catch (err) {
    console.error(err)
    errors.importingError = err
  }
}

const resetImport = () => {
  errors.importingError = null
  hideImportRenderModal()
  store.commit('PERSON_CSV_FILE_SELECTED', null)
  showImportModal()
}

// Avatar

const saveAvatar = async (loadingKey, action, payload) => {
  loading[loadingKey] = true
  try {
    await store.dispatch(action, payload)
    modals.avatar = false
    onSearchChange()
  } catch (err) {
    errors.avatar = true
  } finally {
    loading[loadingKey] = false
  }
}

const deleteAvatar = () =>
  saveAvatar('deletingAvatar', 'clearPersonAvatar', personToEdit.value)

const updateAvatar = formData =>
  saveAvatar('updatingAvatar', 'uploadPersonAvatar', {
    person: personToEdit.value,
    formData
  })

// Edition

// Only studio managers can edit people, so lowering your own role locks
// you out of the people page: nobody but another admin can revert it.
const isSelfRoleDowngrade = form =>
  personToEdit.value.id === user.value?.id &&
  personToEdit.value.role === 'admin' &&
  form.role !== 'admin'

const confirmEditPeople = form => {
  if (isSelfRoleDowngrade(form)) {
    pendingEditForm.value = form
    modals.selfRoleDowngrade = true
  } else {
    saveEditedPerson(form)
  }
}

const confirmSelfRoleDowngrade = () => {
  const form = pendingEditForm.value
  cancelSelfRoleDowngrade()
  saveEditedPerson(form)
}

const cancelSelfRoleDowngrade = () => {
  modals.selfRoleDowngrade = false
  pendingEditForm.value = null
}

const savePerson = async (loadingKey, action, form) => {
  loading[loadingKey] = true
  errors.edit = false
  errors.invalidEmailDomain = false
  errors.userLimit = false
  try {
    await store.dispatch(action, form)
    modals.edit = false
    onSearchChange()
  } catch (err) {
    console.error(err)
    const message = err.body?.message ?? ''
    if (message.includes('domain name')) {
      errors.invalidEmailDomain = true
    } else if (message.includes('limit reached')) {
      errors.userLimit = true
    } else {
      errors.edit = true
    }
  } finally {
    loading[loadingKey] = false
  }
}

const saveEditedPerson = form =>
  personToEdit.value.id === undefined
    ? savePerson('edit', 'newPerson', form)
    : savePerson('edit', 'editPerson', { ...form, id: personToEdit.value.id })

const confirmCreateAndInvite = form =>
  savePerson('createAndInvite', 'newPersonAndInvite', form)

const confirmInvite = async form => {
  loading.invite = true
  success.invite = false
  success.inviteLinkCopied = false
  errors.invite = false
  try {
    await store.dispatch('invitePerson', {
      ...form,
      id: personToEdit.value.id
    })
    success.invite = true
    onSearchChange()
  } catch (err) {
    console.error(err)
    errors.invite = true
  } finally {
    loading.invite = false
  }
}

const confirmCopyInviteLink = async form => {
  loading.inviteLink = true
  success.inviteLinkCopied = false
  success.invite = false
  errors.inviteLink = false
  try {
    const result = await store.dispatch('getResetPasswordLink', {
      ...form,
      id: personToEdit.value.id
    })
    const link =
      typeof result === 'string'
        ? result
        : (result.link ?? result.url ?? result.reset_password_link)
    await navigator.clipboard.writeText(link)
    success.inviteLinkCopied = true
  } catch (err) {
    console.error(err)
    errors.inviteLink = true
  } finally {
    loading.inviteLink = false
  }
}

const resetError = error => {
  if (error === 'email') {
    errors.invalidEmailDomain = false
  }
}

const onEditClicked = person => {
  errors.invite = false
  success.invite = false
  personToEdit.value = person
  modals.edit = true
}

const onNewClicked = () => onEditClicked({ role: 'user' })

// Deletion and archive

const confirmDeletePeople = async () => {
  loading.del = true
  errors.del = false
  try {
    await store.dispatch('deletePeople', personToDelete.value)
    modals.del = false
    onSearchChange()
  } catch (err) {
    console.error(err)
    errors.del = true
  } finally {
    loading.del = false
  }
}

const confirmArchiveGuest = async () => {
  if (!personToArchive.value) return
  loading.archiveGuest = true
  errors.archiveGuest = false
  try {
    await store.dispatch('archivePerson', personToArchive.value)
    modals.archiveGuest = false
    personToArchive.value = null
  } catch (err) {
    console.error(err)
    errors.archiveGuest = true
  } finally {
    loading.archiveGuest = false
  }
}

const onRestoreClicked = person => {
  store.dispatch('restorePerson', person).catch(console.error)
}

// List events

const onAvatarClicked = person => {
  personToEdit.value = person
  errors.avatar = false
  modals.avatar = true
}

const onDeleteClicked = person => {
  personToDelete.value = person
  modals.del = true
}

const onArchiveClicked = person => {
  personToArchive.value = person
  errors.archiveGuest = false
  modals.archiveGuest = true
}

const onChangePasswordClicked = person => {
  personToChangePassword.value = person
  modals.changePassword = true
}

// Watchers
// --------------------------------------------------------------------------

watch(
  () => modals.edit,
  isDisplayed => {
    if (isDisplayed) {
      Object.assign(loading, {
        createAndInvite: false,
        edit: false,
        invite: false,
        inviteLink: false
      })
      Object.assign(errors, {
        edit: false,
        invite: false,
        inviteLink: false,
        invalidEmailDomain: false,
        userLimit: false
      })
      Object.assign(success, { invite: false, inviteLinkCopied: false })
    } else {
      cancelSelfRoleDowngrade()
    }
  }
)

watch([selectedDepartment, selectedStudio, role], updateRoute)

watch(
  () => route.query.tab,
  tab => {
    activeTab.value = tab || 'active'
    ensureGuestsLoaded()
  }
)

watch(
  () => route.query.search,
  search => {
    searchFieldRef.value?.setValue(search)
    onSearchChange()
  }
)

// Lifecycle
// --------------------------------------------------------------------------

onMounted(async () => {
  activeTab.value = route.query.tab || 'active'
  role.value = route.query.role || 'all'
  selectedDepartment.value = route.query.department || ''
  selectedStudio.value = route.query.studio || ''
  if (!searchFieldRef.value?.getValue() && route.query.search) {
    searchFieldRef.value?.setValue(route.query.search)
  }
  await store.dispatch('loadPeople')
  onSearchChange()
  ensureGuestsLoaded()
})

// Head
// --------------------------------------------------------------------------

useHead({ title: computed(() => `${t('people.title')} - Kitsu`) })
</script>

<style lang="scss" scoped>
.page-header {
  margin-bottom: 0;
}

.data-list {
  margin-top: 1em;
}

.search {
  margin-top: 2em;
}
.query-list {
  margin-top: 1rem;
  margin-bottom: 1rem;
}
.search-options {
  align-items: flex-end;
}
</style>
