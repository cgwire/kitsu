---
path: "/fr/guides/review-publishing/review"
slug: "review"
published_at: 2026-09-10
---

# Révisions

<!-- #region body -->

## Demander une révision

<!-- #region request-review -->

Lorsque vous terminez une tâche, vous pouvez la soumettre pour révision :

1. Modifiez le statut de la tâche en **Waiting for Approval (WFA)**.
2. Joignez un fichier d’aperçu en le faisant glisser dans la zone de téléversement ou en cliquant sur **Attach Preview**.
3. Cliquez sur **Post** pour finaliser votre soumission.

![Demander une révision](/fr/img/getting-started/add_preview.png)

Les personnes assignées à la tâche recevront une notification. Vous pouvez également mentionner d’autres membres de l’équipe dans un commentaire à l’aide de l’opérateur `@`. 

Les révisions précédentes sont enregistrées et restent accessibles à titre de référence.

![Historique des révisions](/fr/img/getting-started/previewv2.png)

<!-- #endregion request-review -->

## Réviser les tâches

Cliquez sur le statut d’une tâche pour ouvrir le panneau latéral droit et commencer la révision.

Vous pouvez regarder la version depuis le panneau droit, l’agrandir en saisissant le bord du panneau ou même passer en plein écran en cliquant sur cette icône ![Plein écran](/fr/img/getting-started/fullscreen.png).

![révision sur la page globale](/fr/img/getting-started/review_global.png)

De la même manière, vous pouvez également réviser des fichiers 3D (fichier `.glb`) sous forme de maillage ou ajouter un fichier `.HDR` pour vérifier l’éclairage.

Vous pouvez vous déplacer dans le fichier 3D en faisant glisser le curseur et effectuer un zoom avant ou arrière avec la molette de défilement.

![révision du maillage 3D](/fr/img/getting-started/review_wireframe.png)

![Exemple d’arrière-plan d’aperçu](/fr/img/getting-started/preview_background_example.png)

