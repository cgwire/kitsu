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
  background-color: #36393F;
  border-color: #25282E;
  color: #EEE;
}

.dark div:hover {
  background-color: #5E6169;
}

div {
  color: black;
  width: 100%;
  padding: 0.5em;
  border-bottom: 1px solid #DDD;
  border-left: 1px solid #CCC;
  border-right: 1px solid #CCC;
}
</style>
