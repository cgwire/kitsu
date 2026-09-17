---
path: "/fr/guides/production/manage-assets"
slug: "manage-assets"
published_at: 2026-09-10
---

# Gestion des éléments

<!-- #region body -->
<!-- #region intro -->

Vous pouvez accéder à la page `Assets` à l’aide du menu déroulant situé en haut de l’écran :

![Menu déroulant Client Asset](/fr/img/getting-started/client_dropdown_asset.png)

Sur la page globale, vous pourrez voir tous les statuts des différentes étapes des éléments.

![Page globale Client Asset](/fr/img/getting-started/client_global_asset.png)

<!-- #endregion intro -->

## Créer un élément

<!-- #region create-an-asset -->
<!-- #region setup -->

Sur la page des éléments, cliquez sur **Add assets**.

![Première visite de la page des éléments](/fr/img/getting-started/add_assets_first.png)

::: warning
Lorsque vous créez un élément, votre workflow de tâches sera appliqué et **toutes les tâches seront créées simultanément avec l’élément**.
:::

Une fenêtre contextuelle s’ouvre :

Elle vous demande de choisir le **Asset Type** (1).
Si vous n’avez pas ajouté de nouveau type d’élément, Kitsu proposera des exemples tels que Characters, Environment, FX, Props, etc.
Commençons par un personnage.

