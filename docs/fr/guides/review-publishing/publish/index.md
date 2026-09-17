---
path: "/fr/guides/review-publishing/publish"
slug: "publish"
published_at: 2026-09-10
---

# Publication

<!-- #region body -->

Dans un pipeline, publier signifie soumettre une version de votre travail en tant que livrable traçable associé à une tâche spécifique, afin qu’il puisse être révisé, versionné et référencé par le reste du pipeline.

Dans Kitsu, publier une révision est une autre façon de mettre à jour le statut d’une tâche. La différence avec les commentaires est qu’une publication est associée à un fichier de prévisualisation versionné.

## Publier un concept

Pour publier un **Concept**, accédez à la page **Concepts** depuis le menu de navigation du projet.

![Menu Concept](/fr/img/getting-started/menu_concept.png)

Pour téléverser un concept, cliquez sur le bouton **Ajouter une nouvelle référence aux concepts**. Vous pouvez téléverser un ou plusieurs concepts simultanément.

![Page Concept vide](/fr/img/getting-started/concept_empty_prod.png)

Une fois le téléversement terminé, des prévisualisations seront générées et visibles depuis votre page de concepts.

![Page Concept remplie](/fr/img/getting-started/concept_filled_prod.png)

Cliquez sur la miniature pour voir une prévisualisation agrandie de votre concept, ou cliquez sur le statut pour ouvrir le **Panneau de commentaires** à droite.

Lorsque le panneau de commentaires est ouvert, deux options s’offrent à vous :

1) Vous pouvez associer un concept à un élément existant / supprimer un lien existant.
2) Vous pouvez commenter et modifier le statut du concept.

Il est recommandé de n’avoir qu’une seule version par **Concept**. Si le concept n’est pas approuvé et nécessite des modifications supplémentaires, il est préférable de créer une nouvelle version de ce concept.

![Options du concept](/fr/img/getting-started/concept_options.png)

## Publier une prévisualisation en tant que version

Pour publier une prévisualisation, une image ou une vidéo, ouvrez le panneau de commentaires de la tâche et sélectionnez l’onglet **PUBLIER LA RÉVISION**.

Kitsu bascule automatiquement vers l’onglet **Publier la révision** lorsqu’un statut avec l’option **DEMANDE DE RETOUR** est utilisé, comme le statut **WFA**.

![Publier la révision](/fr/img/getting-started/publish_revision.png)

Vous pouvez ajouter une ou plusieurs prévisualisations à n’importe quel commentaire. Il peut s’agir d’une image (`.png`, `.jpg`, `.jpeg`, `.gif`), d’une vidéo (`.mp4`, `.mov`, `.wmv`) ou d’un fichier `.glb`. Vous pouvez également réviser toutes les prévisualisations depuis le navigateur ou tout mélanger.

Vous pouvez aussi réviser un fichier `.glb` en mode filaire ou ajouter un fichier `.HDR` pour vérifier l’éclairage. Consultez la section **Personnalisation** pour plus de détails.

[Personnalisation du pipeline](../../../configure-kitsu/index.md#3d-backgrounds)

D’autres fichiers comme `.pdf`, `.zip`, `.rar`, `.ma` ou `.mb` ne peuvent pas être consultés dans le navigateur et doivent être téléchargés pour être révisés.

Cliquez ensuite sur le bouton **Ajouter une révision de prévisualisation à publier**. L’explorateur s’ouvre et vous permet de choisir un ou plusieurs fichiers.

![Joindre une prévisualisation](/fr/img/getting-started/attach_preview.png)

Vous pouvez également **copier-coller une capture d’écran** depuis votre presse-papiers dans cette boîte de dialogue de téléversement, sans avoir besoin de la télécharger au préalable. Une fois votre fichier sélectionné, son nom apparaît à côté du bouton **Ajouter des fichiers à publier**.

![Prévisualisation jointe](/fr/img/getting-started/attach_preview_filled.png)

Vous pouvez également **faire glisser-déposer** les fichiers que vous souhaitez téléverser dans la section des commentaires afin de lancer automatiquement le processus de téléversement.

![Glisser-déposer d’une prévisualisation](/fr/img/getting-started/drag_drop_preview.png)

Au-dessus de votre prévisualisation, vous pouvez ajouter un **Commentaire**. Cliquez sur le bouton **Laisser un commentaire** pour déplier la section des commentaires.

![Ajouter un commentaire à une publication](/fr/img/getting-started/publish_revision_comment.png)

Vous pouvez ensuite sélectionner votre statut et publier votre prévisualisation avec le bouton **Publier**.

Pour plus d’informations sur l’utilisation des publications comme miniatures, [consultez cette section sur les miniatures](../../../thumbnails/index.md).

## Combiner des prévisualisations en une version

Vous pouvez ajouter plusieurs images simultanément ou, après avoir téléversé une image, en ajouter une autre.

![Téléverser plusieurs images](/fr/img/getting-started/upload_several_pictures.png)

La fenêtre contextuelle **Ajouter une prévisualisation** vous demande de choisir un fichier. Vous pouvez parcourir les images téléversées.

Vous pouvez modifier l’ordre des prévisualisations en cliquant sur le numéro, puis en les faisant glisser-déposer.

![Glisser-déposer des prévisualisations](/fr/img/getting-started/multiple_preview.png)

Pour supprimer une prévisualisation supplémentaire, agrandissez le panneau de commentaires, cliquez sur le numéro des versions, puis cliquez sur ![Bouton Supprimer](/fr/img/getting-started/delete_button.png).

![Agrandir la section des commentaires et supprimer](/fr/img/getting-started/enlarge_comment_delete.png)

## Supprimer une prévisualisation

Pour supprimer une prévisualisation, supprimez simplement le commentaire associé.

<!-- #endregion body -->

