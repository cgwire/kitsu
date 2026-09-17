---
path: "/fr/guides/task-configuration/status-automation"
slug: "status-automation"
published_at: 2026-09-10
---

# Automatisation des statuts

## Créer une nouvelle automatisation de statut

<!-- #region setup -->

Une **Automatisation de statut** définit des règles ou des conditions qui déclenchent automatiquement des changements de statut des tâches en fonction de critères prédéfinis. Vous pouvez configurer une **Automatisation de statut** pour les tâches d’assets et de plans.

Pour les assets, vous pouvez établir des **Automatisations de statut** entre les tâches. Par exemple, lorsque le statut de la tâche de conception est défini sur `done`, le statut de la tâche de modélisation en aval est automatiquement changé en `ready`.

Vous pouvez également créer des **Automatisations de statut** qui mettent à jour le **Statut de l’asset** en fonction des statuts des tâches. Par exemple, lorsque la tâche de conception est définie sur `done`, le statut de l’asset associé est défini sur ``layout``.

::: tip
Vous pouvez également demander à Kitsu de **copier la dernière prévisualisation** avec l’automatisation.
:::

Accédez au menu principal et sélectionnez **Automatisations** :

![Main menu Status Automation](/fr/guides/task-configuration/managing-task-statuses/screenshots/001.png)

Depuis cette page, vous pouvez créer des **Automatisations de statut** en cliquant sur le bouton `+ Ajouter une automatisation de statut` :

![create Status Automation](/fr/img/getting-started/status_automation_empy.png)

Vous avez la possibilité de créer une **Automatisation de statut** pour un **asset** ou un **plan**.

Ensuite, vous pouvez sélectionner le **type de tâche** et le **statut** qui déclencheront l’automatisation.

Vous pouvez spécifier quel **Type de tâche** répondra à l’automatisation et sélectionner le **Statut** qui sera modifié.

![detail create status automation](/fr/img/getting-started/add_status_automation.png)

Vous devez remplacer le déclencheur « Statut » par **Prêt pour** afin d’initier le changement du statut **Prêt pour**.

Vous remarquerez que le **Type de tâche appliqué** affiche désormais **Type de tâche de plan**.

![detail create status automation Ready For](/fr/img/getting-started/add_status_automation_readyfor.png)

Pour créer une **Automatisation de statut** pour les plans, vous devez modifier le **Type d’entité** en plans.

Votre nouvelle **Automatisation de statut** est maintenant créée dans votre **Bibliothèque globale**.

::: warning
Vous devez ajouter les automatisations de statut à votre **Bibliothèque de production** une fois votre production créée.
:::

::: tip
À tout moment pendant la production, vous pouvez revenir ici et créer davantage d’**Automatisations de statut** si nécessaire, puis les ajouter à votre production.
:::

<!-- #endregion setup -->

## Ajouter une automatisation de statut à une production

Dans le **Menu de navigation**, sélectionnez **Paramètres** dans le menu déroulant.

![Drop Down menu Setting](/fr/img/getting-started/drop_down_menu_setting.png)

Par défaut, Kitsu ne chargera aucune **automatisation de statut** de votre
**Bibliothèque globale** d’automatisations de statut dans votre **Bibliothèque de production**.

![Setting Task Type new](/fr/img/getting-started/setting_auto_new.png)

Cependant, vous pouvez utiliser uniquement certaines **Automatisations de statut**, en fonction du type de votre production.

Dans l’onglet **Automatisation de statut**, vous pouvez choisir les automatisations que vous souhaitez utiliser pour cette production,
puis valider votre choix avec le bouton **Ajouter**.

![Setting Add Task Type](/fr/img/getting-started/setting_auto_add.png)