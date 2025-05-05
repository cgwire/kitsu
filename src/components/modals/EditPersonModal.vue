<template>
  <div class="modal" :class="{ 'is-active': active }">
    <div class="modal-background" @click="$emit('cancel')"></div>

    <div class="modal-content">
      <form @submit.prevent="emitForm('confirm')" class="box">
        <h1 class="title" v-if="personToEdit.id !== undefined">
          {{ $t('people.edit_title') }} {{ personToEdit.full_name }}
        </h1>
        <h1 class="title" v-else>
          {{ $t(isBot ? 'bots.new_bot' : 'people.new_person') }}
        </h1>
        <text-field
          ref="name-field"
          :errored="form.first_name && !isValidName"
          :label="$t(isBot ? 'bots.fields.name' : 'people.fields.first_name')"
          :disabled="personToEdit.is_generated_from_ldap"
          v-model.trim="form.first_name"
        />
        <text-field
          :label="$t('people.fields.last_name')"
          :disabled="personToEdit.is_generated_from_ldap"
          v-model.trim="form.last_name"
          v-if="!isBot"
        />
        <text-field
          type="email"
          :errored="form.email && !isValidEmail"
          :label="$t('people.fields.email')"
          :disabled="personToEdit.is_generated_from_ldap"
          v-model.trim="form.email"
          v-if="!isBot"
        />
        <text-field
          :label="$t('people.fields.phone')"
          v-model.trim="form.phone"
          v-if="!isBot"
        />
        <date-field
          :label="$t('bots.fields.expiration_date')"
          :min-date="today"
          :disabled="isEditing"
          v-model="form.expiration_date"
          v-if="isBot"
        />
        <combobox
          :label="$t('people.fields.role')"
          :options="roleOptions"
          locale-key-prefix="people.role."
          v-model="form.role"
        />
        <combobox
          :label="$t('people.fields.position')"
          :options="positionOptions"
          locale-key-prefix="people.position."
          v-model="form.position"
          v-if="!isBot"
        />
        <combobox
          :label="$t('people.fields.seniority')"
          :options="seniorityOptions"
          locale-key-prefix="people.seniority."
          v-model="form.seniority"
          v-if="!isBot"
        />
        <text-field
          type="number"
          :label="$t('people.fields.daily_salary')"
          v-model="form.daily_salary"
          v-if="!isBot"
        />
        <combobox
          :label="$t('people.fields.contract')"
          :options="contractOptions"
          locale-key-prefix="people.contract."
          v-model="form.contract_type"
          v-if="!isBot && form.role !== 'client'"
        />
        <div class="departments field">
          <label class="label">{{ $t('people.fields.departments') }}</label>
          <p
            class="empty mb1"
            v-if="form.departments && form.departments.length === 0"
          >
            {{ $t('people.departments_empty') }}
          </p>
          <div
            class="department-element mb1 mt05"
            :key="departmentId"
            @click="removeDepartment(departmentId)"
            v-for="departmentId in form.departments"
          >
            <department-name
              :department="departmentMap.get(departmentId)"
              v-if="departmentId"
            />
          </div>
          <div class="flexrow">
            <combobox-department
              class="flexrow-item"
              :selectable-departments="selectableDepartments"
              v-model="selectedDepartment"
              v-if="selectableDepartments.length > 0"
            />
            <button
              class="button is-success flexrow-item"
              :class="{
                'is-disabled': selectedDepartment === null
              }"
              type="button"
              @click="addDepartment"
              v-if="selectableDepartments.length > 0"
            >
              {{ $t('main.add') }}
            </button>
          </div>
        </div>
        <combobox-studio
          class="field"
          :label="$t('people.fields.studio')"
          v-model="form.studio_id"
          v-if="!isBot"
        />
        <combobox
          :label="$t('people.fields.active')"
          :options="activeOptions"
          :disabled="personToEdit.is_generated_from_ldap"
          v-model="form.active"
        />

        <div class="flexrow">
          <button
            class="button flexrow-item"
            :class="{
              'is-loading': isInviteLoading
            }"
            :disabled="!isValidEmail"
            type="button"
            @click="emitForm('invite')"
            v-if="isEditing && !isBot"
          >
            {{ $t('people.invite') }}
          </button>
          <div class="filler"></div>

          <button
            class="button is-primary flexrow-item"
            :class="{
              'is-loading': isCreateInviteLoading
            }"
            :disabled="!isValidForm"
            type="button"
            @click="emitForm('confirm-invite')"
            v-if="!isEditing && !isBot"
          >
            {{ $t('people.create_invite') }}
          </button>
          <button
            class="button is-primary flexrow-item"
            :class="{
              'is-loading': isLoading
            }"
            :disabled="!isValidForm"
            type="submit"
          >
            {{ !isEditing ? $t('people.create') : $t('people.confirm_edit') }}
          </button>
          <button
            class="button is-link flexrow-item"
            type="button"
            @click="$emit('cancel')"
          >
            {{ $t('main.cancel') }}
          </button>
        </div>

        <div class="success has-text-right mt1" v-if="isInvitationSuccess">
          {{ $t('people.invite_success') }}
        </div>
        <div class="error has-text-right mt1" v-if="isInvitationError">
          {{ $t('people.invite_error') }}
        </div>
        <div class="error has-text-right mt1" v-if="isUserLimitError">
          {{ $t('people.user_limit_error') }}
        </div>
        <div class="error has-text-right mt1" v-if="isError">
          {{ $t('people.create_error') }}
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { modalMixin } from '@/components/modals/base_modal'
import { timeMixin } from '@/components/mixins/time'

