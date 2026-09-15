<script setup>
import DefaultTheme from 'vitepress/theme'

import NavbarSignupButton from "./NavbarSignupButton.vue"

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #nav-bar-content-after>
      <NavbarSignupButton/>
    </template>

    <template #doc-before>
      <div class="btn-container">
        <div class="btn-group"></div>
        <div class="btn-group"></div>
        <div class="btn-group">
          <CopyMarkdownButton />
        </div>
      </div>
    </template>

    <template #doc-after>
      <div class="btn-container">
        <div class="btn-group"></div>
        <div class="btn-group"></div>
        <div class="btn-group">
          <CopyMarkdownButton />
        </div>
      </div>
    </template>
  </Layout>
</template>

<style scoped>
.btn-container {
  display: flex;
  justify-content: space-between;
}
</style>