<template>
  <div class="data-list">
    <div class="datatable-wrapper">
      <table class="datatable">
        <thead class="datatable-head">
          <tr>
            <th scope="col" class="name">
              {{ $t('departments.fields.name') }}
            </th>
            <th scope="col" class="color">
              {{ $t('departments.fields.color') }}
            </th>
            <th scope="col">
              {{ $t('departments.hardware_used_by_artists') }}
            </th>
            <th scope="col">
              {{ $t('departments.software_used_by_artists') }}
            </th>
            <th scope="col" class="actions"></th>
          </tr>
        </thead>
        <tbody class="datatable-body" v-if="entries.length > 0">
          <tr class="datatable-row" v-for="entry in entries" :key="entry.id">
            <td class="name" :data-label="$t('departments.fields.name')">
              {{ entry.name }}
            </td>
            <td class="color" :data-label="$t('departments.fields.color')">
              <div>
                <span :style="{ background: entry.color }"> </span>
              </div>
            </td>
            <td
              class="items"
              :data-label="$t('departments.hardware_used_by_artists')"
            >
              {{
                linkedHardwareItems[entry.id]?.map(item => item.name).join(', ')
              }}
            </td>
            <td
              class="items"
              :data-label="$t('departments.software_used_by_artists')"
            >
              {{
                linkedSoftwareLicenses[entry.id]
                  ?.map(item => item.name)
                  .join(', ')
              }}
            </td>
            <row-actions-cell
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
      :cells="2"
      :with-thumbnail="false"
    />
    <p class="has-text-centered nb-departments">
      {{ entries.length }} {{ $t('departments.number', entries.length) }}
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
  linkedHardwareItems: { type: Object, default: () => ({}) },
  linkedSoftwareLicenses: { type: Object, default: () => ({}) }
})

defineEmits(['delete-clicked', 'edit-clicked'])
</script>

<style lang="scss" scoped>
.datatable-body tr:first-child th,
.datatable-body tr:first-child td {
  border-top: 0;
}

.name {
  min-width: 300px;
  padding: 1em;
}

.color {
  width: 60px;
  text-align: center;

  span {
    display: inline-block;
    width: 20px;
    height: 20px;
    border-radius: 10px;
  }
}

.items {
  min-width: 200px;
  max-width: 200px;
  padding: 1em;
}

@media screen and (max-width: 768px) {
  .name {
    min-width: auto;
    padding: 0.5em;
  }

  .items {
    min-width: auto;
    padding: 0.5em;
  }

  .datatable-body td,
  .datatable-head th {
    padding: 0.5em;
  }
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

  .datatable-row {
    background: var(--background);
    border: 1px solid var(--border);
    border-radius: 12px;
    display: block;
    margin-bottom: 0.75em;
    padding: 0.85em 1em;
  }

  .dark .datatable-row {
    background: var(--background-alt);
  }

  .datatable-row td {
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
