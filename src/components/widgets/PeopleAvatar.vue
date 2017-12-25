<template>
<span class="avatar has-text-centered"
   :style="{
     background: person.color,
     width: (size || 40) +'px',
     height: (size || 40) + 'px',
     'font-size': (fontSize || 18) + 'px'
   }">
   <img
     v-lazy="person.avatarPath"
     v-if="person.has_avatar"
    />
   <span v-else>
     {{ person.initials }}
   </span>
</span>
</template>

<script>
export default {
  name: 'person-avatar',
  props: [
    'font-size',
    'person',
    'size'
  ]
}
</script>

<style scoped>
.avatar img {
  max-height: 100%;
  height: 100%;
  width: 100%;
}
.avatar {
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
}
.avatar span {
  flex: 1;
}
</style>
