<template>
  <div class="data-list">
    <div class="datatable-wrapper">
      <table class="datatable">
        <thead class="datatable-head">
          <tr>
            <th scope="col" class="name">
              {{ $t('software_licenses.fields.name') }}
            </th>
            <th scope="col" class="short-name">
              {{ $t('software_licenses.fields.short_name') }}
            </th>
            <th scope="col" class="extension">
              {{ $t('software_licenses.fields.extension') }}
            </th>
            <th scope="col" class="version">
              {{ $t('software_licenses.fields.version') }}
            </th>
            <th scope="col" class="monthly-cost number-cell">
              {{ $t('software_licenses.fields.monthly_cost') }}
            </th>
            <th scope="col" class="inventory-amount number-cell">
              {{ $t('software_licenses.fields.inventory_amount') }}
            </th>
            <th scope="col" class="remaining-amount number-cell">
              {{ $t('hardware_items.fields.remaining_amount') }}
            </th>
            <th scope="col" class="actions"></th>
          </tr>
        </thead>
        <tbody class="datatable-body" v-if="entries.length > 0">
          <tr class="datatable-row" v-for="entry in entries" :key="entry.id">
            <td class="name" :data-label="$t('software_licenses.fields.name')">
              {{ entry.name }}
            </td>
            <td
              class="short-name"
              :data-label="$t('software_licenses.fields.short_name')"
            >
              {{ entry.short_name }}
            </td>
            <td
              class="extension"
              :data-label="$t('software_licenses.fields.extension')"
            >
              {{ entry.file_extension }}
            </td>
            <td
              class="version"
              :data-label="$t('software_licenses.fields.version')"
            >
              {{ entry.version }}
            </td>
            <td
              class="monthly-cost number-cell"
              :data-label="$t('software_licenses.fields.monthly_cost')"
            >
              {{ entry.monthly_cost }}
            </td>
            <td
              class="inventory-amount number-cell"
              :data-label="$t('software_licenses.fields.inventory_amount')"
            >
              {{ entry.inventory_amount }}
            </td>
            <td
              :class="{ negative: remainingSoftwareLicenses[entry.id] < 0 }"
              class="remaining-amount number-cell"
              :data-label="$t('hardware_items.fields.remaining_amount')"
            >
              {{ remainingSoftwareLicenses[entry.id] }}
            </td>
            <row-actions-cell
              class="datatable-row-footer"
              @edit-clicked="$emit('edit-clicked', entry)"
              @delete-clicked="$emit('delete-clicked', entry)"
            />
          </tr>
        </tbody>
      </table>
    </div>

    <table-info
      :is-loading="isLoading"
      :is-error="isError"
      :with-thumbnail="false"
    />

    <p class="has-text-centered nb-software-licenses">
      {{ entries.length }} {{ $t('software_licenses.number', entries.length) }}
    </p>
  </div>
</template>

<script setup>
import RowActionsCell from '@/components/cells/RowActionsCell.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'

defineProps({
  entries: { type: Array, default: () => [] },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  remainingSoftwareLicenses: { type: Object, default: () => ({}) }
})

defineEmits(['delete-clicked', 'edit-clicked'])
</script>

<style lang="scss" scoped>
.datatable-body tr:first-child th,
.datatable-body tr:first-child td {
  border-top: 0;
}

.name {
  min-width: 200px;
  padding: 1em;
}

.extension,
.version {
  width: 100px;
  padding: 1em;
}

.remaining-amount.negative {
  color: $red;
  font-weight: bold;
}

@media screen and (max-width: 768px) {
  // Stack each row as a card, mirroring the AssetTypeList mobile layout.
  :deep(.datatable-wrapper) {
    background: transparent;
    border: 0;
    overflow-x: visible;
  }

  .datatable,
  .datatable-body {
    display: block;
    width: 100%;
  }

  .datatable-head {
    display: none;
  }

  // Override App.vue's global `:last-child { background: transparent !important }`
  // rule, which would otherwise leave the last card with only its border drawn.
  .datatable-row,
  .datatable-row:last-child {
    background: var(--background) !important;
    border: 1px solid var(--border);
    border-radius: 12px;
    display: block;
    margin-bottom: 0.75em;
    padding: 0.85em 1em;
  }

  .dark .datatable-row,
  .dark .datatable-row:last-child {
    background: var(--background-alt) !important;
  }

  .datatable-row td {
    background-color: transparent !important;
    border: 0;
    display: block;
    height: auto;
    max-width: none;
    min-width: 0;
    padding: 0.4em 0;
    text-align: left;
    width: auto;
  }

  .datatable-row td[data-label]::before {
    color: var(--text-alt);
    content: attr(data-label);
    display: block;
    font-size: 0.75em;
    letter-spacing: 0.06em;
    margin-bottom: 0.2em;
    text-transform: uppercase;
  }

  .datatable-row .name {
    font-size: 1.05em;
    font-weight: 600;
    padding-top: 0;

    &::before {
      display: none;
    }
  }

  .datatable-row .actions {
    display: none;
  }
}
</style>
