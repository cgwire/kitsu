<template>
  <v-autocomplete
    :items="items"
    :get-label="getAssignationLabel"
    :component-item="assignationItem"
    :min-len="1"
    :auto-select-one-item="false"
    :input-attrs="{
      placeholder: this.$t('people.select_person')
    }"
    ref="autocomplete"
    @update-items="update"
    @input="onChange"
    v-model="item"
  />
</template>

<script>
import AssignationItem from './AssignationItem'
import { mapGetters } from 'vuex'
import { buildNameIndex, indexSearch } from '../../lib/indexing'

export default {
  name: 'people-field',

  data () {
    return {
      assignationItem: AssignationItem,
      items: [],
      item: {},
      searchText: ''
    }
  },

  created () {
    this.items = this.people
    this.item = this.value
    this.index = buildNameIndex(this.people)
  },

  mounted () {
    this.$refs.autocomplete.$el.children[0].children[0].addEventListener(
      'keyup', (event) => {
        if (event.keyCode === 13 && this.item) {
          this.$emit('enter')
        }

        this.searchText =
          this.$refs.autocomplete.$el.children[0].children[0].value
        if (!this.item && this.searchText.length === 0) {
          this.items = this.people
        }
      })
  },

  props: {
    value: {
      type: Object,
      default: () => {}
    },
    people: {
      type: Array,
      default: () => []
    }
  },

  computed: {
    ...mapGetters([
      'peopleIndex'
    ])
  },

  methods: {
    getAssignationLabel (item) {
      if (item) {
        return item.name
      } else {
        return ''
      }
    },

    update (searchText) {
      if (searchText) {
        const result = indexSearch(this.index, searchText)
        this.items = result
      } else {
        this.items = this.people
      }
    },

    onChange () {
      this.$emit('input', this.item)
    },

    clear () {
      this.item = null
    }
  },

  watch: {
    item () {
      if (!this.item) {
        this.items = this.people
      }
    },

    people () {
      this.index = buildNameIndex(this.people)
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
  z-index: 100;
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
  border: 1px solid #CCC;
}
</style>
