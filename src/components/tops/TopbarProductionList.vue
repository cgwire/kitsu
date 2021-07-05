<template>
<div :class="{
  'topbar-menuitem': true,
  'topbar-menuitem-open': showProductionList
}">
  <div
    class="production-menu"
  >
    <div
      class="flexrow root-menu"
      @click="toggleProductionList"
    >
      <div
        class="selected-production-line flexrow-item unselectable"
      >
        <production-name
          :production="currentProduction"
          :no-link="true"
          :size="25"
          v-if="currentProduction"
        />
      </div>
      <chevron-down-icon class="down-icon flexrow-item"/>
    </div>
    <div
      class="select-input"
      ref="select"
      v-if="showProductionList"
    >
      <div
        :class="{
          'production-line': true,
          'selected': production.id === currentProduction.id
        }"
        v-for="production in productionList"
        @click="selectProduction(production)"
        :key="production.id"
      >
        <router-link
          :to="getProductionPath(production)"
        >
          <span class="name-wrapper">
            <production-name
              class="link"
              :size="25"
              :no-link="true"
              :production="production"
            />
          </span>
        </router-link>
      </div>
    </div>
  </div>
  <combobox-mask
    :displayed="showProductionList"
    @click="toggleProductionList"
  />
</div>

</template>

<script>
import { mapGetters } from 'vuex'
import { ChevronDownIcon } from 'vue-feather-icons'

import ComboboxMask from '@/components/widgets/ComboboxMask'
import ProductionName from '@/components/widgets/ProductionName'

import { getProductionPath } from '@/lib/path'

export default {
  name: 'topbar-production-list',

  components: {
    ChevronDownIcon,
    ComboboxMask,
    ProductionName
  },

  data () {
    return {
      showProductionList: false
    }
  },

  props: {
    productionList: {
      required: true,
      type: Array
    },
    section: {
      default: 'assets',
      type: String
    },
    episodeId: {
      default: '',
      type: String
    }
  },

  mounted () {
  },

  computed: {
    ...mapGetters([
      'currentProduction',
      'openProductions'
    ])
  },

  methods: {
    selectProduction (production) {
      this.$emit('input', production.id)
      this.value = production.id
      this.showProductionList = false
    },

    toggleProductionList () {
      this.showProductionList = !this.showProductionList
    },

    getProductionPath (production) {
      return getProductionPath(
        production,
        this.section,
        this.episodeId || 'all'
      )
    }
  }
}
</script>

<style lang="scss" scoped>
.dark {
  .select-input,
  .selected-production-line,
  .production-line,
  .production-combo {
    background: $black;
    border-color: $dark-grey;
  }

  .select-input,
  .topbar-menuitem {
    border: 1px solid $dark-grey-light;
  }

  .production-line {
    .link {
      color: $white;
    }

    &.selected .name-wrapper {
      background: $dark-grey-light;
    }

    &:hover {
      .name-wrapper {
        background: $dark-purple;
      }
    }
  }
}

.selected-production-line {
  cursor: pointer;
  flex: 1;
  min-width: 150px;
  padding: 0.4em;
}

.production-line {
  background: $white;
  cursor: pointer;
  margin: 0;
  padding: 0 0.2em;
  margin-left: 3px;
  margin-right: 3px;

  &:first-child {
    margin-top: 7px;
  }

  .name-wrapper {
    border-radius: 5px;
    display: flex;
    padding: 0.5em;
    padding-right: 2em;
  }

  .link {
    color: $black;
  }

  &:hover {
    .name-wrapper {
      background: #EEE;
    }
  }
}

.down-icon {
  cursor: pointer;
  color: $green;
  min-width: 15px;
  margin-right: 0.4em;
  width: 15px;
}

.select-input {
  background: $white;
  border: 1px solid $light-grey-light;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  margin-left: -6px;
  max-height: 210px;
  overflow-y: auto;
  position: absolute;
  top: 48px;
  min-width: 100px;
  z-index: 300;
}

.production-line:last-child {
  margin-bottom: 10px;
}

.production-menu {
  cursor: pointer;
}

.root-menu {
}

.topbar-menuitem {
  border: 1px solid $light-grey-light;
  padding-left: 5px;
  padding-right: 5px;
  border-radius: 10px;

  &.topbar-menuitem-open {
    border-bottom-left-radius: 0px;
    border-bottom-right-radius: 0px;
  }
}
</style>
