<template>
  <div class="tabs">
    <ul>
      <li
        :key="`task-type-tab-${tab.name}`"
        :class="{ 'is-active': tab.name === activeTab }"
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
  name: 'route-tabs',

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
          section: tab.name
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
