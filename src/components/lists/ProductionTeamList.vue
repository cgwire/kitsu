<template>
<div class="data-list">
  <div class="datatable-wrapper">
    <table class="datatable">
      <thead class="datatable-head">
        <tr>
          <th scope="col" class="name datatable-row-header">
          {{ $t("people.list.name") }}
          </th>
          <th scope="col" class="email">
          {{ $t("people.list.email") }}
          </th>
          <th scope="col" class="phone">
          {{ $t("people.list.phone") }}
          </th>
          <th scope="col" class="role">
          {{ $t("people.list.role") }}
          </th>
          <th scope="col" class="actions"></th>
        </tr>
      </thead>
      <tbody class="datatable-body" v-if="!isEmpty">
        <tr class="datatable-row" v-for="entry in entries" :key="entry.id">
          <people-name-cell class="name" :person="entry" />
          <td class="email">{{ entry.email }}</td>
          <td class="phone">{{ entry.phone }}</td>
          <td class="role">{{ $t('people.role.' + entry.role) }}</td>
          <td class="actions"
            v-if="isCurrentUserAdmin"
          >
            <button
              class="button"
              @click="removePerson(entry)"
            >
              {{ $t('main.remove') }}
            </button>
          </td>
          <td class="actions" v-else>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <p class="has-text-centered mt2" v-if="isEmpty">
    {{ $t('people.empty_team') }}
  </p>

  <p class="has-text-centered footer-info">
    {{ entries.length }} {{ $tc('people.persons', entries.length) }}
  </p>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import PeopleNameCell from '../cells/PeopleNameCell'

export default {
  name: 'production-team-list',
  components: {
    PeopleNameCell
  },

  props: [
    'entries'
  ],

  computed: {
    ...mapGetters([
      'isCurrentUserAdmin'
    ]),

    isEmpty () {
      return !this.entries || this.entries.length === 0
    }
  },

  methods: {
    ...mapActions([
      'removePersonFromTeam'
    ]),

    removePerson (person) {
      this.removePersonFromTeam(person)
    }
  }
}
</script>

<style lang="scss" scoped>

.datatable-wrapper {
  overflow: auto;
  margin-bottom: 1rem;
}
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
  min-width: 140px;
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
</style>
