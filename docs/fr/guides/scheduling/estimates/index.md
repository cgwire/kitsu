---
path: "/fr/guides/scheduling/estimates"
slug: "estimates"
published_at: 2026-09-10
---

# Estimations

<!-- #region body -->

Estimer le temps nécessaire pour chaque tâche peut sembler accablant, mais les avantages dépassent largement l'effort requis. En renseignant les estimations des tâches, vous pouvez :

- Voir clairement le nombre de jours estimés pour chaque tâche de votre production.
- Comparer facilement les estimations des tâches avec le temps réellement consacré, ce qui vous permet de prévoir plus précisément les tâches à l'avenir.
- Ajuster les tâches depuis le planning de l'entité ou de l'équipe une fois qu'elles disposent d'estimations, de dates de début et d'échéance.
- Aider vos artistes à rester organisés et à connaître le temps qu'ils doivent consacrer à chaque tâche.
- Améliorer les prévisions pour vos productions actuelles et futures.

Kitsu propose différentes fonctionnalités pour vous aider à suivre, vérifier et prévoir facilement les estimations des tâches. Découvrons certaines des fonctionnalités qui vous permettent de le faire.

## Ajouter une estimation à une tâche

Pour commencer, cliquez sur le nom d'un type de tâche.

![Type de tâche](/fr/img/getting-started/supervisor_tasktype.png)

Vous accéderez ensuite à la vue détaillée du type de tâche. Vous pourrez y voir la liste de toutes les tâches de ce type précis, ainsi que des informations supplémentaires.

![Page du superviseur](/fr/img/getting-started/supervisor_page.png)

Pour ajouter une estimation à une tâche, cliquez sur le champ **Estimate (Est.)** et saisissez le nombre de jours. Vous pouvez sélectionner plusieurs tâches avec **ctrl / cmd** ou **shift** et appliquer la même estimation à toutes les tâches sélectionnées.

::: tip
La durée représente le temps réellement nécessaire à l'exécution de votre tâche et est calculée automatiquement à partir du temps enregistré. Nous aborderons ce point plus en détail ultérieurement.
:::

Vous pouvez également définir une **Date de début** en cliquant dans le champ, puis en choisissant une date dans le calendrier contextuel.

La **Date d'échéance** est calculée automatiquement à partir de l'**Estimation** et de la **Date de début** indiquées.

![date de début](/fr/img/getting-started/set_estimation.png)

### Fonctionnalités de la vue détaillée du type de tâche :

Voici un résumé des cas d'utilisation et des fonctionnalités que vous pouvez exploiter depuis la vue détaillée du type de tâche.

- Voir et modifier le statut des tâches
- Affecter des personnes aux tâches
- Ajouter une estimation pour la tâche (en jours)
- Voir la somme cumulée du temps enregistré à partir de la feuille de temps d'un artiste
- Suivre le nombre d'allers-retours avec le statut de reprise
- Ajouter une date de début à la tâche à l'aide du sélecteur de calendrier
- Voir la date d'échéance générée automatiquement en fonction de la date de début et de l'estimation
- Voir les dates WIP et Feedback automatiquement renseignées
- Surveiller la section des derniers commentaires afin de suivre l'activité récente pour ce type de tâche

## Prévoir la vitesse de l'équipe et les estimations de soumission

Cliquez sur le nom d'un **Type de tâche** pour ouvrir sa page dédiée. Sur cette page, vous pouvez accéder à trois onglets : **Tasks**, **Schedule** et **Estimation**. Pour vous aider à définir des estimations précises et à prévoir la vitesse de votre équipe, nous nous concentrerons sur l'onglet **Estimation**.

![Onglet Estimation](/fr/img/getting-started/tasktype_estimation_tab.png)

La moitié gauche répertorie les tâches avec leurs affectations et le nombre d'images (1). En fonction des **FPS** définis pour la production, le nombre de **secondes** sera calculé automatiquement (2).

