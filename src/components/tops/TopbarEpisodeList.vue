<template>
  <div
    class="topbar-menuitem"
    :class="{
      'topbar-menuitem-open': showEpisodeList
    }"
  >
    <div class="episode-menu">
      <div
        class="flexrow unselectable"
        role="button"
        tabindex="0"
        @click="toggleEpisodeList"
        @keydown.enter.prevent="toggleEpisodeList"
        @keydown.space.prevent="toggleEpisodeList"
      >
        <div class="selected-production-line flexrow-item">
          {{ episodeLabel }}
        </div>
        <chevron-down-icon class="down-icon flexrow-item" />
      </div>
      <div class="select-input" ref="select" v-if="showEpisodeList">
        <div v-for="(group, index) in episodeGroups" :key="`group-${index}`">
          <div
            class="group-name"
            v-if="showAllMode && group.name && group.name !== 'running'"
          >
            {{ $t('episodes.status.' + group.name) }}
          </div>
          <template v-if="showAllMode || ['', 'running'].includes(group.name)">
            <div
              :key="optionKey(episode)"
              :ref="'episode-' + optionKey(episode)"
              class="episode-line"
              @click="selectEpisode(episode)"
              v-for="episode in group.episodeList"
            >
              <router-link :to="getEpisodePath(episode)">
                {{ episode.label }}
              </router-link>
            </div>
          </template>
        </div>
        <div
          class="group-name episode-line has-text-centered more-button"
          role="button"
          tabindex="0"
          @click="showAllMode = true"
          @keydown.enter.prevent="showAllMode = true"
          @keydown.space.prevent="showAllMode = true"
          v-if="!showAllMode"
        >
          +
        </div>
        <div
          class="group-name episode-line has-text-centered more-button"
          role="button"
          tabindex="0"
          @click="showAllMode = false"
          @keydown.enter.prevent="showAllMode = false"
          @keydown.space.prevent="showAllMode = false"
          v-else
        >
          -
        </div>
      </div>
    </div>
    <combobox-mask :displayed="showEpisodeList" @click="toggleEpisodeList" />
  </div>
</template>

<script>
import { ChevronDownIcon } from 'lucide-vue-next'
import { mapGetters } from 'vuex'

import { getProductionPath } from '@/lib/path'

import ComboboxMask from '@/components/widgets/ComboboxMask.vue'

export default {
  name: 'topbar-episode-list',

  components: {
    ChevronDownIcon,
    ComboboxMask
  },

  emits: ['input'],

  data() {
    return {
      showAllMode: false,
      lastScrollPosition: 0,
      showEpisodeList: false
    }
  },

  props: {
    episodeGroups: {
      required: true,
      type: Array
    },
    section: {},
    episodeId: {
      default: '',
      type: String
    }
  },

  computed: {
    ...mapGetters(['currentProduction']),

    episodeLabel() {
      const options = this.episodeGroups.flatMap(group =>
        group.episodeList.filter(o => o.value === this.episodeId)
      )
      // Several options can share a value (All assets / All shots): the
      // route query tells them apart.
      const forEntity = this.$route.query.for_entity
      const option =
        options.find(o => o.query?.for_entity === forEntity) ||
        options.find(o => !o.query) ||
        options[0]
      return option ? option.label : ''
    },

    getEpisodePath() {
      const currentProduction = this.currentProduction
      const section = this.section
      const pluginId = this.$route.params.plugin_id
      const currentQuery = this.$route.query
      return episode => {
        const path = getProductionPath(
          currentProduction,
          section,
          episode.value,
          pluginId
        )
        if (section === 'schedule') {
          // The production schedule keeps its view state (mode, version, ...) in the URL query.
          path.query = { ...currentQuery }
        }
        if (episode.query) {
          path.query = { ...path.query, ...episode.query }
        }
        return path
      }
    }
  },

  methods: {
    optionKey(episode) {
      return episode.query
        ? `${episode.value}-${Object.values(episode.query).join('-')}`
        : episode.value
    },

    selectEpisode(episode) {
      this.$emit('input', episode.id)
      this.showEpisodeList = false
    },

    toggleEpisodeList() {
      if (this.showEpisodeList) {
        this.lastScrollPosition = this.$refs.select.scrollTop
      }
      this.showEpisodeList = !this.showEpisodeList
      if (this.showEpisodeList) {
        this.$nextTick(() => {
          this.$refs.select.scrollTo({ top: this.lastScrollPosition, left: 0 })
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dark {
  .select-input,
  .selected-episode-line,
  .episode-line,
  .episode-combo {
    background: $black;
    border-color: $dark-grey;
  }

  .select-input,
  .topbar-menuitem {
    border: 1px solid $dark-grey-light;
  }

  .episode-line {
    a {
      color: $white;
    }
  }
}

.episode-combo {
  background: $white;
  min-width: 300px;
  width: 300px;
  border: 1px solid $light-grey-light;
  user-select: none;
  cursor: pointer;
  border-radius: 3px;
  margin: 0;
  padding: 0.15em;
  position: relative;
}

.selected-episode-line {
  background: $white;
  padding: 0.4em;
  flex: 1;
  cursor: pointer;
}

.episode-menu {
  cursor: pointer;
}

.episode-line {
  background: $white;
  cursor: pointer;
  margin: 0;
  border-radius: 5px;

  a {
    color: $black;
    padding: 0.5em;
    padding-right: 0.8em;
    display: inline-block;
    width: 100%;
  }

  &:hover {
    background: var(--background-hover);
  }
}

.group-name {
  color: $grey;
  font-size: 0.9em;
  margin-top: 1em;
  padding-left: 0.5em;
  text-transform: uppercase;

  &:first-child {
    margin-top: 0.5em;
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
  position: absolute;
  border: 1px solid $light-grey-light;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  text-align: left;
  margin-left: -11px;
  max-height: min(80vh, 600px);
  min-width: 120px;
  overflow-y: auto;
  padding: 5px;
  padding-bottom: 10px;
  top: 49px;
  z-index: 300;
}

.topbar-menuitem {
  height: 42px;
  border: 1px solid $light-grey-light;
  padding-top: 7px;
  padding-left: 10px;
  padding-right: 10px;
  border-radius: 10px;

  &.topbar-menuitem-open {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
}

.more-button {
  margin-top: 0;
}
</style>
