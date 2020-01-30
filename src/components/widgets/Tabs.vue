<template>
<div>
  <div class="tabs">
    <ul>
      <li
        :class="{ 'is-active': tab.isActive }"
        v-for="(tab, index) in tabs"
        :key="tab.name"
        :ref="'tab-'+ index"
      >
        <a
          @click="selectTab(tab)"
        >
          {{ tab.name }}
        </a>
      </li>
    </ul>
  </div>

  <div class="tabs-details">
      <slot></slot>
  </div>
</div>
</template>

<script>
export default {
  name: 'tabs',
  data () {
    return { tabs: [] }
  },
  created () {
    this.tabs = this.$children
  },
  mounted () {
    this.$emit('update', this.tabs)
  },
  methods: {
    selectTab (selectedTab) {
      this.tabs.forEach(tab => {
        tab.isActive = (tab.name === selectedTab.name)
      })
      this.$emit('update', this.tabs)
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
