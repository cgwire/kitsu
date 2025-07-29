<template>
  <div class="data-list">
    <div ref="body" class="datatable-wrapper">
      <table class="datatable" v-if="!isLoading">
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
import { mapGetters } from 'vuex'
import { AlertTriangleIcon } from 'lucide-vue-next'
import { grabListMixin } from '@/components/mixins/grablist'
import { domMixin } from '@/components/mixins/dom'

import DepartmentNamesCell from '@/components/cells/DepartmentNamesCell.vue'
import PeopleNameCell from '@/components/cells/PeopleNameCell.vue'
import RowActionsCell from '@/components/cells/RowActionsCell.vue'
import StudioName from '@/components/widgets/StudioName.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'

export default {
  name: 'people-list',

  mixins: [domMixin, grabListMixin],

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
.name {
  width: 230px;
  min-width: 230px;
  user-select: text;
}

.email {
  width: 300px;
  min-width: 300px;
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

  .departments-element {
    padding: 5px;
  }
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
</style>