::: tip Definition
Les **Quotas** représentent la **vitesse de votre équipe**.

Vous pouvez voir en moyenne combien de plans, d'images ou de secondes l'artiste doit réaliser quotidiennement pour terminer toutes les tâches dans le **nombre de jours estimé**.
:::

La moitié droite affiche toute l'équipe du département (en fonction des affectations que vous avez définies), le nombre de plans à réaliser, le nombre d'images et de secondes, ainsi que le quota moyen. Vous verrez également la ligne **Remaining**, qui indique l'état actuel de votre équipe.

La dernière colonne correspond à l'**Estimation**. Pour modifier l'estimation, placez le curseur sur la ligne avec votre souris et cliquez sur la zone modifiable. Vous pouvez également sélectionner plusieurs tâches simultanément pour les modifier toutes en une seule fois.

![Modification de l'onglet Estimation](/fr/img/getting-started/tasktype_estimation_tab_edit.png)

Chaque fois que vous modifiez l'**Estimation** (en nombre de jours), vous verrez le **Quota moyen** se mettre à jour en temps réel.

Pour plus d'informations sur l'onglet **Schedule**, consultez [Task Type Schedule](../../../schedules/index.md#Set-a-Task-Estimation).

### Estimations de soumission par artiste

La page **Estimation** peut également être consultée selon une perspective individuelle par artiste.

![Estimation du superviseur](/fr/img/getting-started/supervisor_estimation.png)

À gauche, toutes les tâches sont triées par artiste, avec leur nombre d'images et de secondes. À droite, vous trouverez un résumé de votre équipe, avec une ligne par artiste indiquant le nombre total de tâches affectées, le nombre total d'images et de secondes, ainsi que le nombre total actualisé de jours estimés.

Grâce à ces informations, Kitsu peut calculer différents **Quotas** estimés : **par seconde**, **par image** et **par tâche**.

Vous pouvez maintenant renseigner la colonne **Estimation** à gauche et voir le résultat à droite. Dès que vous renseignez une **Estimation** pour une tâche, la ligne de l'artiste se met à jour à droite.

![Estimation du superviseur renseignée](/fr/img/getting-started/supervisor_estimation_filled.png)

Cela vous permet de vous assurer que la répartition des tâches entre les membres de votre équipe est équilibrée et de mieux comprendre leurs quotas estimés pour la production. Vous devez prendre en compte l'expérience de l'artiste et la difficulté de chaque tâche lors de cette opération.

## Modifier les priorités

Les priorités changent souvent au cours d'une production, et vous pouvez souhaiter signaler facilement ce changement de priorité à votre équipe.

Pour ce faire, cliquez dans l'espace situé près du statut d'une tâche (1).

![Tâche affectée](/fr/img/getting-started/task_assigned.png)

La boîte d'actions apparaîtra.

![Menu bleu](/fr/img/getting-started/blue_menu.png)

Cliquez sur l'icône du menu d'actions pour choisir **Modifier la priorité**.

![Modifier la priorité](/fr/img/getting-started/change_priority.png)

Il existe quatre niveaux de priorité : **Normale**, qui est la valeur par défaut pour toutes les tâches, **Élevée**, **Très élevée** et **Urgence**. Enregistrez les modifications avec le bouton **Confirmer**.

Comme pour la modification des statuts ou des affectations, vous pouvez modifier la priorité de plusieurs tâches simultanément en sélectionnant les tâches, puis en choisissant **Modifier la priorité des tâches sélectionnées**.

![Sélection de la priorité](/fr/img/getting-started/priority.png)

Des points d'exclamation apparaîtront maintenant à côté du statut de la tâche. Plus il y a de points d'exclamation, plus la tâche est urgente.

* (1) correspond à **Normale**
* (2) correspond à **Élevée**
* (3) correspond à **Très élevée**
* (4) correspond à **Urgence**

![Niveau de priorité](/fr/img/getting-started/priority_level.png)

<!-- #endregion body -->

