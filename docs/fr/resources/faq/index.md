---
path: "/fr/resources/faq"
slug: "faq"
published_at: 2026-09-10
---

# Questions fréquemment posées

Ce guide de FAQ fournit des solutions rapides aux problèmes courants liés à Kitsu, tels que les problèmes de connexion, la gestion des tâches et l’organisation de la production. Consultez les sections ci-dessous pour obtenir des instructions détaillées et des conseils utiles. Pour obtenir davantage d’aide, consultez la [documentation détaillée de Kitsu](../configure-kitsu/) ou contactez le support.

---

## Problèmes de connexion

### Je n’arrive plus à me connecter à Kitsu
La première chose à vérifier est **l’adresse web** que vous utilisez pour vous connecter.

- Si l’adresse web est **account.cg-wire.com/signin** et que vous voyez le logo CGWire, vous êtes sur la **mauvaise page**.

  ![Connexion au compte](/fr/img/getting-started/account_login.png)

  La **page du compte** sert uniquement à gérer les abonnements, les factures, etc. Vous n’y aurez pas accès, sauf si vous avez souscrit à un abonnement.

- L’adresse web correcte de votre instance Kitsu doit ressembler à **your-studio-name.cg-wire.com**. Sur cette page, vous serez invité à vous connecter et vous devriez voir le logo Kitsu.

  ![Connexion à Kitsu](/fr/img/getting-started/kitsu_login.png)

Si vous n’êtes pas sûr du lien correct :
- Consultez l’e-mail d’invitation que vous avez reçu.
- Contactez le responsable de votre studio pour obtenir de l’aide.

---

## Gestion des tâches

