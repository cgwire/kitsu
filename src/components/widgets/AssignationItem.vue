<template>
  <div class="flexrow">
    <people-avatar
      :no-cache="true"
      :person="item"
      :size="30"
      class="flexrow-item"
    />
    <span class="flexrow-item">
      {{ item.name }}
    </span>
  </div>
</template>

<script>
import PeopleAvatar from './PeopleAvatar'

export default {
  name: 'assignation-item',

  components: {
    PeopleAvatar
  },

  props: {
    item: { required: true },
    searchText: { required: true }
  },

  computed: {
    nonHighilightedText () {
      if (this.searchText === this.item.first_name) {
        return '&nbsp;' + this.item.name.substring(this.searchText.length)
      } else {
        return this.item.name.substring(this.searchText.length)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dark div {
  background-color: $dark-grey-light;
  border-color: $dark-grey;
  color: $white-grey;
}

.dark div:hover {
  background-color: $dark-grey-lightest;
}

div {
  color: black;
  width: 100%;
  padding: 0.5em;
  border-bottom: 1px solid #DDD;
  border-left: 1px solid $light-grey;
  border-right: 1px solid $light-grey;
}
</style>
