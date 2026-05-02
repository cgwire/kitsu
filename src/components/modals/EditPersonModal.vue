<template>
  <base-modal :active="active" :title="modalTitle" @cancel="$emit('cancel')">
    <form @submit.prevent="emitForm('confirm')">
      <text-field
        ref="nameField"
        :errored="form.first_name && !isValidName"
        :label="isBot ? $t('bots.fields.name') : $t('people.fields.first_name')"
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
        :error-text="emailErrorText"
        :label="$t('people.fields.email')"
        :disabled="personToEdit.is_generated_from_ldap"
        v-model.trim="form.email"
        @update:model-value="$emit('reset-error', 'email')"
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
          {{
            isBot
              ? $t('bots.departments_empty')
              : $t('people.departments_empty')
          }}
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
          {{
            !isEditing
              ? isBot
                ? $t('bots.create')
                : $t('people.create')
              : isBot
                ? $t('bots.confirm_edit')
                : $t('people.confirm_edit')
          }}
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
  </base-modal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { useTime } from '@/composables/time'

import BaseModal from '@/components/modals/BaseModal.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxDepartment from '@/components/widgets/ComboboxDepartment.vue'
import ComboboxStudio from '@/components/widgets/ComboboxStudio.vue'
import DateField from '@/components/widgets/DateField.vue'
import DepartmentName from '@/components/widgets/DepartmentName.vue'
import TextField from '@/components/widgets/TextField.vue'

const { t } = useI18n()
const { today } = useTime()
const store = useStore()

const props = defineProps({
  active: { type: Boolean, default: false },
  isBot: { type: Boolean, default: false },
  isCreateInviteLoading: { type: Boolean, default: false },
  isEmailDomainError: { type: Boolean, default: false },
  isError: { type: Boolean, default: false },
  isInvitationError: { type: Boolean, default: false },
  isInvitationSuccess: { type: Boolean, default: false },
  isInviteLoading: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  isUserLimitError: { type: Boolean, default: false },
  personToEdit: { type: Object, default: () => ({}) }
})

// emitForm() emits one of 'confirm' / 'confirm-invite' / 'invite' dynamically,
// so vue/no-unused-emit-declarations can't statically prove they're used.
/* eslint-disable vue/no-unused-emit-declarations */
const emit = defineEmits([
  'cancel',
  'confirm',
  'confirm-invite',
  'invite',
  'reset-error'
])
/* eslint-enable vue/no-unused-emit-declarations */

const activeOptions = computed(() => [
  { label: t('main.yes'), value: 'true' },
  { label: t('main.no'), value: 'false' }
])

const contractOptions = [
  { label: 'open-ended', value: 'open-ended' },
  { label: 'fixed-term', value: 'fixed-term' },
  { label: 'short-term', value: 'short-term' },
  { label: 'freelance', value: 'freelance' },
  { label: 'apprentice', value: 'apprentice' },
  { label: 'internship', value: 'internship' }
]

const roleOptions = [
  { label: 'user', value: 'user' },
  { label: 'supervisor', value: 'supervisor' },
  { label: 'manager', value: 'manager' },
  { label: 'client', value: 'client' },
  { label: 'vendor', value: 'vendor' },
  { label: 'admin', value: 'admin' }
]

const positionOptions = [
  { label: '', value: null },
  { label: 'artist', value: 'artist' },
  { label: 'supervisor', value: 'supervisor' },
  { label: 'lead', value: 'lead' }
]

const seniorityOptions = [
  { label: '', value: null },
  { label: 'senior', value: 'senior' },
  { label: 'mid', value: 'mid' },
  { label: 'junior', value: 'junior' }
]

const form = ref({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  role: 'user',
  position: 'artist',
  seniority: 'mid',
  daily_salary: 0,
  contract_type: 'open-ended',
  active: 'true',
  departments: [],
  studio_id: null,
  expiration_date: null,
  is_bot: false
})
const nameField = ref(null)
const selectedDepartment = ref(null)

const departments = computed(() => store.getters.departments)
const departmentMap = computed(() => store.getters.departmentMap)
const people = computed(() => store.getters.people)
const user = computed(() => store.getters.user)

const isEditing = computed(() => Boolean(props.personToEdit?.id))

const modalTitle = computed(() => {
  if (isEditing.value) {
    const prefix = props.isBot ? t('bots.edit_title') : t('people.edit_title')
    return `${prefix} ${props.personToEdit.full_name}`
  }
  return props.isBot ? t('bots.new_bot') : t('people.new_person')
})

const selectableDepartments = computed(() =>
  departments.value.filter(d => !form.value.departments.includes(d.id))
)

const isValidName = computed(() => Boolean(form.value.first_name?.length))

const isUniqEmail = computed(
  () =>
    !people.value.some(
      person =>
        !person.is_bot &&
        person.email === form.value.email &&
        (!props.personToEdit || props.personToEdit.email !== person.email)
    )
)

const isValidEmail = computed(() => {
  if (!form.value.email?.length) return false
  const emailRegex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  if (!emailRegex.test(form.value.email)) return false
  if (form.value.is_bot) return true
  return isUniqEmail.value && !props.isEmailDomainError
})

const isValidForm = computed(() => isValidName.value && isValidEmail.value)

const emailErrorText = computed(() => {
  if (props.isEmailDomainError) return t('people.email_domain_error')
  if (!isUniqEmail.value) return t('people.email_exist_error')
  return ''
})

const emitForm = event => {
  if (!isValidForm.value) return
  emit(event, {
    ...form.value,
    last_name: form.value.last_name || '',
    active: form.value.active === 'true' || form.value.active === true
  })
}

const addDepartment = () => {
  form.value.departments.push(selectedDepartment.value)
  selectedDepartment.value = null
}

const removeDepartment = idToRemove => {
  const index = form.value.departments.indexOf(idToRemove)
  if (index >= 0) form.value.departments.splice(index, 1)
}

const resetForm = () => {
  if (isEditing.value) {
    const p = props.personToEdit
    form.value = {
      first_name: p.first_name,
      last_name: p.last_name,
      email: p.email,
      phone: p.phone,
      role: p.role,
      position: p.position,
      seniority: p.seniority,
      daily_salary: p.daily_salary,
      contract_type: p.contract_type,
      active: p.active ? 'true' : 'false',
      departments: [...(p.departments || [])],
      studio_id: p.studio_id,
      expiration_date: p.expiration_date,
      is_bot: p.is_bot,
      notifications_enabled: p.notifications_enabled ? 'true' : 'false',
      notifications_slack_enabled: p.notifications_slack_enabled
        ? 'true'
        : 'false',
      notifications_mattermost_enabled: p.notifications_mattermost_enabled
        ? 'true'
        : 'false',
      notifications_discord_enabled: p.notifications_discord_enabled
        ? 'true'
        : 'false'
    }
  } else {
    form.value = {
      role: 'user',
      position: 'artist',
      seniority: 'mid',
      daily_salary: 0,
      contract_type: 'open-ended',
      active: 'true',
      departments: [],
      studio_id: null,
      expiration_date: null,
      is_bot: props.isBot,
      email: props.isBot ? user.value.email : null
    }
  }
}

watch(() => props.personToEdit, resetForm, { immediate: true })

watch(
  () => props.active,
  active => {
    if (active) {
      setTimeout(() => {
        nameField.value?.focus()
      }, 100)
    }
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.department-element {
  display: inline-block;
  margin-right: 0.2em;
  cursor: pointer;
}

.empty {
  color: var(--text);
  font-style: italic;
}
</style>
