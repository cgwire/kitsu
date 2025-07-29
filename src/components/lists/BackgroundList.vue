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
      {{ entries.length }} {{ $tc('backgrounds.number', entries.length) }}
    </p>
  </div>
</template>

<script>
import BooleanCell from '@/components/cells/BooleanCell.vue'
import RowActionsCell from '@/components/cells/RowActionsCell.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'

export default {
  name: 'background-list',

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
    }
  },

  components: {
    BooleanCell,
    RowActionsCell,
    TableInfo
  },

  emits: ['delete-clicked', 'edit-clicked']
}
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
</style>
