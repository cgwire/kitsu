<template>
<router-link :to="'/people/' + person.id" v-if="isLink">
  <span class="avatar has-text-centered"
     :style="{
       background: person.color,
       width: size +'px',
       height: size + 'px',
       'font-size': fontSize + 'px'
     }">
     <img
       v-lazy="person.avatarPath"
       v-if="person.has_avatar"
      />
     <span v-else>
       {{ person.initials }}
     </span>
  </span>
</router-link>

<span
   class="avatar has-text-centered"
   :style="{
     background: person.color,
     width: size +'px',
     height: size + 'px',
     'font-size': fontSize + 'px'
   }"
   v-else
>
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
  props: {
    person: { type: Object, default: () => { return { color: '#FFF' } } },
    size: { type: Number, default: 40 },
    'font-size': { type: Number, default: 18 },
    'is-link': { type: Boolean, default: true }
  }
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
