---
path: "/fr/guides/production/meta-column"
slug: "meta-column"
published_at: 2026-09-10
---

# Colonnes de métadonnées

<!-- #region body -->

Pour ajouter davantage d’informations aux pages générales des feuilles de calcul, vous pouvez créer une **colonne de métadonnées**.

Les colonnes de métadonnées vous permettent de suivre des informations supplémentaires liées à votre production. Par exemple, une colonne de métadonnées peut servir à suivre la difficulté perçue d’une tâche ou à essayer des balises personnalisées qui vous aident à identifier certains aspects d’une tâche. Les colonnes de métadonnées personnalisées peuvent stocker des données dans différents formats afin de faciliter la saisie, le filtrage et la validation des données.

## Créer des colonnes de métadonnées

<!-- #region setup -->

Pour ajouter une nouvelle colonne de métadonnées personnalisée, cliquez sur l’icône **+** à côté de la colonne Nom.

![Colonne de métadonnées](/fr/img/getting-started/add_column_custom.png)

Commencez par choisir le nom que vous souhaitez donner à votre champ. Sélectionnez ensuite le **Type** approprié selon vos besoins :

- **Texte** : ce type accepte les entrées textuelles, notamment les lettres et les chiffres. Il offre une grande flexibilité pour stocker des informations telles que des descriptions, des commentaires ou du contenu textuel.

- **Nombre** : réservé exclusivement aux données numériques. Il est recommandé pour suivre des informations composées uniquement de valeurs numériques, telles que des fréquences d’images, des dates ou des durées.

- **Case à cocher** : cette option vous permet de marquer les éléments comme activés ou désactivés. Elle convient au suivi de données ne comportant que deux états possibles, comme l’indication des plans destinés à une bande-annonce.

- **Liste de valeurs** : avec ce type, vous définissez une liste d’options parmi lesquelles un seul élément unique peut être sélectionné. Il est idéal lorsque vous devez suivre des données avec un nombre limité de choix. Par exemple, pour suivre les mouvements de caméra, vous pouvez inclure des options telles que « Statique », « Panoramique », « Inclinaison » ou « Zoom ».

- **Liste de balises** : ici, vous pouvez définir plusieurs balises. Contrairement à une liste de valeurs, qui permet de sélectionner un seul élément, ce type permet de sélectionner plusieurs entrées dans la liste.

- **Liste de contrôle** : ce type présente une liste d’options, chacune accompagnée de sa propre case à cocher. Il est utile pour suivre les petites sous-tâches associées à un plan ou à un élément, qui ne justifient pas leur propre tâche dans le flux de production.

![Détails de la colonne de métadonnées](/fr/img/getting-started/custom_column_detail.png)

:::warning
Lors de la création de types de métadonnées **Texte** et **Nombre**, une valeur par défaut n’est pas requise.

En revanche, lorsque vous utilisez une **Liste de valeurs**, une **Liste de balises** ou une **Liste de contrôle**, vous devez préciser les valeurs à inclure lors de la création.

![Liste de la colonne de métadonnées](/fr/img/getting-started/custom_column_list.png)

Saisissez les éléments de la liste sous **Valeurs disponibles**, puis confirmez-les en cliquant sur **Ajouter une valeur**.
:::

<!-- #endregion setup -->

## Lier des colonnes de métadonnées à des départements

Vous pouvez également associer la **colonne de métadonnées** à un ou plusieurs **départements**. Les artistes et les superviseurs la verront sur leur page des tâches à effectuer ainsi que dans la vue filtrée par département.

