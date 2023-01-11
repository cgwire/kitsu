<template v-if="roomId">
  <div class="preview-room">
    <button-simple
      :text="$t('preview_room.leave_room')"
      class="preview-room-button"
      @click="leaveRoom(); openRoom()"
      v-if="joinedRoom"
    />
    <button-simple
      :text="$t('preview_room.join_room')"
      class="preview-room-button"
      @click="joinRoom"
      v-else
    />
    <people-avatar
      class="person-avatar"
      :key="personEmailMap.get(personEmail).id"
      :person="personEmailMap.get(personEmail)"
      :size="30"
      :font-size="15"
      :is-link="false"
      v-for="personEmail in room.people"
      v-if="personEmailMap.get(personEmail)"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import ButtonSimple from '@/components/widgets/ButtonSimple'
import PeopleAvatar from '@/components/widgets/PeopleAvatar'

export default {
  name: 'review-room',
  mixins: [],

  components: {
    ButtonSimple,
    PeopleAvatar
  },

  props: {
    roomId: { type: String },
    joinRoom: { type: Function },
    leaveRoom: { type: Function }
  },

  data () {
    return {
      room: {
        people: [],
        newComer: true
      }
    }
  },

  mounted () {
    this.openRoom()
  },

  beforeDestroy () {
  },

  computed: {
    ...mapGetters([
      'personEmailMap',
      'user'
    ]),

    joinedRoom () {
      if (!this.roomId) {
        return
      }
      return !!this.room.people.find(email => email === this.user.email)
    }
  },

  methods: {

    openRoom () {
      if (!this.roomId) {
        return
      }
      this.$socket.emit('preview-room:open-playlist', {
        playlist_id: this.roomId
      })
    }
  },

  watch: {
  }
}
</script>

<style lang="scss" scoped>
.preview-room {
  font-size: 1.5em;
}

.preview-room-button.button {
  background: $dark-grey-light;
  border: 1px solid $dark-grey-strong;
  border-radius: 10px;
  margin-right: 0.5em;

  &:hover {
    background: $dark-grey-lighter;
  }
}

.avatar.person-avatar {
  display: inline-flex;
  margin-right: 4px;
}
</style>
