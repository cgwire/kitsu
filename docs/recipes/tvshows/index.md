---
prev: false
next: false
---

<script setup>
import EmbedDocument from '../../.vitepress/theme/EmbedDocument.vue'
</script>

# Kitsu for TV Show Productions

[[Concept for production type page highlighting features for type-specific pipelines + shorter quickstart to reach aha moment https://mercury.com/blog/identifying-product-aha-moment]]

## Quickstart

### 1. Create a new production

<EmbedDocument link="/guides/production-structure/manage-productions/#create-a-new-production">
<!--@include: ../../guides/production-structure/manage-productions/index.md#setup-->
</EmbedDocument>

### 2. Create an Asset

<EmbedDocument link="/guides/pre-production/manage-assets/#create-an-asset">
<!--@include: ../../guides/pre-production/manage-assets/index.md#setup-->
</EmbedDocument>

### 3. Create an Episode

<EmbedDocument link="/guides/production-structure/manage-episodes/">
<!--@include: ../../guides/production-structure/manage-episodes/index.md#setup-->
</EmbedDocument>

### 4. Create a Shot

<EmbedDocument link="/guides/production-structure/manage-shots/">
<!--@include: ../../guides/production-structure/manage-shots/index.md#create-a-shot-->
</EmbedDocument>

### 5. Next Steps

- [Invite your team](/guides/team-management/managing-teams/#adding-users-to-a-production-team)
- [Assign Your First Task](/guides/scheduling/assign-tasks/)

## TV Show Features

### Episode as a structural entity

Only TV Show productions get episodes as a distinct organizational layer. Shots and assets are separated by episode, and navigation dropdowns let you switch between production, episode, or entity. In a Feature Film production there's no episode layer — just sequences/shots.

### Mandatory Episode field on CSV import

When bulk-importing shots or assets, the Episode column is mandatory only for TV Show productions — it's not required when importing for a feature film.

### Episode-scoped progress views and playlists

The progress dashboards and review playlists are scoped to episodes rather than sequences: producers get an overview of progress across all episodes, and can run full episode reviews through a single playlist with external collaborators. (The equivalent feature-film page describes the same mechanism but scoped to sequences instead — so it's the same underlying tool, just organized around the episode unit.)