Pour créer d’autres départements, consultez [Créer des départements](/fr/guides/team-management/managing-departments/#creating-departments).

Vous pouvez associer la colonne de métadonnées à un ou plusieurs départements. Cliquez sur le département dans la liste, puis cliquez sur **Ajouter** pour confirmer.

Ici, la colonne VFX est associée à deux départements.

![Vue filtrée par département de la colonne de métadonnées](/fr/img/getting-started/department_filtered_view_column.png)

::: details Comment modifier votre colonne de métadonnées
Sur la page globale de l’élément ou du plan, cliquez sur la flèche située juste à droite de votre colonne de métadonnées, puis cliquez sur **Modifier**.

![Modifier une colonne de métadonnées](/fr/img/getting-started/custom_column_edit.png)
:::

Félicitations, votre nouvelle colonne de métadonnées devrait maintenant être disponible depuis votre page globale.

![Détails de la colonne de métadonnées](/fr/img/getting-started/custom_column_list_edit.png)

::: tip Mises à jour groupées
Si vous souhaitez mettre à jour plusieurs éléments avec les mêmes valeurs, cochez d’abord les éléments à inclure comme indiqué ci-dessous, puis mettez à jour la valeur. La valeur saisie sera alors appliquée à tous les éléments.

![Détails de la colonne de métadonnées](/fr/img/getting-started/batch_edit_custom_column.png)

![Détails de la colonne de métadonnées](/fr/img/getting-started/batch_edit_custom_column2.png)

:::

::: details Modifier des entités
Bien que vous puissiez mettre à jour directement les entités dans la feuille de calcul, vous pouvez également utiliser le bouton de modification ![Bouton de modification](/fr/img/getting-started/edit_button.png) pour mettre à jour plusieurs colonnes de métadonnées.

Une fois l’entité sélectionnée, vous pouvez renseigner ou ajuster les valeurs de toutes les colonnes de métadonnées qui lui sont associées. N’oubliez pas de cliquer sur le bouton **Confirmer** lorsque vous avez terminé.

![Détails de la colonne de métadonnées](/fr/img/getting-started/edit_asset_custom.png)
:::

Si vous devez modifier ou supprimer la colonne de métadonnées depuis la page générale de la feuille de calcul, cliquez sur la flèche ![Détails de la colonne de métadonnées](/fr/img/getting-started/arrow.png) située à côté du nom de votre colonne de métadonnées.

::: tip
En plus de modifier ou de supprimer des colonnes de métadonnées, vous pouvez également **trier** votre page globale selon cette nouvelle colonne en cliquant sur **Trier par**.

Vous pouvez également **épingler** la colonne de métadonnées : elle restera verrouillée à gauche et restera visible lorsque vous ferez défiler un grand jeu de données.
:::

## Organiser les colonnes de métadonnées

### Afficher ou masquer toutes les colonnes de métadonnées

Pour garder votre feuille de calcul globale bien organisée, vous pouvez choisir de masquer les colonnes non essentielles. Notez que cette action ne supprime pas la colonne ; elle la masque simplement de la vue tout en la conservant dans les autres zones où elle est utilisée.

Pour ce faire, cliquez sur le bouton **Masquer les informations supplémentaires**
![bouton de réduction](/fr/img/getting-started/maximize.png) situé en haut à droite de la page.

![Toutes les informations affichées](/fr/img/getting-started/hide_extra_information1.png)

Pour faire réapparaître les informations, cliquez sur le même bouton,
![bouton d’agrandissement](/fr/img/getting-started/minimize.png) qui ne sera alors plus mis en évidence en gris.

![Toutes les informations affichées](/fr/img/getting-started/hide_extra_information2.png)

### Afficher ou masquer une seule colonne de métadonnées

Vous pouvez avoir besoin de masquer ou d’afficher une **colonne de métadonnées** spécifique sur une page globale.

Pour masquer votre colonne de métadonnées, cliquez sur la flèche située sur le bord droit de la page globale.

![Colonne visible](/fr/img/getting-started/visible_column.png)

Vous pouvez choisir la colonne que vous souhaitez **masquer** ou **afficher**.

## Colonnes épinglées

Si une information est consultée fréquemment, vous pouvez **épingler** cette colonne à côté du nom du plan.

Cliquez sur la flèche située à droite de la colonne pour ouvrir son menu, puis choisissez **Épingler**.

![Option Épingler](/fr/img/getting-started/sticky.png)

![Option Épingler](/fr/img/getting-started/sticky_example.png)

## Mettre à jour les colonnes de métadonnées

Survolez votre colonne de métadonnées et cliquez sur l’icône du menu déroulant, puis sélectionnez `Modifier`. Une boîte de dialogue modale s’affichera pour vous permettre de mettre à jour les propriétés de votre colonne de métadonnées :

![](/fr/guides/production/meta-column/images/1.png)

## Supprimer des colonnes de métadonnées

Survolez votre colonne de métadonnées et cliquez sur l’icône du menu déroulant, puis sélectionnez `Supprimer` :

![](/fr/guides/production/meta-column/images/0.png)

<!-- #endregion body -->