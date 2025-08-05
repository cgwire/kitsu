<template>
  <div class="data-list">
    <div class="datatable-wrapper">
      <table class="datatable">
        <thead class="datatable-head">
          <tr>
            <th scope="col" class="name">
              {{ $t('departments.fields.name') }}
            </th>
            <th scope="col">{{ $t('departments.fields.color') }}</th>
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
            <td class="name">
              {{ entry.name }}
            </td>
            <td class="color">
              <div>
                <span :style="{ background: entry.color }"> </span>
              </div>
            </td>
            <td class="items">
              {{
                linkedHardwareItems[entry.id]?.map(item => item.name).join(', ')
              }}
            </td>
            <td class="items">
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
    <table-info :is-loading="isLoading" :is-error="isError"> </table-info>
    <p class="has-text-centered nb-asset-types">
      {{ entries.length }} {{ $tc('departments.number', entries.length) }}
    </p>
  </div>
</template>

<script>
import RowActionsCell from '@/components/cells/RowActionsCell.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'

export default {
  name: 'department-list',

  emits: ['delete-clicked', 'edit-clicked'],

  components: {
    RowActionsCell,
    TableInfo
  },

  props: {
    entries: {
      type: Array,
      required: true
    },
    isLoading: {
      type: Boolean,
      required: true
    },
    isError: {
      type: Boolean,
      required: true
    },
    linkedHardwareItems: {
      type: Object,
      required: true
    },
    linkedSoftwareLicenses: {
      type: Object,
      required: true
    }
  }
}
</script>

<style lang="scss" scoped>
.name {
  width: 300px;
  padding: 1em;
}

.color {
  width: 20px;
  height: 20px;
  text-align: center;

  span {
    display: inline-block;
    width: 20px;
    height: 20px;
    border-radius: 10px;
  }
}

.items {
  padding: 1em;
  min-width: 200px;
  max-width: 200px;
}

.datatable-body tr:first-child th,
.datatable-body tr:first-child td {
  border-top: 0;
}
</style>
