<template>
  <div class="data-list">
    <div class="datatable-wrapper">
      <table class="datatable">
        <thead class="datatable-head">
          <tr>
            <th scope="col" class="name">{{ $t('departments.fields.name') }}</th>
            <th scope="col">{{ $t('departments.fields.color') }}</th>
            <th scope="col" class="actions"></th>
          </tr>
        </thead>
        <tbody class="datatable-body" v-if="entries.length > 0">
          <tr class="datatable-row" v-for="entry in entries" :key="entry.id">
            <td class="name">
               {{ entry.name }}
            </td>
            <td class="color">
              <div
                :class="{
                  color: true,
                }"
              >
                <span
                  :style="{ background: entry.color }"
                >
                </span>
              </div>
            </td>
            <row-actions-cell
              :entry-id="entry.id"
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
    >
    </table-info>
    <p class="has-text-centered nb-asset-types">
      {{ entries.length }} {{ $tc('departments.number', entries.length) }}
    </p>
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import RowActionsCell from '../cells/RowActionsCell'
import TableInfo from '../widgets/TableInfo'

export default {
  name: 'departments-list',
  props: [
    'entries',
    'isLoading',
    'isError'
  ],
  data () {
    return {}
  },
  components: {
    RowActionsCell,
    TableInfo
  },
  computed: {
    ...mapGetters([
    ])
  },
  methods: {
    ...mapActions([
    ])
  }
}
</script>

<style lang="scss" scoped>
.color {
  width: 20px;
  height: 20px;
}

.color span {
  display: inline-block;
  width: 20px;
  height: 20px;
}

.datatable-body tr:first-child th,
.datatable-body tr:first-child td {
  border-top: 0;
}

.name {
  width: 300px;
  padding: 1em;
}
</style>
