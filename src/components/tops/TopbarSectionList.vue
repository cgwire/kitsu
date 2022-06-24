<template>
<div :class="{
  'topbar-menuitem': true,
  'topbar-menuitem-open': showSectionList
}">
  <div
    class="section-menu"
  >
    <div
      class="flexrow unselectable root-menu"
      @click="toggleSectionList"
    >
      <div
        class="selected-section-line flexrow-item"
      >
       {{ currentSectionLabel }}
      </div>
      <chevron-down-icon class="down-icon flexrow-item"/>
    </div>
    <div
      class="select-input"
      ref="select"
      v-if="showSectionList"
    >
      <div
        class="section-line"
        v-for="(section, index) in sectionList"
        @click="selectSection(section)"
        :key="section.value + '-' + index"
      >
        <router-link
          :to="getSectionPath(section)"
          v-if="section.value !== 'separator'"
        >
          {{ section.label }}
        </router-link>
        <hr v-else />
      </div>
    </div>
  </div>
  <combobox-mask
    :displayed="showSectionList"
    @click="toggleSectionList"
  />
</div>

</template>

<script>
import { mapGetters } from 'vuex'
import { ChevronDownIcon } from 'vue-feather-icons'

import { getProductionPath } from '@/lib/path'

import ComboboxMask from '@/components/widgets/ComboboxMask'

export default {
  name: 'topbar-section-menu',

  components: {
    ChevronDownIcon,
    ComboboxMask
  },

  data () {
    return {
      localSection: null,
      showSectionList: false
    }
  },

  props: {
    sectionList: {
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
    this.localSection = this.section
  },

  computed: {
    ...mapGetters([
      'currentProduction'
    ]),

    currentSectionLabel () {
      const section = this.localSection
      const sectionOption = this.sectionList.find(s => s.value === section)
      if (sectionOption) return sectionOption.label
      else return null
    }
  },

  methods: {
    selectSection (section) {
      if (section.value !== 'separator') {
        this.$emit('input', section.value)
        this.localSection = section.value
        this.showSectionList = false
      }
    },

    toggleSectionList () {
      this.showSectionList = !this.showSectionList
    },

    getSectionPath (section) {
      return getProductionPath(
        this.currentProduction,
        section.value,
        this.episodeId
      )
    }
  },

  watch: {
    section () {
      if (this.localSection !== this.section) this.localSection = this.section
    }
  }
}
</script>

<style lang="scss" scoped>
.dark {
  .select-input,
  .selected-section-line,
  .section-line,
  .section-combo {
    background: $black;
    border-color: $dark-grey;
  }

  .select-input,
  .topbar-menuitem {
    border: 1px solid $dark-grey-light;
  }

  .section-line {
    a {
      color: $white;
    }
  }

  .section-line:hover {
    background: $dark-purple;
  }
}

.selected-section-line {
  background: $white;
  cursor: pointer;
  flex: 1;
  min-width: 100px;
  padding: 0.4em;
  text-align: left;
}

.section-menu {
  cursor: pointer;
}

.section-line {
  background: $white;
  cursor: pointer;
  margin: 0;
  border-radius: 5px;

  a {
    color: $black;
    padding: 0.4em;
    padding-right: 0.8em;
    display: inline-block;
    width: 100%;
  }

  &:hover {
    background: #EEE;
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
  border: 1px solid $light-grey-light;
  border-top-right-radius: 5px;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  margin-left: -6px;
  max-height: 460px;
  min-width: 180px;
  overflow-y: auto;
  padding: 5px;
  padding-bottom: 10px;
  position: absolute;
  text-align: left;
  top: 49px;
  z-index: 300;
}

.root-menu {
}

hr {
  margin: 8px 8px 8px 6px;
  border: 1px solid $light-grey;
}

.topbar-menuitem {
  height: 40px;
  padding-top: 2px;
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
