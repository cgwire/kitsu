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
            <th scope="col" class="studio" v-if="!isBots">
              {{ $t('people.list.studio') }}
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
            v-for="person in activePeople"
            :key="person.id"
          >
            <people-name-cell
              class="name datatable-row-header"
              :person="person"
            />
            <td class="email" v-if="!isBots">{{ person.email }}</td>
            <td class="phone" v-if="!isBots">{{ person.phone }}</td>
            <td
              class="expiration"
              :class="{
                error: isExpired(person.expiration_date),
                warning: isSoonExpired(person.expiration_date)
              }"
              v-if="isBots"
            >
              {{ person.expiration_date }}
              <alert-triangle-icon class="icon mr05" />
            </td>
            <td class="role">{{ $t(`people.role.${person.role}`) }}</td>
            <td class="contract" v-if="!isBots">
              {{ $t(`people.contract.${person.contract_type}`) }}
            </td>
            <department-names-cell
              class="departments"
              :departments="person.departments"
            />
            <td class="studio" v-if="!isBots">
              <studio-name :studio="person.studio" v-if="person.studio" />
            </td>
            <row-actions-cell
              v-if="isCurrentUserAdmin"
              :entry-id="person.id"
              :hide-avatar="false"
              :hide-change-password="isBots"
              :hide-delete="true"
              :hide-refresh="!isBots"
              @avatar-clicked="$emit('avatar-clicked', person)"
              @change-password-clicked="
                $emit('change-password-clicked', person)
              "
              @edit-clicked="$emit('edit-clicked', person)"
              @refresh-clicked="$emit('refresh-clicked', person)"
            />
            <td class="actions" v-else></td>
          </tr>
        </tbody>
        <tbody class="datatable-body" v-if="inactivePeople.length > 0">
          <tr class="datatable-type-header">
            <th scope="rowgroup" colspan="5">
              <span class="datatable-row-header">
                {{ $t('people.unactive') }}
              </span>
            </th>
          </tr>
          <tr
            class="datatable-row"
            v-for="person in inactivePeople"
            :key="person.id"
          >
            <people-name-cell
              class="name datatable-row-header"
              :person="person"
            />
            <td class="email" v-if="!isBots">{{ person.email }}</td>
            <td class="phone" v-if="!isBots">{{ person.phone }}</td>
            <td class="expiration" v-if="isBots">
              {{ person.expiration_date }}
            </td>
            <td class="role">{{ $t('people.role.' + person.role) }}</td>
            <td class="contract" v-if="!isBots">
              {{ $t('people.contract.' + person.contract_type) }}
            </td>
            <department-names-cell
              class="departments"
              :departments="person.departments"
            />
            <td class="studio" v-if="!isBots">
              <studio-name :studio="person.studio" v-if="person.studio" />
            </td>
            <row-actions-cell
              v-if="isCurrentUserAdmin"
              :entry-id="person.id"
              @edit-clicked="$emit('edit-clicked', person)"
              @delete-clicked="$emit('delete-clicked', person)"
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
import { AlertTriangleIcon } from 'lucide-vue'

import DepartmentNamesCell from '@/components/cells/DepartmentNamesCell.vue'
import PeopleNameCell from '@/components/cells/PeopleNameCell.vue'
import RowActionsCell from '@/components/cells/RowActionsCell.vue'
import StudioName from '@/components/widgets/StudioName.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'

export default {
  name: 'people-list',

  components: {
    AlertTriangleIcon,
    DepartmentNamesCell,
    PeopleNameCell,
    RowActionsCell,
    StudioName,
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
    ...mapGetters(['isCurrentUserAdmin']),

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

    inactivePeople() {
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

.departments {
  width: 200px;
  min-width: 200px;

  .departments-element {
    padding: 5px;
  }
}

.studio {
  min-width: 200px;
}

.actions {
  min-width: 100px;
}
</style>
