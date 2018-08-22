<template>
  <div class="flexrow">
    <people-avatar :person="item" class="flexrow-item" :size="30"/>
    <strong>
      {{ searchText }}
    </strong>
    <span class="flexrow-item">
      {{ item.name.substring(searchText.length) }}
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
  }
}
</script>

<style scoped>
div {
  color: black;
  width: 100%;
  padding: 0.5em;
  border-bottom: 1px solid #DDD;
  border-left: 1px solid #CCC;
  border-right: 1px solid #CCC;
}
</style>
