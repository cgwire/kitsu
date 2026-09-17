---
path: "/fr/guides/tracking-reporting/ensure-tasks-on-time"
slug: "ensure-tasks-on-time"
published_at: 2026-09-10
---

# S'assurer que les tâches sont réalisées à temps

<!-- #region body -->

Pour savoir si une tâche est réalisée à temps, vous avez besoin de deux éléments :
- Le **Type de tâche** de la tâche
- Une **Estimation** (devis) en jours, ainsi qu'une **Date de début** et une **Date d'échéance** estimées pour la tâche.

Une fois ces informations saisies, vous pouvez **comparer l'estimation à la réalité** sur la page du type de tâche.

![Type de tâche renseigné](/fr/img/getting-started/task_type_schedule_due_date.png)

## Méthodes pour comparer les estimations et les résultats réels

Il existe deux principales façons de procéder :
1. **Filtrer par statut d'échéance**
2. **Utiliser le diagramme de Gantt**

::: tip
Kitsu récupère automatiquement la date et le statut de **WIP** (en cours de production) et de **WFA** (en attente de validation). Vous pouvez comparer votre **date de début estimée** à **la date à laquelle l'artiste commence réellement**, et comparer la **date d'échéance estimée** à **la date à laquelle l'artiste demande une validation**.
:::

## Filtrer par statut d'échéance

Dans l'onglet **Tâches**, le premier filtre que vous voyez est **Statut de l'échéance**. Sélectionnez **Échéance avant aujourd'hui** pour afficher toutes les tâches dont la **Date d'échéance** est **antérieure à aujourd'hui**.

Ensuite, pour déterminer ce qui est terminé et ce qui doit encore l'être, utilisez le filtre **-Terminé** afin d'exclure les tâches terminées.

![Type de tâche avec une échéance antérieure à aujourd'hui](/fr/img/getting-started/task_type_due_before.png)

Cela affichera toutes les tâches en retard avec les deux filtres appliqués, ce qui signifie qu'elles ont été validées après la **Date d'échéance estimée**. Le récapitulatif en bas de la page se met à jour en temps réel selon les filtres appliqués.

Vous pouvez exporter cette page au format `CSV` et l'ouvrir avec un tableur.

## Utiliser le filtre de statut de retard

Le filtre **Statut de retard** intégré à la page vous aide à voir immédiatement quelles tâches ont pris plus de temps que prévu (**Estimation supérieure à la durée**).

![Type de tâche : estimation supérieure à la durée](/fr/img/getting-started/task_type_estimation_duration.png)

Filtrez les tâches en retard à l'aide de l'option **Échéance dépassée**. Il existe deux façons de calculer si une tâche est en retard :
1. **Date d'échéance estimée** par rapport aux **retours**
2. **Date d'échéance estimée** par rapport à **Terminé**

Selon la méthode de calcul de votre studio, Kitsu vous donnera la réponse.

![Type de tâche : retard par rapport aux retours](/fr/img/getting-started/task_type_late_feedback.png)

## Utiliser le diagramme de Gantt

Sur la **page du type de tâche**, accédez à l'onglet **Planning**. Les dates de **Début** et de **Fin** de ce type de tâche, telles qu'elles sont définies dans le planning de production, sont visibles en haut de l'écran.

Le **diagramme de Gantt** sera gris foncé avant et après ces dates, fournissant un repère visuel pour le calendrier des tâches.

![Planning du type de tâche](/fr/img/getting-started/task_type_schedule_emplty.png)

Modifiez la **Coloration**, en passant de **Couleur du statut** à **Retard en rouge**. Les tâches s'afficheront en **gris** si elles sont dans les temps et en **rouge** si elles sont en retard.

![Planning du type de tâche en retard](/fr/img/getting-started/task_type_schedule_coloring_late.png)

Vous pouvez revenir à l'onglet **Tâches** pour obtenir plus de détails ; Kitsu conservera vos filtres d'un onglet à l'autre.

<!-- #endregion body -->