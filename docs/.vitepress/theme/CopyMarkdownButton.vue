<script setup lang="ts">
import { ref } from 'vue'
import { useData } from 'vitepress'
import { Copy } from '@lucide/vue';

const { page } = useData()
const copied = ref(false)

async function copyMarkdown() {
  const content = (page.value as any).rawContent ?? ''
  try {
    await navigator.clipboard.writeText(content)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}
</script>

<template>
  <button class="copy-md-btn" @click="copyMarkdown">
    <span v-if="copied">Copied!</span>
    <Copy v-else />
  </button>
</template>

<style scoped>
.copy-md-btn {
  padding: 6px 12px;
  font-size: 13px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  margin-bottom: 2rem;
  margin-top: 2rem;
  width: 4rem;
  text-align: center;
  display: flex;
  justify-content: center;
}
.copy-md-btn:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}
</style>