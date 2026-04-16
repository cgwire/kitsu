<template>
  <div class="data-list">
    <div class="datatable-wrapper">
      <table class="datatable">
        <thead class="datatable-head">
          <tr>
            <th scope="col" class="name">
              {{ $t('studios.fields.name') }}
            </th>
            <th scope="col">{{ $t('studios.fields.color') }}</th>
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
            <row-actions-cell
              @edit-clicked="$emit('edit-clicked', entry)"
              @delete-clicked="$emit('delete-clicked', entry)"
            />
          </tr>
        </tbody>
      </table>
    </div>
    <table-info :is-loading="isLoading" :is-error="isError"> </table-info>
    <p class="has-text-centered nb-studios">
      {{ entries.length }}
      {{ $t('studios.number', entries.length, { n: entries.length }) }}
    </p>
  </div>
</template>

<script setup>
import RowActionsCell from '@/components/cells/RowActionsCell.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'

defineProps({
  entries: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  isError: {
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
  min-width: 200px;
  padding: 1em;
}

.color {
  text-align: center;
  width: 60px;

  span {
    display: inline-block;
    width: 20px;
    height: 20px;
    border-radius: 2px;
  }
}

@media screen and (max-width: 768px) {
  .name {
    min-width: auto;
    padding: 0.5em;
  }

  .datatable-body td,
  .datatable-head th {
    padding: 0.5em;
  }
}
</style>
