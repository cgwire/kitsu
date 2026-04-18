<template>
  <div class="data-list">
    <div ref="body" class="datatable-wrapper">
      <table class="datatable" v-if="!isLoading">
        <thead class="datatable-head">
          <tr>
            <th scope="col" class="user datatable-row-header">
              {{ isBots ? $t('bots.bots') : $t('people.persons') }}
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
            <th scope="col" class="departments">
              {{ $t('people.list.departments') }}
            </th>
            <th scope="col" class="studio" v-if="!isBots">
              {{ $t('people.list.studio') }}
            </th>
            <th scope="col" class="contract" v-if="!isBots">
              {{ $t('people.list.contract') }}
            </th>
            <th scope="col" class="position" v-if="!isBots">
              {{ $t('people.list.position') }}
            </th>
            <th scope="col" class="seniority" v-if="!isBots">
              {{ $t('people.list.seniority') }}
            </th>
            <th scope="col" class="salary" v-if="!isBots">
              {{ $t('people.fields.daily_salary') }}
            </th>
            <th scope="col" class="actions"></th>
          </tr>
        </thead>
        <tbody
          class="datatable-body"
          @mousedown="startBrowsing"
          @touchstart="startBrowsing"
          v-if="entries.length > 0"
        >
          <tr :key="person.id" class="datatable-row" v-for="person in entries">
            <people-user-cell
              class="user datatable-row-header"
              :person="person"
            />
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
            <department-names-cell
              class="departments"
              :departments="person.departments"
            />
            <td class="studio" v-if="!isBots">
              <studio-name :studio="person.studio" v-if="person.studio" />
            </td>
            <td class="contract" v-if="!isBots">
              {{ $t(`people.contract.${person.contract_type}`) }}
            </td>
            <td class="position" v-if="!isBots">
              {{
                person.position ? $t(`people.position.${person.position}`) : ''
              }}
            </td>
            <td class="seniority" v-if="!isBots">
              {{
                person.seniority
                  ? $t(`people.seniority.${person.seniority}`)
                  : ''
              }}
            </td>
            <td class="salary" v-if="!isBots">
              {{ person.daily_salary }}
            </td>
            <row-actions-cell
              class="datatable-row-footer"
              :hide-avatar="!person.active"
              :hide-change-password="isBots || !person.active"
              :hide-delete="person.active"
              :hide-refresh="!isBots || !person.active"
              @avatar-clicked="$emit('avatar-clicked', person)"
              @change-password-clicked="
                $emit('change-password-clicked', person)
              "
              @edit-clicked="$emit('edit-clicked', person)"
              @refresh-clicked="$emit('refresh-clicked', person)"
              @delete-clicked="$emit('delete-clicked', person)"
              v-if="isCurrentUserAdmin"
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
import { AlertTriangleIcon } from 'lucide-vue-next'
import { mapGetters } from 'vuex'

import { grabListMixin } from '@/components/mixins/grablist'
import { domMixin } from '@/components/mixins/dom'

import DepartmentNamesCell from '@/components/cells/DepartmentNamesCell.vue'
import PeopleUserCell from '@/components/cells/PeopleUserCell.vue'
import RowActionsCell from '@/components/cells/RowActionsCell.vue'
import StudioName from '@/components/widgets/StudioName.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'

