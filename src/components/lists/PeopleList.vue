<template>
<div class="data-list">
  <div
    class="datatable-wrapper"
    ref="body"
    v-scroll="onBodyScroll"
  >
    <table class="datatable">
      <thead class="datatable-head">
        <tr>
          <th scope="col" class="name datatable-row-header">
            {{ $t("people.list.name") }}
          </th>
          <th scope="col" class="email">
            {{ $t("people.list.email") }}
          </th>
          <th scope="col" class="phone">
            {{ $t("people.list.phone") }}
          </th>
          <th scope="col" class="role">
            {{ $t("people.list.role") }}
          </th>
          <th scope="col" class="actions"></th>
        </tr>
      </thead>
      <tbody class="datatable-body" v-if="activePeople.length > 0">
        <tr class="datatable-type-header">
          <th scope="rowgroup" colspan="5">
            <span class="datatable-row-header">{{ $t('people.active') }}</span>
          </th>
        </tr>
        <tr
          class="datatable-row"
          v-for="entry in activePeople"
          :key="entry.id"
        >
          <people-name-cell class="name" :person="entry" />
          <td class="email">{{ entry.email }}</td>
          <td class="phone">{{ entry.phone }}</td>
          <td class="role">{{ $t('people.role.' + entry.role) }}</td>
          <row-actions
            v-if="isCurrentUserAdmin"
            :entry-id="entry.id"
            :edit-route="{
              name: 'edit-person',
              params: {person_id: entry.id}
            }"
            :hide-delete="true"
          >
          </row-actions>
          <td class="actions" v-else>
          </td>
        </tr>
      </tbody>
      <tbody class="datatable-body" v-if="unactivePeople.length > 0">
        <tr class="datatable-type-header">
          <th scope="rowgroup" colspan="5">
            <span class="datatable-row-header">{{ $t('people.unactive') }}</span>
          </th>
        </tr>
        <tr
          class="datatable-row"
          v-for="entry in unactivePeople"
          :key="entry.id"
        >
          <people-name-cell class="name" :person="entry" />
          <td class="email">{{ entry.email }}</td>
          <td class="phone">{{ entry.phone }}</td>
          <td class="role">{{ $t('people.role.' + entry.role) }}</td>
          <row-actions
            v-if="isCurrentUserAdmin"
            :entry-id="entry.id"
            :edit-route="{
              name: 'edit-person',
              params: {person_id: entry.id}
            }"
            :delete-route="{
              name: 'delete-person',
              params: {person_id: entry.id}
            }"
          />
          <td class="actions" v-else>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <table-info
    :is-loading="isLoading"
    :is-error="isError"
  />

  <p class="has-text-centered footer-info" v-if="!isLoading">
    {{ entries.length }} {{ $tc('people.persons', entries.length) }}
  </p>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import PeopleNameCell from '../cells/PeopleNameCell'
import RowActions from '../widgets/RowActions'
import TableInfo from '../widgets/TableInfo'

export default {
  name: 'people-list',
  components: {
    PeopleNameCell,
    RowActions,
    TableInfo
  },

  props: [
    'entries',
    'isLoading',
    'isError',
    'onEditClicked',
    'onDeleteClicked'
  ],

  computed: {
    ...mapGetters([
      'isCurrentUserAdmin'
    ]),

    activePeople () {
      return this.entries.filter(person => person.active)
    },

    unactivePeople () {
      return this.entries.filter(person => !person.active)
    }
  },

  methods: {
    ...mapActions([
    ]),

    taskColor (nbTasks) {
      if (nbTasks < 1 || nbTasks > 4) {
        return 'red'
      } else {
        return ''
      }
    },

    onBodyScroll (event, position) {
      this.$refs.body.style.left = `-${position.scrollLeft}px`
    }
  }
}
</script>

<style lang="scss" scoped>

.name {
  width: 230px;
  min-width: 230px;
}
.email {
  width: 300px;
  min-width: 300px;
}
.phone {
  width: 200px;
  min-width: 200px;
}
.role {
  width: 125px;
  min-width: 125px;
}
.actions {
  min-width: 100px;
}

.data-list {
  margin-top: 2em;
}
</style>
