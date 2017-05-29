<template>
  <div class="server-down page">
    <h1 class="title">Kitsu encountered an error while reching its server.</h1>
    <p>
      Sorry but the server is not reachable. Please contact your system
      administrator or your IT department to understand what is going wrong.
    </p>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'server-down',
  computed: {
    ...mapGetters([
    ])
  },
  methods: {
    ...mapActions([
    ])
  }
}
</script>

<style scoped>
</style>
