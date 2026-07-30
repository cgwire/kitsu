<template>
  <div>
    <label class="label" v-if="label">
      {{ label }}
    </label>
    <div class="people-field" :class="{ small, wide }">
      <multiselect
        ref="multiselectRef"
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
        role="button"
        tabindex="0"
        @click="clear"
        @keydown.enter.prevent="clear"
        @keydown.space.prevent="clear"
        v-if="hasSelection && clearable && !disabled"
      >
        <x-icon :size="12" />
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { XIcon } from 'lucide-vue-next'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css'

import { buildNameIndex, buildPeopleIndex, indexSearch } from '@/lib/indexing'

import AssignationItem from '@/components/widgets/AssignationItem.vue'

const props = defineProps({
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
    type: [Object, Array],
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
  // Also match on the email address, not only on the name.
  searchEmail: {
    type: Boolean,
    default: false
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
})

const emit = defineEmits(['select', 'update:model-value'])

const multiselectRef = ref(null)
const index = ref(null)
const item = ref(null)
const items = ref([])
const search = ref('')

const buildIndex = people =>
  props.searchEmail ? buildPeopleIndex(people) : buildNameIndex(people)

const hasSelection = computed(() =>
  Array.isArray(item.value) ? item.value.length > 0 : Boolean(item.value)
)

items.value = props.people
index.value = buildIndex(props.people)

onMounted(() => {
  items.value = props.people
  item.value = props.modelValue
  setTimeout(() => {
    item.value = props.modelValue
  }, 10)
})

const onSearchChange = s => {
  items.value = s?.length ? (indexSearch(index.value, [s]) ?? []) : props.people
  search.value = s
}

const onSelect = () => {
  emit('update:model-value', item.value)
  emit('select', item.value)
}

const clear = () => {
  item.value = props.multiple ? [] : null
  onSelect()
}

const focus = () => {
  multiselectRef.value.$el.focus()
}

watch(
  () => props.people,
  () => {
    const findAgain = person => props.people.find(({ id }) => id === person.id)
    if (Array.isArray(item.value)) {
      item.value = item.value.map(findAgain).filter(Boolean)
    } else {
      item.value = item.value ? findAgain(item.value) : null
    }
    items.value = props.people
    index.value = buildIndex(props.people)
  }
)

watch(
  () => props.modelValue,
  () => {
    item.value = props.modelValue
  }
)

defineExpose({ clear, focus })
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
  font-size: inherit;

  &--active {
    z-index: 501;
  }

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
