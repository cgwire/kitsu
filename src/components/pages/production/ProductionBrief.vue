<template>
  <div class="production-brief">
    <div v-if="!isEditing" class="box" @dblclick="openEditing">
      <div v-if="!currentProduction?.description">
        <p>{{ $t('productions.brief.empty') }}</p>
      </div>
      <div
        class="content"
        v-html="renderMarkdown(currentProduction.description)"
        v-else
      ></div>
    </div>
    <div v-else class="box has-text-right">
      <textarea-field
        class="editor"
        ref="textarea"
        input-class="textarea"
        @keyup.ctrl.enter="editBrief"
        v-model="brief"
      />
      <p v-if="errors.editBrief" class="error mt1 has-text-right">
        {{ $t('productions.brief.edit_error') }}
      </p>
      <p>
        <button-simple
          :is-primary="true"
          :is-loading="isLoading"
          :disabled="isLoading"
          :text="$t('main.save')"
          @click="editBrief"
        />
      </p>
    </div>
  </div>
</template>

<script setup>
import {
  computed,
  nextTick,
  onMounted,
  reactive,
  ref,
  useTemplateRef
} from 'vue'
import { useStore } from 'vuex'

import { renderMarkdown } from '@/lib/render'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import TextareaField from '@/components/widgets/TextareaField.vue'

const store = useStore()

const brief = ref('')
const isEditing = ref(false)
const isLoading = ref(false)
const errors = reactive({ editBrief: false })
const textarea = useTemplateRef('textarea')

const currentProduction = computed(() => store.getters.currentProduction)
const isCurrentUserManager = computed(() => store.getters.isCurrentUserManager)

onMounted(() => {
  brief.value = currentProduction.value?.description
})

const openEditing = () => {
  if (!isCurrentUserManager.value) return
  isEditing.value = true
  nextTick(() => {
    textarea.value?.focus()
  })
}

const editBrief = async () => {
  isLoading.value = true
  errors.editBrief = false
  try {
    await store.dispatch('editProduction', {
      id: currentProduction.value.id,
      description: brief.value
    })
    isEditing.value = false
  } catch {
    errors.editBrief = true
  }
  isLoading.value = false
}
</script>

<style lang="scss" scoped>
.dark {
  .content {
    color: $white;
  }
}

.production-brief {
  flex: 1;
}

.box {
  display: flex;
  flex: 1;
  flex-direction: column;
  height: calc(100% - 20px);
  max-width: 800px;
  overflow: auto;
  margin-bottom: 0.5em;
}

.content {
  padding-bottom: 1em;
}

.editor {
  height: 100%;
}
</style>
