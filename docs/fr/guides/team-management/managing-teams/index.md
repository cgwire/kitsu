---
path: "/fr/guides/team-management/managing-teams"
slug: "managing-teams"
published_at: 2026-09-10
---

# Gérer les équipes

<iframe width="560" height="315" src="https://www.youtube.com/embed/sUs-wPbpYF8?si=yjbC8MGdrA2-a1QJ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

<!-- #region body -->

Il existe deux bibliothèques pour les utilisateurs :
- La **Page des personnes** (bibliothèque globale) est utilisée pour déterminer les autorisations, les contrats et les départements auxquels les utilisateurs appartiennent.
- La **Page de l'équipe** (bibliothèque de production) est utilisée pour définir qui travaille sur un projet et donner accès à la production.

## Créer des utilisateurs

<!-- #region setup -->

Pour attribuer des tâches à des personnes, vous devez d'abord créer un compte pour elles dans Kitsu.

Allez dans le **Menu de navigation principal** et choisissez la page **Personnes** dans la section **STUDIO**.

![Menu Personnes](/fr/guides/team-management/managing-teams/screenshots/001.png)

Vous arrivez sur la page Personnes. C'est ici que vous pouvez gérer les équipes :

![Page Personnes](/fr/guides/team-management/managing-teams/screenshots/002.png)

Cliquez ensuite sur le bouton `Ajouter un nouvel utilisateur` dans le coin supérieur droit pour ouvrir la fenêtre de création :

![Créer un nouvel utilisateur](/fr/guides/team-management/managing-teams/screenshots/003.png)

Vous serez ensuite invité à saisir les informations suivantes (veuillez noter que certains champs sont obligatoires pour créer l'utilisateur) :
- 1) Prénom (**OBLIGATOIRE**)
- 2) Nom
- 3) E-mail (**OBLIGATOIRE**)
- 4) Numéro de téléphone

::: danger Important !
Une adresse e-mail est **obligatoire** et doit être unique pour créer un compte.
:::

![Créer un nouvel utilisateur](/fr/guides/team-management/managing-teams/screenshots/010.png)

- 5) Vous pouvez spécifier un ou plusieurs **Départements** auxquels associer un utilisateur.

L'affectation à un département aura également une incidence sur ce qui s'affiche sur la page **Mes vérifications**, qui n'affichera que les tâches liées à votre département.

Enfin, la page de feuille de temps sera également filtrée afin de n'afficher que les tâches de votre département.

Une fois qu'un utilisateur est associé à un département, différentes options deviennent disponibles pour lui. Par exemple, il bénéficie d'un accès direct à la vue de son département sur la page d'accueil globale.

Le responsable du département pourra commenter toutes les tâches de son département et attribuer des tâches uniquement aux personnes appartenant au(x) même(s) département(s).

![Vue filtrée par département](/fr/img/getting-started/department_filtered_view.png)

- 6) Rôle : c'est ici que vous définirez le rôle d'autorisation de l'utilisateur. [Consultez la documentation sur les rôles d'autorisation des utilisateurs](/fr/guides/team-management/team-roles/) pour en savoir plus sur les différents rôles.

- 7) Actif

Cette section vous permet de choisir d'activer immédiatement les utilisateurs. Si l'utilisateur a besoin d'un accès immédiat à Kitsu, définissez cette option sur **oui**. Cependant, il peut arriver que vous souhaitiez créer un utilisateur sans être encore prêt à lui donner accès à Kitsu (par exemple, si vous souhaitez planifier des tâches pour un artiste qui doit commencer à travailler dans deux semaines). Dans ce cas, vous pouvez créer et planifier l'utilisateur, puis simplement l'activer lorsqu'il commencera.

::: danger Important !
Chaque utilisateur doit disposer d'un compte individuel pour se connecter à Kitsu.
:::

<!-- #endregion setup -->

## Ajouter des utilisateurs à une équipe de production

<!-- #region addusers -->

Une fois votre production créée, vous devez ajouter des utilisateurs à l'équipe de la production afin de leur permettre d'y accéder.

Faire partie d'une équipe permet également de vous attribuer des tâches.

::: tip
Il n'est pas nécessaire d'ajouter le rôle de Responsable du studio à une équipe pour lui donner une autorisation de lecture (puisque ce rôle y aura de toute façon accès). Cependant, si vous souhaitez lui attribuer des tâches, vous devrez l'ajouter à l'équipe.
:::

Pour ajouter des utilisateurs à une équipe, dans votre projet, utilisez le menu déroulant **navigation** en haut de la page et sélectionnez la page **ÉQUIPE**.

![Menu déroulant équipe](/fr/guides/team-management/managing-teams/screenshots/017.png)

Sur la page **Équipe**, vous pouvez voir tous les utilisateurs qui ont été affectés à ce projet. Si vous venez de créer un tout nouveau projet, cette page sera vide. Vous pouvez également passer rapidement à la page de l'équipe d'un autre projet en sélectionnant le nom du projet dans le menu déroulant en haut de la page.

![Page Équipe](/fr/guides/team-management/managing-teams/screenshots/018.png)

::: warning
Les autorisations et les départements sont définis au **niveau du studio**. Vous ne pouvez pas les modifier au niveau de la production.
:::

<!-- #endregion addusers -->

## Retirer des utilisateurs d'une équipe

Pour retirer un utilisateur d'une production, allez dans `Menu de production > Équipe`, placez le curseur sur la ligne de l'utilisateur concerné, puis cliquez sur le bouton `Retirer`.

![retirer un utilisateur de l'équipe](/fr/guides/team-management/managing-teams/screenshots/020.png)

La suppression d'un utilisateur d'un département s'effectue dans la page `Menu principal > Studio > Personnes`. Cliquez simplement sur le bouton `Modifier` de l'utilisateur concerné, puis, dans la section des départements, cliquez sur le département duquel vous souhaitez retirer cette personne.

## Supprimer des utilisateurs

Pour supprimer un utilisateur, vous devez d'abord modifier son statut en `Inactif` dans la page `Personnes` du studio.

![modifier le statut d'un utilisateur en inactif](/fr/guides/team-management/managing-teams/screenshots/028.png)

Ensuite, allez dans l'onglet `Inactifs`, placez le curseur sur l'utilisateur que vous souhaitez sélectionner, puis cliquez sur l'icône `Supprimer`.

![supprimer un utilisateur inactif](/fr/guides/team-management/managing-teams/screenshots/031.png)

<!-- #endregion body -->