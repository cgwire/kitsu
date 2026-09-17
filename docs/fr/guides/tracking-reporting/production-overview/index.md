---
path: "/fr/guides/tracking-reporting/production-overview"
slug: "production-overview"
published_at: 2026-09-10
---

# Vue d’ensemble de la production

<!-- #region body -->

En tant que producteur, il est essentiel d’avoir une vue d’ensemble complète de l’ensemble du processus de production.

Kitsu propose différents outils pour vous aider à rester informé et à gérer efficacement la production sans être submergé par les notifications ni perdre votre concentration.

## Fonctionnalités du fil d’actualité

La section du fil d’actualité affiche les mises à jour en temps réel relatives à votre production, notamment :

- **Mises à jour en temps réel** : consultez tous les changements de statut au fur et à mesure qu’ils se produisent, minute par minute.
- **Vue récapitulative** : la partie droite de l’écran affiche le nombre total d’actualités ainsi qu’une répartition par statut.
- **Options de filtrage** : filtrez la liste par statut de tâche, type de tâche et personne afin de vous concentrer sur des domaines spécifiques.
- **Panneau de commentaires** : cliquez sur une ligne pour ouvrir le panneau de commentaires à droite et afficher tous les détails nécessaires.

![Page du fil d’actualité](/fr/img/getting-started/newsfeed_comment_all.png)

### Utiliser les filtres

Vous pouvez personnaliser la période d’affichage des informations à l’aide du bouton **Générateur de filtres**. Cela est utile pour vous concentrer sur certains superviseurs ou certaines périodes.

![Détails de la page du fil d’actualité](/fr/img/getting-started/newsfeed_details.png)

### Exemple

Si vous souhaitez vous concentrer sur un superviseur pour un mois donné, sélectionnez son nom et choisissez une date dans le champ **Du**.

![Commentaires de la page du fil d’actualité](/fr/img/getting-started/newsfeed_comment_panel.png)

## Connaître l’état actuel de la production

Comprendre l’état actuel de votre production est essentiel. Kitsu fournit des statistiques détaillées et des visualisations, accessibles à la fois en interne et à votre client, afin de vous aider à suivre efficacement l’avancement.

### Court métrage / Long métrage

Nous allons examiner certaines fonctionnalités propres aux flux de travail des courts métrages et des longs métrages.

#### Statistiques des séquences

La page **Statistiques des séquences** propose des diagrammes circulaires représentant l’état de votre production, séquence par séquence. La palette de couleurs des diagrammes correspond au statut, ce qui vous permet de comprendre rapidement l’état de votre production.

- **Toutes les séquences** : la première ligne représente l’ensemble de la production.
- **Toutes les tâches** : la première colonne inclut toutes les tâches simultanément.

En vous concentrant sur le premier diagramme circulaire, vous pouvez voir l’état exact de votre production. Pour plus de détails, consultez le reste de la ligne afin d’obtenir une vue globale de l’état de chaque type de tâche.

![Vue globale d’une séquence](/fr/img/getting-started/global_view_sequence.png)

#### Statistiques des types d’assets

Comme pour les statistiques des séquences, la page **Statistiques des types d’assets** propose des diagrammes circulaires pour les types d’assets, vous donnant une vue claire de leur état dans l’ensemble de la production.

![Vue globale d’un asset](/fr/img/getting-started/global_view_asset.png)

#### Vue en nombres

Vous pouvez également afficher les données sous forme de **Nombres** pour voir le nombre exact d’assets, de plans ou d’images, ainsi que leur pourcentage par statut.

![Nombres de la vue globale des séquences](/fr/img/getting-started/global_view_sequence_detail_count_stat.png)

![Page des statistiques du nombre d’assets](/fr/img/getting-started/global_view_asset_detail.png)

#### Exporter les données

Vous pouvez exporter cette page sous forme de fichier texte `.csv` et l’importer dans un tableur pour effectuer des analyses et créer des rapports plus approfondis.

En utilisant ces outils, vous pouvez garder le contrôle du processus de production et vous assurer que tout se déroule correctement et dans les délais.

### Spécificités des séries télévisées

Vous pouvez accéder à un niveau d’information supplémentaire sur une série télévisée grâce à la **Page des statistiques des épisodes**.

### Affichage des retakes

Le paramètre par défaut de la page **Statistiques des épisodes** est **Retakes**. Cet affichage vous permet de voir le nombre de retakes (allers-retours) pour chaque épisode et chaque type de tâche. Seules trois couleurs sont affichées :
- **Validé en vert**
- **Retakes en rouge**
- **En cours en gris**

![Vue globale d’un épisode](/fr/img/getting-started/global_view_episode_retake.png)

Si vous déployez un épisode, vous verrez le pourcentage de chaque take ainsi que l’évolution des retakes par rapport aux validations. Cela vous aide à suivre l’avancement de chaque épisode pour chaque tâche.

![Vue globale détaillée d’un épisode déployé](/fr/img/getting-started/global_view_episode_retake_detail.png)

En général, les premiers épisodes comportent de nombreux allers-retours, mais la situation devrait s’améliorer au fil du temps. Toutefois, si les épisodes plus avancés comportent encore beaucoup de retakes, quelque chose doit être corrigé. Il est temps de discuter du problème avec le réalisateur et le superviseur.

### Affichage des statuts

La deuxième option d’affichage des données est **Statut**. Cet affichage fonctionne comme la page de statistiques des **Séquences** / **Types d’assets**.

![Statut de la vue globale d’un épisode](/fr/img/getting-started/global_view_episode_stat.png)

Vous pouvez également afficher les données sous forme de **Nombres**. Vous verrez ainsi le nombre exact de plans ou d’images, avec leur pourcentage par statut.

![Nombre des statuts de la vue globale d’un épisode](/fr/img/getting-started/global_view_episode_stat_count.png)

Vous pouvez exporter cette page sous forme de fichier texte `.csv` et l’importer dans un tableur.

## Rapports de production destinés aux clients

Pour faciliter la communication avec le studio, vous avez un accès direct à une version du rapport de production destinée au client. Celle-ci reprend les pages **Statistiques des séquences** et **Statistiques des types d’assets** décrites ci-dessus et est mise à jour en temps réel. Chaque fois que vous consultez cette page, vous êtes certain de disposer d’informations à jour.

![Menu déroulant client des statistiques de séquence](/fr/img/getting-started/client_dropdown_sequence.png)

![Statistiques de séquence côté client](/fr/img/getting-started/client_sequence_stat.png)

Dans ce rapport, vous pouvez choisir d’afficher les statistiques selon le nombre de plans ou le nombre d’images, et basculer le **Mode d’affichage** entre la vue **Diagrammes circulaires** et la vue **Nombres**, comme dans les pages de statistiques internes.

![Nombres des statistiques de séquence côté client](/fr/img/getting-started/client_sequence_stat_count.png)

C’est cette présentation que vous pouvez télécharger pour suivre l’avancement de la production.

Comme pour les pages internes, vous pouvez exporter cette page sous forme de fichier texte `.csv` afin de l’importer dans un tableur.

Passez d’une production à l’autre à l’aide du menu **Navigation** situé en haut de l’écran. Vous resterez sur la même page, ce qui vous permettra de consulter les statistiques de chaque production en sélectionnant chacune d’entre elles.

![Navigation des statistiques de séquence](/fr/img/getting-started/global_sequence_navigation.png)

<!-- #endregion body -->

