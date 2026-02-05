<template>
  <td>
    <div class="flexrow" v-if="person">
      <people-avatar :is-link="true" :person="person" />
      <div class="filler">
        <people-name class="name" :person="person" with-link />
        <div v-if="person.email && !person.is_bot" class="email nowrap">
          {{ person.email }}
          <span class="copy-icon" :title="$t('main.copy')" @click="copyEmail">
            <copy-icon :size="12" />
          </span>
        </div>
      </div>
      <span
        class="tag"
        :title="$t('profile.two_factor_authentication.enabled')"
        v-if="isCurrentUserAdmin && twoFAEnabled"
      >
        <shield-check-icon class="mr05" :size="15" /> 2FA
      </span>
    </div>
  </td>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { CopyIcon, ShieldCheckIcon } from 'lucide-vue-next'

import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import PeopleName from '@/components/widgets/PeopleName.vue'

const props = defineProps({
  person: {
    type: Object,
    required: true
  }
})

const store = useStore()

const isCurrentUserAdmin = computed(() => store.getters.isCurrentUserAdmin)

const twoFAEnabled = computed(
  () =>
    props.person?.email_otp_enabled ||
    props.person?.totp_enabled ||
    props.person?.fido_enabled
)

async function copyEmail() {
  await navigator.clipboard.writeText(props.person.email)
}
</script>

<style lang="scss" scoped>
.flexrow {
  column-gap: 0.75rem;
}

.name {
  font-weight: bold;
}

.email {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  .copy-icon {
    opacity: 0;
    cursor: pointer;
    transition:
      opacity 0.2s,
      transform 0.1s;

    &:active {
      transform: scale(0.8);
    }
  }

  &:hover .copy-icon {
    opacity: 0.5;

    &:hover {
      opacity: 1;
    }
  }
}

.tag {
  background: $light-green;
  color: $white;
  font-weight: bold;
}
</style>
