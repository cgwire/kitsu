<template>
  <div class="data-list">
    <div class="datatable-wrapper">
      <table class="datatable">
        <thead class="datatable-head">
          <tr>
            <th scope="col" class="name datatable-row-header">
              {{ $t('people.list.name') }}
            </th>
            <!-- Email and contract stay on the global role: zou only serves
                 these person fields to global managers, a per-project manager
                 would get empty cells. -->
            <th scope="col" class="email" v-if="isCurrentUserManager">
              {{ $t('people.list.email') }}
            </th>
            <th scope="col" class="contract" v-if="isCurrentUserManager">
              {{ $t('people.list.contract') }}
            </th>
            <th scope="col" class="role">
              {{ $t('people.list.role') }}
            </th>
            <th scope="col">
              {{ $t('people.list.departments') }}
            </th>
            <th
              scope="col"
              class="actions"
              v-if="isCurrentUserProductionManager"
            ></th>
          </tr>
        </thead>
        <tbody class="datatable-body" v-if="!isEmpty">
          <tr class="datatable-row" :key="person.id" v-for="person in entries">
            <people-name-cell
              class="name datatable-row-header"
              :person="person"
            />
            <td class="email" v-if="isCurrentUserManager">
              {{ person.email }}
            </td>
            <td class="contract" v-if="isCurrentUserManager">
              {{ $t(`people.contract.${person.contract_type}`) }}
            </td>
            <td class="role">
              <div class="flexrow">
                <!-- Admin is a global-only role: no project role select. -->
                <combobox
                  v-if="
                    isCurrentUserProductionManager && person.role !== 'admin'
                  "
                  thin
                  class="flexrow-item"
                  :options="roleOptions"
                  :with-margin="false"
                  :model-value="projectRoles[person.id] || person.role"
                  @update:model-value="value => onRoleChange(person, value)"
                />
                <span v-else class="flexrow-item">
                  {{
                    $t(`people.role.${projectRoles[person.id] || person.role}`)
                  }}
                </span>
                <span
                  v-if="isOverridden(person)"
                  class="tag project-role-tag flexrow-item"
                  :title="overriddenTitle(person)"
                >
                  {{ $t('people.project_role') }}
                </span>
              </div>
            </td>
            <department-names-cell :departments="person.departments" />
            <td
              class="actions has-text-right"
              v-if="isCurrentUserProductionManager"
            >
              <button class="button" @click="removePerson(person)">
                {{ $t('main.remove') }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="has-text-centered mt2" v-if="isEmpty">
      {{ $t('people.empty_team') }}
    </p>

    <p class="has-text-centered footer-info" v-else>
      {{ entries.length }} {{ $t('people.persons', { count: entries.length }) }}
    </p>
  </div>
</template>

<script setup>
// Imports
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

/* eslint-disable no-unused-vars */
import DepartmentNamesCell from '@/components/cells/DepartmentNamesCell.vue'
import PeopleNameCell from '@/components/cells/PeopleNameCell.vue'
import Combobox from '@/components/widgets/Combobox.vue'
/* eslint-enable no-unused-vars */

// Composables
const { t } = useI18n()
const store = useStore()

// Props / Emits
const props = defineProps({
  entries: { type: Array, default: () => [] },
  projectRoles: { type: Object, default: () => ({}) }
})
const emit = defineEmits(['update-role'])

// Computed
const isCurrentUserManager = computed(() => store.getters.isCurrentUserManager)
const isCurrentUserProductionManager = computed(
  () => store.getters.isCurrentUserProductionManager
)
const isEmpty = computed(() => !props.entries?.length)

const PROJECT_ROLES = ['user', 'supervisor', 'manager', 'client', 'vendor']

const roleOptions = computed(() =>
  PROJECT_ROLES.map(role => ({
    label: t(`people.role.${role}`),
    value: role
  }))
)

// Functions
const isOverridden = person => Boolean(props.projectRoles[person.id])

const overriddenTitle = person =>
  isOverridden(person)
    ? t('people.global_role', { role: t(`people.role.${person.role}`) })
    : undefined

const onRoleChange = (person, value) => {
  // Picking the person's global role back means inheriting it again.
  emit('update-role', {
    person,
    role: value === person.role ? null : value
  })
}

const removePerson = person => {
  store.dispatch('removePersonFromTeam', person)
}
</script>

<style lang="scss" scoped>
.datatable-body tr:first-child th,
.datatable-body tr:first-child td {
  border-top: 0;
}

.name {
  width: 230px;
  min-width: 230px;
}

.email {
  width: 300px;
  min-width: 300px;
}

.phone {
  width: 200px;
  min-width: 200px;
}

.role {
  width: 200px;
  min-width: 200px;
}

.contract {
  width: 125px;
  min-width: 125px;
}

.actions {
  min-width: 100px;
}

.data-list {
  margin-top: 2em;
}

.project-role-tag {
  background: $blue;
  color: white;
  font-size: 0.7em;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.footer-info {
  color: var(--text);
}
</style>
