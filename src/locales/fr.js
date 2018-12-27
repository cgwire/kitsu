export default {

  people: {
    add_member_to_team: 'Ajouter un membre à l\'équipe: ',
    delete_text: 'Êtes vous sûr de vouloir retirer {personName} de la base de données?',
    delete_error: 'Une erreur est survenue lors de la suppression. Il y a probablement des données liées à elle. Etes vous sur que cette personne n\'a aucune tâche assignée et n\'a fait aucun commentaire ?',
    edit_title: 'Modifier les informations de',
    empty_team: 'Personne n\'a été affecté à cette production',
    new_person: 'Ajouter un employé',
    persons: 'Personnes',
    picture: 'Changer l\'image',
    running_tasks: 'Tâches en cours',
    select_person: 'Sélectionner une personne...',
    team: 'Équipe',
    title: 'Employés',
    csv: {
      export_file: 'Télécharger',
      import_file: 'Importer',
      import_title: 'Import employees from a CSV file',
      required_fields: 'Le fichier CSV à importer doit comporter les colonnes suivantes :',
      select_file: 'Sélectionnez un fichier de votre disque dur :'
    },
    list: {
      active: 'Actif',
      email: 'Adresse Mail',
      name: 'Nom',
      phone: 'Téléphone',
      role: 'Rôle'
    },
    fields: {
      active: 'Actif',
      email: 'Adresse email',
      first_name: 'Prénom',
      last_name: 'Nom',
      old_password: 'Mot de passe actuel',
      password: 'Nouveau mot de passe',
      password_2: 'Répétez le nouveau mot de passe',
      phone: 'Téléphone',
      role: 'Rôle'
    },
    role: {
      admin: 'Studio Manager',
      manager: 'Superviseur',
      user: 'Graphiste',
      client: 'Client'
    }
  },

  profile: {
    title: 'Votre Profil',
    info_title: 'Informations',
    password_title: 'Changement de mot de passe',
    timezone: 'Fuseau horaire',
    language: 'Langue',
    change_avatar: 'Changer Avatar',
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
    all: 'Tous',
    admin: 'Admin',
    back_to_list: 'retour à la liste',
    cancel: 'Annuler',
    confirmation: 'Confirmer',
    confirmation_and_stay: 'Confirmer et rester',
    clear_selection: 'Effacer la sélection',
    close: 'Fermer',
    dark_theme: 'Thème sombre',
    delete_all: 'Supprimer tout',
    documentation: 'Documentation',
    delete_text: 'Etes vous sûr de vouloir supprimer {name} de la base de données ?',
    empty_comment: 'Commentaire vide',
    history: 'Historique',
    info: 'Information',
    loading_data: 'Chargement des données',
    loading_error: 'Une erreur est survenue en chargeant les données.',
    logout: 'Se déconnecter',
    maximize: 'Maximiser',
    minimize: 'Minimiser',
    no: 'non',
    or: 'ou',
    production: 'Production',
    profile: 'Profil',
    remove: 'Enlever',
    studio: 'Studio',
    user: 'Utilisateur',
    save: 'Enregistrer',
    white_theme: 'Thème blanc',
    yes: 'oui',
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
    change_priority: 'Change priority',
    delete_tasks: 'Supprimer des tâches',
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
    current: 'Production sélectionnée ',
    delete_text: 'Êtes vous sûr de vouloir retirer {name} de la base de données?',
    delete_error: 'Une erreur est survenue lors de la suppression. Il y a probablement des données liées à cette production. Etes vous sur que cette production n\'a aucune tâche, shot ou asset lié ? Kitsu n\'autorise pas la suppression de production. Si vous ne souhaitez plus la voir apparaitre, vous pouvez fermer la production.',
    edit_title: 'Modifier la production',
    new_production: 'Ajouter une production',
    number: 'production | productions',
    open_productions: 'Mes productions',
    picture: 'Changer l\'image',
    title: 'Productions',
    home: {
      create_new: 'Créer une nouvelle production',
      empty: 'Vous n\'avez pas de production ouverte, voulez vous en créer une nouvelle ?',
      no_task: 'Vous n\'avez pas de tâches assignées. Demandez à votre superviseur ce que vous pouvez faire !',
      title: 'Productions en cours',
      welcome: 'Bienvenue sur Kitsu'
    },
    fields: {
      fps: 'FPS',
      name: 'Name',
      ratio: 'Ratio',
      resolution: 'Resolution',
      status: 'Status',
      type: 'Type'
    },
    status: {
      open: 'Ouvert',
      closed: 'Fermé'
    },
    type: {
      short: 'Format court',
      featurefilm: 'Long Métrage',
      tvshow: 'Série télé'
    }
  },

  comments: {
    add_comment: 'Ajouter un commentaire...',
    add_preview: 'Attacher un fichier',
    edit_title: 'Modifier le commentaire',
    empty_text: 'Ce commentaire est vide',
    no_file_attached: 'Aucun fichier attaché',
    post_status: 'Publier le commentaire',
    validated: 'Validé !',
    validation_required: 'Validation requise',
    retake: 'Reprise',
    fields: {
      text: 'Texte'
    }
  },

  tasks: {
    add_preview: 'Ajouter une previz',
    add_preview_error: 'Une erreur est survenue en ajoutant la preview.',
    assign: 'Assigner une tâche à : | Assigner {nbSelectedTasks} tâches à :',
    back_to_list: 'Retour à la liste',
    change_status_to: 'Changer le statut de la tâche à : ',
    change_priority: 'Changer le priorité de la tâche à : ',
    change_preview: 'Modifier preview',
    clear_assignations: 'effacer les assignations',
    create_tasks: 'Ajouter des tâches',
    create_tasks_shot: 'Ajouter des tâches pour les plans affichés',
    create_tasks_shot_explaination: 'Vous allez créer une nouvelle tâche pour chaque plan de la liste affichée. Est-ce que vous voulez continuer ?',
    create_tasks_shot_failed: 'Une erreur serveur est survenue pendant la création des tâches.',
    create_tasks_asset: 'Ajouter des tâches pour les assets affichés',
    create_tasks_asset_explaination: 'Vous allez créer une nouvelle tâche pour chaque asset de la liste affichée. Est-ce que vous voulez continuer ?',
    create_tasks_asset_failed: 'Une erreur serveur est survenue pendant la création des tâches.',
    create_for_selection: 'Créer une tâche pour chaque cellule vide :',
    current: 'Tâches à faire',
    current_status: 'Statut actuel :',
    delete_all_error: 'Supprimer toutes les tâches pour ce type de tâche a échoué',
    delete_comment: 'Êtes vous sûr de vouloir supprimer ce commentaire ?',
    delete_comment_error: 'Une erreur est survenue en supprimant le commentaire.',
    delete_error: 'Une erreur est survenue en supprimant la tâche.',
    delete_for_selection: 'Delete selected tasks:',
    delete_preview: 'Êtes vous sûr de vouloir supprimer ce commentaire ?',
    delete_preview_error: 'Une erreur est survenue en supprimant la preview.',
    done: 'Terminées',
    download_pdf_file: 'Télécharger le fichier',
    feedback: 'retours',
    full_screen: 'Afficher en plein écran',
    hide_assignations: 'Cacher assignations',
    my_tasks: 'Mes tâches',
    no_preview: 'Il n\'y a pas de préviz pour cette tâche.',
    no_comment: 'Il n\'y a pas de commentaires pour cette tâche.',
    no_assignation_right: 'vous n\'êtes pas autorisé à gérer les assigations.',
    next: 'Suivante',
    preview: 'Pré-visualisation',
    previous: 'Précédente',
    select_preview_file: 'Choisissez une preview sur votre disque dur:',
    set_preview: 'Utilisez cette previz comme vignette',
    set_preview_error: 'Une erreur est survenue en utilisant cette vignette.',
    set_preview_done: 'Cette previz sert de vignette à l\'entité courante.',
    show_assignations: 'Voir assignations',
    tasks: 'Tâches',
    validation: 'Validation',
    fields: {
      task_type: 'Type',
      production: 'Prod',
      entity: 'Entité',
      task_status: 'Statut',
      last_comment: 'Dernier commentaire',
      assignees: 'Assignation',
      end_date: 'Date de fin'
    },
    priority: {
      emergency: 'Urgence',
      normal: 'Normale',
      high: 'Haute',
      very_high: 'Très haute'
    }
  },

  timesheets: {
    title: 'Feuille de temps',
    time_spents: 'Temps passé (heures)',
    hours: 'heures',
    done_tasks: 'Tâches terminées',
    detail_level: 'Niveau de détail',
    year: 'Année',
    month: 'Mois'
  },

  task_types: {
    title: 'Types de tâches',
    edit_title: 'Modifier le type de tâches',
    number: 'type de tâche | types de tâches',
    new_task_type: 'Ajouter un type de tâche',
    fields: {
      allow_timelog: 'Temps passé',
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
      is_done: 'Est terminé',
      is_artist_allowed: 'Autorisé aux artistes'
    },
    delete_text: 'Êtes vous sur de vouloir retirer {name} de la base de données ?',
    delete_error: 'Une erreur est survenue lors de la suppression du statut de tâche. Êtes vous sûr qu\'aucune tâche n\'est lié à ce statut de tâche ?'
  },

  custom_actions: {
    title: 'Actions',
    new_custom_action: 'Ajouter une action personnalisée',
    edit_title: 'Modifier une action personnalisée',
    number: 'action pesonnalisée | actions personnalisées',
    run_for_selection: 'Lancer une action personnalisée pour les tâche sélectionnées :',
    delete_text: 'Êtes-vous sûr de supprimer l\'action personnalisée {name} de la base de données?',
    delete_error: 'Une erreur est survenue en supprimant l\'action personnalisée.',
    fields: {
      name: 'Nom',
      url: 'URL',
      entity_type: 'Type d\'entité'
    },
    entity_types: {
      all: 'Tous',
      shot: 'Plan',
      asset: 'Asset'
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
    edit_success: 'Asset {name} édité avec succès.',
    edit_fail: 'La création ou l\'édition a échoué, une erreur est survenue.',
    new_success: 'Asset {name} créé avec succès.',
    empty_list: 'Il n\'y a pas d\'assets dans la production. Voulez vous en créer ?',
    fields: {
      description: 'Description',
      episode: 'Ep.',
      name: 'Nom',
      production: 'Prod',
      type: 'Type'
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
    manage: 'Créer des plans',
    edit_fail: 'La création ou l\'édition a échoué, une erreur est survenue.',
    new_success: 'Plan {name} créé avec succès.',
    edit_success: 'Plan {name} édité avec succès.',
    description: 'Description',
    empty_list: 'Il n\'y a pas de plans dans la production. Voulez vous en créer ?',
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
    no_casting: 'Le casting du plan est vide.'
  },

  sequences: {
    title: 'Séquences',
    number: 'séquence | séquences',
    new_sequence: 'Nouvelle séquence',
    edit_title: 'Éditer séquence',
    delete_text: 'Etes vous sûr de vouloir retirer {name} de la base de données ?',
    delete_error: 'Une erreur est survenue en créant le plan, êtes vous sûr que la séquence n\'a plus aucun lien ?',
    empty_list: 'Il n\'y a pas de séquence dans la production. Voulez vous en créer ?',
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
    empty_list: 'Il n\'y a pas d\'épisodes dans la production. Voulez vous en créer ?',
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
    add_shots: 'Selectonner les plans',
    title: 'Playlists',
    new_playlist: 'Ajouter une playlist',
    loading_error: 'Une erreur serveur est apparue, les playlists ne peuvent pas être chargées.',
    no_selection: 'Séléctionnez une playlist sur la gauche.',
    delete_text: 'Êtes vous sûr de vouloir supprimer {name} de la base de données ?',
    delete_error: 'Une erreur est survenue en supprimant la playlist.',
    edit_title: 'Modifier la playlist',
    no_playlist: 'Il n\'y a pas de playlist pour ce projet.',
    no_sequence_for_episode: 'Il n\'y a pas de séquence pour cette épisode',
    no_shot_for_production: 'Il n\'y pas de plan pour cette production',
    select_shot: 'Sélectionnez un plan dans la colonne de droite',
    select_playlist: 'Sélectionnez une playlist dans la colonne de gauche',
    remove: 'enlever',
    fields: {
      name: 'Nom'
    }
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
