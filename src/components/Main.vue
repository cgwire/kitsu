<template>
  <div class="main">
    <topbar />
    <action-topbar />
    <sidebar />
    <router-view />
  </div>
</template>

<script>
import Topbar from '@/components/tops/Topbar'
import ActionTopbar from '@/components/tops/ActionTopbar'
import Sidebar from '@/components/sides/Sidebar'

export default {
  name: 'main-wrapper',
  components: {
    ActionTopbar,
    Topbar,
    Sidebar
  },

  mounted () {
    this.$socket.connect()
  }
}
</script>

<style>
.main {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: $white-grey;
}
</style>
