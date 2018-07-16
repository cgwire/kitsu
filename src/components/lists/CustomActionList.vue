<template>
<div class="data-list">
  <div style="overflow: hidden">
    <table class="table table-header" ref="headerWrapper">
      <thead class="thead">
        <tr>
          <th class="name">{{ $t('custom_actions.fields.name') }}</th>
          <th class="url">{{ $t('custom_actions.fields.url') }}</th>
          <th class="entity-type">{{ $t('custom_actions.fields.entity_type') }}</th>
          <th class="actions">&nbsp;</th>
        </tr>
      </thead>
    </table>
  </div>

  <table-info
    :is-loading="isLoading"
    :is-error="isError"
  >
  </table-info>

  <div class="table-body" v-scroll="onBodyScroll">
    <table class="table">
      <tbody>
        <tr v-for="customAction in entries" :key="customAction.id">
          <td class="name">{{ customAction.name }}</td>
          <td class="url">{{ customAction.url }}</td>
          <td class="entity-type">{{ customAction.entity_type }}</td>
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
          >
          </row-actions>
        </tr>
      </tbody>
    </table>
  </div>

  <p class="has-text-centered nb-custom-actions">
    {{ entries.length }} {{ $tc('custom_actions.number', entries.length) }}
  </p>

</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import RowActions from '../widgets/RowActions'
import TableInfo from '../widgets/TableInfo'
import TaskTypeName from '../cells/TaskTypeName'

export default {
  name: 'custom-action-list',
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
    TaskTypeName,
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
    },
    onBodyScroll (event, position) {
      this.$refs.headerWrapper.style.left = `-${position.scrollLeft}px`
    }
  }
}
</script>

<style scoped>
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

.thead {
  width: 100%
}
</style>
