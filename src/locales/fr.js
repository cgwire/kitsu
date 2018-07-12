export default {

  people: {
    title: 'Employés',
    picture: 'Changer l\'image',
    edit_title: 'Modifier les informations de',
    new_person: 'Ajouter un employé',
    delete_text: 'Êtes vous sûr de vouloir retirer {personName} de la base de données?',
    delete_error: 'Une erreur est survenue lors de la suppression. Il y a probablement des données liées à elle. Etes vous sur que cette personne n\'a aucune tâche assignée et n\'a fait aucun commentaire ?',
    persons: 'Personnes',
    running_tasks: 'Tâches en cours',
    csv: {
      import_file: 'Importer',
      export_file: 'Télécharger',
      import_title: 'Import employees from a CSV file',
      required_fields: 'Le fichier CSV à importer doit comporter les colonnes suivantes :',
      select_file: 'Sélectionnez un fichier de votre disque dur :'
    },
    list: {
      name: 'Nom',
      email: 'Adresse Mail',
      phone: 'Téléphone',
      role: 'Rôle',
      active: 'Actif'
    },
    fields: {
      first_name: 'Prénom',
      last_name: 'Nom',
      email: 'Adresse email',
      phone: 'Téléphone',
      role: 'Rôle',
      active: 'Actif',
      old_password: 'Mot de passe actuel',
      password: 'Nouveau mot de passe',
      password_2: 'Répétez le nouveau mot de passe'
    },
    role: {
      admin: 'Administrateur',
      manager: 'Superviseur',
      user: 'Graphiste'
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
    avatar: {
      title: 'Changer votre avatar'
    },
    change_password: {
      button: 'Changez de mot de passe',
      success: 'Votre mot de passe a été changé avec succès !',
      unvalid: 'Les nouveaux mots de passe sont différents ou votre mot de passe est trop court (7 caractères minimum).',
      error: 'Une erreur s\'est produite lors du changement de mot de passe. Veuillez vérifier votre mot de pass actuel.'
    }
  },

  main: {
    add: 'Ajouter',
    profile: 'Profil',
    logout: 'Se déconnecter',
    save: 'Enregistrer',
    cancel: 'Annuler',
    close: 'Fermer',
    or: 'ou',
    yes: 'oui',
    no: 'non',
    info: 'Information',
    confirmation: 'Confirmer',
    confirmation_and_stay: 'Confirmer et rester',
    clear_selection: 'Effacer la sélection',
    delete_text: 'Etes vous sûr de vouloir supprimer {name} de la base de données ?',
    loading_error: 'Une erreur est survenue en chargeant les données.',
    user: 'Utilisateur',
    production: 'Production',
    studio: 'Studio',
    admin: 'Admin',
    back_to_list: 'retour à la liste',
    empty_comment: 'Commentaire vide',
    csv: {
      import_file: 'Importer',
      export_file: 'Exporter',
      import_title: 'Importer depuis un .csv',
      required_fields: 'Le fichier CSV à importer doit comporter les colonnes suivantes :',
      select_file: 'Sélectionner un fichier depuis votre dossier :',
      error_upload: 'Une erreur est survenue en téleversant votre fichier .csv.'
    }
  },

  menu: {
    assign_tasks: 'Assigner des tâches',
    create_tasks: 'Créer des tâches',
    change_status: 'Changer le statut',
    run_custom_action: 'Lancer des actions'
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
    current: 'Production sélectionnée ',
    home: {
      title: 'Productions en cours',
      welcome: 'Bienvenue sur Kitsu',
      empty: 'Vous n\'avez pas de production ouverte, voulez vous en créer une nouvelle ?',
      create_new: 'Créer une nouvelle production',
      no_task: 'Vous n\'avez pas de tâches assignées. Demandez à votre superviseur ce que vous pouvez faire !'
    },
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

  comments: {
    retake: 'Reprise',
    validated: 'Validé !',
    validation_required: 'Validation requise',
    add_comment: 'Ajouter un commentaire...',
    post_status: 'Envoyer l\'état'
  },

  tasks: {
    preview: 'Pré-visualisation',
    validation: 'Validation',
    assign: 'Assigner une tâche à : | Assigner {nbSelectedTasks} tâches à :',
    change_status_to: 'Changer le statut de la tâche à : ',
    no_preview: 'Il n\'y a pas de previz pour cette tâche..',
    no_comment: 'Il n\'y a pas de commentaires pour cette tâche.',
    clear_assignations: 'effacer les assignations',
    no_assignation_right: 'vous n\'êtes pas autorisé à gérer les assigations.',
    create_tasks: 'Ajouter des tâches',
    create_tasks_shot: 'Ajouter des tâches pour les plans affichés',
    create_tasks_shot_explaination: 'Vous allez créer une nouvelle tâche pour chaque plan de la liste affichée. Est-ce que vous voulez continuer ?',
    create_tasks_shot_failed: 'Une erreur serveur est survenue pendant la création des tâches.',
    create_tasks_asset: 'Ajouter des tâches pour les assets affichés',
    create_tasks_asset_explaination: 'Vous allez créer une nouvelle tâche pour chaque asset de la liste affichée. Est-ce que vous voulez continuer ?',
    create_tasks_asset_failed: 'Une erreur serveur est survenue pendant la création des tâches.',
    current_status: 'Statut actuel :',
    add_preview: 'Ajouter une previz',
    add_preview_error: 'Une erreur est survenue en ajoutant la preview.',
    set_preview: 'Utilisez cette previz comme vignette',
    set_preview_error: 'Une erreur est survenue en utilisant cette vignette.',
    set_preview_done: 'Cette previz sert de vignette à l\'entité courante.',
    select_preview_file: 'Choisissez une preview sur votre disque dur:',
    delete_error: 'Une erreur est survenue en supprimant la tâche.',
    feedback: 'retours',
    my_tasks: 'Mes tâches',
    tasks: 'Tâches',
    current: 'En cours',
    done: 'Terminées',
    create_for_selection: 'Créer une tâche pour chaque cellule vide :',
    fields: {
      task_type: 'Type',
      production: 'Prod',
      entity: 'Entité',
      task_status: 'Statut',
      last_comment: 'Dernier commentaire',
      assignees: 'Assignation',
      end_date: 'Date de fin'
    }
  },

  task_types: {
    title: 'Types de tâches',
    edit_title: 'Modifier le type de tâches',
    number: 'type de tâche | types de tâches',
    new_task_type: 'Ajouter un type de tâche',
    fields: {
      name: 'Nom',
      color: 'Couleur',
      priority: 'Priorité',
      dedicated_to: 'Pour'
    },
    delete_text: 'Êtes vous sur de vouloir retirer {name} de la base de données ?',
    delete_error: 'Une erreur est survenue lors de la suppression du type de tâche. Êtes vous sûr qu\'aucune tâche n\'est lié à ce type de tâche ?'
  },

  task_status: {
    title: 'Statut des tâches',
    edit_title: 'Modifier statut',
    number: 'statut | task statuts',
    new_task_status: 'Ajouter un statut de tâche',
    fields: {
      name: 'Nom',
      short_name: 'Nom court',
      color: 'Couleur',
      is_reviewable: 'Est vérifiable',
      is_done: 'Est terminé'
    },
    delete_text: 'Êtes vous sur de vouloir retirer {name} de la base de données ?',
    delete_error: 'Une erreur est survenue lors de la suppression du statut de tâche. Êtes vous sûr qu\'aucune tâche n\'est lié à ce statut de tâche ?'
  },

  custom_actions: {
    title: 'Actions',
    new_custom_action: 'Ajouter une action personnalisée',
    number: 'action pesonnalisée | actions personnalisées',
    run_for_selection: 'Lancer une action personnalisée pour les tâche sélectionnées :',
    delete_text: 'Êtes-vous sûr de supprimer l\'action personnalisée {name} de la base de données?',
    delete_error: 'Une erreur est survenue en supprimant l\'action personnalisée.',
    fields: {
      name: 'Nom',
      url: 'URL',
      entity_type: 'Type d\'entité'
    }
  },

  asset_types: {
    title: 'Types d\'assets',
    edit_title: 'Modifier le type d\'asset',
    number: 'type d\'asset | types d\'assets',
    new_asset_type: 'Ajouter un type d\'asset',
    fields: {
      name: 'Nom'
    },
    delete_text: 'Êtes vous sur de vouloir enlever {name} de la base de données ?',
    delete_error: 'Une erreur est survenue en supprimant un type d\'asset. Êtes vous sûr qu\'aucun asset est lié à ce type d\'asset?'
  },

  assets: {
    title: 'Assets',
    edit_title: 'Modifier asset',
    number: 'asset | assets',
    new_asset: 'Ajouter un asset',
    new_assets: 'Ajouter des assets',
    edit_fail: 'La création ou l\'édition a échoué, une erreur est survenue.',
    new_success: 'Asset {name} créé avec succès.',
    empty_list: 'Il n\'y a pas d\'assets dans la production. Voulez vous en créer ?',
    fields: {
      name: 'Asset',
      type: 'Type',
      production: 'Prod',
      description: 'Description'
    },
    delete_text: 'Etes vous sûr de vouloir retirer {name} de la base de données ?',
    delete_error: 'Une erreur est survenue en créant l\'asset, êtes vous sûr de vouloir que l\'asset n\'ait plus aucun lien ?',
    restore_text: 'Êtes vous sûr de vouloir restaurer {name} dans votre base de données ?',
    restore_error: 'Une erreur est survenue en restaurant l\'asset.',
    tasks: 'Tâches de fabrication',
    cast_in: 'Présent dans',
    no_cast_in: 'Cet asset n\'apparait dans aucun shot.'
  },

  shots: {
    title: 'Plans',
    edit_title: 'Modifier plan',
    number: 'plan | plans',
    new_shot: 'Ajouter un plan',
    new_shots: 'Ajouter des plans',
    new_sequences: 'Ajouter des séquences',
    new_episodes: 'Ajouter des épisodes',
    manage: 'Gérer les plans',
    edit_fail: 'La création ou l\'édition a échoué, une erreur est survenue.',
    new_success: 'Plan {name} créé avec succès.',
    description: 'Description',
    empty_list: 'Il n\'y a pas de shots dans la production. Voulez vous en créer ?',
    fields: {
      name: 'Plan',
      episode: 'Épisode',
      sequence: 'Séquence',
      frame_in: 'In',
      frame_out: 'Out',
      fps: 'FPS',
      description: 'Description',
      production: 'Prod'
    },
    delete_text: 'Etes vous sûr de vouloir retirer {name} de la base de données ?',
    delete_error: 'Une erreur est survenue en créant le plan, êtes vous sûr que le plan n\'a plus aucun lien ?',
    restore_text: 'Etes vous sûr de vouloir restorer {name} dans la base de données ?',
    restore_error: 'Une erreur est survenue en restorant le plan.',
    tasks: 'Tâches de fabrication',
    casting: 'Casting',
    no_cast_in: 'Le casting du plan est vide.'
  },

  sequences: {
    title: 'Sequences',
    number: 'sequence | sequences',
    new_sequence: 'Nouvelle sequence',
    edit_title: 'Éditer sequence',
    delete_text: 'Etes vous sûr de vouloir retirer {name} de la base de données ?',
    delete_error: 'Une erreur est survenue en créant le plan, êtes vous sûr que la séquence n\'a plus aucun lien ?',
    empty_list: 'Il n\'y a pas de séquence dans la description. Pourquoi pas en créer quelques uns?',
    fields: {
      name: 'Nom',
      description: 'Description'
    }
  },

  episodes: {
    title: 'Episodes',
    number: 'episode | episodes',
    new_episode: 'Nouvelle episode',
    edit_title: 'Éditer episode',
    delete_text: 'Etes vous sûr de vouloir retirer {name} de la base de données ?',
    delete_error: 'Une erreur est survenue en créant le plan, êtes vous sûr que la séquence n\'a plus aucun lien ?',
    empty_list: 'Il n\'y a pas de séquence dans la description. Pourquoi pas en créer quelques uns?',
    fields: {
      name: 'Nom',
      description: 'Description'
    }
  },

  breakdown: {
    title: 'Casting',
    select_shot: 'Sélectionnez un shot à gauche pour gérer son casting',
    selected_shot: 'Assets présents dans le casting de {sequence_name} / {name}',
    all_assets: 'Tous les assets disponibles',
    save_error: 'Une erreur est survenue en sauvegardant le casting.'
  },

  playlists: {
    title: 'Playlists',
    new_playlist: 'Ajouter une playlist',
    loading_error: 'Une erreur serveur est apparue, les playlists ne peuvent pas être chargées.',
    no_selection: 'Séléctionnez une playlist sur la gauche.',
    delete_text: 'Êtes vous sûr de vouloir supprimer {name} de la base de données ?',
    delete_error: 'Une erreur est survenue en supprimant la playlist.'
  },

  notifications: {
    title: 'Notifications',
    commented_on: 'a commenté',
    and_change_status: 'et changé le statut à',
    with_preview: 'avec une version'
  },

  server_down: {
    title: 'Kitsu a rencontré une erreur en communiquant avec son API de données.',
    text: 'Contactez votre fournisseur, votre administrateur système ou votre département informatique pour comprendre ce qui ne va pas.'
  }

}
