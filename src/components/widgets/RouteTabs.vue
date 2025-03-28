<template>
  <div class="tabs">
    <ul>
      <li
        :key="`task-type-tab-${tab.name}`"
        :class="{ 'is-active': tab.name === activeTab }"
        v-for="tab in tabs"
      >
        <router-link
          :to="{
            query: { ...$route.query, tab: tab.name }
          }"
        >
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
    tabs: {
      type: Array,
      default: () => []
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
