---
prev: false
next: false
---

<script setup>
import EmbedDocument from '../../.vitepress/theme/EmbedDocument.vue'
</script>

# Kitsu for 2D Productions

[[Concept for production style page highlighting features for style-specific pipelines]]

Kitsu is built around a fairly standard production-tracking data model, and most 2D studios adapt the defaults. Here's how it typically breaks down:

## Asset Types

Assets are usually grouped by category, and for 2D shows the common ones are:

- **Characters**
- **Props**
- **Sets/Backgrounds** (sometimes called "Decors" — Kitsu's default term, inherited from CG Wire's French roots)
- **FX** (sometimes treated as its own asset type even in 2D, for things like reusable effects elements)

Each asset gets its own task list, and asset tasks are tracked separately from shot tasks.

## Task Types

Task types are split into two families: **Asset tasks** and **Shot tasks**.

**Asset task types (2D-specific defaults):**

- Concept / Design
- Modeling is skipped for pure 2D, but some studios keep a "Turnaround" or "Model Pack" task instead
- Color/Style (color scripts, palettes)
- Rigging (if using cut-out/Toon Boom rigs)

**Shot task types (typical 2D pipeline):**

- Storyboard
- Layout (sometimes split into Layout Pose / Layout)
- Animation (often split into Rough Animation / Clean-up if the studio tracks those separately)
- In-betweening (sometimes merged into Animation)
- Compositing
- FX
- Lighting (less common in flat 2D, more relevant for 2D/3D hybrids)

## Task Statuses

Kitsu ships with a default status set that anyone can extend:

- **Todo**
- **Work In Progress (WIP)**
- **Waiting For Approval (Pending)**
- **Retake** (sent back)
- **Done**

Studios often add custom statuses like "On Hold," "Omit" (cut from the show), or "Standby" for dependency blocks.

## Episodes & Sequences

For 2D series work specifically, the hierarchy is usually: **Episode → Sequence → Shot**, with assets linked to shots via casting. This episode layer is one of the more heavily used features for TV animation studios versus film/short pipelines, which often just use Sequence → Shot.