Consultez la section **Personnalisation** pour plus de détails.
[Personnalisation du pipeline](../../../configure-kitsu/index.md#3d-backgrounds)

Vous pouvez sélectionner une couleur, puis dessiner directement sur l’aperçu avec l’outil **Crayon** ![Crayon](/fr/img/getting-started/draw.png).

![dessin de révision](/fr/img/getting-started/review_comment.png)

## Ajouter un commentaire

Pour transmettre un retour général, vous pouvez laisser un commentaire écrit sur la tâche depuis le panneau latéral droit.

Saisissez votre retour dans la zone de commentaire et laissez le statut de la tâche inchangé si vous souhaitez permettre à un autre membre de l’équipe d’intervenir, ou passez-le à `Approved` pour terminer la révision.

![ajouter un commentaire de révision](/fr/img/getting-started/comment_panel.png)

Cliquez sur **Post** pour publier votre commentaire. Il apparaîtra dans l’historique des commentaires de la tâche, accompagné d’un horodatage et de votre nom, afin que l’artiste puisse voir exactement quel retour a été donné et à quel moment.

Vous pouvez mentionner des collègues dans votre commentaire à l’aide de l’opérateur `@` pour les notifier directement, ou joindre des fichiers (voir **Exporter les annotations** ci-dessous) en complément de votre retour écrit.

Une fois publiés, les commentaires ne peuvent pas être modifiés, mais vous pouvez les supprimer si nécessaire en cliquant sur l’**icône de corbeille** à côté de votre commentaire.

## Dessiner des annotations

Vous pouvez également annoter l’image avec du **texte**.

![texte du dessin de révision](/fr/img/getting-started/review_comment_text.png)

Si vous souhaitez **masquer temporairement les annotations**, cliquez sur le bouton **Plume**.
![Masquer l’annotation](/fr/img/getting-started/hide_annotation.png)

## Annotations de formes

Les réviseurs peuvent dessiner des carrés, des cercles et des flèches au lieu de se limiter au dessin à main levée.

![](/fr/guides/review-publishing/review/images/0.png)

## Marquer des images

Si vous souhaitez faire référence à une image précise dans vos commentaires, vous pouvez facilement marquer une image en saisissant `@`, ce qui ouvre un sous-menu contenant la liste de l’équipe, puis en commençant à saisir **frame**.

Cela ajoutera alors l’horodatage de l’image actuelle à ce commentaire. En cliquant sur cet horodatage, vous accéderez directement à l’image correspondante.

![Marquer une image](/fr/img/getting-started/tag_frame.png)

## Exporter les annotations

Vous pouvez également exporter vos dessins sur chaque image en joignant les **captures d’écran en tant que pièces jointes**.

Cliquez sur le bouton **Add attachment**.

![pièce jointe](/fr/img/getting-started/attachment_retake.png)

Vous pouvez également choisir **Attach snapshots from your annotation** dans les options de pièce jointe. Cela vous permet de capturer des images annotées et de les ajouter comme pièces jointes au commentaire, ce qui peut être utile si vous souhaitez mettre en évidence certaines annotations dans votre retour.

![Capture d’écran jointe](/fr/img/getting-started/screenshot_attachment.png)

Une fois que vous avez cliqué sur le bouton, Kitsu récupère toutes les images comportant des annotations et affiche le résultat. Vous pouvez les publier en cliquant sur **Confirm**.

![Détail de la capture d’écran jointe](/fr/img/getting-started/attachment_snapshot_detail.png)

## Supprimer des annotations et utiliser la gomme

Si vous devez supprimer une annotation, cliquez sur l’icône `Eraser` :

![](/fr/guides/review-publishing/review/images/1.png)

## Comparer des images

En passant en **plein écran**, vous pouvez comparer côte à côte deux types de tâches ou deux versions en cliquant sur le bouton **Compare** ![bouton de comparaison](/fr/img/getting-started/compare_button.png).

![bouton de comparaison](/fr/img/getting-started/compare_version.png)

Depuis cet écran, vous pouvez remplacer le statut par ![À reprendre](/fr/img/getting-started/retake_icon.png) si vous souhaitez que l’artiste apporte des modifications.

Vous pouvez également le remplacer par ![Terminé](/fr/img/getting-started/done_icon.png) pour informer l’artiste que son travail est approuvé.

## Pelure d’oignon

Si vous devez vérifier la cohérence d’une image à l’autre lors de la révision d’une animation dans Kitsu, vous pouvez utiliser la pelure d’oignon pour les annotations.

La pelure d’oignon superpose les images annotées proches (jusqu’à 5 images avant et/ou après l’image actuelle), afin que vous puissiez repérer en une seule fois les problèmes de mouvement, d’espacement et de synchronisation, sans faire défiler la séquence dans les deux sens.

Voici l’image annotée N :

![](/fr/guides/review-publishing/review/images/2.png)

Et voici à quoi ressemble la superposition sur l’image N + 4 : 

![](/fr/guides/review-publishing/review/images/3.png)

## Révisions par les superviseurs

<!-- #region for-supervisors -->

En général, lorsqu’un artiste termine une tâche, il sollicite le superviseur pour une révision. Cependant, les interruptions fréquentes peuvent être improductives et rendre difficile le maintien de la concentration. 

Pour éviter cela, définissez une plage horaire précise pour les révisions. Cette approche est bénéfique pour vous et votre équipe, car elle fournit un planning structuré. Les artistes sauront quand ils peuvent s’attendre à recevoir un retour et pourront organiser leur travail en conséquence, tandis que vous pourrez consacrer du temps sans interruption à vos propres tâches.

Cliquez sur le bouton **My Checks** en haut de l’écran pour afficher la liste de toutes les tâches **WFA** de votre département.

![Page My Checks du superviseur](/fr/img/getting-started/supervisor_mycheck.png)

Cette liste comprend toutes les **Productions**, les **Types de tâches** et les **Statuts des tâches** concernés. Comme sur les autres pages de Kitsu, vous pouvez cliquer sur un **Statut** pour ouvrir le **Panneau de commentaires** à droite et réviser les tâches une par une.

Vous pouvez également utiliser le bouton **Build playlist from list** pour créer une playlist contenant toutes les tâches de la liste. Cette playlist offre les mêmes options que les autres vues : ouvrir le panneau de commentaires, comparer les versions et les types de tâches, et ajouter des annotations.

![Playlist My Checks du superviseur](/fr/img/getting-started/supervisor_mycheck_playlist.png)
![Option de playlist My Checks du superviseur](/fr/img/getting-started/supervisor_mycheck_playlist_option.png)

Une autre option consiste à accéder à la **Page des types de tâches** et à modifier l’option **Display as contact sheet**. Par exemple, vous pouvez filtrer par **Statut de date d’échéance** et sélectionner **Due this week**.

![Planche de contact du superviseur](/fr/img/getting-started/supervisor_contactsheet.png)

Depuis cette page, vous pouvez cliquer sur la planche de contact pour ouvrir le panneau de commentaires ou sélectionner plusieurs tâches afin de créer une playlist.

<!-- #endregion for-supervisors -->

## Réviser des concepts

Si vous êtes **artiste conceptuel**, vous pouvez téléverser et partager des concepts pour révision. Une fois qu’un artiste a téléversé un concept, le superviseur ou le directeur peut le réviser.

Lorsque vos artistes téléversent un concept, vous pouvez le réviser depuis le menu de navigation en haut de l’écran en sélectionnant la page **Concepts**.

![Menu des concepts](/fr/img/getting-started/menu_concept.png)

Sur cette page, vous pouvez voir tous les concepts téléversés ainsi que leur statut, leur assignation et les éléments liés.

![Statut de concept renseigné](/fr/img/getting-started/concept_empty_prod_linked.png)

Pour réviser un concept, cliquez sur son statut afin d’ouvrir le panneau de commentaires. Vous pouvez agrandir le panneau de commentaires ou passer en plein écran. Vous pouvez ensuite rédiger un commentaire, définir le statut sur **Approved** ou **Rejected**, puis confirmer vos modifications avec le bouton **Post**.

![Commentaire sur le statut du concept](/fr/img/getting-started/concept_status_comment.png)

Vous pouvez restreindre les résultats de la page à l’aide du filtre **Statut** afin d’afficher tous les concepts dont le statut est **Neutral**. Vous pouvez également filtrer par artiste et modifier l’ordre de tri afin de mieux cibler les données que vous devez réviser.

![Filtre du statut du concept](/fr/img/getting-started/concept_status_filter.png)

## Révision en lot

Parfois, vous souhaitez réviser plusieurs plans de manière ciblée, ou avec votre équipe en temps réel. 

Pour ce cas d’utilisation, [vous pouvez utiliser les playlists](/fr/guides/review-publishing/playlist/).

<!-- #endregion body -->