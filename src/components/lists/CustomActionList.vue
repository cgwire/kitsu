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
          v-for="customAction in entries"
          :key="customAction.id"
        >
          <th scope="row" class="name datatable-row-header">
            {{ customAction.name }}
          </th>
          <td class="url">{{ customAction.url }}</td>
          <td class="entity-type">{{ customAction.entity_type }}</td>
          <td class="is-ajax">
            {{ formatBoolean(customAction.is_ajax) }}
          </td>
          <row-actions
            :entry-id="customAction.id"
            :edit-route="{
              name: 'edit-custom-action',
              params: {custom_action_id: customAction.id}
            }"
            :delete-route="{
              name: 'delete-custom-action',
              params: {custom_action_id: customAction.id}
            }"
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

  <p class="has-text-centered nb-custom-actions">
    {{ entries.length }} {{ $tc('custom_actions.number', entries.length) }}
  </p>

</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { formatListMixin } from './format_mixin'
import RowActions from '../widgets/RowActions'
import TableInfo from '../widgets/TableInfo'

export default {
  name: 'custom-action-list',
  mixins: [formatListMixin],

  props: [
    'entries',
    'isLoading',
    'isError'
  ],
  data () {
    return {}
  },
  components: {
    RowActions,
    TableInfo
  },
  computed: {
    ...mapGetters([
    ])
  },
  methods: {
    ...mapActions([
    ]),
    renderForShots (entry) {
      if (entry.for_shots) {
        return this.$tc('shots.title')
      } else {
        return this.$tc('assets.title')
      }
    }
  }
}
</script>

<style lang="scss" scoped>

.datatable-body tr:first-child th,
.datatable-body tr:first-child td {
  border-top: 0;
}

.name {
  width: 200px;
  min-width: 200px;
}

.url {
  width: 400px;
  min-width: 400px;
}

.entity-type {
  width: 200px;
  min-width: 200px;
}

.is-ajax {
  width: 150px;
  min-width: 150px;
}

.thead {
  width: 100%
}
</style>
