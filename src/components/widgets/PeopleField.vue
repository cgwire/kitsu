<template>
  <v-autocomplete
    :items="items"
    :get-label="getAssignationLabel"
    :component-item="assignationItem"
    :min-len="1"
    :input-attrs="{
      placeholder: this.$t('people.select_person')
    }"
    @update-items="update"
    @input="onChange"
    v-model="item"
  />
</template>

<script>
import { mapGetters } from 'vuex'
import { indexSearch } from '../../lib/indexing'
import AssignationItem from './AssignationItem'

export default {
  name: 'people-field',

  data () {
    return {
      assignationItem: AssignationItem,
      items: []
    }
  },

  created () {
    this.items = this.people
    this.item = this.value
  },

  props: {
    value: {
      type: Object,
      default: null
    }
  },

  computed: {
    ...mapGetters([
      'people',
      'peopleIndex'
    ])
  },

  methods: {
    getAssignationLabel (item) {
      if (item) {
        return item.name
      } else {
        return null
      }
    },

    update (searchText) {
      if (searchText) {
        this.items = indexSearch(this.peopleIndex, searchText)
      } else {
        this.items = this.people
      }
    },

    onChange () {
      this.$emit('input', this.item)
      if (!this.item) {
        this.items = this.people
      }
    }
  },

  watch: {
    item () {
      if (!this.item) {
        this.items = this.people
      }
    }
  }
}
</script>

<style>
.v-autocomplete .v-autocomplete-list {
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
  box-shadow: 2px 2px 2px 0px #DDD;
}

.v-autocomplete .v-autocomplete-list-item {
  background: white;
}

.v-autocomplete .v-autocomplete-list-item.v-autocomplete-item-active {
  background: #BCB;
}

.v-autocomplete .v-autocomplete-input-group .v-autocomplete-input {
  width: 300px;
  padding: 0.5em;
  margin-bottom: 3px;
}
</style>
