<template>
  <div
    class="topbar-menuitem"
    :class="{
      'topbar-menuitem-open': showSectionList
    }"
  >
    <div class="section-menu">
      <div class="flexrow unselectable" @click="toggleSectionList">
        <div
          class="selected-section-line flexrow-item flexrow"
          v-if="currentSection"
        >
          <kitsu-icon
            class="section-icon"
            :name="currentSection.value"
            v-if="currentSection.value !== 'budget'"
          />
          <hand-coins-icon
            class="section-icon"
            :stroke-width="1.5"
            v-else-if="currentSection.value === 'budget'"
          />
          {{ currentSection.label }}
        </div>
      </div>
      <div class="select-input" ref="select" v-if="showSectionList">
        <div
          :key="`${section.value}-${index}`"
          class="section-line"
          @click="selectSection(section)"
          v-for="(section, index) in sectionList"
        >
          <router-link
            class="flexrow"
            :to="getSectionPath(section)"
            v-if="section.value !== 'separator'"
          >
            <kitsu-icon
              class="section-icon"
              :name="section.value"
              v-if="section.value !== 'budget'"
            />
            <hand-coins-icon
              class="section-icon"
              :stroke-width="1.5"
              v-else-if="section.value === 'budget'"
            />
            <span class="flexrow-item">
              {{ section.label }}
            </span>
          </router-link>
          <hr v-else />
        </div>
      </div>
    </div>
    <combobox-mask :displayed="showSectionList" @click="toggleSectionList" />
  </div>
</template>

<script>
import { HandCoinsIcon } from 'lucide-vue-next'
import { mapActions, mapGetters } from 'vuex'

import { getProductionPath } from '@/lib/path'

import ComboboxMask from '@/components/widgets/ComboboxMask.vue'
import KitsuIcon from '@/components/widgets/KitsuIcon.vue'

export default {
  name: 'topbar-section-list',

  components: {
    ComboboxMask,
    KitsuIcon,
    HandCoinsIcon
  },

  emits: ['input'],

  data() {
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

  mounted() {
    this.localSection = this.section
  },

  computed: {
    ...mapGetters(['currentProduction']),

    currentSection() {
      return this.sectionList.find(
        section => section.value === this.localSection
      )
    }
  },

  methods: {
    ...mapActions(['setCurrentSection', 'setLastProductionScreen']),

    selectSection(section) {
      if (section.value !== 'separator') {
        this.$emit('input', section.value)
        this.localSection = section.value
        this.showSectionList = false
      }
    },

    toggleSectionList() {
      this.showSectionList = !this.showSectionList
    },

    getSectionPath(section) {
      const result = getProductionPath(
        this.currentProduction,
        section.value,
        this.episodeId
      )
      return result
    }
  },

  watch: {
    section() {
      if (this.localSection !== this.section) {
        this.localSection = this.section
      }
    },

    localSection() {
      this.setCurrentSection(this.localSection)
      if (
        ['assets', 'episodes', 'sequences', 'shots', 'edits'].includes(
          this.localSection
        )
      ) {
        this.setLastProductionScreen(this.localSection)
      }
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
    padding: 0.2em 0.4em;
    padding-right: 0.8em;
    width: 100%;
  }

  &:hover {
    background: var(--background-hover);
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
  max-height: min(80vh, 600px);
  min-width: 200px;
  overflow-y: auto;
  padding: 5px;
  padding-bottom: 10px;
  position: absolute;
  text-align: left;
  top: 49px;
  z-index: 300;
}

hr {
  margin: 8px 8px 8px 6px;
  height: 1px;
  background: var(--border-alt);
}

.topbar-menuitem {
  height: 40px;
  padding-top: 2px;
  border: 1px solid $light-grey-light;
  padding-left: 5px;
  padding-right: 5px;
  border-radius: 10px;

  &.topbar-menuitem-open {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
}

.section-icon {
  cursor: pointer;
  margin-right: 0.8em;
  width: 20px;
}
</style>
