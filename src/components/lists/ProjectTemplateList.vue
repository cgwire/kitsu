<template>
  <div class="data-list">
    <div class="datatable-wrapper">
      <table class="datatable">
        <thead class="datatable-head">
          <tr>
            <th scope="col" class="name">
              {{ $t('project_templates.fields.name') }}
            </th>
            <th scope="col" class="type">
              {{ $t('productions.fields.type') }}
            </th>
            <th scope="col" class="style">
              {{ $t('productions.fields.style') }}
            </th>
            <th scope="col" class="description">
              {{ $t('project_templates.fields.description') }}
            </th>
            <th scope="col" class="actions"></th>
          </tr>
        </thead>
        <tbody class="datatable-body" v-if="entries.length > 0">
          <tr class="datatable-row" v-for="entry in entries" :key="entry.id">
            <td class="name">
              <router-link
                :to="{
                  name: 'project-template-settings',
                  params: { template_id: entry.id }
                }"
              >
                {{ entry.name }}
              </router-link>
            </td>
            <td class="type">
              {{ entry.production_type || '-' }}
            </td>
            <td class="style">
              {{ entry.production_style || '-' }}
            </td>
            <td class="description">
              {{ truncate(entry.description, 60) }}
            </td>
            <row-actions-cell
              @edit-clicked="$emit('edit-clicked', entry)"
              @delete-clicked="$emit('delete-clicked', entry)"
            />
          </tr>
        </tbody>
      </table>
    </div>
    <table-info :is-loading="isLoading" :is-error="isError" />
    <p class="has-text-centered nb-templates">
      {{ entries.length }}
      {{
        $t('project_templates.number', entries.length, { n: entries.length })
      }}
    </p>
  </div>
</template>

<script setup>
import RowActionsCell from '@/components/cells/RowActionsCell.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'

defineProps({
  entries: { type: Array, default: () => [] },
  isLoading: { type: Boolean, default: false },
  isError: { type: Boolean, default: false }
})

defineEmits(['delete-clicked', 'edit-clicked'])

const truncate = (text, max) => {
  if (!text) return ''
  return text.length > max ? text.substring(0, max) + '...' : text
}
</script>

<style lang="scss" scoped>
.datatable-body tr:first-child th,
.datatable-body tr:first-child td {
  border-top: 0;
}

.name {
  min-width: 200px;
  max-width: 300px;
  width: 300px;
  padding: 1em;

  a {
    color: var(--text);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

.description {
  min-width: 200px;
  padding: 1em;
  color: var(--text-alt);
}

.type,
.style {
  width: 120px;
  padding: 1em;
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
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5em;
    padding: 0.75em 1em;
    margin-bottom: 0.5em;
    background-color: var(--background) !important;
    border: 1px solid var(--border);
    border-radius: 6px;
  }

  .data-list .datatable .datatable-row td,
  .data-list .datatable .datatable-row:last-child td,
  .data-list .datatable .datatable-row:last-child:nth-child(even) td,
  .data-list .datatable .datatable-row:last-child:hover td {
    display: block;
    padding: 0;
    border: 0;
    background-color: transparent !important;
  }

  .name {
    flex: 1 1 100%;
    min-width: 0;
    max-width: none;
    width: auto;
    font-weight: 600;
    font-size: 1.05em;
  }

  .type,
  .style {
    flex: 0 0 auto;
    width: auto;
    font-size: 0.8em;
    background: var(--background-hover);
    color: var(--text);
    padding: 0.15em 0.6em;
    border-radius: 999px;
  }

  .description {
    flex: 1 1 100%;
    min-width: 0;
    color: var(--text-alt);
    font-size: 0.9em;
  }

  :deep(td.actions),
  :deep(td.actions button),
  :deep(td.actions a) {
    display: none !important;
  }
}
</style>