::: tip
Vous pouvez également personnaliser la liste des types d’éléments et le pipeline des tâches. Consultez le guide (
[Personnalisation du workflow](../../../configure-kitsu/index.html#asset-types)) pour plus de détails
:::

Donnez-lui un **Name** (2) et saisissez une description qui aide l’Artiste à savoir quoi faire et à identifier rapidement l’élément.

Cliquez sur **Confirm and stay** si vous avez plusieurs éléments à créer.


![Créer un élément](/fr/img/getting-started/add_asset_popup.png)

Vous pouvez modifier le type d’élément et continuer à ajouter des éléments.

::: tip
L’élément nouvellement créé apparaît en arrière-plan chaque fois que vous cliquez sur **Confirm and stay**.
:::

Après avoir ajouté votre dernier élément, cliquez sur
**Confirm**. L’élément sera créé et la fenêtre se fermera.

::: tip
Si vous cliquez sur **Confirm and stay, **, que vous réalisez que vous n’avez plus d’éléments à ajouter et que vous cliquez sur **Close, **, la fenêtre sera annulée.
:::

![Page globale des éléments](/fr/img/getting-started/asset_edit.png)

Vous verrez également que les tâches sélectionnées pour le workflow de vos éléments sont créées en même temps.

Si vous devez ajouter d’autres **Assets**, cliquez sur le bouton **+ Create assets**.

<!-- #endregion setup -->

### Importer des éléments depuis une feuille de calcul

Vous disposez peut-être déjà de votre liste d’éléments dans un fichier de feuille de calcul. Avec Kitsu, vous avez deux façons de l’importer : parcourir vos fichiers pour sélectionner un fichier `.csv`, ou copier-coller directement les données de votre feuille de calcul dans Kitsu.

Accédez à la page des éléments dans Kitsu et cliquez sur l’icône **Import**.

![Icône Import](/fr/img/getting-started/import.png)

Une fenêtre contextuelle **Import data from a CSV** s’ouvre. Choisissez l’une des deux méthodes ci-dessous.

#### Option 1 : Importer un fichier CSV

Commencez par enregistrer votre feuille de calcul au format `.csv`. Cliquez ensuite sur **Browse** pour sélectionner votre fichier `.csv`.

![Importer un fichier csv](/fr/img/getting-started/import_csv_asset.png)

#### Option 2 : Copier-coller un fichier de feuille de calcul

Ouvrez votre feuille de calcul, sélectionnez vos données et copiez-les.

![Copier les données](/fr/img/getting-started/import_copypas_asset.png)

De retour dans la fenêtre contextuelle, cliquez sur l’onglet **Paste a CSV data**.

![Onglet de copie-collage des données importées](/fr/img/getting-started/import_pastcsvdata_asset.png)

Collez les données sélectionnées précédemment.

![Données copiées-collées importées](/fr/img/getting-started/import_pastcsvdata2_asset.png)

#### Terminer l’importation

Pour voir le résultat, cliquez sur le bouton **Preview**. Vous pouvez vérifier et ajuster le nom des colonnes en prévisualisant vos données.

NB : la colonne **Episode** est obligatoire uniquement pour une production de type **TV Show**.

![Données copiées-collées importées](/fr/img/getting-started/import_preview_data.png)

Une fois que tout semble correct, cliquez sur le bouton **Confirm** pour importer vos données dans Kitsu.

Vous avez importé tous vos éléments dans Kitsu et créé les tâches conformément à vos paramètres.

![Données copiées-collées importées](/fr/img/getting-started/import_result_asset.png)

## Voir les détails d’un élément

Pour voir les détails d’un élément, cliquez sur son nom.

![Détails de l’élément](/fr/img/getting-started/asset_detail.png)

Une nouvelle page s’ouvre avec la liste des tâches, l’assignation et le fil d’actualité des statuts à droite.

![Page de détails de l’élément](/fr/img/getting-started/asset_detail_page.png)

Vous pouvez cliquer sur le statut de chaque tâche pour ouvrir le panneau des commentaires et consulter l’historique des commentaires ainsi que les différentes versions.

![Panneau de la page de détails de l’élément](/fr/img/getting-started/asset_detail_page_panel.png)

Vous pouvez également accéder au **Casting**,

![Casting des détails de l’élément](/fr/img/getting-started/asset_detail_page_casting.png)

au **concept** lié à cet élément,

![Concept des détails de l’élément](/fr/img/getting-started/asset_detail_page_concept.png)

Le **Schedule** est disponible si vous avez préalablement renseigné les données de la page des types de tâches. Si vous avez déjà renseigné ces données, vous pouvez les modifier directement ici.

![Planning des détails de l’élément](/fr/img/getting-started/asset_detail_page_schedule.png)

aux **Preview Files** téléversés pour différents types de tâches,

![Fichiers d’aperçu des détails de l’élément](/fr/img/getting-started/asset_detail_page_file.png)

ainsi qu’au **Timelog** si des personnes ont renseigné leur feuille de temps pour les tâches de cet élément.

![Feuille de temps des détails de l’élément](/fr/img/getting-started/asset_detail_page_timelog.png)

<!-- #endregion create-an-asset -->

## Ajouter des tâches après la création des éléments

Si vous réalisez **après** avoir créé les éléments qu’un type de tâche manque, vous pouvez toujours l’ajouter.

Commencez par vérifier que le type de tâche manquant a été ajouté à la page `Settings` de la production, dans l’onglet `Task Type`.

Retournez ensuite sur votre page `Assets` et cliquez sur le bouton `+ Add tasks`.

## Mettre à jour vos éléments

Vous pouvez mettre à jour vos éléments à tout moment, modifier leur nom et leur type, changer leur description et ajouter toute information personnalisée que vous avez ajoutée à la page globale.

Vous pouvez modifier les éléments en accédant à la page des éléments, en plaçant le curseur sur l’élément que vous souhaitez modifier, puis en cliquant sur le bouton **edit**
![Bouton Modifier](/fr/img/getting-started/edit_button.png) (1) à droite de
la ligne.

![Modifier un élément](/fr/img/getting-started/asset_edit01.png)

Pour développer la description sur la page principale des éléments, cliquez sur les premiers mots (2) ; une fenêtre contextuelle contenant la description complète s’ouvrira.


### Mettre à jour les éléments avec l’importation CSV

Vous pouvez utiliser l’importation CSV pour mettre rapidement vos données à jour.

Vous pouvez mettre à jour le **type** d’un élément, l’**Assignation**, le **Status** des tâches et ajouter un **Comment**.

Vous devez activer l’option **Update existing data**. Les lignes qui seront mises à jour
seront alors surlignées en bleu.

![Données copiées-collées importées](/fr/img/getting-started/import_update_asset.png)

### Mettre à jour les éléments en copiant-collant un fichier de feuille de calcul

Ouvrez votre feuille de calcul, sélectionnez vos données et copiez-les.

![Copier les données](/fr/img/getting-started/import_copypas_asset.png)

Retournez ensuite sur la page des éléments dans Kitsu et cliquez sur l’icône **Import**
![Icône Import](/fr/img/getting-started/import.png).

Une fenêtre contextuelle **Import data from a CSV** s’ouvre ; cliquez sur l’onglet **Paste a CSV data**.

![Onglet de copie-collage des données importées](/fr/img/getting-started/import_pastcsvdata_asset.png)
 
Vous pouvez coller les données sélectionnées précédemment et voir le résultat avec le bouton **Preview**.
 
![Données copiées-collées importées](/fr/img/getting-started/import_pastcsvdata2_asset.png)
 
Vous pouvez vérifier et ajuster le nom des colonnes en prévisualisant vos données.

NB : la colonne **Episode** est obligatoire uniquement pour une production de type **TV Show**.
 
Vous devez activer l’option **Update existing data**. Les lignes qui seront mises à jour
seront alors surlignées en bleu.

![Données copiées-collées importées](/fr/img/getting-started/import_update_asset.png)

Vous avez importé tous vos éléments dans Kitsu et créé les tâches conformément à vos paramètres.

![Données copiées-collées importées](/fr/img/getting-started/import_result_asset.png)

## Bibliothèque d’éléments

### Qu’est-ce que la bibliothèque d’éléments ?

La bibliothèque d’éléments sert de dépôt centralisé pour tous les éléments utilisés dans Kitsu. Les équipes peuvent importer des éléments depuis n’importe quel projet dans une bibliothèque partagée, afin de les rendre accessibles aux productions futures. Grâce à cette fonctionnalité, les éléments tels que les modèles de personnages, les accessoires, les environnements et bien plus encore peuvent être gérés au même endroit et réutilisés facilement dans de nouveaux projets.

### Comment utiliser la bibliothèque d’éléments

![Vue d’ensemble de la bibliothèque d’éléments](/fr/img/getting-started/asset_library_overview.png)

- Vous pouvez accéder à la bibliothèque d’éléments depuis la section **Studio** du menu principal de Kitsu.
- La fenêtre principale de la bibliothèque d’éléments affiche tous les éléments actuellement disponibles dans la bibliothèque (1). Utilisez les options de recherche (2) et de filtrage (3) pour trouver rapidement des éléments spécifiques dans la bibliothèque.
- Dans le panneau de droite (4), vous trouverez l’option d’importation permettant d’ajouter à la bibliothèque des éléments provenant d’autres productions.

### Ajouter des éléments à la bibliothèque

![Ajouter à la bibliothèque d’éléments](/fr/img/getting-started/asset_library_add.png)

Le panneau de droite vous permet d’ajouter à la bibliothèque des éléments existants provenant d’autres productions. Cette action ne crée pas de copie, mais fait simplement référence à l’élément d’origine, ce qui permet de l’utiliser dans d’autres productions.

Pour importer un élément :
- Sélectionnez la production depuis laquelle vous souhaitez importer l’élément (1).
- Choisissez le type d’élément que vous souhaitez importer (2).

Il existe trois principales façons d’importer des éléments :
- Importer tous les éléments d’une production spécifique (3).
- Importer les éléments d’un type donné depuis la production sélectionnée (4).
- Sélectionner individuellement les éléments à importer (5).

Une fois importé, l’élément sera disponible pour être utilisé dans les breakdowns d’autres productions, ce qui permet de réutiliser efficacement les éléments entre les projets.

::: tip
Des règles spécifiques définissent qui peut importer des éléments dans la bibliothèque, selon le groupe d’autorisations de l’utilisateur :

- **Studio Manager** : peut importer tous les éléments de toutes les productions.
- **Production Manager** : peut importer des éléments uniquement s’ils font partie de l’équipe.
- **Supervisor** et **Artist** : ne peuvent pas importer d’éléments dans la bibliothèque.
:::

## Supprimer des éléments

Placez le curseur sur l’élément que vous souhaitez supprimer dans la liste des éléments de votre production et cliquez sur l’icône `Delete` :  

![Bouton de suppression d’un élément](/fr/guides/production/manage-assets/images/0.png)

## Utiliser l’état d’élément « Ready For »

La plupart du temps, vous n’avez pas besoin d’attendre que les tâches d’un élément soient approuvées pour l’utiliser dans une tâche de plan.

Par exemple, lorsqu’un élément est approuvé à l’étape **Concept**, il peut être utilisé à l’étape **Storyboard**.
Ensuite, lorsqu’il est approuvé à l’étape **Modeling**, vous pouvez l’utiliser à l’étape **Layout**, et ainsi de suite.

C’est exactement le rôle de l’état d’élément **Ready For** : il vous permet de connaître l’état des tâches d’un élément et de comparer son utilisabilité avec les tâches de plan.

Maintenant que nous avons renseigné notre breakdown, nous savons exactement quel élément est utilisé pour chaque plan.

Nous devons d’abord définir l’état d’un élément en fonction du statut de sa tâche. Vous pouvez modifier le champ **Ready for** en cliquant sur une cellule. Un menu déroulant contenant la tâche du plan s’affichera.

![Statut de l’élément](/fr/img/getting-started/asset_status.png)

::: tip
Vous pouvez utiliser les **automatisations** pour effectuer cette opération automatiquement.

Vous pouvez configurer une automatisation avec le déclencheur **ready for**.
:::

Nous pouvons maintenant voir le résultat sur la page des plans, après avoir modifié certains états d’éléments **Ready for**.

Vous remarquerez que certaines cases blanches sont désormais **vertes** : tous les éléments associés à ce plan sont prêts pour cette tâche spécifique.

![Statut de l’élément](/fr/img/getting-started/asset_status_box.png)

Si vous voyez une case blanche, Kitsu indiquera combien d’éléments sont prêts pour cette tâche.

![Statut de l’élément](/fr/img/getting-started/asset_status_empty.png)

::: tip
Si aucune case ne s’affiche, aucun élément n’est associé à ce plan.
:::
 
Vous pouvez ensuite cliquer sur le nom du plan pour accéder à sa page de détails.
Vous verrez alors tous les éléments associés à ce plan ainsi que leur statut.

![Statut de l’élément](/fr/img/getting-started/asset_status_detail.png)

C’est le moyen le plus rapide de savoir si vous pouvez commencer un plan pour une tâche spécifique.

<!-- #endregion body -->