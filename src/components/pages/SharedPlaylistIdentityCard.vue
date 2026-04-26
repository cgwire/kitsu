<template>
  <div class="identity-card">
    <div class="identity-header">
      <img class="kitsu-logo" src="@/assets/kitsu.png" alt="Kitsu" />
      <h1 class="title">{{ playlistName }}</h1>
      <p class="description">
        {{ $t('share.identity_description') }}
      </p>
    </div>
    <form class="identity-form" @submit.prevent="onSubmit">
      <text-field
        :label="$t('share.your_name')"
        :placeholder="$t('share.name_placeholder')"
        v-model.trim="guestName"
        required
      />
      <p v-if="errorMessage" class="identity-error" role="alert">
        {{ errorMessage }}
      </p>
      <div class="has-text-centered mt2">
        <button class="button is-primary" type="submit" :disabled="!guestName">
          {{ $t('share.enter_review') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import TextField from '@/components/widgets/TextField.vue'

defineProps({
  errorMessage: { type: String, default: '' },
  playlistName: { type: String, required: true }
})

const guestName = defineModel('guestName', {
  type: String,
  default: ''
})

const emit = defineEmits(['submit'])

const onSubmit = () => {
  if (!guestName.value) return
  emit('submit')
}
</script>

<style lang="scss" scoped>
.description {
  color: rgba(244, 245, 250, 0.6);
  font-size: 0.95em;
  line-height: 1.55;
}

.identity-card {
  backdrop-filter: blur(20px);
  background: rgba(29, 29, 38, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  max-width: 440px;
  padding: 2.8em 2.5em;
  text-align: center;
  width: 100%;
}

.identity-error {
  color: #f56565;
  font-size: 0.9em;
  line-height: 1.4;
  margin: 0.75em 0 0;
}

.identity-form {
  text-align: left;

  .button.is-primary {
    background: #7c5cff;
    border: 0;
    border-radius: 999px;
    box-shadow: 0 6px 20px rgba(124, 92, 255, 0.35);
    color: white;
    font-weight: 600;
    padding: 0.7em 2em;
    transition: all 0.2s ease;

    &:disabled {
      box-shadow: none;
      opacity: 0.5;
    }

    &:hover:not(:disabled) {
      box-shadow: 0 8px 28px rgba(124, 92, 255, 0.55);
      transform: translateY(-1px);
    }
  }

  :deep(input) {
    background: rgba(14, 14, 19, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    color: #f4f5fa;
    padding: 0.7em 0.9em;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;

    &::placeholder {
      color: rgba(244, 245, 250, 0.4);
    }

    &:focus {
      border-color: rgba(124, 92, 255, 0.5);
      box-shadow: 0 0 0 3px rgba(124, 92, 255, 0.16);
      outline: none;
    }
  }

  :deep(label) {
    color: rgba(244, 245, 250, 0.75);
  }
}

.identity-header {
  margin-bottom: 2em;
}

.kitsu-logo {
  margin-bottom: 1.2em;
  width: 56px;
}

.title {
  color: #f4f5fa;
  font-size: 1.5em;
  font-weight: 700;
  letter-spacing: -0.01em;
  margin-bottom: 0.5em;
}
</style>
