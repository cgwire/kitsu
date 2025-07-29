<template>
  <div class="bots page fixed-page">
    <div class="flexrow page-header">
      <page-title class="flexrow-item filler" :text="$t('bots.title')" />
      <button-simple
        class="flexrow-item"
        :text="$t('bots.new_bot')"
        :is-responsive="true"
        icon="plus"
        @click="onNewClicked"
        v-if="isCurrentUserAdmin"
      />
    </div>

    <div class="flexrow search-options">
      <search-field
        ref="search-field"
        class="search flexrow-item"
        @change="onSearchChange"
        placeholder="ex: gazu bot"
      />
      <combobox-department
        class="flexrow-item"
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

    <div class="query-list"></div>

    <people-list
      :entries="currentPeople"
      :is-bots="true"
      :is-loading="isPeopleLoading"
      :is-error="isPeopleLoadingError"
      @avatar-clicked="onAvatarClicked"
      @delete-clicked="onDeleteClicked"
      @edit-clicked="onEditClicked"
      @refresh-clicked="onRefreshClicked"
      v-if="isPeopleLoading || currentPeople.length > 0"
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
      :is-bot="true"
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

<script>
import { mapGetters, mapActions } from 'vuex'

import { searchMixin } from '@/components/mixins/search'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ComboboxDepartment from '@/components/widgets/ComboboxDepartment.vue'
import ComboboxStyled from '@/components/widgets/ComboboxStyled.vue'
import EditAvatarModal from '@/components/modals/EditAvatarModal.vue'
import EditPersonModal from '@/components/modals/EditPersonModal.vue'
import HardDeleteModal from '@/components/modals/HardDeleteModal.vue'
import NewTokenModal from '@/components/modals/NewTokenModal.vue'
import PageTitle from '@/components/widgets/PageTitle.vue'
import PeopleList from '@/components/lists/PeopleList.vue'
import SearchField from '@/components/widgets/SearchField.vue'

export default {
  name: 'bots',

  mixins: [searchMixin],

  components: {
    ButtonSimple,
    ComboboxDepartment,
    ComboboxStyled,
    EditAvatarModal,
    EditPersonModal,
    HardDeleteModal,
    NewTokenModal,
    PageTitle,
    PeopleList,
    SearchField
  },

  data() {
    return {
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
        userLimit: false
      },
      loading: {
        del: false,
        deletingAvatar: false,
        edit: false,
        updatingAvatar: false
      },
      modals: {
        avatar: false,
        del: false,
        edit: false,
        newToken: false
      },
      personToDelete: {},
      personToEdit: { role: 'user' },
      selectedDepartment: ''
    }
  },

  async mounted() {
    this.role = this.$route.query.role || 'all'
    this.selectedDepartment = this.$route.query.department || ''
    this.setSearchFromUrl()
    await this.loadPeople()
    this.onSearchChange()
  },

  watch: {
    'modals.edit'() {
      if (this.modals.edit) {
        this.errors.edit = false
        this.errors.userLimit = false
        this.loading.edit = false
      }
    },

    selectedDepartment() {
      this.updateRoute()
    },

    role() {
      this.updateRoute()
    }
  },

  computed: {
    ...mapGetters([
      'displayedPeople',
      'isCurrentUserAdmin',
      'isPeopleLoading',
      'isPeopleLoadingError'
    ]),

    currentPeople() {
      let people = this.displayedPeople.filter(person => person.is_bot)
      if (this.role !== 'all') {
        people = people.filter(person => person.role === this.role)
      }
      if (this.selectedDepartment) {
        people = people.filter(person =>
          person.departments.includes(this.selectedDepartment)
        )
      }
      return people
    },

    deleteText() {
      const personName = this.personToDelete?.full_name
      return personName ? this.$t('people.delete_text', { personName }) : ''
    },

    searchField() {
      return this.$refs['search-field']
    }
  },

  methods: {
    ...mapActions([
      'clearPersonAvatar',
      'deletePeople',
      'editPerson',
      'generateToken',
      'loadPeople',
      'newPerson',
      'setPeopleSearch',
      'uploadPersonAvatar'
    ]),

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

    confirmGenerateToken(form) {
      this.generateToken(form)
        .then(person => {
          this.updatePersonToEdit(person)
        })
        .catch(console.error)
    },

    confirmEditPeople(form) {
      let action = 'editPerson'
      if (this.personToEdit.id === undefined) action = 'newPerson'
      else form.id = this.personToEdit.id
      this.loading.edit = true
      this.errors.edit = false
      this.errors.userLimit = false
      this[action](form)
        .then(person => {
          this.loading.edit = false
          this.modals.edit = false
          const access_token = person.access_token
          if (access_token?.length) {
            this.updatePersonToEdit(person)
            this.modals.newToken = true
          }
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
          this.loading.edit = false
        })
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
        this.updateRoute()
      }
    },

    onAvatarClicked(person) {
      this.updatePersonToEdit(person)
      this.errors.avatar = false
      this.modals.avatar = true
    },

    onDeleteClicked(person) {
      this.personToDelete = person
      this.modals.del = true
    },

    onEditClicked(person) {
      this.updatePersonToEdit(person)
      this.modals.edit = true
    },

    onRefreshClicked(person) {
      this.updatePersonToEdit(person)
      this.modals.newToken = true
    },

    onNewClicked() {
      this.updatePersonToEdit({ role: 'user' })
      this.modals.edit = true
    },

    updatePersonToEdit(person) {
      this.personToEdit = {
        ...person,
        expiration_date: person.expiration_date
          ? new Date(person.expiration_date)
          : null
      }
    },

    updateRoute() {
      const search = this.searchField.getValue()
      const department = this.selectedDepartment
      const role = this.role
      this.$router.push({ query: { search, department, role } })
    }
  },

  head() {
    return {
      title: `${this.$t('bots.title')} - Kitsu`
    }
  }
}
</script>

<style lang="scss" scoped>
.search {
  margin-top: 2em;
}
.query-list {
  margin-top: 1.5rem;
}
.search-options {
  align-items: flex-end;
}
.filter-button {
  margin-top: 0.3em;
}
</style>
