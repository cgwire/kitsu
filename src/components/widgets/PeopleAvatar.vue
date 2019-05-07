<template>
  <span
    class="avatar has-text-centered"
    :style="{
      background: person.color,
      width: size +'px',
      height: size + 'px',
      'min-width': size +'px',
      'min-height': size + 'px',
      'font-size': person.has_avatar ? 0 : fontSize + 'px'
    }"
    v-if="isLink"
  >
    <router-link
      :to="{
        name: 'person',
        params: {
          person_id: person.id
        }
      }"
      :title="person.full_name"
      class="avatar-link"
    >
      <img
        :src="avatarPath"
        v-if="person.has_avatar && noCache"
      />
      <img
        v-lazy="avatarPath"
        :key="avatarKey"
        v-else-if="person.has_avatar"
      />
      <span
        v-if="!person.has_avatar"
      >
       {{ initials }}
      </span>
    </router-link>
  </span>

<span
   class="avatar has-text-centered"
   :title="person.full_name"
   :style="{
     background: person.color,
     width: size +'px',
     height: size + 'px',
     'font-size': fontSize + 'px'
   }"
   v-else
>
  <img
    :src="avatarPath"
    v-if="person.has_avatar && noCache"
  />
  <img
    v-lazy="person.avatarPath"
    v-else-if="person.has_avatar"
  />
  <span v-else>
    {{ initials }}
  </span>
</span>
</template>

<script>
export default {
  name: 'person-avatar',

  data () {
    return {
      avatarPath: '',
      avatarKey: '',
      initials: ''
    }
  },

  props: {
    person: {
      type: Object,
      default: () => ({
        id: 'empty', color: '#FFF'
      })
    },
    size: { type: Number, default: 40 },
    'font-size': { type: Number, default: 18 },
    'is-link': { type: Boolean, default: true },
    'no-cache': { type: Boolean, default: false }
  },

  created () {
    this.reloadAvatar()
  },

  methods: {
    reloadAvatar () {
      this.avatarPath =
        this.person.avatarPath + '?unique=' + this.person.uniqueHash
      this.avatarKey =
        this.person.id + '-' + this.person.uniqueHash
    }
  },

  mounted () {
    this.initials = this.person.initials
  },

  watch: {
    person () {
      this.reloadAvatar()
    }
  }
}
</script>

<style lang="scss" scoped>
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
  justify-content: center;
}

.avatar span {
  flex: 1;
}

.avatar a {
  padding: 0;
  margin: 0;
  color: white;
}

.flexrow-item {
  margin-right: 10px;
}
</style>
