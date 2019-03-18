<template>
<nav class="pagination is-centered">
  <a
    @click="onPreviousClick"
    :class="{
    'pagination-previous': true,
    'is-disabled': page === 1
  }">
    Previous page
  </a>
  <span class="pagination-list">{{ page }} / {{ nbPages }}</span>
  <a
    @click="onNextClick"
    :class="{
    'pagination-next': true,
    'is-disabled': page === nbPages
  }">
    Next page
  </a>
</nav>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'pagination',
  props: [
    'onPreviousClick',
    'onNextClick',
    'page',
    'nbPages'
  ],
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

<style lang="scss" scoped>
</style>
