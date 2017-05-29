<template>
  <div class="topbar">
    <div id="c-mask-user-menu" @click="toggleUserMenu()"
         v-bind:class="{'is-active': !isUserMenuHidden}"
    >
    </div>

    <nav class="nav">
      <div class="nav-left">
        <a class="nav-item sidebar-button" id="toggle-menu-button"
           @click='toggleSidebar()'
           v-bind:class="{'selected': !isSidebarHidden}">
          ≡
        </a>
        <router-link class="nav-item current-project"
           to="/">
          <img src="../assets/logo.png" />
        </router-link>
      </div>

      <div class="nav-right nav-menu">
        <div
          :class="{
            'nav-item': true,
            'user-nav': true,
            active: !isUserMenuHidden
          }"
          ref="user-name"
          @click="toggleUserMenu"
        >
          <people-avatar class="avatar" v-bind:person="user"></people-avatar>
          <people-name v-bind:person="user"></people-name>
        </div>
      </div>
    </nav>

    <nav class="user-menu" ref="user-menu" v-show="!isUserMenuHidden">
      <ul>
        <li>
          <router-link to="profile">
            Profile
          </router-link>
        </li>
        <li @click="logout">
          Logout
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import PeopleAvatar from './widgets/PeopleAvatar'
import PeopleName from './widgets/PeopleName'

export default {
  name: 'topbar',
  components: {
    PeopleName,
    PeopleAvatar
  },
  mounted () {
    const userNameWidth = this.$refs['user-name'].clientWidth
    const userMenu = this.$refs['user-menu']
    userMenu.style.width = `${userNameWidth}px`
  },
  computed: {
    ...mapGetters([
      'isSidebarHidden',
      'isUserMenuHidden',
      'user'
    ])
  },
  methods: {
    ...mapActions([
      'toggleSidebar',
      'toggleUserMenu',
      'logout'
    ]),
    logout () {
      this.$store.dispatch('logout', (err, success) => {
        if (err) console.log(err)
        if (success) this.$router.push('/login')
      })
    }
  }
}
</script>

<style scoped>
.nav {
  box-shadow: 0px 0px 6px rgba(0,0,0,0.2);
  max-height: 60px;
  min-height: 60px;
  z-index: 199;
  position: fixed;
  left: 0;
  right: 0;
}

#toggle-menu-button {
  font-size: 2em;
}

.avatar {
  margin-right: 10px;
}

.user-nav {
  cursor: pointer;
}

.user-nav.active {
  background: #5e60ba;
  color: white
}

.user-menu {
  position: fixed;
  top: 60px;
  right: 0;
  background-color: white;
  padding: 1em 1em 1em 1em;
  z-index: 203;
  box-shadow: 2px 3px 3px rgba(0,0,0,0.2);
  transition-property: all;
  transition-duration: .5s;
  transition-timing-function: cubic-bezier(0, 1, 0.5, 1);
  background: #5e60ba;
  color: white;
}

.user-menu li {
  cursor: pointer;
  padding: 0.2em;
  font-size: 1.1em;
}

.user-menu li a {
  color: white;
}

#c-mask-user-menu {
  position: fixed;
  z-index: 202;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  overflow: hidden;
  background-color: #000;
  opacity: 0;
}

#c-mask-user-menu.is-active {
  width: 100%;
  height: 100%;
}
</style>
