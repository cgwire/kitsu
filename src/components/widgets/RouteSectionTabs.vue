<template>
  <div class="tabs">
    <ul>
      <li
        :key="`task-type-tab-${tab.name || tab.value}`"
        :class="{
          'is-active': tab.name === activeTab || tab.value === activeTab
        }"
        v-for="tab in tabs"
      >
        <router-link :to="getRoute(tab)">
          {{ tab.label }}
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'route-section-tabs',

  props: {
    activeTab: {
      type: String,
      default: ''
    },
    route: {
      type: Object,
      default: () => {}
    },
    tabs: {
      type: Array,
      default: () => []
    }
  },

  methods: {
    getRoute(tab) {
      return {
        ...this.route,
        query: {
          ...this.route.query,
          section: tab.name || tab.value
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.tabs ul {
  margin-left: 0;
  margin-right: 0;
}
.tabs li + li {
  margin: 0;
}
</style>
