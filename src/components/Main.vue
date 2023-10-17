<template>
  <XyzTransition appear xyz="fade">
    <div class="main">
      <topbar />
      <sidebar />
      <router-view />
    </div>
  </XyzTransition>
</template>

<script>
import Topbar from '@/components/tops/Topbar'
import Sidebar from '@/components/sides/Sidebar'

export default {
  name: 'main-wrapper',
  components: {
    Topbar,
    Sidebar
  },

  mounted() {
    this.$socket.connect()
  }
}
</script>

<style>
.main {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
