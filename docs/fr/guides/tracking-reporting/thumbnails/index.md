---
path: "/fr/guides/tracking-reporting/thumbnails"
slug: "thumbnails"
published_at: 2026-09-10
---

# Miniatures

<!-- #region body -->

Une miniature est une petite image d’aperçu associée à une entité telle qu’un plan ou un élément.

Elle fournit une référence visuelle rapide afin que les artistes et le personnel de production puissent identifier une entité en un coup d’œil, sans ouvrir le fichier complet.

## Ajouter des miniatures manuellement

Pour définir un aperçu comme miniature, l’aperçu DOIT avoir été téléversé en tant que révision.

Cliquez sur le statut souhaité dans la page de liste, puis cliquez sur le bouton **Preview** (1) dans le panneau de droite.

![Thumbnail Button](/fr/img/getting-started/pannel_history.png)

Une fois le bouton sélectionné, vous pouvez choisir la première image ou n’importe quelle autre image. Une fois l’image sélectionnée, la miniature apparaît et le bouton devient gris.

![Thumbnail Applied](/fr/img/getting-started/pannel_history_thumbnail.png)


## Ajouter des miniatures automatiquement

Si vous préférez que vos miniatures soient générées automatiquement, vous pouvez accéder à la page des paramètres depuis la production à l’aide du menu de navigation.

![Settings Menu](/fr/img/getting-started/drop_down_menu_setting.png)

Dans l’onglet **Parameters**, sélectionnez **set new preview as entity thumbnail automatically**.

![Settings Preview Auto](/fr/img/getting-started/setting_preview_auto.png)

N’oubliez pas d’**enregistrer** les modifications lorsque vous avez terminé. Désormais, dès que vous téléverserez un aperçu, celui-ci sera automatiquement utilisé comme miniature.

## Téléverser des aperçus par lot (en tant que miniatures)

Utilisez le bouton **Add Thumbnails** ![Add Thumbnails Button](/fr/img/getting-started/add_thumbnails.png) sur la page globale pour importer des miniatures en masse.

![History](/fr/img/getting-started/add_thumbnails_menu.png)

Une nouvelle fenêtre contextuelle s’ouvre et vous demande de choisir les types de tâches auxquels les miniatures sont associées.

**L’importation groupée de miniatures accepte les fichiers image et les fichiers vidéo**. Seule la première image est utilisée comme miniature pour les fichiers vidéo.

Pour que les miniatures soient automatiquement associées au plan correct, vous devez nommer vos miniatures sous la forme sequence_shot.

Par exemple, si votre séquence s’appelle `SEQ_001` et votre plan s’appelle `SH_001`, le nom de fichier de votre miniature doit être `SEQ_001_SH_001`.

<!-- #endregion body -->

