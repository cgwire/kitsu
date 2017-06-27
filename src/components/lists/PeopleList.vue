<template>
<div class="data-list">
  <table class="table">
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
        <th class="actions"></th>
        <th class="filler"></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="entry in entries">
        <people-name-cell class="name" v-bind:entry="entry"></people-name-cell>
        <td class="email">{{ entry.email }}</td>
        <td class="phone">{{ entry.phone }}</td>
        <row-actions
          :entry-id="entry.id"
          :edit-route="'/people/edit/' + entry.id"
          :delete-route="'/people/delete/' + entry.id"
        >
        </row-actions>
        <td class="filler"></td>
       </tr>
    </tbody>
  </table>
  <div class="has-text-centered" v-if="isLoading">
    <img src="../../assets/spinner.svg">
  </div>
  <div class="has-text-centered" v-if="isError">
    <span class="tag is-danger">An error occured while loading data</span>
  </div>
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
.skills {
  width: 250px;
}
.actions {
  width: 100px;
  min-width: 100px;
}
.data-list thead {
  display: block;
  width: 100%;
}
.data-list tbody {
  display: block;
  height: 800px;
  max-height: 800px;
  width: 100%;
  overflow-y: scroll;
}

.data-list table {
  width: 100%;
}

.filler {
  width: 100%;
}

.data-list {
  overflow-x: scroll;
}
</style>
