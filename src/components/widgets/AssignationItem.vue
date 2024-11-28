<template>
  <div class="flexrow">
    <people-avatar
      :is-link="false"
      :person="item"
      :size="30"
      :font-size="14"
      class="flexrow-item"
    />
    <span class="flexrow-item" v-html="label"></span>
  </div>
</template>

<script>
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'

export default {
  name: 'assignation-item',

  components: {
    PeopleAvatar
  },

  props: {
    item: {
      type: Object,
      required: true
    },
    search: {
      type: String
    }
  },

  computed: {
    label() {
      const text = this.item.name.trim()
      const search = this.search.trim()
      return !search
        ? text
        : text.replace(RegExp(this.regExpEscape(search), 'gi'), '<b>$&</b>')
    }
  },

  methods: {
    regExpEscape(string) {
      return string.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&')
    }
  }
}
</script>
