<template>
<div class="data-list">
  <div style="overflow: hidden">
    <table class="table table-header" ref="headerWrapper">
      <thead>
        <tr>
          <th class="name">
          {{ $t("people.list.name") }}
          </th>
          <th class="email">
          {{ $t("people.list.email") }}
          </th>
          <th class="phone">
          {{ $t("people.list.phone") }}
          </th>
          <th class="role">
          {{ $t("people.list.role") }}
          </th>
          <th class="actions"></th>
        </tr>
      </thead>
    </table>
  </div>

  <div class="table-body" v-scroll="onBodyScroll">
    <table class="table">
      <tbody>
        <tr v-for="entry in entries">
          <people-name-cell class="name" v-bind:entry="entry"></people-name-cell>
          <td class="email">{{ entry.email }}</td>
          <td class="phone">{{ entry.phone }}</td>
          <td class="role">{{ $t('people.role.' + entry.role) }}</td>
          <row-actions
            :entry-id="entry.id"
            :edit-route="{
              name: 'edit-person',
              params: {person_id: entry.id}
            }"
            :delete-route="{
              name: 'delete-person',
              params: {person_id: entry.id}
            }"
          >
          </row-actions>
         </tr>
      </tbody>
    </table>
  </div>

  <div class="has-text-centered" v-if="isLoading">
    <img src="../../assets/spinner.svg">
  </div>
  <div class="has-text-centered" v-if="isError">
    <span class="tag is-danger">An error occured while loading data</span>
  </div>
  <p class="has-text-centered footer-info" v-if="!isLoading">
    {{ entries.length }} {{ $tc('people.persons', entries.length) }}
  </p>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import PeopleNameCell from '../cells/PeopleNameCell'
import RowActions from '../widgets/RowActions'

export default {
  name: 'list',
  components: {
    PeopleNameCell,
    RowActions
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
    ])
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
      this.$refs.headerWrapper.style.left = `-${position.scrollLeft}px`
    }
  }
}
</script>

<style scoped>
.name {
  width: 230px;
  min-width: 230px;
}
.email {
  width: 210px;
  min-width: 210px;
}
.phone {
  width: 140px;
  min-width: 140px;
}
.role {
  min-width: 100px;
}
.actions {
  min-width: 100px;
}

.data-list {
  margin-top: 2em;
}
</style>
