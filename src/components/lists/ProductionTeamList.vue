<template>
  <div class="data-list">
    <div class="datatable-wrapper">
      <table class="datatable">
        <thead class="datatable-head">
          <tr>
            <th scope="col" class="name datatable-row-header">
              {{ $t('people.list.name') }}
            </th>
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
            <th scope="col" class="actions" v-if="isCurrentUserManager"></th>
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
              {{ $t(`people.role.${person.role}`) }}
            </td>
            <department-names-cell :departments="person.departments" />
            <td class="actions has-text-right" v-if="isCurrentUserManager">
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
      {{ entries.length }} {{ $tc('people.persons', entries.length) }}
    </p>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import DepartmentNamesCell from '@/components/cells/DepartmentNamesCell.vue'
import PeopleNameCell from '@/components/cells/PeopleNameCell.vue'

export default {
  name: 'production-team-list',

  components: {
    DepartmentNamesCell,
    PeopleNameCell
  },

  props: {
    entries: {
      type: Array,
      default: () => []
    }
  },

  computed: {
    ...mapGetters(['isCurrentUserManager']),

    isEmpty() {
      return !this.entries?.length
    }
  },

  methods: {
    ...mapActions(['removePersonFromTeam']),

    removePerson(person) {
      this.removePersonFromTeam(person)
    }
  }
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
  width: 125px;
  min-width: 125px;
}
.actions {
  min-width: 100px;
}

.data-list {
  margin-top: 2em;
}

.footer-info {
  color: var(--text);
}
</style>
