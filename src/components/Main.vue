<template>
  <div class="main">
    <topbar />
    <action-topbar />
    <sidebar />
    <router-view />
  </div>
</template>

<script>
import Topbar from './Topbar'
import ActionTopbar from './ActionTopbar'
import Sidebar from './Sidebar'

export default {
  name: 'main-wrapper',
  components: {
    ActionTopbar,
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
