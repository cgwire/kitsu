<template>
  <div
    :class="{
      field: withMargin
    }"
  >
    <label class="label" v-if="label">
      {{ label }}
    </label>
    <div class="production-combo">
      <div
        class="flexrow"
        role="combobox"
        tabindex="0"
        aria-haspopup="listbox"
        :aria-expanded="showProductionList"
        :aria-activedescendant="
          activeIndex > -1 ? optionId(activeIndex) : undefined
        "
        @click="toggleProductionList"
        @keydown="onKeydown"
      >
        <div class="selected-production-line flexrow-item">
          <production-name
            :production="currentProduction"
            :no-link="true"
            :size="25"
            v-if="currentProduction"
          />
        </div>
        <chevron-down-icon class="down-icon flexrow-item" />
      </div>
      <div
        class="select-input"
        ref="listRef"
        role="listbox"
        v-if="showProductionList"
      >
        <div
          :id="optionId(index)"
          :key="production.id"
          class="production-line"
          role="option"
          :aria-selected="production.id === currentProduction?.id"
          @click="selectProduction(production)"
          v-for="(production, index) in productionList"
        >
          <production-name
            :size="25"
            :no-link="true"
            :production="production"
          />
        </div>
      </div>
    </div>
    <combobox-mask
      :displayed="showProductionList"
      @click="toggleProductionList"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ChevronDownIcon } from 'lucide-vue-next'

import { useCombobox } from '@/composables/combobox'
import { useComboboxKeyboard } from '@/composables/comboboxKeyboard'

import ComboboxMask from '@/components/widgets/ComboboxMask.vue'
import ProductionName from '@/components/widgets/ProductionName.vue'

const props = defineProps({
  label: {
    default: '',
    type: String
  },
  withMargin: {
    default: true,
    type: Boolean
  },
  productionList: {
    required: true,
    type: Array
  },
  modelValue: {
    default: '',
    type: String
  }
})

const emit = defineEmits(['update:model-value'])

const {
  showList: showProductionList,
  toggle: toggleProductionList,
  select: selectProduction
} = useCombobox(emit)

const listRef = ref(null)
const { activeIndex, onKeydown, optionId } = useComboboxKeyboard({
  isOpen: showProductionList,
  toggle: toggleProductionList,
  optionsLength: () => props.productionList.length,
  onSelect: index => selectProduction(props.productionList[index]),
  listRef
})

const currentProduction = computed(() => {
  return (
    props.productionList.find(({ id }) => id === props.modelValue) ||
    props.productionList[0]
  )
})
</script>

<style lang="scss" scoped>
.dark {
  .select-input,
  .selected-production-line,
  .production-line,
  .production-combo {
    background: $dark-grey-light;
    border-color: $dark-grey;
  }

  .production-line:hover {
    background: $dark-purple;
  }
}

.production-combo {
  background: $white;
  min-width: 300px;
  width: 300px;
  border: 1px solid $light-grey-light;
  user-select: none;
  cursor: pointer;
  border-radius: 10px;
  margin: 0;
  padding: 0.15em;
  position: relative;

  &:hover {
    border: 1px solid $green;
  }
}

.selected-production-line {
  background: $white;
  padding: 0.4em;
  flex: 1;
}

.production-line {
  background: $white;
  cursor: pointer;
  padding: 0.4em;
  margin: 0;

  &:hover {
    background: $purple;
  }
}

.down-icon {
  width: 15px;
  min-width: 15px;
  margin-right: 0.4em;
  color: $green;
  cursor: pointer;
}

.select-input {
  background: $white;
  width: 300px;
  position: absolute;
  // without a top, a parent centering the combo content (flex column)
  // centers the list on the combo too
  top: 100%;
  border: 1px solid $light-grey-light;
  z-index: $z-dropdown;
  margin-left: -1px;
  max-height: 200px;
  overflow-y: auto;
}

.field .label {
  padding-top: 0;
  margin-bottom: 5px;
}

// Force the production name back on under 768px — ProductionName hides
// its .avatar-name by default to save space, but inside this combobox
// the name is the whole point of the selection.
@media screen and (max-width: 768px) {
  .production-combo :deep(.avatar-name) {
    display: inline;
  }
}
</style>
