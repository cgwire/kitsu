<template>
  <div class="people page fixed-page">
    <div class="flexrow page-header">
      <page-title class="flexrow-item filler" :text="$t('people.title')" />

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
      <combobox-department
        class="flexrow-item"
        :label="$t('main.department')"
        v-model="selectedDepartment"
      />
      <combobox-studio
        class="flexrow-item"
        :label="$t('main.studio')"
        v-model="selectedStudio"
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
      :entries="activeTab === 'active' ? activePeople : unactivePeople"
      :is-loading="isPeopleLoading"
      :is-error="isPeopleLoadingError"
      @avatar-clicked="onAvatarClicked"
      @delete-clicked="onDeleteClicked"
      @edit-clicked="onEditClicked"
      @change-password-clicked="onChangePasswordClicked"
    />

    <import-render-modal
      :active="modals.isImportRenderDisplayed"
      :is-loading="isImportPeopleLoading"
      :is-error="isImportPeopleLoadingError"
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
      ref="import-modal"
      :active="modals.importModal"
      :is-loading="isImportPeopleLoading"
      :is-error="isImportPeopleLoadingError"
      :form-data="personCsvFormData"
      :columns="[...dataMatchers, ...csvColumns]"
      :optional-columns="optionalCsvColumns"
      @cancel="hideImportModal"
      @confirm="renderImport"
    />

    <edit-avatar-modal
      :active="modals.avatar"
      :error-text="$t('people.edit_avatar_error')"
      :is-deleting="loading.deletingAvatar"
      :is-error="errors.avatar"
      :is-updating="loading.updatingAvatar"
      :person="personToEdit"
      @close="modals.avatar = false"
      @delete="deleteAvatar"
      @update="updateAvatar"
    />

    <edit-person-modal
      :active="modals.edit"
      :is-create-invite-loading="loading.createAndInvite"
      :is-error="errors.edit"
      :is-invite-loading="loading.invite"
      :is-invitation-success="success.invite"
      :is-invitation-error="errors.invite"
      :is-loading="loading.edit"
      :is-user-limit-error="errors.userLimit"
      :person-to-edit="personToEdit"
      @cancel="modals.edit = false"
      @confirm="confirmEditPeople"
      @confirm-invite="confirmCreateAndInvite"
      @invite="confirmInvite"
    />

    <change-password-modal
      :active="modals.changePassword"
      :person="personToChangePassword"
      @cancel="modals.changePassword = false"
      @confirm="modals.changePassword = false"
    />

    <hard-delete-modal
      :active="modals.del"
      :error-text="$t('people.delete_error')"
      :is-loading="loading.del"
      :is-error="errors.del"
      :lock-text="personToDelete ? personToDelete.full_name : ''"
      :text="deleteText"
      @cancel="modals.del = false"
      @confirm="confirmDeletePeople"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import csv from '@/lib/csv'

import { searchMixin } from '@/components/mixins/search'

import ButtonHrefLink from '@/components/widgets/ButtonHrefLink.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ChangePasswordModal from '@/components/modals/ChangePasswordModal.vue'
import ComboboxDepartment from '@/components/widgets/ComboboxDepartment.vue'
import ComboboxStudio from '@/components/widgets/ComboboxStudio.vue'
import ComboboxStyled from '@/components/widgets/ComboboxStyled.vue'
import EditAvatarModal from '@/components/modals/EditAvatarModal.vue'
import EditPersonModal from '@/components/modals/EditPersonModal.vue'
import HardDeleteModal from '@/components/modals/HardDeleteModal.vue'
import ImportModal from '@/components/modals/ImportModal.vue'
import ImportRenderModal from '@/components/modals/ImportRenderModal.vue'
import PeopleList from '@/components/lists/PeopleList.vue'
import PageTitle from '@/components/widgets/PageTitle.vue'
import RouteTabs from '@/components/widgets/RouteTabs.vue'
import SearchField from '@/components/widgets/SearchField.vue'
import SearchQueryList from '@/components/widgets/SearchQueryList.vue'

