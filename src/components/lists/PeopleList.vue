<template>
  <div class="data-list">
    <div ref="body" class="datatable-wrapper">
      <table class="datatable datatable--cards" v-if="!isLoading">
        <thead class="datatable-head">
          <tr>
            <th scope="col" class="user datatable-row-header">
              {{ $t(usersLabelKey) }}
            </th>
            <th scope="col" class="phone" v-if="!isBots && !isGuests">
              {{ $t('people.list.phone') }}
            </th>
            <th scope="col" class="expiration" v-if="isBots">
              {{ $t('people.list.expiration') }}
            </th>
            <th scope="col" class="role" v-if="!isGuests">
              {{ $t('people.list.role') }}
            </th>
            <th scope="col" class="departments" v-if="!isGuests">
              {{ $t('people.list.departments') }}
            </th>
            <th scope="col" class="studio" v-if="!isBots && !isGuests">
              {{ $t('people.list.studio') }}
            </th>
            <th scope="col" class="country" v-if="!isBots && !isGuests">
              {{ $t('people.list.country') }}
            </th>
            <th scope="col" class="contract" v-if="!isBots && !isGuests">
              {{ $t('people.list.contract') }}
            </th>
            <th scope="col" class="position" v-if="!isBots && !isGuests">
              {{ $t('people.list.position') }}
            </th>
            <th scope="col" class="seniority" v-if="!isBots && !isGuests">
              {{ $t('people.list.seniority') }}
            </th>
            <th scope="col" class="salary" v-if="!isBots && !isGuests">
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
              class="user datatable-row-header card-head"
              :person="person"
            />
            <td class="phone" v-if="!isBots && !isGuests">
              {{ person.phone }}
            </td>
            <td
              class="expiration"
              :class="{
                error: isExpired(person.expiration_date),
                warning: isSoonExpired(person.expiration_date)
              }"
              :data-label="
                person.expiration_date ? $t('people.list.expiration') : null
              "
              v-if="isBots"
            >
              {{ person.expiration_date }}
              <alert-triangle-icon class="icon mr05" />
            </td>
            <td
              class="role"
              :data-label="$t('people.list.role')"
              v-if="!isGuests"
            >
              {{ $t(`people.role.${person.role}`) }}
            </td>
            <department-names-cell
              class="departments"
              :data-label="
                person.departments?.length
                  ? $t('people.list.departments')
                  : null
              "
              :departments="person.departments"
              v-if="!isGuests"
            />
            <td class="studio" v-if="!isBots && !isGuests">
              <studio-name :studio="person.studio" v-if="person.studio" />
            </td>
            <td class="country" v-if="!isBots && !isGuests">
              {{ countryName(person.country) }}
            </td>
            <td class="contract" v-if="!isBots && !isGuests">
              {{ $t(`people.contract.${person.contract_type}`) }}
            </td>
            <td class="position" v-if="!isBots && !isGuests">
              {{
                person.position ? $t(`people.position.${person.position}`) : ''
              }}
            </td>
            <td class="seniority" v-if="!isBots && !isGuests">
              {{
                person.seniority
                  ? $t(`people.seniority.${person.seniority}`)
                  : ''
              }}
            </td>
            <td class="salary" v-if="!isBots && !isGuests">
              {{ person.daily_salary }}
            </td>
            <row-actions-cell
              class="datatable-row-footer"
              :entry="person"
              :hide-archive="!isGuests || isArchivedGuests"
              :hide-avatar="isGuests || !person.active"
              :hide-change-password="isBots || isGuests || !person.active"
              :hide-delete="isGuests ? !isArchivedGuests : person.active"
              :hide-edit="isGuests"
              :hide-refresh="!isBots || !person.active"
              :hide-restore="!isArchivedGuests"
              @archive-clicked="$emit('archive-clicked', person)"
              @avatar-clicked="$emit('avatar-clicked', person)"
              @change-password-clicked="
                $emit('change-password-clicked', person)
              "
              @edit-clicked="$emit('edit-clicked', person)"
              @refresh-clicked="$emit('refresh-clicked', person)"
              @restore-clicked="$emit('restore-clicked', person)"
              @delete-clicked="$emit('delete-clicked', person)"
              v-if="isCurrentUserAdmin"
            />
            <td class="actions" v-else></td>
          </tr>
        </tbody>
      </table>
    </div>

    <table-info :is-loading="isLoading" :is-error="isError" :cells="9" />

    <p class="has-text-centered footer-info" v-if="!isLoading">
      {{ nbUsersDetails }}
    </p>
  </div>
</template>

<script setup>
// Imports
// --------------------------------------------------------------------------
import { AlertTriangleIcon } from 'lucide-vue-next'
import { computed, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { useGrabList } from '@/composables/grabList'
import { getCountryName } from '@/lib/countries'
import { localeCode } from '@/lib/lang'

import DepartmentNamesCell from '@/components/cells/DepartmentNamesCell.vue'
import PeopleUserCell from '@/components/cells/PeopleUserCell.vue'
import RowActionsCell from '@/components/cells/RowActionsCell.vue'
import StudioName from '@/components/widgets/StudioName.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'

const { t } = useI18n()
const store = useStore()
const bodyRef = useTemplateRef('body')
const { startBrowsing } = useGrabList(bodyRef)

// Props / Emits
// --------------------------------------------------------------------------
const props = defineProps({
  entries: { type: Array, default: () => [] },
  isArchivedGuests: { type: Boolean, default: false },
  isBots: { type: Boolean, default: false },
  isError: { type: Boolean, default: false },
  isGuests: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  seatsRemaining: { type: Number, default: null }
})

defineEmits([
  'archive-clicked',
  'avatar-clicked',
  'change-password-clicked',
  'delete-clicked',
  'edit-clicked',
  'refresh-clicked',
  'restore-clicked'
])

// State
// --------------------------------------------------------------------------
const today = new Date().toJSON().slice(0, 10)
const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  .toJSON()
  .slice(0, 10)

// Computed
// --------------------------------------------------------------------------
const isCurrentUserAdmin = computed(() => store.getters.isCurrentUserAdmin)

const usersLabelKey = computed(() =>
  props.isBots
    ? 'bots.bots'
    : props.isGuests
      ? 'people.guests'
      : 'people.persons'
)

const nbUsersDetails = computed(() => {
  const nbUsers = props.entries.length
  const details = `${nbUsers} ${t(usersLabelKey.value, { count: nbUsers })}`
  if (props.isBots || props.isGuests || props.seatsRemaining === null) {
    return details
  }
  const labelRemaining = t('people.seats_remaining', {
    count: props.seatsRemaining
  })
  return `${details} (${labelRemaining})`
})

// Functions
// --------------------------------------------------------------------------
const countryName = country => getCountryName(country, localeCode.value)

const isExpired = expirationDate => expirationDate < today

const isSoonExpired = expirationDate =>
  !isExpired(expirationDate) && expirationDate < nextWeek
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

.country {
  width: 160px;
  min-width: 160px;
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
    background: transparent;
    border: 0;
    overflow-x: visible;
  }

  .footer-info {
    display: none;
  }
}
</style>
