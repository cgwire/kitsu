<template>
  <td scope="row">
    <div class="flexrow">
      <people-avatar :person="person" />
      <people-name with-link :person="person" />
    </div>
  </td>
</template>

<script setup>
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import PeopleName from '@/components/widgets/PeopleName.vue'

defineProps({
  person: { type: Object, required: true }
})
</script>

<style lang="scss" scoped>
.flexrow {
  gap: 0.6em;
}
</style>
