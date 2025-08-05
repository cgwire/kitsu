<template>
  <page-layout>
    <template #main>
      <div class="people flexcolumn">
        <div class="flexrow mt2 add-people" v-if="isCurrentUserManager">
          <people-field
            ref="people-field"
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
        <production-team-list :entries="teamPersons" @remove="removePerson" />
      </div>
    </template>
    <template #side v-if="isCurrentUserManager">
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
            :key="`unlisted-person-${person.id}`"
            class="flexrow person-to-add mb05"
            @click="addPersonToTeam(person)"
            v-for="person in unlistedPeople"
          >
            <people-avatar
              class="flexrow-item"
              :font-size="14"
              :key="person.id"
              :person="person"
              :size="30"
              :is-link="false"
            />
            <people-name class="flexrow-item" :person="person" />
          </div>
        </div>
      </div>
    </template>
  </page-layout>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import { sortPeople } from '@/lib/sorting'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ComboboxProduction from '@/components/widgets/ComboboxProduction.vue'
import ComboboxDepartment from '@/components/widgets/ComboboxDepartment.vue'
import PageLayout from '@/components/layouts/PageLayout.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import PeopleField from '@/components/widgets/PeopleField.vue'
import PeopleName from '@/components/widgets/PeopleName.vue'
import ProductionTeamList from '@/components/lists/ProductionTeamList.vue'

export default {
  name: 'team',

  components: {
    ButtonSimple,
    ComboboxDepartment,
    ComboboxProduction,
    PageLayout,
    PeopleAvatar,
    PeopleField,
    PeopleName,
    ProductionTeamList
  },

  data() {
    return {
      importDepartmentId: null,
      importProductionId: null,
      person: null
    }
  },

  mounted() {
    if (this.availableProductions.length > 0) {
      this.importProductionId = this.availableProductions[0]?.id
      this.importDepartmentId = this.departments.sort((a, b) =>
        a.name.localeCompare(b.name, undefined, {
          numeric: true
        })
      )[0]?.id
    }
  },

  computed: {
    ...mapGetters([
      'activePeople',
      'currentProduction',
      'departments',
      'isCurrentUserManager',
      'openProductions',
      'personMap',
      'productionMap'
    ]),

    availableProductions() {
      return this.openProductions.filter(
        production => production.id !== this.currentProduction.id
      )
    },

    teamPersons() {
      return sortPeople(
        this.currentProduction.team.map(personId =>
          this.personMap.get(personId)
        )
      )
    },

    unlistedPeople() {
      return this.activePeople.filter(
        person =>
          !this.currentProduction.team.includes(person.id) && person.active
      )
    }
  },

  methods: {
    ...mapActions(['addPersonToTeam']),

    addPerson() {
      if (this.person) {
        this.addPersonToTeam(this.person)
        this.$refs['people-field'].focus()
      }
    },

    removePerson(person) {
      this.removePersonFromTeam(person)
    },

    importTeamFromProduction() {
      const production = this.productionMap.get(this.importProductionId)
      production.team.forEach(personId => {
        this.addPersonToTeam(this.personMap.get(personId))
      })
    },

    importTeamFromDepartment() {
      const departmentId = this.importDepartmentId
      this.activePeople
        .filter(person => person.departments.includes(departmentId))
        .forEach(person => {
          this.addPersonToTeam(person)
        })
    }
  },

  head() {
    return {
      title: `${this.currentProduction.name} | ${this.$t(
        'people.team'
      )} - Kitsu`
    }
  }
}
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
