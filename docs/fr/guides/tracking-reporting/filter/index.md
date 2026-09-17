---
path: "/fr/guides/tracking-reporting/filter"
slug: "filter"
published_at: 2026-09-10
---

# Recherche avancée et filtres

<!-- #region body -->

Le filtrage consiste à récupérer sélectivement des données selon des critères ou des conditions spécifiques. Il permet aux utilisateurs de cibler facilement les informations sur lesquelles ils souhaitent se concentrer ou d'extraire des sous-ensembles de données pertinents pour les analyser.

Kitsu propose une série de fonctionnalités qui vous permettent de trouver facilement ce que vous cherchez.

## La barre de recherche

Dans **Kitsu**, les filtres sont définis via la **barre de recherche**. Elle vous permet d'**enregistrer** votre requête de recherche. Une fois cela fait, vous pouvez relancer votre requête d'un simple clic (voir [Gérer les filtres enregistrés](#gérer-les-filtres-enregistrés) ci-dessous).

![Barre de recherche](/fr/img/getting-started/filter_search_bar.png)

Vous trouverez la **barre de recherche**, le **créateur de filtres** et l'option **Enregistrer** ![Barre de
recherche](/fr/img/getting-started/filter_save_button.png) sur les pages suivantes :

* Assets
* Plans
* Séquences
* Montages
* Épisodes

NB : seules la **barre de recherche** et les filtres prédéfinis sont disponibles sur les pages suivantes :
* Ma production
* Mes tâches
* Personnes
* Statistiques des séquences
* Statistiques des épisodes
* Statistiques des types d'assets
* Quotas
* Équipe
* Page détaillée du type de tâche

::: tip
Sur les autres pages de Kitsu, vous trouverez des filtres prédéfinis.
:::

La requête de la **barre de recherche** est appliquée chaque fois qu'un nouveau caractère est saisi. Vous n'avez pas besoin de tout saisir pour obtenir rapidement un résultat.

::: warning
Le filtre est instantané, sauf pour le type de production **Feature Film**.
Kitsu s'attend à gérer des milliers d'éléments. Pour accélérer le processus, vous devez saisir votre recherche et appuyer sur **Entrée** pour l'appliquer.
:::

### Syntaxe et exemples de recherche

Par exemple, sur la page des assets, saisissez les lettres `Ot` pour obtenir tous les assets commençant par `Ot`.

![Résultat de la barre de recherche](/fr/img/getting-started/filter_autocompletion.png)

Vous pouvez également rechercher un **type d'asset** spécifique : `Props`, `Character`, `Environment`, `Fx`... Le résultat affiche tous les assets de ce type.

Par exemple, recherchons tous les assets de type **FX**.

![Recherche par type d'asset](/fr/img/getting-started/filter_asset_type.png)

Un autre exemple consiste à afficher la **page des plans** d'une **séquence** spécifique. Par exemple, vous pouvez afficher uniquement les plans de la deuxième séquence du premier épisode.

Sélectionnez le premier épisode dans le menu déroulant, puis recherchez `sq002` ; le résultat affiche tous les plans de tous les épisodes de la séquence SQ002.

![Recherche dans la barre de recherche par séquence et épisode](/fr/img/getting-started/filter_ep_seq.png)

De la même manière, vous pouvez rechercher un **statut spécifique** associé à une tâche.

::: tip
Vous pouvez créer des **filtres** concernant les **entités** sur toutes les pages :

* **Séquences** : `se01`, `se02`, etc. ou exclure : `-se01`, `-se02`, etc.
* **Type d'asset** : `characters`, `environment`, `fx`, etc., ou exclure `-characters`, `-fx`, etc.

Vous pouvez également créer des **filtres** concernant le **statut d'une tâche** en suivant cette syntaxe : **task=status** sur la page globale des entités.

Exemples :

* Le layout est en cours (wip) : `layout=wip.`
* Le concept est en attente d'approbation (wfa), uniquement pour les fx : `concept=wfa fx.`
* Sur la séquence 2, le layout est en wip : `se02 layout=wip`
* L'animation est à reprendre et le rendu est en attente d'approbation (wfa) : `animation=retake render=wfa`.

Sur la **page détaillée du type de tâche**, vous pouvez filtrer en saisissant uniquement :
- Statut : `wip` ou exclure `-done`, plusieurs statuts `[wfa] [retake].`
- Nom d'un artiste : `Alicia` ou exclure `-Paul`

Vous pouvez combiner tous les filtres :

`[wfa] [retake] -alicia 020.`
:::

## Créer des filtres

### Utiliser le créateur de filtres

La manière la plus simple d'effectuer un filtrage plus avancé consiste à utiliser le créateur de filtres. Cliquez sur l'icône **Créateur de filtres** illustrée ci-dessous pour commencer.

![Bouton de création de filtre](/fr/img/getting-started/filter_builder.png)

Vous pouvez ensuite utiliser la boîte de dialogue interactive du créateur de filtres pour définir les critères de filtrage souhaités.

![Boîte de dialogue de création de filtre](/fr/img/getting-started/filter_builder_example04.png)

::: warning
La première option, **Correspondre à tous les filtres suivants**, utilisera toutes les options que vous sélectionnez dans le créateur de filtres :

- Statut de la tâche
- Métadonnées
- Attribution
- Présence d'une miniature
- Priorité
- Prêt pour / Les assets sont prêts

La deuxième option, **Correspondre à l'un des filtres suivants**, ignorera l'option de filtre indisponible.
:::

### Filtrer par statut de tâche

Le **statut de la tâche** vous aide à filtrer un type de tâche par statut.

- **Égal à** affichera toutes les tâches ayant ce statut pour ce type de tâche
- **Différent de** affichera toutes les tâches **sauf** celles ayant ce statut
- **Dans** affichera toutes les tâches ayant l'ensemble des statuts sélectionnés

Vous pouvez utiliser le bouton **-** pour supprimer l'un des statuts sélectionnés.

Vous pouvez utiliser le bouton **+** sous le statut pour ajouter d'autres statuts.

![Exemple de création de filtre 01](/fr/img/getting-started/filter_builder_double_status.png)

::: tip
Si vous souhaitez filtrer le statut de plusieurs types de tâches, cliquez sur le bouton **+** sous l'option de statut de tâche dans la partie gauche de l'écran.

![Exemple de création de filtre 01](/fr/img/getting-started/filter_builder_double_status01.png)
:::

### Filtrer par métadonnées

Le filtre **Métadonnées** vous permet de filtrer votre page en fonction des informations des colonnes supplémentaires.

- **Égal à** affichera toutes les tâches contenant cette information dans cette colonne de métadonnées
- **Différent de** affichera toutes les tâches **sauf** celles contenant cette information
- **Dans** affichera toutes les tâches contenant l'ensemble des informations sélectionnées

![Création de filtre par métadonnées](/fr/img/getting-started/filter_builder_metadata.png)

::: tip
Si vous souhaitez filtrer des éléments selon plusieurs métadonnées, vous pouvez cliquer sur le bouton **+** sous l'option Métadonnées dans la partie gauche de l'écran.

![Exemple de création de filtre 01](/fr/img/getting-started/filter_builder_metadata2.png)
:::

### Filtrer par attribution

Cette option concerne les personnes et les attributions.

- Aucun filtre : vous ne recherchez aucune personne
- Attribué à : vous permet de rechercher la tâche attribuée à une personne pour un type de tâche spécifique
- Non attribué à : vous permet de rechercher la tâche qui n'est pas attribuée à une personne pour un type de tâche spécifique
- Des attributions existent pour : affichera toutes les tâches d'un type de tâche spécifique avec une attribution
- Aucune attribution n'existe pour : affichera toutes les tâches d'un type de tâche spécifique sans attribution

::: warning
Vous ne pouvez filtrer l'attribution que pour **UN** type de tâche et **UNE** personne.

Vous ne pouvez pas ajouter plusieurs filtres d'attribution.
:::

### Filtrer par miniature

Par défaut, ce filtre est défini sur **Aucun filtre**, ce qui signifie que Kitsu ne vérifiera pas si une miniature est présente.

Vous avez ensuite le choix entre :
- Avec miniature : affiche toutes les entités possédant une miniature
- Sans miniature : affiche toutes les entités ne possédant pas de miniature

### Filtrer par priorité

Vous pouvez filtrer un type de tâche selon un niveau de priorité spécifique.

::: tip
Pour en savoir plus sur les priorités, consultez
[Modifier les priorités](../estimation/index.md#change-priorities)
:::

Commencez par sélectionner votre type de tâche, puis choisissez entre :
- **Normale** (le niveau de priorité par défaut)
- **Élevée**
- **Très élevée**
- **Urgence**

::: warning
Vous ne pouvez filtrer la priorité que pour **UN** type de tâche et **UN** niveau de priorité.

Vous ne pouvez pas ajouter plusieurs filtres de priorité.
:::

### Utiliser le statut « Prêt pour »

Selon que vous effectuez le filtrage sur la page globale des assets ou des plans, vous pouvez filtrer selon le statut **Prêt pour**.

- Sur la page des assets, vous rechercherez la colonne **Prêt pour**.
- Sur la page des plans, vous vérifierez si tous les assets de ces tâches sont prêts (voir Créer votre production).

::: warning
Vous ne pouvez filtrer **Prêt pour** que pour **UN** type de tâche.

Vous ne pouvez pas ajouter plusieurs filtres **Prêt pour**.
:::

## Gérer les filtres enregistrés

Kitsu vous permet d'enregistrer n'importe quelle requête de filtre afin de la réutiliser ultérieurement. Enregistrez une requête en appuyant sur **Entrée** ou en cliquant sur le bouton **Enregistrer** ![Bouton Enregistrer](/fr/img/getting-started/filter_save_button.png).

Une fois enregistrée, votre requête apparaît sous forme de bouton sous la **barre de recherche**.

![Recherche enregistrée](/fr/img/getting-started/filter_saved.png)

::: tip
Remarquez la première icône à gauche et les boutons colorés.

Elle vous permet de créer un groupe de filtres. Vous pouvez ainsi organiser vos filtres enregistrés dans un groupe coloré.

![Ajouter un groupe de filtres](/fr/img/getting-started/filter_group_new.png)
:::

Ces boutons sont présents chaque fois que vous revenez sur cette page. Ils vous aident à exécuter plus rapidement les requêtes courantes.

## Renommer un filtre enregistré

Le filtre enregistré est assez long et difficile à lire. Survolez le filtre enregistré avec votre souris pour afficher deux icônes : une pour le modifier et une pour le supprimer.

![Exemple de modification d'une recherche enregistrée](/fr/img/getting-started/filter_edit.png)

Vous pouvez modifier le nom affiché dans la section **Nom** de la fenêtre contextuelle.

![Modifier le nom du filtre](/fr/img/getting-started/filter_edit_name.png)

Vous pouvez également choisir de conserver ou non la requête enregistrée dans un **groupe de filtres**.

![Exemple de groupe de filtres](/fr/img/getting-started/filter_group_example.png)

## Supprimer un filtre

Si vous avez créé un **bouton de filtre** par erreur, cliquez sur la croix située à côté ![Supprimer le filtre](/fr/img/getting-started/filter_delete.png).

Le résultat du filtre s'affiche, mais le bouton n'est plus présent. Annulez simplement votre recherche en supprimant le texte ou utilisez la croix située à côté de la barre de recherche ![Supprimer la recherche](/fr/img/getting-started/filter_cross_delete.png).

## Filtres prédéfinis

Vous trouverez des filtres prédéfinis sur les pages suivantes :

- Mes vérifications
- Feuilles de temps
- Planning de l'équipe
- Toutes les tâches
- Fils d'actualité
- Concepts
- Quotas
- Page détaillée du type de tâche (+ barre de recherche)

Sur ces pages, sélectionnez l'option souhaitée dans le menu déroulant.

<!-- #endregion body -->