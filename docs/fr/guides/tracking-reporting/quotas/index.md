---
path: "/fr/guides/tracking-reporting/quotas"
slug: "quotas"
published_at: 2026-09-10
---

# Quotas

<!-- #region body -->

Les **quotas** visualisent la **vitesse de votre équipe**.

Un quota correspond à la quantité précise de travail ou au nombre de tâches qu'un artiste est censé accomplir dans un délai donné, afin de garantir que le projet progresse conformément au calendrier et respecte les échéances de production.

Vous pouvez voir en moyenne combien de plans, d'images ou de secondes l'artiste doit réaliser chaque jour pour terminer toutes les tâches dans le **nombre de jours estimé**.

Kitsu propose deux façons de calculer les quotas par **type de tâche**.

## Quotas basés sur les feuilles de temps

La première méthode de calcul est basée sur les feuilles de temps quotidiennes remplies par les artistes.

Les quotas sont calculés à partir du moment où l'artiste remplit sa première feuille de temps pour une tâche jusqu'à ce qu'il cesse de le faire.

Les plans sont considérés comme terminés lorsqu'une première demande de validation est effectuée.

Les quotas sont ensuite pondérés en fonction du temps consacré à la tâche, tel qu'il est enregistré dans la feuille de temps par l'artiste.

![Page des statistiques de quotas pondérés par jour](/fr/img/getting-started/quotas_day_weighted.png)

Dans cet exemple, Kitsu pondère le quota quotidien en fonction des entrées des feuilles de temps.

![Détail de la page des statistiques de quotas pondérés par jour](/fr/img/getting-started/quotas_day_weighted_detail.png)

## Quotas basés sur les changements de statut

Si aucune feuille de temps n'est remplie, Kitsu utilise les changements de statut pour estimer la durée :

- La tâche est considérée comme commencée lorsque le premier changement de statut vers WIP intervient.
- La tâche est considérée comme terminée le jour où la demande de validation (statut WFA) est effectuée.

Il s'agit des quotas First Take, ce qui signifie que les échanges de commentaires ne sont pas inclus dans le calcul.

Kitsu répartit ensuite les images terminées sur tous les jours ouvrés compris entre les dates de début et de fin. Il calcule le nombre d'images (ou de secondes ou de tâches) terminées par jour/semaine/mois et par artiste.

![Page des statistiques de quotas par jour et par statut](/fr/img/getting-started/quotas_day_status.png)

Vous pouvez cliquer à tout moment sur un nombre pour voir ses détails dans le panneau de droite.

::: danger
**Remarque** : Si aucune feuille de temps n'est remplie, Kitsu considère par défaut que :
- La tâche a commencé lors du premier changement de statut vers WIP.
- La tâche a été terminée le jour où la demande de validation a été effectuée.
:::

Cette méthode garantit que, même en l'absence de données détaillées issues des feuilles de temps, il existe un moyen fiable de suivre l'avancement des tâches et de calculer les quotas avec précision.

## Gestion des quotas des départements

Au début de la production, lors de la définition des estimations pour chaque tâche, un superviseur peut également définir les quotas estimés pour chacun de ses artistes.

Une fois une tâche approuvée, la ligne restante dans l'onglet Estimation de la page Type de tâche est mise à jour et affiche le nombre de tâches restantes ainsi que les quotas estimés mis à jour.

Vous pouvez surveiller chaque membre de l'équipe pour vérifier que ses quotas estimés restent dans la plage initialement établie.

![Quotas estimés par le superviseur](/fr/img/getting-started/supervisor_quotas_estimated.png)

Pour consulter leurs **quotas réels**, rendez-vous sur la page **Quotas**.

![Quotas](/fr/img/getting-started/supervisor_quotas.png)

La première colonne, **Moyenne**, est la plus importante. Kitsu calcule les quotas moyens pour chaque artiste par **jour**, **semaine** ou **mois**.

![Quotas hebdomadaires](/fr/img/getting-started/supervisor_quotas_week.png)

<!-- #endregion body -->