### J’ai créé un nouveau type de tâche, mais je ne le vois pas dans ma production
Si vous avez créé un nouveau type de tâche ([voir la documentation](../configure-kitsu/#task-types)) mais qu’il n’apparaît pas dans votre production, c’est probablement parce que les types de tâches doivent être ajoutés explicitement à votre **bibliothèque de production** après avoir été créés dans la **bibliothèque du studio**.

#### Comprendre la différence :
- **Bibliothèque du studio** : c’est ici que tous les types de tâches sont initialement créés et stockés pour votre studio.
- **Bibliothèque de production** : chaque production possède sa propre bibliothèque, et les types de tâches doivent y être ajoutés avant de pouvoir être utilisés dans cette production.


#### Étapes pour ajouter des types de tâches à votre production
1. Accédez à la page **Paramètres** de votre production depuis le menu de navigation.
   ![Page des paramètres de production](/fr/img/getting-started/drop_down_menu_setting.png)

2. Accédez à l’onglet **Types de tâches**.
   ![Page des paramètres des types de tâches](/fr/img/getting-started/setting_task_add.png)

3. Sélectionnez l’onglet de l’entité appropriée (par exemple : assets, plans, séquences, épisodes, montages).
4. Trouvez votre type de tâche dans la liste à droite et cliquez dessus pour l’ajouter.

Une fois ajouté, retournez sur la page de votre entité et cliquez sur **Ajouter un type de tâche**.
![Ajouter un type de tâche](/fr/img/getting-started/add_tasktype.png)

:::warning
**Autorisations** :
   Si vous ne voyez pas l’option **Paramètres** dans le menu principal, vous ne disposez peut-être pas des autorisations nécessaires. Contactez l’administrateur de votre studio si cette option n’est pas disponible.
:::

---

### Les colonnes de mes types de tâches ne sont pas dans le bon ordre
Si les colonnes des types de tâches apparaissent dans le mauvais ordre, vous pouvez les réorganiser :

- **Ordre pour tout le studio** :
  1. Dans le menu principal, accédez à la section **ADMIN** et cliquez sur **Types de tâches**.
     ![Menu d’administration des types de tâches](/fr/img/getting-started/menu_tasktype.png)
  2. Faites glisser les types de tâches pour les placer dans l’ordre souhaité.
     ![Ordre des types de tâches](/fr/img/getting-started/created_task_top.png)

- **Ordre spécifique à la production** :
  1. Accédez à la page **Paramètres** de votre production.
  2. Accédez à l’onglet **Types de tâches** et réorganisez-les par glisser-déposer.

---

### Les colonnes des types de tâches sont manquantes
Si certaines colonnes de types de tâches sont absentes de la page de l’entité :

1. Vérifiez le filtre de département et assurez-vous qu’il est réglé sur **Tous les départements**.
   ![Vue filtrée par département](/fr/img/getting-started/department_filtered_view.png)

2. Vérifiez que le bouton **Afficher les informations supplémentaires** est activé.
   ![Option masquer](/fr/img/getting-started/display_hide_option.png)

3. Si les colonnes sont réduites, elles ne s’afficheront pas tant que les informations supplémentaires ne seront pas affichées.

---

## Équipe et affectations

### Je ne peux affecter personne à une tâche
Si la liste des personnes affectées dans le panneau de commentaires est vide, cela signifie que les personnes que vous avez ajoutées à la page **Personnes** n’ont pas été ajoutées à la production.

#### Étapes pour ajouter des personnes à une production
1. Accédez à la page **Équipe** depuis le menu de la production.
   ![Menu Équipe](/fr/img/getting-started/drop_down_menu_team.png)

2. La page **Équipe** sera vide, mais vous verrez une liste de personnes à droite.
   ![Page Équipe vide](/fr/img/getting-started/people_empty.png)

3. Ajoutez des personnes individuellement ou par département.

Une fois ajoutées, elles auront accès à la production et vous pourrez leur affecter des tâches.

---

### Toutes les affectations ont disparu
Si les avatars des personnes affectées ne sont plus visibles :

1. Vérifiez que vous n’avez pas cliqué accidentellement sur le bouton **Masquer les affectations**.
   ![Option masquer](/fr/img/getting-started/display_hide_option.png)

2. Cliquez à nouveau sur le bouton pour faire réapparaître les avatars.

---

## Gestion de la production

### Comment supprimer ou archiver une production

Si vous n’avez plus besoin d’accéder à une production, vous pouvez choisir de l’archiver ou de la supprimer.

- **Archivage** : la production sera retirée du menu de navigation, mais restera accessible à titre de référence.
- **Suppression** : il s’agit d’une action permanente et irréversible qui supprimera complètement la production de votre instance Kitsu.

#### Étapes pour archiver une production
1. Accédez au menu principal et sélectionnez **Productions** dans la section **STUDIO**.
   ![Productions du menu principal](/fr/img/getting-started/main_menu_production.png)

2. Repérez la production que vous souhaitez archiver et cliquez sur le bouton de modification.
   ![Modifier les productions](/fr/img/getting-started/edit_production.png)

3. Faites passer le **Statut** de **Ouvert** à **Fermé**, puis confirmez.
   ![Option de modification des productions](/fr/img/getting-started/production_edit_status.png)

La production est maintenant archivée et n’apparaîtra plus dans le menu de navigation.

---

#### Étapes pour supprimer une production
Seules les productions archivées peuvent être supprimées. Si vous êtes certain de vouloir supprimer définitivement une production :

1. Dans la liste des **Productions**, placez le curseur sur la production archivée (fermée). Une icône de corbeille apparaîtra.
2. Cliquez sur l’icône de corbeille pour ouvrir une boîte de dialogue de confirmation.
3. Saisissez le nom de la production pour confirmer la suppression.

![Supprimer la production](/fr/img/getting-started/delete_production.png)

:::warning
La suppression d’une production est permanente et ne peut pas être annulée. Ne procédez que si vous êtes certain que ces données ne sont plus nécessaires.
:::

---

## Divers

### Où puis-je voir l’espace de stockage que j’utilise ?
Actuellement, Kitsu n’affiche pas directement l’utilisation de l’espace de stockage dans l’interface ou sur la page de votre compte. Vous ne trouverez donc pas dans l’application de section indiquant la quantité d’espace consommée par vos productions ou vos assets.

Si vous devez vérifier votre utilisation du stockage :
- Contactez votre administrateur système ou votre équipe informatique si Kitsu est hébergé sur les serveurs de votre studio.
- Si vous utilisez une instance Kitsu hébergée dans le cloud, envoyez un e-mail à **support@cg-wire.com** en indiquant le nom de votre studio et les informations de votre compte. Notre équipe pourra alors vous fournir les informations nécessaires.