export default {
  name: 'people-list',

  mixins: [domMixin, grabListMixin],

  components: {
    AlertTriangleIcon,
    DepartmentNamesCell,
    PeopleUserCell,
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
    },
    seatsRemaining: {
      type: Number,
      default: null
    }
  },

  emits: [
    'avatar-clicked',
    'change-password-clicked',
    'delete-clicked',
    'edit-clicked',
    'refresh-clicked'
  ],

  data() {
    return {
      domEvents: [
        ['mousemove', this.onMouseMove],
        ['touchmove', this.onMouseMove],
        ['mouseup', this.stopBrowsing],
        ['mouseleave', this.stopBrowsing],
        ['touchend', this.stopBrowsing],
        ['touchcancel', this.stopBrowsing],
        ['keyup', this.stopBrowsing]
      ]
    }
  },

  mounted() {
    this.addEvents(this.domEvents)
  },

  beforeUnmount() {
    this.removeEvents(this.domEvents)
    document.body.style.cursor = 'default'
  },

  computed: {
    ...mapGetters(['isCurrentUserAdmin']),

    today() {
      return new Date().toJSON().slice(0, 10)
    },

    nextWeek() {
      const date = new Date()
      date.setDate(date.getDate() + 7)
      return date.toJSON().slice(0, 10)
    },

    nbUsersDetails() {
      const nbUsers = this.entries.length
      const labelUsers = this.$tc(
        this.isBots ? 'bots.bots' : 'people.persons',
        nbUsers
      )
      if (!this.isBots && this.seatsRemaining !== null) {
        const labelRemaining = this.$tc(
          'people.seats_remaining',
          this.seatsRemaining,
          { count: this.seatsRemaining }
        )
        return `${nbUsers} ${labelUsers} (${labelRemaining})`
      }
      return `${nbUsers} ${labelUsers}`
    }
  },

  methods: {
    isExpired(expirationDate) {
      return expirationDate < this.today
    },

    isSoonExpired(expirationDate) {
      return !this.isExpired(expirationDate) && expirationDate < this.nextWeek
    }
  }
}
</script>

<style lang="scss" scoped>
.user {
  width: 400px;
  min-width: 400px;
  user-select: text;
}

.phone {
  width: 160px;
  min-width: 160px;
  user-select: text;
}

.expiration {
  width: 160px;
  min-width: 160px;

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
  width: 180px;
  min-width: 180px;
}

.departments {
  width: 180px;
  min-width: 180px;
}

.studio {
  width: 180px;
  min-width: 180px;
}

.contract {
  width: 160px;
  min-width: 160px;
}

.position {
  width: 160px;
  min-width: 160px;
}

.seniority {
  width: 160px;
  min-width: 160px;
}

.salary {
  width: 100px;
  max-width: 100px;
  text-align: right;
}

.actions {
  min-width: 150px;
}

.data-list {
  margin-top: 0;
}

@media screen and (max-width: 768px) {
  .datatable-wrapper {
    overflow-x: visible;
    border: 0;
    background: transparent;
  }

  table.datatable {
    display: block;
    background: transparent;
  }

  .datatable-head {
    display: none;
  }

  .datatable-body {
    display: block;
  }

  .data-list .datatable .datatable-row,
  .data-list .datatable .datatable-row:nth-child(even),
  .data-list .datatable .datatable-row:hover,
  .data-list .datatable .datatable-row:last-child {
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-areas:
      'user role'
      'departments departments'
      'expiration expiration';
    align-items: center;
    column-gap: 0.5em;
    row-gap: 0.25em;
    padding: 0.5em;
    margin-bottom: 0.5em;
    background-color: var(--background) !important;
    border: 1px solid var(--border);
    border-radius: 10px;
  }

  .data-list .datatable .datatable-row td,
  .data-list .datatable .datatable-row :deep(td),
  .data-list .datatable .datatable-row:last-child td,
  .data-list .datatable .datatable-row:last-child:nth-child(even) td,
  .data-list .datatable .datatable-row:last-child:hover td {
    display: block;
    width: auto;
    min-width: 0;
    padding: 0;
    border: 0;
    background-color: transparent !important;
  }

  .user {
    grid-area: user;
    width: auto;
    min-width: 0;
  }

  .role {
    grid-area: role;
    width: auto;
    min-width: 0;
    color: var(--text-alt);
    font-size: 0.9em;
  }

  .departments {
    grid-area: departments;
    width: auto;
    min-width: 0;
  }

  .expiration {
    grid-area: expiration;
    width: auto;
    min-width: 0;
    font-size: 0.9em;
  }

  :deep(.actions) {
    display: none !important;
  }

  :deep(.entity-thumbnail) {
    box-shadow: none;
  }

  :deep(.datatable-row-header) {
    border-right: 0;

    &::after {
      display: none;
    }
  }

  .phone,
  .studio,
  .contract,
  .position,
  .seniority,
  .salary {
    display: none;
  }

  .footer-info {
    display: none;
  }
}
</style>
