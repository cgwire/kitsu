<template>
  <div>
    <label class="label" v-if="label.length">
      {{ label }}
    </label>
    <div
      class="studio-combo"
      :class="{
        opened: showStudioList,
        rounded
      }"
      :style="{ width: `${width}px` }"
    >
      <div class="flexrow" @click="toggleStudioList">
        <div class="selected-studio-line flexrow-item">
          <studio-name :studio="currentStudio" v-if="currentStudio" />
        </div>
        <chevron-down-icon class="down-icon flexrow-item" />
      </div>
      <div
        class="select-input"
        :style="{
          'max-height': `${maxHeightSelectInput}px`,
          width: `${width}px`,
          top: rounded ? '30px' : '37px'
        }"
        v-if="showStudioList"
      >
        <div
          class="studio-line"
          :key="studio.id"
          @click="selectStudio(studio)"
          v-for="studio in studioList"
        >
          <studio-name :studio="studio" />
        </div>
      </div>
    </div>
    <combobox-mask :displayed="showStudioList" @click="toggleStudioList" />
  </div>
</template>

<script>
import { ChevronDownIcon } from 'lucide-vue-next'
import { mapGetters } from 'vuex'

import ComboboxMask from '@/components/widgets/ComboboxMask.vue'
import StudioName from '@/components/widgets/StudioName.vue'

export default {
  name: 'combobox-studio',

  components: {
    ChevronDownIcon,
    ComboboxMask,
    StudioName
  },

  emits: ['update:modelValue'],

  data() {
    return {
      showStudioList: false
    }
  },

  props: {
    label: {
      default: '',
      type: String
    },
    maxHeightSelectInput: {
      default: 200,
      type: Number
    },
    rounded: {
      default: false,
      type: Boolean
    },
    modelValue: {
      default: '',
      type: String
    },
    width: {
      default: 250,
      type: Number
    },
    withEmptyChoice: {
      default: true,
      type: Boolean
    },
    allStudiosLabel: {
      default: false,
      type: Boolean
    }
  },

  computed: {
    ...mapGetters(['studios', 'studioMap']),

    studioList() {
      const studios = [...this.studios]

      if (this.withEmptyChoice) {
        return [
          {
            color: '#aaa',
            id: null,
            name: this.allStudiosLabel
              ? this.$t('studios.all_studios')
              : this.$t('studios.no_studio')
          },
          ...studios
        ]
      }
      return studios
    },

    currentStudio() {
      if (!this.modelValue) {
        return this.studioList[0]
      }
      return (
        this.studioMap.get(this.modelValue) ??
        this.studioList.find(({ id }) => id === this.modelValue)
      )
    }
  },

  methods: {
    selectStudio(studio) {
      this.$emit('update:modelValue', studio.id)
      this.showStudioList = false
    },

    toggleStudioList() {
      this.showStudioList = !this.showStudioList
    }
  }
}
</script>

<style lang="scss" scoped>
.dark {
  .select-input,
  .selected-studio-line,
  .studio-line,
  .studio-combo {
    background: $dark-grey-light;
    border-color: $dark-grey;
  }

  .studio-line:hover {
    background: $dark-purple;
  }
}

.studio-combo {
  background: $white;
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

.selected-studio-line {
  background: $white;
  padding: 0.2em;
  flex: 1;
}

.studio-line {
  background: $white;
  cursor: pointer;
  padding: 0.2em;
  margin: 0;

  &:hover {
    background: $purple;
  }
}

.down-icon {
  color: $green;
  cursor: pointer;
  width: 15px;
  min-width: 15px;
  margin-right: 0.4em;
}

.select-input {
  background: $white;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  position: absolute;
  border: 1px solid $light-grey-light;
  z-index: 300;
  margin-left: -1px;
  max-height: 200px;
  overflow-y: auto;
  left: 0;
}

.field .label {
  padding-top: 5px;
}

.rounded {
  border-radius: 10px;

  &.opened {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }

  .selected-studio-line {
    padding-top: 0;

    padding-bottom: 0;
    border-radius: 50px;
  }
}
</style>
