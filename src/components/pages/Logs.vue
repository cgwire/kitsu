<template>
  <div class="logs fixed-page">
    <div class="tabs logs-tabs">
      <ul>
        <li :class="{ 'is-active': isActiveTab('events') }">
          <a @click="activeTab = 'events'">
            {{ $t('logs.title') }}
          </a>
        </li>
        <li :class="{ 'is-active': isActiveTab('preview_files') }">
          <a @click="activeTab = 'preview_files'">
            {{ $t('logs.preview_files.title') }}
          </a>
        </li>
      </ul>
    </div>
    <events v-if="isActiveTab('events')" />
    <preview-files v-if="isActiveTab('preview_files')" />
  </div>
</template>

<script>
import Events from '@/components/pages/logs/Events'
import PreviewFiles from '@/components/pages/logs/PreviewFiles'

export default {
  name: 'logs',

  components: {
    Events,
    PreviewFiles
  },

  data() {
    return {
      activeTab: 'events'
    }
  },

  mounted() {
    if (this.$route.query.tab) {
      this.activeTab = this.$route.query.tab
    }
  },

  computed: {},

  methods: {
    isActiveTab(tab) {
      return this.activeTab === tab
    }
  },

  watch: {
    activeTab() {
      if (this.$route.query.tab !== this.activeTab) {
        this.$router.push({
          query: {
            tab: this.activeTab
          }
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.fixed-page {
  margin-top: 60px;
  padding: 2em;
  overflow: scroll;
}

.tabs.logs-tabs {
  overflow: visible;
  ul {
    margin-left: 0;
  }
}
</style>
