<template>
  <div>
    <label class="label" v-if="label">
      {{ label }}
    </label>
    <div class="people-field" :class="{ small, wide }">
      <multiselect
        ref="multiselect"
        label="name"
        :allow-empty="clearable"
        :disabled="disabled"
        :internal-search="false"
        :options="items"
        :multiple="multiple"
        :placeholder="placeholder || $t('people.select_person')"
        :show-labels="false"
        :show-no-options="false"
        :show-no-results="false"
        track-by="name"
        @remove="onSelect"
        @search-change="onSearchChange"
        @select="onSelect"
        v-model="item"
      >
        <template #option="props">
          <assignation-item :item="props.option" :search="search" />
        </template>
        <template #noResult></template>
      </multiselect>
      <span
        class="clear-button"
        @click="clear"
        v-if="item && clearable && !disabled"
      >
        <x-icon :size="12" />
      </span>
    </div>
  </div>
</template>

<script>
import { XIcon } from 'lucide-vue-next'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css'

import { buildNameIndex, indexSearch } from '@/lib/indexing'

import AssignationItem from '@/components/widgets/AssignationItem.vue'

export default {
  name: 'people-field',

  components: {
    AssignationItem,
    Multiselect,
    XIcon
  },

  emits: ['select', 'update:modelValue'],

  data() {
    return {
      item: null,
      items: [],
      search: ''
    }
  },

  created() {
    this.items = this.people
    this.index = buildNameIndex(this.people)
  },

  mounted() {
    this.items = this.people
    this.item = this.modelValue
    setTimeout(() => {
      this.item = this.modelValue
    }, 10)
  },

  props: {
    clearable: {
      type: Boolean,
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    label: {
      type: String,
      default: null
    },
    modelValue: {
      type: Object,
      default: () => {}
    },
    multiple: {
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
    small: {
      type: Boolean,
      default: false
    },
    wide: {
      type: Boolean,
      default: false
    }
  },

  methods: {
    onSearchChange(search) {
      this.items = search?.length
        ? indexSearch(this.index, [search])
        : this.people
      this.search = search
    },

    onSelect() {
      this.$emit('update:modelValue', this.item)
      this.$emit('select', this.item)
    },

    clear() {
      this.item = null
      this.onSelect()
    },

    focus() {
      this.$refs.multiselect.$el.focus()
    }
  },

  watch: {
    people: {
      deep: true,
      handler() {
        this.item = this.item
          ? this.people.find(person => person.id === this.item.id)
          : null
        this.items = this.people
        this.index = buildNameIndex(this.people)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.people-field {
  position: relative;

  &:not(.wide) {
    width: 300px;
  }

  &.small {
    width: 200px;
  }

  .clear-button {
    color: var(--text);
    cursor: pointer;
    position: absolute;
    right: 4px;
    top: 0;
  }
}
</style>

<style lang="scss">
.multiselect {
  color: var(--text);

  &--disabled {
    background: none;
  }

  .multiselect__input,
  .multiselect__single {
    background: none;
    padding: 0;
    font-size: inherit;
    color: inherit;
  }

  .multiselect__input::placeholder {
    color: $grey;
  }
  .multiselect__placeholder {
    color: $grey;
    padding-top: 0;
  }

  .multiselect__select {
    display: none;
  }

  .multiselect__tags {
    border-radius: 10px;
    border: 1px solid var(--border);
    padding-left: 0.85em;
    padding-right: 0.85em;
    min-height: 42px;

    &:active,
    &:hover,
    &:focus {
      border: 1px solid $green;
    }
  }

  .multiselect__content-wrapper {
    border: 1px solid var(--border);
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
  }

  .multiselect__element {
    border-bottom: 1px solid var(--border);
  }

  .multiselect__option--highlight {
    background: var(--background-selectable);
    color: inherit;
  }
  .multiselect__option--selected {
    background: var(--background-selected);
    color: inherit;
    font-weight: inherit;
  }

  .dark & {
    .multiselect__content-wrapper,
    .multiselect__element,
    .multiselect__tags {
      background-color: $dark-grey-light;
    }
  }
}
</style>
