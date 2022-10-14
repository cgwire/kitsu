<template>
<div class="data-list">
  <div
    class="datatable-wrapper"
    ref="body"
    v-scroll="onBodyScroll"
  >
    <table class="datatable multi-section">
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
          <th scope="col" class="departments">
            {{ $t("people.list.departments") }}
          </th>
          <th scope="col" class="actions"></th>
        </tr>
      </thead>
      <tbody class="datatable-body" v-if="activePeople.length > 0">
        <tr class="datatable-type-header">
          <th scope="rowgroup" colspan="5">
            <span class="datatable-row-header">{{ $t('people.active') }}</span>
          </th>
        </tr>
        <tr
          class="datatable-row"
          v-for="entry in activePeople"
          :key="entry.id"
        >
          <people-name-cell class="name datatable-row-header" :person="entry" />
          <td class="email">{{ entry.email }}</td>
          <td class="phone">{{ entry.phone }}</td>
          <td class="role">{{ $t('people.role.' + entry.role) }}</td>
          <td class="departments">
            <span
              class="departments-element"
              v-for="department in sortDepartments(entry.departments)"
              :key="entry.id + '-' + department.id"
            >
              <department-name
                :department="department"
                v-if="department"
              />
            </span>
          </td>
          <row-actions-cell
            v-if="isCurrentUserAdmin"
            :entry-id="entry.id"
            :hide-delete="true"
            :hide-change-password="false"
            @edit-clicked="$emit('edit-clicked', entry)"
            @change-password-clicked="$emit('change-password-clicked', entry)"
          />
          <td class="actions" v-else>
          </td>
        </tr>
      </tbody>
      <tbody class="datatable-body" v-if="unactivePeople.length > 0">
        <tr class="datatable-type-header">
          <th scope="rowgroup" colspan="5">
            <span class="datatable-row-header">
              {{ $t('people.unactive') }}
            </span>
          </th>
        </tr>
        <tr
          class="datatable-row"
          v-for="entry in unactivePeople"
          :key="entry.id"
        >
          <people-name-cell class="name datatable-row-header" :person="entry" />
          <td class="email">{{ entry.email }}</td>
          <td class="phone">{{ entry.phone }}</td>
          <td class="role">{{ $t('people.role.' + entry.role) }}</td>
          <td class="departments">
            <span
              class="departments-element"
              v-for="department in sortDepartments(entry.departments)"
              :key="entry.id + '-' + department.id"
            >
              <department-name
                :department="department"
                v-if="department"
              />
            </span>
          </td>
          <row-actions-cell
            v-if="isCurrentUserAdmin"
            :entry-id="entry.id"
            :hide-change-password="true"
            @edit-clicked="$emit('edit-clicked', entry)"
            @delete-clicked="$emit('delete-clicked', entry)"
          />
          <td class="actions" v-else>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <table-info
    :is-loading="isLoading"
    :is-error="isError"
  />

  <p class="has-text-centered footer-info" v-if="!isLoading">
    {{ entries.length }} {{ $tc('people.persons', entries.length) }}
    ({{ activePeople.length }} {{ $tc('people.active_persons', activePeople.length) }})
  </p>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import { sortByName } from '@/lib/sorting'

import PeopleNameCell from '@/components/cells/PeopleNameCell'
import RowActionsCell from '@/components/cells/RowActionsCell'
import TableInfo from '@/components/widgets/TableInfo'
import DepartmentName from '@/components/widgets/DepartmentName.vue'

export default {
  name: 'people-list',
  components: {
    PeopleNameCell,
    RowActionsCell,
    TableInfo,
    DepartmentName
  },

  props: [
    'entries',
    'isLoading',
    'isError',
    'onEditClicked',
    'onDeleteClicked'
  ],

  computed: {
    ...mapGetters([
      'departmentMap',
      'isCurrentUserAdmin'
    ]),

    activePeople () {
      return this.entries.filter(person => person.active)
    },

    unactivePeople () {
      return this.entries.filter(person => !person.active)
    }
  },

  methods: {
    ...mapActions([
    ]),

    taskColor (nbTasks) {
      if (nbTasks < 1 || nbTasks > 4) {
        return 'red'
      } else {
        return ''
      }
    },

    onBodyScroll (event, position) {
      this.$refs.body.style.left = `-${position.scrollLeft}px`
    },

    sortDepartments (departmentIds = []) {
      return sortByName(departmentIds
        .map(departmentId => this.departmentMap.get(departmentId)))
    }
  }
}
</script>

<style lang="scss" scoped>
.name {
  width: 230px;
  min-width: 230px;
  user-select: text;
}
.email {
  width: 340px;
  min-width: 340px;
  user-select: text;
}
.phone {
  width: 200px;
  min-width: 200px;
  user-select: text;
}
.role {
  width: 200px;
  min-width: 200px;
}
.actions {
  min-width: 100px;
}

.data-list {
  margin-top: 2em;
}

.departments-element {
  padding: 5px;
}
</style>
