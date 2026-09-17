---
path: "/fr/recipes/2d"
slug: "2d"
prev: false
next: false
published_at: 2026-09-10
---

<script setup>
import EmbedDocument from '../../../.vitepress/theme/EmbedDocument.vue'
</script>

# Kitsu pour les productions 2D

[[Concept de page sur le style de production mettant en évidence les fonctionnalités propres aux pipelines spécifiques à chaque style]]

Kitsu repose sur un modèle de données de suivi de production assez standard, et la plupart des studios 2D adaptent les paramètres par défaut. Voici comment cela se présente généralement :

## Types d'assets

Les assets sont généralement regroupés par catégorie. Pour les productions 2D, les catégories courantes sont les suivantes :

- **Personnages**
- **Accessoires**
- **Décors/Fonds** (parfois appelés « Decors » — le terme par défaut de Kitsu, hérité des racines françaises de CG Wire)
- **FX** (parfois considérés comme un type d'asset à part entière, même en 2D, pour des éléments d'effets réutilisables)

Chaque asset possède sa propre liste de tâches, et les tâches liées aux assets sont suivies séparément de celles liées aux plans.

## Types de tâches

Les types de tâches sont répartis en deux familles : **tâches d'asset** et **tâches de plan**.

**Types de tâches liées aux assets (paramètres par défaut spécifiques à la 2D) :**

- Concept / Design
- La modélisation est ignorée pour la 2D pure, mais certains studios conservent une tâche « Turnaround » ou « Model Pack »
- Couleur/Style (scripts couleur, palettes)
- Rigging (en cas d'utilisation de rigs cut-out/Toon Boom)

**Types de tâches liées aux plans (pipeline 2D courant) :**

- Storyboard
- Layout (parfois séparé en Layout Pose / Layout)
- Animation (souvent séparée en Animation Rough / Clean-up si le studio suit ces étapes séparément)
- Intervallage (parfois regroupé avec l'animation)
- Compositing
- FX
- Éclairage (moins courant en 2D plane, mais plus pertinent pour les productions hybrides 2D/3D)

## Statuts des tâches

Kitsu est livré avec un ensemble de statuts par défaut que chacun peut étendre :

- **À faire**
- **En cours (WIP)**
- **En attente d'approbation (Pending)**
- **À refaire** (renvoyé)
- **Terminé**

Les studios ajoutent souvent des statuts personnalisés tels que « En pause », « Omit » (retiré de la production) ou « En attente » pour les blocages liés aux dépendances.

## Épisodes et séquences

Pour les productions de séries 2D, la hiérarchie est généralement la suivante : **Épisode → Séquence → Plan**, les assets étant liés aux plans via le casting. Ce niveau « épisode » est particulièrement utilisé par les studios d'animation TV, contrairement aux pipelines de films ou de courts métrages, qui utilisent souvent simplement la structure Séquence → Plan.