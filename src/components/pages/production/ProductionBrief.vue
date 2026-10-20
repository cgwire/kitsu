<template>
  <div class="production-brief">
    <div v-if="!isEditing" class="box section" @dblclick="openEditing">
      <p class="explanation edit-hint mb1">
        {{ $t('productions.brief.edit_hint') }}
      </p>
      <div v-if="!currentProduction?.description">
        <p>{{ $t('productions.brief.empty') }}</p>
      </div>
      <div
        class="content"
        v-html="renderMarkdown(currentProduction.description)"
        v-else
      ></div>
    </div>
    <div v-else class="box section has-text-right">
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

// State
// --------------------------------------------------------------------------
const brief = ref('')
const isEditing = ref(false)
const isLoading = ref(false)
const errors = reactive({ editBrief: false })
const textarea = useTemplateRef('textarea')

// Computed
// --------------------------------------------------------------------------
const currentProduction = computed(() => store.getters.currentProduction)
const isCurrentUserProductionManager = computed(
  () => store.getters.isCurrentUserProductionManager
)

// Functions
// --------------------------------------------------------------------------
const openEditing = () => {
  if (!isCurrentUserProductionManager.value) return
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

// Lifecycle
// --------------------------------------------------------------------------
onMounted(() => {
  brief.value = currentProduction.value?.description
})
</script>

<style lang="scss" scoped>
.production-brief {
  display: flex;
  flex: 1;
  flex-direction: column;
}

.box {
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: auto;
}

.content {
  color: var(--text-strong);
  padding-bottom: 1em;

  // The global ul rule only indents by 1em, so the bullets sit on the edge
  :deep(ul),
  :deep(ol) {
    margin: 0 0 1em;
    padding-left: 1.8em;
  }

  :deep(ul) {
    list-style-type: disc;
  }

  :deep(ol) {
    list-style-type: decimal;
  }

  :deep(li) {
    margin-bottom: 0.3em;
  }

  :deep(li > ul),
  :deep(li > ol) {
    margin: 0.3em 0 0;
  }
}

.editor {
  height: 100%;
}
</style>
