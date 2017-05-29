<template>
  <div class="main">
    <topbar></topbar>
    <sidebar></sidebar>
    <router-view></router-view>
  </div>
</template>

<script>
import Topbar from './Topbar'
import Sidebar from './Sidebar'

export default {
  name: 'main',
  components: {
    Topbar,
    Sidebar
  }
}
</script>

<style>
.main {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #EEE;
}
</style>
