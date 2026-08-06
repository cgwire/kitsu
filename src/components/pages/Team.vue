<template>
  <page-layout>
    <template #main>
      <div class="people flexcolumn">
        <div
          class="flexrow mt2 add-people"
          v-if="isCurrentUserProductionManager"
        >
          <people-field
            ref="peopleFieldRef"
            class="flexrow-item add-people-field"
            :people="unlistedPeople"
            :placeholder="$t('people.add_member_to_team')"
            v-model="person"
          />
          <button
            class="button flexrow-item"
            @click="addPerson"
            :disabled="!person"
          >
            {{ $t('main.add') }}
          </button>
        </div>
        <production-team-list
          :entries="teamPersons"
          :project-roles="projectRoles"
          @update-role="updateRole"
          @remove="removePerson"
        />
      </div>
    </template>
    <template #side v-if="isCurrentUserProductionManager">
      <div class="importers flexcolumn">
        <div
          class="project-import flexcolumn"
          v-if="availableProductions.length > 0"
        >
          <combobox-production
            class="flexrow-item"
            :label="$t('people.import_from_production')"
            :production-list="availableProductions"
            :with-margin="false"
            v-model="importProductionId"
          />
          <button-simple
            class="flexrow-item mt05"
            :disabled="!importProductionId"
            :text="$t('main.import')"
            @click="importTeamFromProduction"
          />
        </div>
        <div
          :class="{
            'department-import': true,
            flexcolumn: true,
            mt2: availableProductions.length > 0
          }"
        >
          <combobox-department
            class="flexrow-item"
            :label="$t('people.import_from_department')"
            :with-empty-choice="false"
            v-model="importDepartmentId"
          />
          <button-simple
            class="flexrow-item mt05"
            :disabled="!importDepartmentId"
            :text="$t('main.import')"
            @click="importTeamFromDepartment"
          />
        </div>
        <p class="label mt2">
          {{ $t('people.import_from_unlisted') }}
        </p>
        <div class="import-list">
          <div
            :key="`unlisted-person-${unlistedPerson.id}`"
            class="flexrow person-to-add mb05"
            role="button"
            tabindex="0"
            @click="addPersonToTeam(unlistedPerson)"
            @keydown.enter.prevent="addPersonToTeam(unlistedPerson)"
            v-for="unlistedPerson in unlistedPeople"
          >
            <people-avatar
              class="flexrow-item"
              :font-size="14"
              :key="unlistedPerson.id"
              :person="unlistedPerson"
              :size="30"
              :is-link="false"
            />
            <people-name class="flexrow-item" :person="unlistedPerson" />
          </div>
        </div>
      </div>
    </template>
  </page-layout>
</template>

<script setup>
// Imports
import { useHead } from '@unhead/vue'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { sortPeople } from '@/lib/sorting'

/* eslint-disable no-unused-vars */
import PageLayout from '@/components/layouts/PageLayout.vue'
import ProductionTeamList from '@/components/lists/ProductionTeamList.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ComboboxDepartment from '@/components/widgets/ComboboxDepartment.vue'
import ComboboxProduction from '@/components/widgets/ComboboxProduction.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import PeopleField from '@/components/widgets/PeopleField.vue'
import PeopleName from '@/components/widgets/PeopleName.vue'
/* eslint-enable no-unused-vars */

// Composables
const { t } = useI18n()
const store = useStore()

// State
const importDepartmentId = ref(null)
const importProductionId = ref(null)
const peopleFieldRef = ref(null)
const person = ref(null)

// Computed
const activePeople = computed(() => store.getters.activePeople)
const currentProduction = computed(() => store.getters.currentProduction)
const departments = computed(() => store.getters.departments)
const isCurrentUserProductionManager = computed(
  () => store.getters.isCurrentUserProductionManager
)
const openProductions = computed(() => store.getters.openProductions)
const personMap = computed(() => store.getters.personMap)
const productionMap = computed(() => store.getters.productionMap)
const projectRoles = computed(() => store.getters.productionTeamRoles)

const availableProductions = computed(() =>
  openProductions.value.filter(
    production => production.id !== currentProduction.value.id
  )
)

const teamPersons = computed(() =>
  sortPeople(
    currentProduction.value?.team
      .map(personId => personMap.value.get(personId))
      .filter(Boolean) ?? []
  )
)

const unlistedPeople = computed(() =>
  activePeople.value.filter(
    p => !currentProduction.value?.team.includes(p.id) && p.active
  )
)

// Functions
const addPersonToTeam = personToAdd =>
  store.dispatch('addPersonToTeam', personToAdd)

const addPerson = () => {
  if (person.value) {
    addPersonToTeam(person.value)
    peopleFieldRef.value.focus()
  }
}

const removePerson = personToRemove =>
  store.dispatch('removePersonFromTeam', personToRemove)

const importTeamFromProduction = () => {
  const production = productionMap.value.get(importProductionId.value)
  production.team.forEach(personId => {
    addPersonToTeam(personMap.value.get(personId))
  })
}

const importTeamFromDepartment = () => {
  const departmentId = importDepartmentId.value
  activePeople.value
    .filter(p => p.departments.includes(departmentId))
    .forEach(p => {
      addPersonToTeam(p)
    })
}

const loadTeamRoles = () => {
  store.dispatch('loadProductionTeam').catch(console.error)
}

const updateRole = ({ person: member, role }) => {
  store
    .dispatch('setTeamMemberRole', { personId: member.id, role })
    .catch(console.error)
}

// Watchers
watch(
  () => currentProduction.value?.id,
  () => loadTeamRoles()
)

// Lifecycle
onMounted(() => {
  if (availableProductions.value.length > 0) {
    importProductionId.value = availableProductions.value[0]?.id
    importDepartmentId.value = departments.value.toSorted((a, b) =>
      a.name.localeCompare(b.name, undefined, {
        numeric: true
      })
    )[0]?.id
  }
  loadTeamRoles()
})

// Head
useHead({
  title: computed(
    () => `${currentProduction.value.name} | ${t('people.team')} - Kitsu`
  )
})
</script>

<style lang="scss" scoped>
.people {
  max-height: 100%;
}

.label {
  color: var(--text-alt);
  font-size: 0.8em;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 0;
}

.importers {
  border-left: 1px solid var(--border);
  height: 100%;
  max-height: 100%;
  padding: 1em;
}

.people {
  padding: 1em;
  padding-top: 60px;
}

.import-list {
  border: 1px solid var(--border);
  border-radius: 5px;
  margin-top: 0.5em;
  padding: 0.5em;
  flex: 1;
  overflow-y: auto;
}

.person-to-add {
  cursor: pointer;
}
</style>
