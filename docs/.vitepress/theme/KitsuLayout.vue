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
  </Layout>
</template>