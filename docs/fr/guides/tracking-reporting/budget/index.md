---
path: "/fr/guides/tracking-reporting/budget"
slug: "budget"
published_at: 2026-09-10
---

# Budget

<!-- #region body -->

Dans votre menu Production, accédez à Budget pour trouver la page de prévision budgétaire :

![](/fr/guides/tracking-reporting/budget/images/0.png)

Vous pouvez utiliser cette page pour prévoir, comparer et gérer les coûts de production avec précision :

- Suivre la répartition des dépenses et surveiller l’évolution des coûts au fil du temps pour votre équipe recrutée
- Créer plusieurs versions du budget pour planifier différents scénarios
- Les administrateurs peuvent saisir les tarifs journaliers au niveau de chaque personne. Ceux-ci sont utilisés lorsque cette personne est affectée à un rôle dans un département
- Pour les recrutements prévus, vous pouvez utiliser un profil fictif basé sur l’ancienneté, avec une échelle salariale correspondante
- Récupérer automatiquement les données de coûts depuis vos listes de licences logicielles et de matériel

## Créer un nouveau budget

La première fois que vous utilisez cette fonctionnalité, cliquez sur `Créer un nouveau budget` :

![](/fr/guides/tracking-reporting/budget/images/1.png)

Choisissez un nom et une devise :

![](/fr/guides/tracking-reporting/budget/images/2.png)

## Ajouter une nouvelle entrée budgétaire

Une entrée budgétaire représente un élément de coût que vous ajoutez au plan budgétaire d’une production. Il peut s’agir, par exemple, du tarif journalier d’une personne pour un type de tâche, du coût d’un logiciel ou d’une licence, ou encore du coût d’un équipement.

Sur la page `Budget`, vous pouvez ajouter des entrées de main-d’œuvre en cliquant sur le bouton `Ajouter une entrée` :

![](/fr/guides/tracking-reporting/budget/images/3.png)

Remplissez ensuite le formulaire et cliquez sur `Confirmer` :

![](/fr/guides/tracking-reporting/budget/images/4.png)

- **Département** : le département auquel la personne appartient
- **Personne** (facultatif) : la personne pour laquelle vous établissez le budget
- **Poste** : artiste, superviseur ou responsable
- **Ancienneté** : junior, intermédiaire ou senior
- **Date de début** : la date à laquelle son travail commence
- **Durée en mois** : le nombre de mois pendant lesquels le travail dure
- **Salaire journalier** : le montant qui lui est versé par jour dans la devise du budget

Le salaire mensuel est calculé comme suit : `Salaire journalier X 20 jours travaillés par mois`. Le salaire total correspond simplement au salaire mensuel multiplié par le nombre de mois budgétés.

Pour faciliter l’établissement du budget, il est possible de définir une échelle salariale que Kitsu utilisera pour générer un salaire journalier par défaut en fonction du département, du poste et de l’ancienneté.

## Définir une échelle salariale

La page consacrée à l’échelle salariale est accessible depuis `Menu principal > Administration > Échelle salariale` :

![](/fr/guides/tracking-reporting/budget/images/5.png)

Les responsables de studio peuvent définir des tarifs journaliers par défaut en fonction du département, du poste et de l’ancienneté de la personne.

Cliquez simplement sur la cellule salariale que vous souhaitez modifier et saisissez votre montant. Kitsu enregistre automatiquement toute modification.

## Ajouter une nouvelle version du budget

Vous devez parfois prévoir différents scénarios budgétaires afin de voir leur impact sur votre production.

Pour ce faire, vous pouvez créer une nouvelle version du budget en cliquant sur `Nouvelle version` dans le coin supérieur droit de votre page de budget.

## Gérer les licences logicielles

Pour gérer les coûts des licences logicielles, accédez à `Menu principal > Administration > Licences logicielles` :

![](/fr/guides/tracking-reporting/budget/images/6.png)

Chaque entrée budgétaire possède les propriétés suivantes :

- **Nom** : le nom complet du logiciel
- **Nom court** : un nom abrégé pour les rapports
- **Extension** : l’extension de fichier, le cas échéant (par exemple .blend pour Blender)
- **Version** : le numéro de version du logiciel
- **Coût mensuel** : le coût mensuel du logiciel
- **Quantité en inventaire** : le nombre de licences achetées
- **Quantité restante** : le nombre de licences encore disponibles

## Comptabiliser les équipements

Pour gérer les coûts des équipements, accédez à `Menu principal > Administration > Équipements` :

![](/fr/guides/tracking-reporting/budget/images/7.png)

Chaque entrée possède les propriétés suivantes :

- **Nom** : le nom complet du produit
- **Nom court** : un nom abrégé pour les rapports
- **Coût mensuel** : le coût mensuel du produit
- **Quantité en inventaire** : le nombre de produits achetés
- **Quantité restante** : le nombre de produits encore disponibles

## Lier les licences logicielles et les équipements aux départements

Sur la page Départements (`Menu principal > Administration > Départements`), vous pouvez accéder aux onglets Matériel lié et Logiciels liés afin d’affecter des coûts aux départements :

![](/fr/guides/tracking-reporting/budget/images/8.png)

Cliquez simplement sur l’`Élément lié` pour le supprimer, et cliquez sur un `Élément disponible` pour l’ajouter au département.

Kitsu répartit automatiquement les coûts par département en fonction du nombre de personnes qui y travaillent. Il met également à jour le champ `Quantité restante` des entrées comptables.

## Prévisions budgétaires et coûts réels

Bien sûr, la réalité ne correspond pas toujours aux prévisions. Kitsu en tient compte grâce à un bouton `Afficher les coûts réels` que vous pouvez activer pour obtenir une comparaison détaillée entre les prévisions budgétaires et le budget réel de la production :

![](/fr/guides/tracking-reporting/budget/images/9.png)

<!-- #endregion body -->