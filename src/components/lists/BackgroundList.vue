<template>
  <div class="data-list">
    <div class="datatable-wrapper">
      <table class="datatable">
        <thead class="datatable-head">
          <tr>
            <th scope="col" class="name">
              {{ $t('backgrounds.fields.name') }}
            </th>
            <th scope="col" class="is-default">
              {{ $t('backgrounds.fields.is_default') }}
            </th>
            <th scope="col" class="actions"></th>
          </tr>
        </thead>
        <tbody class="datatable-body">
          <tr class="datatable-row" v-for="entry in entries" :key="entry.id">
            <td class="name">
              <span class="flexrow">
                <a
                  :href="entry.url"
                  target="_blank"
                  class="thumbnail-wrapper thumbnail-picture entity-thumbnail flexrow-item"
                >
                  <img
                    :src="entry.thumbnail"
                    :alt="entry.name"
                    width="100"
                    height="67"
                  />
                </a>
                {{ entry.name }}
              </span>
            </td>
            <boolean-cell class="is-default" :value="entry.is_default" />
            <row-actions-cell
              :hide-delete="entry.is_default === true"
              @edit-clicked="$emit('edit-clicked', entry)"
              @delete-clicked="$emit('delete-clicked', entry)"
            />
          </tr>
        </tbody>
      </table>
    </div>

    <table-info :is-loading="isLoading" :is-error="isError" />

    <p class="has-text-centered">
      {{ entries.length }}
      {{ $t('backgrounds.number', entries.length, { n: entries.length }) }}
    </p>
  </div>
</template>

<script setup>
import BooleanCell from '@/components/cells/BooleanCell.vue'
import RowActionsCell from '@/components/cells/RowActionsCell.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'

defineProps({
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
  }
})

defineEmits(['delete-clicked', 'edit-clicked'])
</script>

<style lang="scss" scoped>
.datatable-body tr:first-child th,
.datatable-body tr:first-child td {
  border-top: 0;
}

.name {
  width: 300px;
  min-width: 300px;
  font-weight: bold;
  word-break: break-word;

  .entity-thumbnail {
    display: flex;
    border-radius: 5px;
    max-width: none;

    img {
      background-color: black;
      border-radius: inherit;
      min-width: 100px;
    }
  }
}

.is-default {
  text-align: center;
  width: 140px;
  min-width: 140px;
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

  .name {
    flex: 1;
    min-width: 0;
    width: auto;
    font-weight: 600;

    :deep(.flexrow) {
      align-items: center;
      gap: 0.75em;
    }

    .entity-thumbnail {
      flex-shrink: 0;

      img {
        width: 80px;
        height: 53px;
        min-width: 80px;
      }
    }
  }

  .is-default {
    display: none;
  }
}
</style>
