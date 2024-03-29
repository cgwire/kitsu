<template>
  <div class="data-list">
    <div class="datatable-wrapper" ref="body" v-scroll="onBodyScroll">
      <table class="datatable multi-section">
        <thead class="datatable-head">
          <tr>
            <th scope="col" class="name datatable-row-header">
              {{ $t('people.list.name') }}
            </th>
            <th scope="col" class="email" v-if="!isBots">
              {{ $t('people.list.email') }}
            </th>
            <th scope="col" class="phone" v-if="!isBots">
              {{ $t('people.list.phone') }}
            </th>
            <th scope="col" class="expiration" v-if="isBots">
              {{ $t('people.list.expiration') }}
            </th>
            <th scope="col" class="role">
              {{ $t('people.list.role') }}
            </th>
            <th scope="col" class="contract" v-if="!isBots">
              {{ $t('people.list.contract') }}
            </th>
            <th scope="col" class="departments">
              {{ $t('people.list.departments') }}
            </th>
            <th scope="col" class="actions"></th>
          </tr>
        </thead>
        <tbody class="datatable-body" v-if="activePeople.length > 0">
          <tr class="datatable-type-header">
            <th scope="rowgroup" colspan="5">
              <span class="datatable-row-header">{{
                $t('people.active')
              }}</span>
            </th>
          </tr>
          <tr
            class="datatable-row"
            v-for="entry in activePeople"
            :key="entry.id"
          >
            <people-name-cell
              class="name datatable-row-header"
              :person="entry"
            />
            <td class="email" v-if="!isBots">{{ entry.email }}</td>
            <td class="phone" v-if="!isBots">{{ entry.phone }}</td>
            <td
              class="expiration"
              :class="{
                error: isExpired(entry.expiration_date),
                warning: isSoonExpired(entry.expiration_date)
              }"
              v-if="isBots"
            >
              {{ entry.expiration_date }}
              <alert-triangle-icon class="icon" />
            </td>
            <td class="role">{{ $t('people.role.' + entry.role) }}</td>
            <td class="contract" v-if="!isBots">
              {{ $t('people.contract.' + entry.contract_type) }}
            </td>
            <department-names-cell
              class="departments"
              :departments="entry.departments"
            />
            <row-actions-cell
              v-if="isCurrentUserAdmin"
              :entry-id="entry.id"
              :hide-avatar="false"
              :hide-change-password="isBots"
              :hide-delete="true"
              :hide-refresh="!isBots"
              @avatar-clicked="$emit('avatar-clicked', entry)"
              @change-password-clicked="$emit('change-password-clicked', entry)"
              @edit-clicked="$emit('edit-clicked', entry)"
              @refresh-clicked="$emit('refresh-clicked', entry)"
            />
            <td class="actions" v-else></td>
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
            <people-name-cell
              class="name datatable-row-header"
              :person="entry"
            />
            <td class="email" v-if="!isBots">{{ entry.email }}</td>
            <td class="phone" v-if="!isBots">{{ entry.phone }}</td>
            <td class="expiration" v-if="isBots">
              {{ entry.expiration_date }}
            </td>
            <td class="role">{{ $t('people.role.' + entry.role) }}</td>
            <td class="contract" v-if="!isBots">
              {{ $t('people.contract.' + entry.contract_type) }}
            </td>
            <department-names-cell
              class="departments"
              :departments="entry.departments"
            />
            <row-actions-cell
              v-if="isCurrentUserAdmin"
              :entry-id="entry.id"
              @edit-clicked="$emit('edit-clicked', entry)"
              @delete-clicked="$emit('delete-clicked', entry)"
            />
            <td class="actions" v-else></td>
          </tr>
        </tbody>
      </table>
    </div>

    <table-info :is-loading="isLoading" :is-error="isError" />

    <p class="has-text-centered footer-info" v-if="!isLoading">
      {{ nbUsersDetails }}
    </p>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { AlertTriangleIcon } from 'vue-feather-icons'

import DepartmentNamesCell from '@/components/cells/DepartmentNamesCell.vue'
import PeopleNameCell from '@/components/cells/PeopleNameCell'
import RowActionsCell from '@/components/cells/RowActionsCell'
import TableInfo from '@/components/widgets/TableInfo'

export default {
  name: 'people-list',

  components: {
    AlertTriangleIcon,
    DepartmentNamesCell,
    PeopleNameCell,
    RowActionsCell,
    TableInfo
  },

  props: {
    entries: {
      type: Array,
      default: () => []
    },
    isBots: {
      type: Boolean,
      default: false
    },
    isError: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    ...mapGetters(['departmentMap', 'isCurrentUserAdmin']),

    activePeople() {
      return this.entries.filter(person => person.active)
    },

    today() {
      return new Date().toJSON().slice(0, 10)
    },

    nextWeek() {
      const date = new Date()
      date.setDate(date.getDate() + 7)
      return date.toJSON().slice(0, 10)
    },

    unactivePeople() {
      return this.entries.filter(person => !person.active)
    },

    nbUsersDetails() {
      const nbUsers = this.entries.length
      const nbActiveUsers = this.activePeople.length
      const labelUsers = this.$tc(
        this.isBots ? 'bots.bots' : 'people.persons',
        nbUsers
      )
      const labelActiveUsers = this.$tc(
        this.isBots ? 'bots.active_bots' : 'people.active_persons',
        nbActiveUsers
      )
      return `${nbUsers} ${labelUsers} (${nbActiveUsers} ${labelActiveUsers})`
    }
  },

  methods: {
    isExpired(expirationDate) {
      return expirationDate < this.today
    },

    isSoonExpired(expirationDate) {
      return !this.isExpired(expirationDate) && expirationDate < this.nextWeek
    },

    onBodyScroll(event, position) {
      this.$refs.body.style.left = `-${position.scrollLeft}px`
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
.expiration {
  width: 200px;
  min-width: 200px;

  .icon {
    display: none;
  }

  &.error,
  &.warning {
    .icon {
      display: inline;
      margin-left: 0.5rem;
    }
  }

  &.error {
    color: $red;
  }
  &.warning {
    color: $yellow;
  }
}
.role {
  width: 200px;
  min-width: 200px;
}
.contract {
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