import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxDepartment from '@/components/widgets/ComboboxDepartment.vue'
import ComboboxStudio from '@/components/widgets/ComboboxStudio.vue'
import DateField from '@/components/widgets/DateField.vue'
import DepartmentName from '@/components/widgets/DepartmentName.vue'
import TextField from '@/components/widgets/TextField.vue'

export default {
  name: 'edit-person-modal',

  mixins: [modalMixin, timeMixin],

  components: {
    Combobox,
    ComboboxDepartment,
    ComboboxStudio,
    DateField,
    DepartmentName,
    TextField
  },

  props: {
    active: {
      type: Boolean,
      default: false
    },
    isBot: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    isCreateInviteLoading: {
      type: Boolean,
      default: false
    },
    isInviteLoading: {
      type: Boolean,
      default: false
    },
    isInvitationSuccess: {
      type: Boolean,
      default: false
    },
    isInvitationError: {
      type: Boolean,
      default: false
    },
    isUserLimitError: {
      type: Boolean,
      default: false
    },
    isError: {
      type: Boolean,
      default: false
    },
    personToEdit: {
      type: Object,
      default: () => {}
    }
  },

  emits: ['cancel'],

  data() {
    return {
      activeOptions: [
        { label: this.$t('main.yes'), value: 'true' },
        { label: this.$t('main.no'), value: 'false' }
      ],
      contractOptions: [
        { label: 'open-ended', value: 'open-ended' },
        { label: 'fixed-term', value: 'fixed-term' },
        { label: 'short-term', value: 'short-term' },
        { label: 'freelance', value: 'freelance' },
        { label: 'apprentice', value: 'apprentice' },
        { label: 'internship', value: 'internship' }
      ],
      form: {
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        role: 'user',
        contract_type: 'open-ended',
        active: 'true',
        departments: [],
        studio_id: null,
        expiration_date: null,
        is_bot: false
      },
      roleOptions: [
        { label: 'user', value: 'user' },
        { label: 'supervisor', value: 'supervisor' },
        { label: 'manager', value: 'manager' },
        { label: 'client', value: 'client' },
        { label: 'vendor', value: 'vendor' },
        { label: 'admin', value: 'admin' }
      ],
      positionOptions: [
        { label: '', value: null },
        { label: 'artist', value: 'artist' },
        { label: 'supervisor', value: 'supervisor' },
        { label: 'lead', value: 'lead' }
      ],
      seniorityOptions: [
        { label: '', value: null },
        { label: 'senior', value: 'senior' },
        { label: 'mid', value: 'mid' },
        { label: 'junior', value: 'junior' }
      ],
      selectedDepartment: null
    }
  },

  computed: {
    ...mapGetters(['departments', 'departmentMap', 'people', 'user']),

    selectableDepartments() {
      return this.departments.filter(
        department => !this.form.departments.includes(department.id)
      )
    },

    isEditing() {
      return Boolean(this.personToEdit?.id)
    },

    isValidName() {
      return Boolean(this.form.first_name?.length)
    },

    isValidEmail() {
      if (!this.form.email?.length) {
        return false
      }

      const emailRegex =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

      if (!emailRegex.test(this.form.email)) {
        return false
      }

      if (this.form.is_bot) {
        return true
      }

      const isExist = this.people.some(
        person =>
          !person.is_bot &&
          person.email === this.form.email &&
          (!this.personToEdit || this.personToEdit.email !== person.email)
      )
      return !isExist
    },

    isValidForm() {
      return this.isValidName && this.isValidEmail
    }
  },

  methods: {
    emitForm(event) {
      if (!this.isValidForm) {
        return
      }
      const form = {
        ...this.form,
        last_name: this.form.last_name || '',
        active: this.form.active === 'true' || this.form.active === true
      }
      this.$emit(event, form)
    },

    addDepartment() {
      this.form.departments.push(this.selectedDepartment)
      this.selectedDepartment = null
    },

    removeDepartment(idToRemove) {
      const departmentIndex = this.form.departments.indexOf(idToRemove)
      if (departmentIndex >= 0) {
        this.form.departments.splice(departmentIndex, 1)
      }
    },

    resetForm() {
      if (this.isEditing) {
        this.form = {
          first_name: this.personToEdit.first_name,
          last_name: this.personToEdit.last_name,
          email: this.personToEdit.email,
          phone: this.personToEdit.phone,
          role: this.personToEdit.role,
          position: this.personToEdit.position,
          seniority: this.personToEdit.seniority,
          daily_salary: this.personToEdit.daily_salary,
          contract_type: this.personToEdit.contract_type,
          active: this.personToEdit.active ? 'true' : 'false',
          departments: [...(this.personToEdit.departments || [])],
          studio_id: this.personToEdit.studio_id,
          expiration_date: this.personToEdit.expiration_date,
          is_bot: this.personToEdit.is_bot
        }
      } else {
        this.form = {
          role: 'user',
          position: 'artist',
          seniority: 'mid',
          daily_salary: 0,
          contract_type: 'open-ended',
          active: 'true',
          departments: [],
          studio_id: null,
          expiration_date: null,
          is_bot: this.isBot,
          email: this.isBot ? this.user.email : null
        }
      }
    }
  },

  watch: {
    personToEdit() {
      this.resetForm()
    },

    active() {
      if (this.active) {
        this.resetForm()
        setTimeout(() => {
          this.$refs['name-field'].focus()
        }, 100)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.department-element {
  display: inline-block;
  margin-right: 0.2em;
  cursor: pointer;
}

.modal-content .box p.text {
  margin-bottom: 1em;
}

.is-danger {
  color: #ff3860;
  font-style: italic;
}

.empty {
  color: var(--text);
  font-style: italic;
}
</style>