export default {
  name: 'people',

  mixins: [searchMixin],

  components: {
    ButtonHrefLink,
    ButtonSimple,
    ChangePasswordModal,
    ComboboxDepartment,
    ComboboxStudio,
    ComboboxStyled,
    EditAvatarModal,
    EditPersonModal,
    HardDeleteModal,
    ImportModal,
    ImportRenderModal,
    PageTitle,
    PeopleList,
    RouteTabs,
    SearchField,
    SearchQueryList
  },

  data() {
    return {
      activeTab: 'active',
      csvColumns: ['First Name', 'Last Name'],
      optionalCsvColumns: [
        'Phone',
        'Role',
        'Contract Type',
        'Studio',
        'Active'
      ],
      dataMatchers: ['Email'],
      role: 'all',
      roleOptions: [
        { label: 'all', value: 'all' },
        { label: 'admin', value: 'admin' },
        { label: 'client', value: 'client' },
        { label: 'manager', value: 'manager' },
        { label: 'supervisor', value: 'supervisor' },
        { label: 'user', value: 'user' },
        { label: 'vendor', value: 'vendor' }
      ],
      errors: {
        avatar: false,
        del: false,
        edit: false,
        invite: false,
        userLimit: false
      },
      loading: {
        createAndInvite: false,
        del: false,
        deletingAvatar: false,
        edit: false,
        invite: false,
        savingSearch: false,
        updatingAvatar: false
      },
      modals: {
        avatar: false,
        changePassword: false,
        del: false,
        edit: false,
        importModal: false,
        isImportRenderDisplayed: false
      },
      parsedCSV: [],
      personToDelete: {},
      personToEdit: { role: 'user' },
      personToChangePassword: {},
      selectedDepartment: '',
      selectedStudio: '',
      success: {
        invite: false
      },
      tabs: [
        {
          name: 'active',
          label: this.$t('main.active')
        },
        {
          name: 'unactive',
          label: this.$t('people.unactive')
        }
      ]
    }
  },

  mounted() {
    this.role = this.$route.query.role || 'all'
    this.selectedDepartment = this.$route.query.department || ''
    this.selectedStudio = this.$route.query.studio || ''
    this.setSearchFromUrl()
    this.loadPeople(() => {
      this.onSearchChange()
    })
  },

  computed: {
    ...mapGetters([
      'displayedPeople',
      'isCurrentUserAdmin',
      'isPeopleLoading',
      'isPeopleLoadingError',
      'isImportPeopleLoading',
      'isImportPeopleLoadingError',
      'people',
      'peopleSearchQueries',
      'personCsvFormData',
      'studioMap'
    ]),

    currentPeople() {
      let people = this.displayedPeople.filter(person => !person.is_bot)
      if (this.role !== 'all') {
        people = people.filter(person => person.role === this.role)
      }
      if (this.selectedDepartment) {
        people = people.filter(person =>
          person.departments.includes(this.selectedDepartment)
        )
      }
      if (this.selectedStudio) {
        people = people.filter(
          person => person.studio_id === this.selectedStudio
        )
      }
      return people.map(person => ({
        ...person,
        studio: this.studioMap.get(person.studio_id)
      }))
    },

    deleteText() {
      const personName = this.personToDelete?.full_name
      return personName ? this.$t('people.delete_text', { personName }) : ''
    },

    filteredPeople() {
      const persons = {}
      this.displayedPeople.forEach(person => {
        const personKey = person.email
        persons[personKey] = true
      })
      return persons
    },

    searchField() {
      return this.$refs['people-search-field']
    },

    activePeople() {
      return this.currentPeople.filter(person => person.active)
    },

    unactivePeople() {
      return this.currentPeople.filter(person => !person.active)
    }
  },

  methods: {
    ...mapActions([
      'clearPersonAvatar',
      'deletePeople',
      'editPerson',
      'invitePerson',
      'loadPeople',
      'newPerson',
      'newPersonAndInvite',
      'removePeopleSearch',
      'savePeopleSearch',
      'setPeopleSearch',
      'uploadPersonAvatar',
      'uploadPersonFile'
    ]),

    renderImport(data, mode) {
      this.loading.importing = true
      this.errors.importing = false
      this.formData = data
      if (mode === 'file') {
        data = data.get('file')
      }
      csv.processCSV(data).then(results => {
        this.parsedCSV = results
        this.hideImportModal()
        this.loading.importing = false
        this.showImportRenderModal()
      })
    },

    uploadImportFile(data, toUpdate) {
      const formData = new FormData()
      const filename = 'import.csv'
      const csvContent = csv.turnEntriesToCsvString(data)
      const file = new File([csvContent], filename, { type: 'text/csv' })

      formData.append('file', file)
      this.loading.importing = true
      this.errors.importing = false
      this.$store.commit('PERSON_CSV_FILE_SELECTED', formData)

      this.uploadPersonFile(toUpdate)
        .then(() => {
          this.$store.dispatch('loadPeople')
          this.hideImportRenderModal()
        })
        .catch(err => {
          console.error(err)
          this.loading.importing = false
          this.errors.importing = true
        })
    },

    resetImport() {
      this.errors.importing = false
      this.hideImportRenderModal()
      this.$store.commit('PERSON_CSV_FILE_SELECTED', null)
      this.$refs['import-modal'].reset()
      this.showImportModal()
    },

    async deleteAvatar() {
      this.loading.deletingAvatar = true
      try {
        await this.clearPersonAvatar(this.personToEdit)
        this.modals.avatar = false
      } catch (err) {
        this.errors.avatar = true
      }
      this.loading.deletingAvatar = false
    },

    async updateAvatar(formData) {
      this.loading.updatingAvatar = true
      try {
        await this.uploadPersonAvatar({ person: this.personToEdit, formData })
        this.modals.avatar = false
      } catch (err) {
        this.errors.avatar = true
      }
      this.loading.updatingAvatar = false
    },

    confirmEditPeople(form) {
      let action = 'editPerson'
      if (this.personToEdit.id === undefined) action = 'newPerson'
      else form.id = this.personToEdit.id
      this.loading.edit = true
      this.errors.edit = false
      this.errors.userLimit = false
      this[action](form)
        .then(() => {
          this.loading.edit = false
          this.modals.edit = false
        })
        .catch(err => {
          const isUserLimitReached =
            err.body?.message?.includes('limit') ?? false
          if (isUserLimitReached) {
            this.errors.userLimit = true
          } else {
            this.errors.edit = true
          }
          this.loading.edit = false
        })
    },

    confirmCreateAndInvite(form) {
      this.loading.createAndInvite = true
      this.errors.edit = false
      this.errors.userLimit = false
      this.newPersonAndInvite(form)
        .then(() => {
          this.loading.createAndInvite = false
          this.modals.edit = false
        })
        .catch(err => {
          console.error(err)
          const isUserLimitReached =
            err.body?.message?.includes('limit') ?? false
          if (isUserLimitReached) {
            this.errors.userLimit = true
          } else {
            this.errors.edit = true
          }
          this.loading.createAndInvite = false
        })
      this.onSearchChange()
    },

    confirmInvite(form) {
      form.id = this.personToEdit.id
      this.loading.invite = true
      this.errors.invite = false
      this.invitePerson(form)
        .then(() => {
          this.loading.invite = false
          this.success.invite = true
        })
        .catch(err => {
          console.error(err)
          this.loading.invite = false
          this.success.invite = false
          this.errors.invite = true
        })
      this.onSearchChange()
    },

    confirmDeletePeople() {
      this.loading.del = true
      this.errors.del = false
      this.deletePeople(this.personToDelete)
        .then(() => {
          this.loading.del = false
          this.modals.del = false
        })
        .catch(err => {
          console.error(err)
          this.loading.del = false
          this.errors.del = true
        })
    },

    onSearchChange() {
      if (!this.searchField) return
      const searchQuery = this.searchField.getValue()
      if (searchQuery.length !== 1) {
        this.setPeopleSearch(searchQuery)
      }
      this.setSearchInUrl()
      this.tabs[0].label =
        this.$t('main.active') + ' (' + this.activePeople.length + ')'
      this.tabs[1].label =
        this.$t('people.unactive') + ' (' + this.unactivePeople.length + ')'
    },

    onAvatarClicked(person) {
      this.personToEdit = person
      this.errors.avatar = false
      this.modals.avatar = true
    },

    onDeleteClicked(person) {
      this.personToDelete = person
      this.modals.del = true
    },

    onEditClicked(person) {
      this.errors.invite = false
      this.success.invite = false
      this.personToEdit = person
      this.modals.edit = true
    },

    onChangePasswordClicked(person) {
      this.personToChangePassword = person
      this.modals.changePassword = true
    },

    onNewClicked() {
      this.errors.invite = false
      this.success.invite = false
      this.personToEdit = { role: 'user' }
      this.modals.edit = true
    },

    showImportModal() {
      this.modals.importModal = true
    },

    hideImportModal() {
      this.modals.importModal = false
    },

    showImportRenderModal() {
      this.modals.isImportRenderDisplayed = true
    },

    hideImportRenderModal() {
      this.modals.isImportRenderDisplayed = false
    },

    saveSearchQuery(searchQuery) {
      if (this.loading.savingSearch) {
        return
      }
      this.loading.savingSearch = true
      this.savePeopleSearch(searchQuery)
        .catch(console.error)
        .finally(() => {
          this.loading.savingSearch = false
        })
    },

    removeSearchQuery(searchQuery) {
      this.removePeopleSearch(searchQuery).catch(console.error)
    },

    updateRoute() {
      const search = this.searchField.getValue()
      const department = this.selectedDepartment
      const studio = this.selectedStudio
      const role = this.role
      this.$router.push({ query: { search, department, studio, role } })
    }
  },

  watch: {
    'modals.edit'() {
      if (this.modals.edit) {
        this.loading.createAndInvite = false
        this.errors.edit = false
        this.errors.invite = false
        this.errors.userLimit = false
        this.loading.edit = false
        this.loading.invite = false
        this.success.invite = false
      }
    },

    selectedDepartment() {
      this.updateRoute()
    },

    selectedStudio() {
      this.updateRoute()
    },

    role() {
      this.updateRoute()
    },

    '$route.query.tab'() {
      this.activeTab = this.$route.query.tab || 'active'
    },

    '$route.query.search'() {
      this.onSearchChange()
    }
  },

  head() {
    return {
      title: `${this.$t('people.title')} - Kitsu`
    }
  }
}
</script>

<style lang="scss" scoped>
.page-header {
  margin-bottom: 0em;
}

.tabs {
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
.filter-button {
  margin-top: 0.3em;
}
</style>
