---
path: "/fr/start-here/getting-started"
slug: "getting-started"
published_at: 2026-09-10
prev: false
next: false
---

<script setup>
import EmbedCard from '../../../.vitepress/theme/EmbedCard.vue'
</script>

# Bien démarrer avec Kitsu

<iframe width="560" height="315" src="https://www.youtube.com/embed/iP5fp-x_7VA?si=F6Q89meflNHBaBM6" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Introduction

Kitsu est un outil de suivi de production conçu pour les studios travaillant dans la production 2D et 3D, les effets visuels, les jeux vidéo et les domaines connexes. Il est suffisamment flexible pour gérer aussi bien une publicité composée d'une seule image fixe qu'un long métrage de 3 heures.

Cette page vous guide à travers toutes les étapes nécessaires pour rendre un studio opérationnel dans Kitsu, dans l'ordre :

1. [Paramètres généraux de Kitsu](#_1-general-kitsu-settings) : configurez les paramètres communs à tout le studio, comme votre logo, vos horaires de travail et vos intégrations de messagerie
2. [Flux de travail du studio](#_2-studio-workflows) : configurez les types de tâches, les statuts et les bibliothèques qui définissent la manière dont le travail progresse dans votre studio
3. [Préparer votre équipe](#_3-preparing-your-team) : invitez des utilisateurs, affectez-les à des départements et accordez des permissions
4. [Créer une nouvelle production](#_5-create-a-new-production) : consultez les guides de démarrage rapide pour différents types de productions (séries TV, longs métrages, courts métrages, jeux vidéo, etc.) et découvrez comment ajouter des coéquipiers à une production
5. [Étapes suivantes](#_6-next-steps) : consultez les manuels spécifiques à chaque rôle pour intégrer vos superviseurs, producteurs, artistes, clients et développeurs

À la fin, vous disposerez d'un studio configuré, d'une équipe intégrée et d'une voie claire pour lancer votre première production.

## 1. Paramètres généraux de Kitsu

Commençons par personnaliser votre instance Kitsu afin qu'elle corresponde à la culture de votre studio.

Cliquez sur le bouton `Menu principal` en haut à gauche, puis, dans la section `Administration`, cliquez sur la page `Paramètres` :

![Bouton Menu principal](/fr/start-here/getting-started/screenshots/002.png)

La page répertorie les paramètres globaux qui affectent chaque production :

![Paramètres de Kitsu](/fr/start-here/getting-started/screenshots/003.png)

1. Cliquez sur le bouton **Définir le logo du studio** et sélectionnez une image pour remplacer le logo Kitsu
2. Modifiez le **Nom du studio** utilisé dans votre instance Kitsu
3. Indiquez le nombre d'heures de travail par jour pour la planification et les rapports

La section Préférences dépend de vos besoins :

1. Vous pouvez choisir d'utiliser les noms de fichiers d'origine pour les téléchargements plutôt que des noms générés automatiquement
1. Affichez par défaut les images en qualité HD si vous disposez d'une connexion Internet très rapide
1. Vous pouvez également empêcher les artistes de modifier les feuilles de temps datant de plus d'une semaine
1. Affichez les durées en heures plutôt qu'en jours si la durée des journées de travail varie
1. Activez par défaut le thème sombre ou clair

Enfin, vous trouverez également une section consacrée à différentes intégrations de messagerie. Consultez les pages [Intégration de messagerie](https://dev.kitsu.cloud/integrations/messaging/slack/) de la documentation destinée aux développeurs pour plus d'informations sur leur configuration.

![Intégrations de messagerie Kitsu](/fr/start-here/getting-started/screenshots/004.png)

::: warning
N'oubliez pas de **Enregistrer les paramètres** une fois que vous avez terminé.
:::

## 2. Flux de travail du studio

Nous devons ensuite définir la manière dont le travail progresse dans votre studio.

### Comprendre les flux de travail du studio

::: info Définition
**Flux de travail** : coordination structurée des tâches constituant les processus opérationnels au sein d'une production. Par exemple, dans une production CGI, un élément passe par une série de tâches telles que la modélisation, le rigging et le shading.

Le **flux de travail** de votre production est constitué de l'ensemble de vos [types de tâches](/fr/guides/task-configuration/managing-task-types/) et de vos [statuts de tâches](/fr/guides/task-configuration/managing-task-statuses/).
:::

::: info Définition
**Type de tâche** : catégorie de processus, comme la modélisation ou le shading
:::

::: info Définition
**Entité** : objet individuel, par exemple un élément ou un plan
:::

::: info Définition
**Tâche** : action ou activité spécifique qui doit être effectuée. Les tâches sont liées à des entités et classées par type de tâche. Chaque tâche est ensuite attribuée à un artiste.
:::

Une fois le flux de travail de vos tâches défini, l'étape suivante consiste à établir un **flux de validation** : définissez tous les statuts de tâches utilisés pour communiquer au sein de l'équipe. Les statuts de tâches permettent de suivre l'avancement de votre production.

::: info Définition
**Statut de tâche** : étape ou condition spécifique par laquelle une tâche doit passer dans le cadre du flux de révision et de validation. Exemples : Prêt à commencer, En cours, En attente de validation, À reprendre, Terminé.
:::

Tout comme vous pouvez définir un flux de travail pour les éléments (par exemple : Modélisation, Shading, Rigging), vous pouvez définir un flux de travail pour les plans, les séquences, etc.

![](/fr/img/getting-started/task_type_empty.png)

Une bibliothèque est une collection d'éléments de production réutilisables qui composent les flux de travail : départements, types de tâches, statuts de tâches et types d'éléments, que vous configurez une fois avant de les appliquer à vos projets, plutôt que de les recréer à chaque fois.

### Bibliothèque globale et bibliothèque de production

Kitsu propose deux types de bibliothèques :

| Bibliothèque | Accès | Objectif |
|---|---|---|
| **Bibliothèque globale** | Gestionnaire du studio uniquement | Source commune au studio pour les départements, les types de tâches, les statuts de tâches, les types d'éléments et les automatisations de statuts |
| **Bibliothèque de production** | Par production | Alimentée en sélectionnant des éléments dans la bibliothèque globale |

Cette séparation permet à chaque production de disposer de son propre flux de travail si nécessaire.

Commençons par configurer la bibliothèque globale :

<EmbedCard title="1. Configuration des départements" link="/fr/guides/team-management/managing-departments#setup">
<!--@include: ../../guides/team-management/managing-departments/index.md#setup-->
</EmbedCard>

<EmbedCard title="2. Configuration des types de tâches">
<!--@include: ../../guides/task-configuration/managing-task-types/index.md#setup-->
</EmbedCard>

<EmbedCard title="3. Configuration des statuts de tâches">
<!--@include: ../../guides/task-configuration/managing-task-statuses/index.md#setup-->
</EmbedCard>

<EmbedCard title="4. Configuration des types d'éléments">
<!--@include: ../../guides/production/managing-asset-types/index.md#setup-->
</EmbedCard>

<EmbedCard title="5. Configuration de l'automatisation des statuts">
<!--@include: ../../guides/task-configuration/status-automation/index.md#setup-->
</EmbedCard>

Lorsque vous créerez votre première production, vous alimenterez la **Bibliothèque de production** avec les éléments de la **Bibliothèque globale**.

## 3. Préparer votre équipe

Maintenant que vous avez défini les flux de travail de votre studio, il est temps d'organiser votre équipe afin de pouvoir attribuer les tâches aux personnes appropriées.

Nous allons apprendre à inviter des utilisateurs dans Kitsu, à les associer à des départements et à leur accorder des permissions :

<EmbedCard title="Ajouter et inviter des utilisateurs">
<!--@include: ../../guides/team-management/managing-teams/index.md#setup-->
</EmbedCard>

Lors de la création de notre première production, nous verrons ensuite comment ajouter des coéquipiers à une équipe de production afin qu'ils puissent commencer à travailler sur les tâches.

## 4. Créer une nouvelle production

Maintenant que vous avez conçu votre flux de travail global et invité d'autres personnes, il est temps de créer votre production :

- [Démarrage rapide pour les séries TV](/fr/recipes/for-tvshows/)
- [Démarrage rapide pour les longs métrages](/fr/recipes/for-feature-films/)
- [Démarrage rapide pour les courts métrages](/fr/recipes/for-shorts/)
- [Démarrage rapide pour les jeux vidéo](/fr/recipes/for-videogames/)
- [Démarrage rapide pour les productions composées uniquement de plans](/fr/recipes/shots-only-productions/)
- [Démarrage rapide pour les productions composées uniquement d'éléments](/fr/recipes/assets-only-productions/)

La dernière étape de configuration consiste à ajouter les coéquipiers du studio à la production :

<EmbedCard title="Ajouter des utilisateurs à une équipe de production">
<!--@include: ../../guides/team-management/managing-teams/index.md#addusers-->
</EmbedCard>

## 5. Étapes suivantes

- [À propos des rôles d'équipe](/fr/guides/team-management/team-roles/) - Présentation des différents rôles d'équipe et des permissions correspondantes disponibles dans Kitsu.
- [Kitsu pour les superviseurs](/fr/handbooks/for-supervisors/) - Liste des principaux flux de travail pour les superviseurs.
- [Kitsu pour les producteurs](/fr/handbooks/for-producers/) - Liste des principaux flux de travail pour les producteurs.
- [Kitsu pour les artistes](/fr/handbooks/for-artists/) - Liste des principaux flux de travail pour les artistes.
- [Kitsu pour les clients](/fr/handbooks/for-clients/) - Liste des principaux flux de travail pour les clients.
- [Kitsu pour les développeurs](https://dev.kitsu.cloud/) - Liste des ressources pour les développeurs.