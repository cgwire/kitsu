<template>
<div class="data-list">
  <table class="table">
    <thead>
      <tr>
        <th class="name">Name</th>
        <th class="email">Email</th>
        <th class="phone">Phone</th>
        <th class="skills">Skills</th>
        <th class="situation">Situation</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="entry in entries">
        <people-name-cell
          class="name"
          v-bind:entry="entry">
        </people-name-cell>
        <td class="email">{{ entry.email }}</td>
        <td class="phone">{{ entry.phone }}</td>
        <td class="skills">
          <span
            class="tag"
            v-for="department in entry.departments.split(', ')">
            {{ department }}
          </span>
        </td>
        <td class="situation">{{ entry.active ? 'Active' : 'Unactive'}}</td>
        <row-actions
          :entry-id="entry.id"
          :on-edit-clicked="onEditClicked"
          :on-delete-clicked="onDeleteClicked">
        </row-actions>
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
}
.email {
  width: 210px;
}
.phone {
  width: 140px;
}
.skills {
  width: 250px;
}
</style>
