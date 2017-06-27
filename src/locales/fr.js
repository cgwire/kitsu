export default {
  people: {
    title: 'Employés',
    edit_title: 'Modifier les informations de',
    new_person: 'Ajouter un employé',
    delete_text: 'Êtes vous sûr de vouloir retirer {personName} de la base de données?',
    delete_error: 'Une erreur est survenue lors de la suppression. Il y a probablement des données liées à elle. Etes vous sur que cette personne n\'a aucune tâche assignée et n\'a fait aucun commentaire ?',
    persons: 'Personnes',
    csv: {
      import_file: 'Importer un fichier .csv',
      export_file: 'Télécharger en .csv',
      import_title: 'Import employees from a CSV file',
      required_fields: 'Le fichier CSV à importer doit comporter les colonnes suivantes :',
      select_file: 'Sélectionnez un fichier de votre disque dur :'
    },
    list: {
      name: 'Nom',
      email: 'Adresse Mail',
      phone: 'Téléphone'
    },
    fields: {
      first_name: 'Prénom',
      last_name: 'Nom',
      email: 'Adresse email',
      phone: 'Téléphone',
      old_password: 'Mot de passe actuel',
      password: 'Nouveau mot de passe',
      password_2: 'Répétez le nouveau mot de passe'
    }
  },

  profile: {
    title: 'Votre Profil',
    info_title: 'Informations',
    password_title: 'Changement de mot de passe',
    timezone: 'Fuseau horaire',
    language: 'Langue',
    save: {
      button: 'Sauvegardez vos changements',
      error: 'Une erreur est survenue pendant la sauvegarde de vos changememts.'
    },
    change_password: {
      button: 'Changez de mot de passe',
      success: 'Votre mot de passe a été changé avec succès !',
      unvalid: 'Les nouveaux mots de passe sont différents ou votre mot de passe est trop court (7 caractères minimum).',
      error: 'Une erreur s\'est produite lors du changement de mot de passe. Veuillez vérifier votre mot de pass actuel.'
    }
  },

  main: {
    profile: 'Profil',
    logout: 'Se déconnecter',
    cancel: 'Annuler',
    confirmation: 'Confirmer'
  },

  login: {
    title: 'Se connecter à Kitsu',
    login: 'Se connecter',
    login_failed: 'La connexion a échoué, vérifiez vos identifiants',
    fields: {
      email: 'Adresse Mail',
      password: 'Mot de passe'
    }
  },

  productions: {
    title: 'Productions',
    edit_title: 'Modifier la production',
    new_production: 'Ajouter une production',
    number: 'production | productions',
    fields: {
      name: 'Nom',
      status: 'État'
    },
    status: {
      open: 'Ouvert',
      closed: 'Fermé'
    },
    delete_text: 'Êtes vous sûr de vouloir retirer {name} de la base de données?',
    delete_error: 'Une erreur est survenue lors de la suppression. Il y a probablement des données liées à cette production. Etes vous sur que cette production n\'a aucune tâche, shot ou asset lié ?'
  },

  task_types: {
    title: 'Types de Tâches'
  },

  server_down: {
    title: 'Kitsu a rencontré une erreur en communiquant avec son API de données.',
    text: 'Contactez votre fournisseur, votre administrateur système ou votre déartement informatique pour comprendre ce qui ne va pas.'
  }
}
