<template>
  <div class="data-list">
    <div class="datatable-wrapper">
      <table class="datatable">
        <thead class="datatable-head">
          <tr>
            <th scope="col" class="name">
              {{ $t('custom_actions.fields.name') }}
            </th>
            <th scope="col" class="url">
              {{ $t('custom_actions.fields.url') }}
            </th>
            <th scope="col" class="entity-type">
              {{ $t('custom_actions.fields.entity_type') }}
            </th>
            <th scope="col" class="is-ajax">
              {{ $t('custom_actions.fields.is_ajax') }}
            </th>
            <th scope="col" class="actions">&nbsp;</th>
          </tr>
        </thead>
        <tbody class="datatable-body">
          <tr
            class="datatable-row"
            :key="customAction.id"
            v-for="customAction in entries"
          >
            <td scope="row" class="name datatable-row-header">
              {{ customAction.name }}
            </td>
            <td class="url">
              <span class="mobile-label">
                {{ $t('custom_actions.fields.url') }}:
              </span>
              {{ customAction.url }}
            </td>
            <td class="entity-type">
              <span class="mobile-label">
                {{ $t('custom_actions.fields.entity_type') }}:
              </span>
              {{
                $t(`custom_actions.entity_types.${customAction.entity_type}`)
              }}
            </td>
            <td class="is-ajax">
              <span class="mobile-label">
                {{ $t('custom_actions.fields.is_ajax') }}:
              </span>
              {{ formatBoolean(customAction.is_ajax) }}
            </td>
            <row-actions-cell
              @edit-clicked="$emit('edit-clicked', customAction)"
              @delete-clicked="$emit('delete-clicked', customAction)"
            />
          </tr>
        </tbody>
      </table>
    </div>

    <table-info :is-loading="isLoading" :is-error="isError" />

    <p class="has-text-centered nb-custom-actions">
      {{ entries.length }} {{ $t('custom_actions.number', entries.length) }}
    </p>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

import RowActionsCell from '@/components/cells/RowActionsCell.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'

const { t } = useI18n()

// Props / Emits

defineProps({
  entries: { type: Array, default: () => [] },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false }
})

defineEmits(['delete-clicked', 'edit-clicked'])

// Functions

const formatBoolean = value => (value ? t('main.yes') : t('main.no'))
</script>

<style lang="scss" scoped>
.datatable-body tr:first-child th,
.datatable-body tr:first-child td {
  border-top: 0;
}

.entity-type {
  min-width: 200px;
  width: 200px;
}

.is-ajax {
  min-width: 150px;
  width: 150px;
}

.mobile-label {
  display: none;
}

.name {
  min-width: 200px;
  width: 200px;
}

.nb-custom-actions {
  color: var(--text);
}

.url {
  min-width: 400px;
  width: 400px;
  word-break: break-all;
}

@media screen and (max-width: 768px) {
  .datatable-wrapper {
    background: transparent;
    border: 0;
    overflow-x: visible;
  }

  table.datatable {
    background: transparent;
    display: block;
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
    background-color: var(--background) !important;
    border: 1px solid var(--border);
    border-radius: 10px;
    display: grid;
    gap: 0.4em;
    grid-template-columns: 1fr auto;
    grid-template-areas:
      'name actions'
      'url url'
      'entity-type is-ajax';
    margin-bottom: 0.5em;
    padding: 0.75em;
  }

  .data-list .datatable .datatable-row td,
  .data-list .datatable .datatable-row :deep(td),
  .data-list .datatable .datatable-row:last-child td,
  .data-list .datatable .datatable-row:last-child:nth-child(even) td,
  .data-list .datatable .datatable-row:last-child:hover td {
    background-color: transparent !important;
    border: 0;
    display: block;
    min-width: 0;
    padding: 0;
    width: auto;
  }

  .entity-type {
    grid-area: entity-type;
  }

  .is-ajax {
    grid-area: is-ajax;
    justify-self: end;
  }

  .mobile-label {
    color: var(--text-alt);
    display: inline;
    font-size: 0.85em;
    font-weight: 500;
    margin-right: 0.25em;
  }

  td.name {
    font-size: 1.05em;
    font-weight: 600;
    grid-area: name;
  }

  .url {
    border-top: 1px solid var(--border) !important;
    color: var(--text-alt);
    font-size: 0.9em;
    grid-area: url;
    padding-top: 0.4em !important;
  }

  :deep(.actions) {
    grid-area: actions;
    justify-self: end;
  }
}
</style>
