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
    this.items = this.people
    this.$refs.autocomplete.$el.children[0].children[0].addEventListener(
      'keyup', (event) => {
        if (event.keyCode === 13 && this.item) {
          this.$emit('enter')
        }

        this.searchText =
          this.$refs.autocomplete.$el.children[0].children[0].value
        if (!this.item && this.searchText.length === 0) {
          this.items = []
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
      if (searchText && searchText.length > 0) {
        const result = indexSearch(this.index, [searchText])
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
    },

    focus () {
      const inputEl = this.$el.querySelector('.v-autocomplete-input')
      if (inputEl) inputEl.focus()
    }
  },

  watch: {
    item () {
      if (!this.item) {
        this.items = this.people
      }
    },

    people () {
      this.items = null
      this.items = this.people
      this.index = buildNameIndex(this.people)
    }
  }
}
</script>

<style lang="scss">
.dark .v-autocomplete .v-autocomplete-input-group .v-autocomplete-input {
  background-color: $dark-grey-light;
  border-color: $dark-grey;
  color: $white-grey;

  &:active {
    border: 1px solid $green;
  }

  &:hover {
    border: 1px solid $green;
  }
}

.dark .v-autocomplete .v-autocomplete-input-group .v-autocomplete-input:focus {
  border-color: $green;
}

.dark .v-autocomplete .v-autocomplete-list {
  box-shadow: 2px 2px 2px 0px $dark-grey-light;
  border-color: $dark-grey;
}

.v-autocomplete .v-autocomplete-list {
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
  box-shadow: 2px 2px 2px 0px $light-grey;
  z-index: 100;
}

.v-autocomplete .v-autocomplete-list-item {
  background: white;
}

.v-autocomplete .v-autocomplete-list-item.v-autocomplete-item-active {
  background: $light-grey-light;
}

.v-autocomplete .v-autocomplete-input-group .v-autocomplete-input {
  width: 300px;
  margin-bottom: 1px;
  border: 1px solid $light-grey;
  border-radius: 5px;
  padding: 0.5em;

  &:active {
    border: 1px solid $green;
    border-left-bottom-radius: 0px;
    border-right-bottom-radius: 0px;

  }

  &:hover {
    border: 1px solid $green;
  }
}
</style>
