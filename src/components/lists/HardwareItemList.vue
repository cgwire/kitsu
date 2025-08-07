<template>
  <div class="data-list">
    <div class="datatable-wrapper">
      <table class="datatable">
        <thead class="datatable-head">
          <tr>
            <th scope="col" class="name">
              {{ $t('hardware_items.fields.name') }}
            </th>
            <th scope="col" class="short-name">
              {{ $t('hardware_items.fields.short_name') }}
            </th>
            <th scope="col" class="monthly-cost number-cell">
              {{ $t('hardware_items.fields.monthly_cost') }}
            </th>
            <th scope="col" class="inventory-amount number-cell">
              {{ $t('hardware_items.fields.inventory_amount') }}
            </th>
            <th scope="col" class="remaining-amount number-cell">
              {{ $t('hardware_items.fields.remaining_amount') }}
            </th>
            <th scope="col" class="actions"></th>
          </tr>
        </thead>
        <tbody class="datatable-body" v-if="entries.length > 0">
          <tr class="datatable-row" v-for="entry in entries" :key="entry.id">
            <td class="name">
              {{ entry.name }}
            </td>
            <td class="short-name">
              {{ entry.short_name }}
            </td>
            <td class="monthly-cost number-cell">
              {{ entry.monthly_cost }}
            </td>
            <td class="inventory-amount number-cell">
              {{ entry.inventory_amount }}
            </td>
            <td
              :class="{ negative: remainingHardwareItems[entry.id] < 0 }"
              class="remaining-amount number-cell"
            >
              {{ remainingHardwareItems[entry.id] }}
            </td>
            <row-actions-cell
              @edit-clicked="$emit('edit-clicked', entry)"
              @delete-clicked="$emit('delete-clicked', entry)"
            />
          </tr>
        </tbody>
      </table>
    </div>

    <table-info :is-loading="isLoading" :is-error="isError"> </table-info>

    <p class="has-text-centered nb-hardware-items">
      {{ entries.length }} {{ $tc('hardware_items.number', entries.length) }}
    </p>
  </div>
</template>

<script>
import RowActionsCell from '@/components/cells/RowActionsCell.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'

export default {
  name: 'hardware-item-list',

  components: {
    RowActionsCell,
    TableInfo
  },

  props: {
    entries: {
      type: Array,
      default: () => []
    },
    isError: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    remainingHardwareItems: {
      type: Object,
      default: () => {}
    }
  },

  emits: ['delete-clicked', 'edit-clicked']
}
</script>

<style lang="scss" scoped>
.datatable-body tr:first-child th,
.datatable-body tr:first-child td {
  border-top: 0;
}

.remaining-amount.negative {
  color: $red;
  font-weight: bold;
}
</style>
