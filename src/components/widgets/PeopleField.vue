<template>
  <div class="people-field">
    <v-autocomplete
      ref="autocomplete"
      :auto-select-one-item="false"
      :component-item="assignationItem"
      :get-label="getAssignationLabel"
      :items="items"
      :input-attrs="{
        placeholder: placeholder || this.$t('people.select_person'),
        class: wide
          ? 'big wide v-autocomplete-input'
          : big
            ? 'big v-autocomplete-input'
            : 'v-autocomplete-input'
      }"
      :keep-open="keepOpen"
      :min-len="0"
      :wait="100"
      @focus="keepOpen = true"
      @input="onChange"
      @item-clicked="keepOpen = false"
      @keyup.enter.native="onEnter"
      @update-items="update"
      v-model="item"
    />
    <span class="clear-button" @click="item = null" v-show="item !== null">
      <x-icon size="0.8x" />
    </span>

    <div
      @click="keepOpen = false"
      :class="{
        'c-mask': true,
        'is-active': keepOpen
      }"
    ></div>
  </div>
</template>

<script>
import AssignationItem from '@/components/widgets/AssignationItem'
import { buildNameIndex, indexSearch } from '@/lib/indexing'

import { XIcon } from 'vue-feather-icons'

export default {
  name: 'people-field',

  components: {
    XIcon
  },

  data() {
    return {
      assignationItem: AssignationItem,
      item: null,
      items: [],
      keepOpen: false
    }
  },

  created() {
    this.items = this.people
    this.item = this.value
    this.index = buildNameIndex(this.people)
  },

  mounted() {
    this.items = this.people
  },

  props: {
    big: {
      type: Boolean,
      default: false
    },
    people: {
      type: Array,
      default: () => []
    },
    placeholder: {
      type: String,
      default: ''
    },
    value: {
      type: Object,
      default: () => {}
    },
    wide: {
      type: Boolean,
      default: false
    }
  },

  methods: {
    getAssignationLabel(item) {
      return item?.name || ''
    },

    update(searchText) {
      this.keepOpen = true
      this.items = searchText?.length
        ? indexSearch(this.index, [searchText])
        : this.people
    },

    onChange() {
      this.$emit('input', this.item)
    },

    onEnter() {
      if (this.item) {
        this.$emit('enter')
        this.$refs.autocomplete.focus()
      }
    },

    clear() {
      this.item = null
    },

    focus() {
      this.$el.querySelector('.v-autocomplete-input')?.focus()
    }
  },

  watch: {
    people() {
      this.item = this.item
        ? this.people.find(person => person.id === this.item.id)
        : null
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

  &:active,
  &:hover {
    border: 1px solid $green;
  }

  &:focus {
    border-color: $green;
  }
}

.people-field {
  position: relative;

  .clear-button {
    color: var(--text);
    cursor: pointer;
    position: absolute;
    right: 4px;
    top: 0;
    z-index: 3001;
  }
}

.dark .v-autocomplete .v-autocomplete-list {
  box-shadow: 2px 2px 2px 0 $dark-grey-light;
  border-color: $dark-grey;
}

.v-autocomplete .v-autocomplete-list {
  box-shadow: 0 0 2px 0 rgba(0, 0, 0, 0.2);
  left: 6px;
  top: 41px;
  width: calc(100% - 13px);
  max-height: 300px;
  overflow-y: auto;
  z-index: 3000;
  border: 1px solid var(--border);
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
}

.v-autocomplete {
  z-index: 205; // +1 relative to the z-index of c-mask
  position: relative;

  // Hide native clear button for Webkit browsers (Chrome, Safari)
  input[type='search']::-webkit-search-cancel-button {
    display: none;
  }
}

.v-autocomplete .v-autocomplete-list-item {
  background: white;
  border: 0;
  border-bottom: 1px solid var(--border);
}

.v-autocomplete .v-autocomplete-list-item:last-child {
  background: white;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
}

.v-autocomplete .v-autocomplete-input-group .v-autocomplete-input.wide.big {
  width: 100%;
}

.v-autocomplete .v-autocomplete-list-item.v-autocomplete-item-active {
  background: $light-grey-light;
}

.small .v-autocomplete .v-autocomplete-input-group .v-autocomplete-input {
  width: 200px;
}

.v-autocomplete .v-autocomplete-input-group .v-autocomplete-input {
  width: 300px;
  margin-bottom: 1px;
  border: 1px solid $light-grey-light;
  border-radius: 10px;
  padding: 0.5em;

  &:active,
  &:hover {
    border: 1px solid $green;
  }

  &.big {
    padding: 0.85em;
  }
}
</style>
