---
path: "/fr/recipes/tvshows"
slug: "tvshows"
prev: false
next: false
published_at: 2026-09-10
---

<script setup>
import EmbedDocument from '../../../.vitepress/theme/EmbedDocument.vue'
</script>

# Kitsu pour les productions de séries télévisées

[[Concept pour une page dédiée au type de production mettant en avant les fonctionnalités des pipelines spécifiques à chaque type + un guide de démarrage rapide pour atteindre plus rapidement le moment « aha » https://mercury.com/blog/identifying-product-aha-moment]]

## Démarrage rapide

### 1. Créer une nouvelle production

<EmbedDocument link="/fr/guides/production-structure/manage-productions/#create-a-new-production">
<!--@include: ../../guides/production-structure/manage-productions/index.md#setup-->
</EmbedDocument>

### 2. Créer un asset

<EmbedDocument link="/fr/guides/production/manage-assets/#create-an-asset">
<!--@include: ../../guides/production/manage-assets/index.md#setup-->
</EmbedDocument>

### 3. Créer un épisode

<EmbedDocument link="/fr/guides/production-structure/manage-episodes/">
<!--@include: ../../guides/production-structure/manage-episodes/index.md#setup-->
</EmbedDocument>

### 4. Créer un plan

<EmbedDocument link="/fr/guides/production-structure/manage-shots/">
<!--@include: ../../guides/production-structure/manage-shots/index.md#setup-->
</EmbedDocument>

### 5. Prochaines étapes

- [Inviter votre équipe](/fr/guides/team-management/managing-teams/#adding-users-to-a-production-team)
- [Attribuer votre première tâche](/fr/guides/production/assign-tasks/)

## Fonctionnalités pour les séries télévisées

### L’épisode en tant qu’entité structurelle

Seules les productions de séries télévisées disposent d’épisodes comme couche organisationnelle distincte. Les plans et les assets sont séparés par épisode, et les menus déroulants de navigation permettent de basculer entre la production, l’épisode ou l’entité. Dans une production de long métrage, il n’existe pas de couche épisode — uniquement des séquences/plans.

### Champ Épisode obligatoire lors de l’importation CSV

Lors de l’importation groupée de plans ou d’assets, la colonne Épisode est obligatoire uniquement pour les productions de séries télévisées — elle n’est pas requise lors d’une importation pour un long métrage.

### Vues de progression et playlists limitées à un épisode

Les tableaux de bord de progression et les playlists de révision sont organisés par épisode plutôt que par séquence : les producteurs obtiennent une vue d’ensemble de la progression de tous les épisodes et peuvent effectuer la révision complète d’un épisode au moyen d’une seule playlist avec des collaborateurs externes. (La page équivalente consacrée aux longs métrages décrit le même mécanisme, mais organisé par séquence — il s’agit donc du même outil sous-jacent, simplement structuré autour de l’unité épisode.)