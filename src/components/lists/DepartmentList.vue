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
</style>
