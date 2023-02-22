export default {

  assets: {
    cast_in: 'Eingießen',
    delete_error: 'Beim Löschen dieses Assets ist ein Fehler aufgetreten. Wahrscheinlich sind damit Daten verknüpft. Sind Sie sicher, dass dieser Anlagentyp keine Aufgabe hat, die mit ihm verbunden ist?',
    delete_text: 'Sind Sie sicher, dass Sie {name} aus Ihrer Datenbank entfernen möchten?',
    edit_fail: 'Erstellung oder Ausgabe fehlgeschlagen, ein Fehler ist aufgetreten.',
    edit_success: 'Anlage {name} erfolgreich bearbeitet.',
    edit_title: 'Anlage bearbeiten',
    empty_list: 'In der Produktion gibt es keine Anlage. Wie wäre es mit der Erstellung von solchen?',
    empty_list_client: 'Es gibt keine Anlage in dieser Produktion.',
    new_asset: 'Hinzufügen einer Anlage',
    new_assets: 'Assets hinzufügen',
    new_success: 'Anlage {name} erfolgreich erstellt.',
    no_cast_in: 'Dieser Gegenstand wird in keinem Schuss geworfen.',
    number: 'Vermögenswerte',
    restore_text: 'Sind Sie sicher, dass Sie {name} in Ihrer Datenbank wiederherstellen möchten?',
    restore_error: 'Bei der Wiederherstellung dieses Assets ist ein Fehler aufgetreten.',
    tasks: 'Asset-Aufgaben',
    title: 'Vermögenswerte',
    fields: {
      description: 'Beschreibung',
      episode: 'Ep.',
      hidden_from_client: 'Vor dem Kunden verborgen',
      name: 'Name',
      production: 'Produkt',
      time_spent: 'Zeit',
      type: 'Typ'
    }
  },

  asset_types: {
    all_asset_types: 'Alle asset typen',
    delete_text: 'Sind Sie sicher, dass Sie {name} aus Ihrer Datenbank entfernen möchten?',
    delete_error: 'Beim Löschen dieses Anlagentyps ist ein Fehler aufgetreten. Wahrscheinlich sind damit Daten verknüpft. Sind Sie sicher, dass diese Anlageart keine Anlage mit ihr verbunden hat?',
    edit_title: 'Anlagenart bearbeiten',
    new_asset_type: 'Hinzufügen einer Anlagenart',
    number: 'asset type | asset types',
    title: 'Vermögensarten',
    production_title: 'Vermögensarten Statistiken',
    fields: {
      name: 'Name'
    }
  },

  breakdown: {
    all_assets: 'Alle verfügbaren Vermögenswerte',
    edit_label: 'Etikett bearbeiten',
    empty: 'Leerguss',
    label: 'Etikett',
    title: 'Aufschlüsselung',
    options: {
      fixed: 'festgelegt',
      animate: 'animierte'
    }
  },

  comments: {
    add_attachment: 'Anhang hinzufügen',
    add_comment: 'Einen Kommentar hinzufügen...',
    add_checklist: 'Checkliste hinzufügen',
    add_preview: 'Vorschau anhängen',
    comment_from_client: 'Kommentar von die Kunde',
    change_preview: 'Änderungsvorschau',
    empty_text: 'Dieser Kommentar ist leer',
    edit_title: 'Bearbeiten Sie, wie',
    error: 'Beim Posten von Kommentaren ist ein Fehler aufgetreten.',
    no_file_attached: 'Keine Datei angehängt',
    post_status: 'Veröffentlichen Sie, wie',
    retake: 'Wiederaufnahme',
    pin: 'Pin',
    pinned: 'Pinned',
    revision: 'Überarbeitung',
    task_placeholder: 'Neuer Artikel',
    text: 'Text',
    unpin: 'Unbekannt',
    validated: 'Validiert!',
    validation_required: 'Validierung erforderlich',
    set_status_to: 'Status auf setzen',
    fields: {
      text: 'Text'
    }
  },

  custom_actions: {
    delete_text: 'Sind Sie sicher, dass Sie benutzerdefinierte Aktionen {name} aus Ihrer Datenbank entfernen möchten?',
    delete_error: 'Beim Löschen dieser benutzerdefinierten Aktion ist ein Fehler aufgetreten.',
    edit_title: 'Bearbeiten einer benutzerdefinierten Aktion',
    new_custom_action: 'Hinzufügen einer benutzerdefinierten Aktion',
    number: 'benutzerdefinierte Aktion | benutzerdefinierte Aktionen',
    run_for_selection: 'Benutzerdefinierte Aktion für ausgewählte Aufgaben ausführen:',
    title: 'Benutzerdefinierte Aktionen',
    fields: {
      name: 'Name',
      url: 'URL',
      entity_type: 'Entitätstyp',
      is_ajax: 'AJAX verwenden'
    },
    entity_types: {
      all: 'Alle',
      shot: 'Erschossen',
      asset: 'Vermögen'
    }
  },

  entities: {
    build_filter: {
      assignation: 'Zuweisung',
      assignation_exists_for: 'Zuordnungen existieren für',
      assigned_to: 'Zugewiesen an',
      descriptor: 'Metadaten',
      equal: 'Gleich',
      no_assignation_for: 'Keine Zuordnung vorhanden für',
      no_filter: 'Kein Filter',
      not_equal: 'Nicht gleich',
      not_assigned_to: 'Nicht zugeordnet zu',
      status: 'Aufgabenstatus',
      thumbnail: 'Anwesenheit von Miniaturbildern',
      Titel: 'Filter an...',
      with_thumbnail: 'Mit Vorschaubild',
      without_thumbnail: 'Ohne Miniaturansicht',
      title: 'Filter on...'
    },
    thumbnails: {
      error: 'Beim Hochladen von Miniaturbildern ist ein Fehler aufgetreten',
      explaination: 'Das Hinzufügen einer Miniaturansicht erfordert die Einstellung einer neuen Vorschau. Um mehrere Miniaturansichten gleichzeitig festzulegen, müssen Sie zunächst einen Aufgabentyp auswählen, der für die Erstellung der neuen Vorschauen verwendet wird. Die Miniaturansichten werden von dieser neuen Vorschau aus eingestellt.',
      explaination_two: 'Dann müssen Sie die Dateien auswählen, die Sie hochladen möchten. Um die richtigen Entitäten zu finden, müssen die Dateinamen dem folgenden Muster entsprechen:',
      shots_pattern: 'SequenceName ShotName" z.B. SQ01_SH01',
      assets_pattern: 'AssetType AssetName" z.B. Umgebung_Wald',
      select_files: 'Dateien auswählen',
      selected_files: 'Ausgewählte Dateien',
      select_task_type: 'Aufgabentyp auswählen',
      title: 'Thumbnails hinzufügen',
      undefined: 'Unbestimmt',
      undefined_pattern: 'Undefiniert',
      upload: 'Thumbnails hinzufügen'
    }
  },

  episodes: {
    all_episodes: 'Alle Episoden',
    delete_error: 'Beim Löschen dieser Episode ist ein Fehler aufgetreten. Wahrscheinlich sind damit Daten verknüpft. Bist du sicher, dass diese Episode keine Sequenz hat, die mit ihr verbunden ist?',
    delete_text: 'Sind Sie sicher, dass Sie {name} aus Ihrer Datenbank entfernen möchten?',
    edit_title: 'Episode bearbeiten',
    empty_list: 'Es gibt keine Episode in der Produktion. Wie wäre es mit der Erstellung von solchen?',
    empty_list_client: 'Es gibt keine Episode in dieser Produktion.',
    new_episode: 'Neue Episode',
    number: 'episode | episoden',
    title: 'Episodenstatistiken',
    fields: {
      name: 'Name',
      description: 'Beschreibung'
    }
  },

  keyboard: {
    altdown: 'Verschiebt die Auswahl einer Aufgabe nach unten',
    altj: 'Vorherige vorschau auswählen',
    altk: 'Nächste vorschau auswählen',
    altleft: 'Verschiebt die Auswahl einer Aufgabe nach links',
    altright: 'Verschiebt die Auswahl einer Aufgabe nach rechts',
    altup: 'Verschiebt die Auswahl einer Aufgabe nach oben',
    annotations: 'Anmerkungen',
    draw: 'Zeichnungsmodus einschalten',
    navigation: 'Navigation',
    playlist_navigation: 'Playlist navigation',
    redo: 'Redo',
    remove_annotation: 'Annotation entfernen',
    undo: 'Undo',
    shortcuts: 'Tastaturkürzel'
  },

  login: {
    back_to_login: 'Zurück zum Login',
    forgot_password: 'Passwort vergessen?',
    login: 'Einloggen',
    login_failed: 'Die Anmeldung ist fehlgeschlagen, bitte überprüfen Sie Ihre Zugangsdaten.',
    login_page: 'Abbrechen',
    redirecting: 'Umleitung',
    reset_change_password: 'Passwort ändern',
    reset_change_password_form_failed: 'Es gibt ein Problem mit dem von dir angegebenen Passwort. Bitte überprüfen Sie, ob es mindestens 8 Zeichen lang ist und ob beide Passwörter übereinstimmen.',
    reset_change_password_failed: 'Die Änderung des Passworts ist fehlgeschlagen. Bitte starten Sie den gesamten Vorgang erneut.',
    reset_change_password_succeed: 'Dein Passwort wurde erfolgreich geändert. Bitte gehen Sie zurück zur Login-Seite, um sie zu verwenden.',
    reset_change_password_title: 'Geben Sie ein neues Passwort ein',
    reset_password: 'Passwort zurücksetzen',
    reset_password_failed: 'Passwort zurücksetzen fehlgeschlagen. Bitte überprüfen Sie Ihre E-Mail-Adresse.',
    reset_password_succeed: 'Passwort zurücksetzen erfolgreich. Bitte überprüfen Sie Ihren Posteingang.',
    reset_password_title: 'Gib deine E-Mail-Adresse ein, um dein Passwort zurückzusetzen.',
    title: 'Einloggen bei Kitsu',
    fields: {
      email: 'E-Mail',
      password: 'Passwort',
      password2: 'Passwort wiederholen'
    }
  },

  main: {
    about: 'Über',
    add: 'hinzufügen',
    all: 'Alle',
    all_assets: 'Alle assets',
    admin: 'Admin',
    cancel: 'Abbrechen',
    clear_selection: 'Aktuelle Auswahl löschen',
    documentation: 'Dokumentation',
    close: 'Schließen',
    confirmation: 'Bestätigen',
    confirmation_and_stay: 'Bestätigen und bleiben',
    date: 'Datum',
    dark_theme: 'Dunkles Thema',
    days_spent: 'Tag verbracht | Tage verbracht',
    delete: 'Löschen',
    delete_all: 'Alle löschen',
    delete_text: 'Sind Sie sicher, dass Sie {name} aus Ihrer Datenbank entfernen möchten?',
    edit: 'Bearbeiten',
    empty_comment: 'Leerer Kommentar',
    end_date: 'Enddatum',
    files_selected: 'Ausgewählte dateien',
    for: 'Für',
    go_productions: 'Zu den Produktionen',
    history: 'Historie',
    info: 'Informationen',
    or: 'oder',
    no: 'Nein',
    loading: 'Laden...',
    loading_data: 'Laden von Daten',
    loading_error: 'Beim Laden von Daten ist ein Fehler aufgetreten.',
    logout: 'Abmeldung',
    modify: 'Modify',
    minimize: 'Minimieren',
    maximize: 'Maximieren',
    nb_frames: 'frame | frames',
    profile: 'Profil',
    production: 'Produktion',
    remove: 'Entfernen',
    save: 'Speichern',
    start_date: 'Startdatum',
    sort_by: 'Sortierent',
    sorted_by: 'Sortiert nach',
    studio: 'Studio',
    tutorials: 'Tutorials',
    user: 'Benutzer',
    white_theme: 'Weißes Thema',
    yes: 'Ja',
    csv: {
      choose: 'Auswählen',
      unknown: 'Unbekannte Spalte',
      error_upload: 'Beim Hochladen Ihrer CSV-Datei ist ein Fehler aufgetreten',
      export_file: 'Exportieren',
      import_file: 'Importieren',
      import_title: 'Daten aus einem CSV importieren',
      legend: 'Legende',
      legend_ok: 'Erkannte Daten',
      legend_ignored: 'Ignorierte Daten',
      legend_missing: 'Fehlende Daten',
      legend_disabled: 'Daten, die nicht aktualisiert oder erstellt werden',
      legend_overwrite: 'Daten, die aktualisiert werden',
      paste: 'Einfügen',
      paste_code: 'Bitte fügen Sie hier Ihre CSV-Daten ein:',
      preview: 'Vorschau',
      preview_episode_name: 'Episodenname',
      preview_title: 'Vorschau Ihrer importierten Daten',
      preview_description: 'Laden Sie eine .csv-Datei hoch, um Ihr Forum mit Beiträgen zu füllen',
      preview_required: 'NB: Kopfzeilen müssen als erste Zeile eingefügt werden',
      preview_reupload: 'CSV-Datei erneut hochladen',
      required_fields: 'Ihr CSV erfordert die folgenden Spalten',
      select_file: 'Bitte wählen Sie eine Datei aus einem Ihrer Ordner:',
      tab_select_file: 'Laden Sie eine CSV-Datei hoch',
      tab_paste_code: 'CSV-Daten einfügen',
      upload_file: 'Durchsuchen',
      options: {
        title: 'Optionen',
        update: 'Bestehende Daten aktualisieren'
      }
    }
  },

  menu: {
    assign_tasks: 'Aufgaben zuweisen',
    change_priority: 'Priorität ändern',
    change_status: 'Status ändern',
    create_tasks: 'Aufgaben erstellen',
    delete_tasks: 'Aufgaben löschen',
    generate_playlists: 'Wiedergabelisten generieren',
    run_custom_action: 'Benutzerdefinierte Aktion ausführen',
    set_estimations: 'Schätzungen festlegen'
  },

  news: {
    all: 'Alle',
    commented_on: 'kommentiert',
    infos: 'Infos',
    no_news: 'Es gibt keine Neuigkeiten für diese Produktion oder für diesen Filter.',
    only_comments: 'Nur Kommentare',
    only_previews: 'Nur Vorschauen',
    set_preview_on: 'Vorschau einstellen auf',
    task_status: 'Aufgabenstatus',
    task_type: 'Aufgabentyp',
    title: 'News Feed'
  },

  not_found: {
    text: 'Mit dem Link, auf den du geklickt hast, war etwas nicht in Ordnung, wir empfehlen dir, auf der Homepage wieder vorbeizuschauen.',
    title: 'Seite nicht gefunden.... suchen Sie nach etwas, das Sie gelöscht haben?'
  },

  notifications: {
    and_change_status: 'und änderte den Status auf',
    assigned_you: 'die Sie zugeordnet haben',
    commented_on: 'kommentiert',
    mention_you_on: 'hat dich erwähnt',
    no_notifications: 'Für Ihre aktuellen Projekte gibt es derzeit keine Benachrichtigung für Sie.',
    title: 'Benachrichtigungen',
    with_preview: 'mit einer Vorschau'
  },

  people: {
    active: 'Aktiv',
    add_member_to_team: 'Füge ein Mitglied zum Team hinzu:',
    create_invite: 'Einladung erstellen und versenden',
    delete_error: 'Beim Löschen dieser Person ist ein Fehler aufgetreten. Wahrscheinlich sind damit Daten verknüpft. Sind Sie sicher, dass diese Person keine Zuordnung hat oder keinen Kommentar geschrieben hat?',
    delete_text: 'Sind Sie sicher, dass Sie {personName} aus Ihrer Datenbank entfernen möchten?',
    edit_title: 'Person bearbeiten',
    empty_team: 'Im Projektteam ist niemand gelistet.',
    invite: 'Einladung senden',
    invite_error: 'Beim Senden der Einladung ist ein Fehler aufgetreten.',
    invite_success: 'Einladung wurde erfolgreich versendet',
    new_person: 'Einen neuen Mitarbeiter hinzufügen',
    no_task_assigned: 'Es gibt keine laufenden Aufgaben, die Ihnen zugeordnet sind.',
    persons: 'Person | Personen',
    running_tasks: 'Laufende Aufgaben',
    select_person: 'Eine Person auswählen.....',
    team: 'Team',
    title: 'Menschen',
    unactive: 'Inaktiv',
    fields: {
      first_name: 'Vorname',
      last_name: 'Nachname',
      email: 'E-Mail',
      phone: 'Phone',
      role: 'Rolle',
      old_password: 'Aktuelles Passwort',
      password: 'Neues Passwort',
      password_2: 'Neues Passwort (wiederholen)',
      active: 'Aktiv'
    },
    list: {
      name: 'Name',
      email: 'E-Mail',
      phone: 'Phone',
      role: 'Rolle',
      active: 'Aktiv'
    },
    role: {
      admin: 'Studio-Manager',
      client: 'Client',
      manager: 'Production manager',
      supervisor: 'Supervisor',
      undefined: '',
      user: 'CG Artist',
      vendor: 'Anbieter'
    }
  },

  playlists: {
    add_assets: 'Assets hinzufügen',
    add_selection: 'Auswahl hinzufügen',
    add_shots: 'Shots hinzufügen',
    add_episode: 'Ganze episode hinzufügen',
    add_movie: 'Ganze film hinzufügen',
    add_sequence: 'Ganze sequenz hinzufügen',
    apply_task_type_change: 'Dadurch wird die letzte Revision für den gegebenen Aufgabentyp auf allen shots positioniert.',
    available_build: 'Verfügbare Builds',
    building: 'Gebäude',
    build_daily: 'Täglich ausstehend',
    build_weekly: 'Alle ausstehend',
    build_mp4: 'Build .mp4',
    client_playlist: 'Kunde Playlist',
    created_at: 'Erstellen Sie die:',
    create_for_selection: 'Zur Auswahl erstellen',
    create_title: 'Playlist erstellen',
    delete_text: 'Sind Sie sicher, dass Sie {name} aus Ihrer Datenbank entfernen möchten?',
    delete_error: 'Beim Löschen dieser Playlist ist ein Fehler aufgetreten.',
    download_zip: 'Download.zip',
    edit_title: 'Wiedergabeliste bearbeiten',
    failed: 'Fehlgeschlagen',
    for_client: 'Der Kunde',
    for_studio: 'Das Studio',
    last_creation: 'Neueste kreationen',
    last_modification: 'Neueste änderungen',
    loading_error: 'Es ist ein Serverfehler aufgetreten. Wiedergabelisten können nicht geladen werden.',
    new_playlist: 'Eine Wiedergabeliste hinzufügen',
    no_build: 'Kein Build',
    no_playlist: 'Für dieses Projekt gibt es derzeit keine Playlist.',
    no_preview: 'Keine Vorschau für diese Aufnahme',
    no_selection: 'Bitte wählen Sie links eine Playlist aus.',
    no_sequence_for_episode: 'Es gibt keine Sequenz für diese Episode.',
    no_shot_for_production: 'Für diese Produktion gibt es keine Chance.',
    no_shot_for_sequence: 'Es gibt keinen Schuss für diese Sequenz.',
    select_shot: 'Bitte wählen Sie einen Schuss in der rechten Spalte aus.',
    select_playlist: 'Bitte wählen Sie eine Playlist in der linken Spalte aus.',
    select_task_type: 'Ändern Sie den Aufgabentyp für alle shots',
    title: 'Wiedergabelisten',
    updated_at: 'Geändert am',
    remove: 'entfernen',
    actions: {
      edit: 'Playliste bearbeiten',
      delete: 'Playliste löschen',
      fullscreen: 'Vollbild',
      download: 'Herunterladen...',
      entity_list: 'Entity-Liste anzeigen/verbergen',
      comments: 'Kommentare anzeigen/verbergen',
      annotation: 'Anmerkung',
      annotation_text: 'Doppelklicken Sie auf die Vorschau, um etwas Text hinzuzufügen',
      annotation_delete: 'Annotation löschen',
      annotation_redo: 'Annotation wiederholen',
      annotation_undo: 'Annotation rückgängig machen',
      annotation_big: 'Groß',
      annotation_medium: 'Medium',
      annotation_small: 'Klein',
      change_task_type: 'Aufgabentyp ändern',
      split_screen: 'Geteilter Bildschirm',
      next_shot: 'Nächster shot',
      previous_shot: 'Vorherige shot',
      next_frame: 'Nächstes Bild',
      previous_frame: 'Vorheriges Bild',
      play: 'Spielen',
      pause: 'Pause'
    },
    fields: {
      created_at: 'Erstellt bei',
      for_client: 'Zum teilen mit',
      for_entity: 'Für Entität',
      name: 'Name',
      updated_at: 'Aktualisiert bei'
    }
  },

  productions: {
    current: 'Ausgewählte Produktion',
    delete_text: 'Sind Sie sicher, dass Sie {name} aus Ihrer Datenbank entfernen möchten?',
    delete_error: 'Beim Löschen dieser Produktion ist ein Fehler aufgetreten. Wahrscheinlich sind damit Daten verknüpft. Sind Sie sicher, dass diese Produktion keine Aufgabe, keinen Schuss oder Vermögenswert hat, der mit ihr verbunden ist? Kitsu erlaubt es nicht, die Produktion zu löschen. Wenn du die Produktion nicht mehr sehen willst, kannst du sie stattdessen schließen.',
    edit_title: 'Produktion bearbeiten',
    new_production: 'Eine Produktion hinzufügen',
    number: 'Produktion | Produktionen',
    open_productions: 'Meine Produktionen',
    picture: 'Bild ändern',
    title: 'Produktionen',
    home: {
      create_new: 'Erstellen Sie eine neue Produktion',
      empty: 'Du hast keine offene Produktion. Wie wäre es mit der Erstellung eines neuen?',
      no_task: 'Du hast keine Aufgabe zugewiesen. Wenden Sie sich an Ihren Vorgesetzten, um zu sehen, was Sie tun können!',
      no_prod_for_client: 'Du hast keinen Zugang zu einer Produktion. Wenden Sie sich an Ihren Auftragnehmer, um einen Zugang zu erhalten.',
      title: 'Laufende Produktionen',
      welcome: 'Willkommen bei Kitsu'
    },
    fields: {
      fps: 'FPS',
      name: 'Name',
      ratio: 'Ratio',
      resolution: 'Auflösung',
      status: 'Status',
      type: 'Typ'
    },
    metadata: {
      add_explaination: 'Fügen Sie spezifische Daten hinzu, die für dieses Projekt erforderlich sind.',
      add_failed: 'Beim Hinzufügen von Metadaten zu Ihrem Projekt ist ein Fehler aufgetreten.',
      add_new_values: 'Es sind derzeit keine Werte verfügbar.',
      available_values: 'Verfügbare Werte',
      choices: 'Liste der Werte',
      delete_text: 'Sind Sie sicher, dass Sie diese Spalte und die zugehörigen Daten für alle Anlagen dieser Produktion löschen möchten?',
      delete_error: 'Beim Löschen dieser Metadatenspalte ist ein Fehler aufgetreten.',
      error: 'Beim Hinzufügen der Metadatenspalte ist ein Fehler aufgetreten. Stellen Sie sicher, dass es keine Spalte mit ähnlichem Namen gibt und dass alle Felder ausgefüllt sind. Wenn das Problem weiterhin besteht, wenden Sie sich bitte an das Support-Team.',
      free: 'Freier Wert',
      title: 'Metadatenspalte hinzufügen'
    },

    status: {
      closed: 'Geschlossen',
      open: 'Offen',
      active: 'Offen',
      archived: 'Geschlossen'
    },

    type: {
      short: 'Kurz',
      featurefilm: 'Spielfilm',
      tvshow: 'TV-Show'
    }
  },

  profile: {
    change_avatar: 'Avatar ändern',
    info_title: 'Informationen',
    language: 'Sprache',
    notifications_enabled: 'E-Mail-Benachrichtigungen aktiviert',
    notifications_slack_enabled: 'Slack-Benachrichtigungen aktiviert',
    notifications_slack_user: 'Slack-Benutzername',
    notifications_mattermost_enabled: 'Mattermost-Benachrichtigungen aktiviert',
    notifications_mattermost_user: 'Mattermost-Benutzername',
    notifications_discord_enabled: 'Discord-Benachrichtigungen aktiviert',
    notifications_discord_user: 'Discord-Benutzername',
    password_title: 'Passwort ändern',
    timezone: 'Zeitzone',
    title: 'Dein Profil',
    avatar: {
      title: 'Avatar ändern',
      error_upload: 'Beim Hochladen des Bildes ist ein Fehler aufgetreten.'
    },
    change_password: {
      button: 'Passwort ändern',
      error: 'Beim Ändern des Passworts ist ein Fehler aufgetreten. Bitte überprüfen Sie Ihr aktuelles Passwort.',
      success: 'Dein Passwort wurde erfolgreich geändert!',
      unvalid: 'Deine neue Passwort-Bestätigung stimmt nicht oder dein Passwort ist zu kurz (es werden mindestens 8 Zeichen erwartet).'
    },
    save: {
      button: 'Änderungen speichern',
      error: 'Beim Speichern von Änderungen ist ein Fehler aufgetreten.'
    }
  },

  quota: {
    average: 'Durchschnitt',
    count_label: 'Zählmodus',
    detail_label: 'Detaillierungsgrad',
    details_name: 'Name',
    details_seconds: 'Sekunden',
    details_frames: 'Frames',
    month_label: 'Monat',
    no_quota: 'Für diese Art von Aufgaben gibt es keine Quote.',
    name: 'Nom',
    quota_day: 'Quote pro Tag',
    quota_week: 'Quote pro Woche',
    quota_month: 'Quote pro Monat',
    year_label: 'Jahr',
    title: 'Quoten',
    type_label: 'Typ'
  },

  settings: {
    change_logo: 'Logo ändern',
    integrations: 'Integrationen',
    logo: 'Logo-Studio',
    no_logo: 'Es gibt kein Logo-Set.',
    set_logo: 'Logo Studio-Set',
    title: 'Einstellungen',
    webhook_error: 'An error occurred while posting webhook',
    fields: {
      name: 'Studio-Name',
      hours_by_day: 'Stunden am Tag',
      slack_token: 'Slack Token (Optional)',
      mattermost_webhook: 'Mattermost Webhook (Optional)',
      discord_token: 'Discord Token (Optional)',
      use_original_name: 'Original-Dateinamen für Downloads verwenden'
    },
    production: {
      empty_list: 'Die Liste ist derzeit leer. Das bedeutet, dass den Benutzern alle Daten aus den Haupteinstellungen zur Verfügung stehen. Fügen Sie einige Einträge hinzu, um die Auswahl für diese Produktion einzuschränken.'
    },
    save: {
      button: 'Einstellungen speichern',
      error: 'Beim Speichern von Einstellungen ist ein Serverfehler aufgetreten.'
    }
  },

  task_status: {
    delete_text: 'Sind Sie sicher, dass Sie {name} aus Ihrer Datenbank entfernen möchten?',
    delete_error: 'Beim Löschen dieses Aufgabenstatus ist ein Fehler aufgetreten. Wahrscheinlich sind damit Daten verknüpft. Sind Sie sicher, dass dieser Aufgabenstatus keine Aufgabe zugeordnet hat?',
    edit_title: 'Aufgabenstatus bearbeiten',
    number: 'Aufgabenstatus | Aufgabenstatus',
    new_task_status: 'Hinzufügen eines Aufgabenstatus',
    title: 'Aufgabenstatus',
    fields: {
      is_artist_allowed: 'Ist der Künstler erlaubt',
      is_client_allowed: 'Ist der Kunde erlaubt',
      color: 'Farbe',
      is_done: 'Ist erledigt',
      is_retake: 'Hat Wiederholungswert',
      is_default: 'Is default',
      name: 'Name',
      short_name: 'Kurzname'
    }
  },

  task_types: {
    delete_text: 'Sind Sie sicher, dass Sie {name} aus Ihrer Datenbank entfernen möchten?',
    delete_error: 'Beim Löschen dieses Aufgabentyps ist ein Fehler aufgetreten. Wahrscheinlich sind damit Daten verknüpft. Sind Sie sicher, dass dieser Aufgabentyp keine Aufgabe hat, die mit ihm verknüpft ist?',
    edit_title: 'Aufgabentyp bearbeiten',
    new_task_type: 'Hinzufügen eines Aufgabentyps',
    number: 'Aufgabentyp | Aufgabentypen',
    title: 'Aufgabentypen',
    fields: {
      dedicated_to: 'Für',
      color: 'Farbe',
      name: 'Name',
      allow_timelog: 'Zeiterfassung',
      priority: 'Priorität'
    }
  },

  sequences: {
    all_sequences: 'Alle Sequenzen',
    delete_text: 'Sind Sie sicher, dass Sie {name} aus Ihrer Datenbank entfernen möchten?',
    delete_error: 'Beim Löschen dieser Sequenz ist ein Fehler aufgetreten. Wahrscheinlich sind damit Daten verknüpft. Bist du sicher, dass diese Sequenz keinen Schuss damit zu tun hat?',
    edit_title: 'Sequenz bearbeiten',
    empty_list: 'Es gibt keine Reihenfolge in der Produktion. Wie wäre es mit der Erstellung von solchen?',
    empty_list_client: 'In dieser Produktion gibt es keine Reihenfolge.',
    new_sequence: 'Neue Sequenz',
    number: 'Sequenz | Sequenzen',
    title: 'Sequenz-Statistiken',
    fields: {
      name: 'Name',
      description: 'Beschreibung'
    }
  },

  schedule: {
    title: 'Zeitplan',
    title_main: 'Hauptterminplan',
    overall_man_days: 'Manntage',
    md: 'md',
    zoom_level: 'Zoomstufe',
    milestone: {
      add_milestone: 'Meilenstein hinzufügen für',
      edit_milestone: 'Meilenstein bearbeiten für',
      name: 'Name',
      error: 'Beim Hinzufügen oder Bearbeiten des Meilensteins ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.'
    }
  },

  shots: {
    casting: 'Druckguss',
    creation_explaination: 'Um Aufnahmen hinzuzufügen, musst du zuerst eine Episode und eine Sequenz erstellen. Geben Sie unten in der linken Spalte einen Episodennamen ein und klicken Sie dann auf Hinzufügen, um eine neue Episode zu erstellen. Wählen Sie diese Episode aus und wiederholen Sie den gleichen Vorgang für die Sequenz. Wählen Sie schließlich eine Sequenz aus und geben Sie einen Schussnamen in das Feld unten in der rechten Spalte ein. Klicken Sie auf die Schaltfläche Hinzufügen unten. Dein erster Schuss wurde erstellt. Du kannst jetzt viel mehr hinzufügen! Wenn es sich nicht um eine TV-Show handelt, müssen Sie direkt eine Sequenz erstellen.',
    delete_text: 'Sind Sie sicher, dass Sie {name} aus Ihrer Datenbank entfernen möchten?',
    delete_error: 'Beim Löschen dieses Schusses ist ein Fehler aufgetreten. Wahrscheinlich sind damit Daten verknüpft. Bist du sicher, dass diese Aufnahme keine Aufgabe hat?',
    edit_success: 'Shot {name} erfolgreich bearbeitet.',
    edit_fail: 'Erstellung oder Ausgabe fehlgeschlagen, ein Fehler ist aufgetreten. Achte darauf, dass du den Schuss nicht mit einem Namen umbenennst, der bereits für eine bestimmte Sequenz vergeben wurde.',
    edit_title: 'Schuss bearbeiten',
    empty_list: 'Es gibt keinen Schuss in der Produktion. Wie wäre es mit der Erstellung von solchen?',
    empty_list_client: 'In dieser Produktion gibt es keine Aufnahme.',
    episodes: 'Episoden',
    history: 'Filmaufnahme werte historie',
    new_shot: 'Einen Schuss hinzufügen',
    new_shots: 'Schüsse hinzufügen',
    new_sequences: 'Sequenzen hinzufügen',
    new_episodes: 'Episoden hinzufügen',
    no_casting: 'Der Schuss ist leer.',
    number: 'Schuss | Schüsse',
    manage: 'Schüsse erstellen',
    new_success: 'Schuss {name} erfolgreich erstellt.',
    padding: 'Schusspolsterung',
    restore_text: 'Sind Sie sicher, dass Sie {name} in Ihrer Datenbank wiederherstellen möchten?',
    restore_error: 'Bei der Wiederherstellung dieser Aufnahme ist ein Fehler aufgetreten.',
    sequences: 'Sequenzen',
    tasks: 'Schuss-Aufgaben',
    title: 'Shots',
    fields: {
      description: 'Beschreibung',
      nb_frames: 'Rahmen',
      episode: 'Episode',
      frame_in: 'In',
      frame_out: 'Aus',
      fps: 'FPS',
      name: 'Name',
      production: 'Produkt',
      sequence: 'Sequenz',
      time_spent: 'Zeit'
    }
  },

  server_down: {
    text: 'Bitte wenden Sie sich an Ihren Lieferantensupport, Ihren Systemadministrator oder Ihre IT-Abteilung, um zu erfahren, was schief läuft.',
    title: 'Kitsu ist beim Erreichen seiner Daten-API auf einen Fehler gestoßen.'
  },

  statistics: {
    count: 'Zählt',
    count_mode: 'Zählmodus',
    display_mode: 'Anzeigemodus',
    frames: 'Rahmen',
    pie: 'Kreisdiagramme',
    shots: 'Shots'
  },

  tasks: {
    add_preview: 'Vorschau hinzufügen',
    add_preview_error: 'Beim Hinzufügen einer Vorschau ist ein Fehler aufgetreten.',
    assign: 'Weisen Sie eine Aufgabe zu: | Aufgaben zuweisen {nbSelectedTasks} Aufgaben zu:',
    back_to_list: 'zurück zur Liste',
    bigger: 'Erweitern Sie das Aufgabenfeld',
    change_status_to: 'Ändern des Aufgabenstatus in:',
    change_preview: 'Änderungsvorschau',
    change_priority: 'Ändern Sie die Priorität auf:',
    clear_assignations: 'klare Zuordnungen',
    comment_image: 'Ihrem Kommentar ein Bild anhängen',
    create_for_selection: 'Erstellen Sie eine Aufgabe für jede leere Zelle:',
    create_tasks: 'Aufgaben hinzufügen',
    create_tasks_shot: 'Aufgaben für aktuelle Aufnahmen hinzufügen',
    create_tasks_shot_explaination: 'Du wirst eine neue Aufgabe für jeden Schuss der aktuellen Liste für den angegebenen Aufgabentyp erstellen. Willst du fortfahren?',
    create_tasks_shot_failed: 'Beim Fortfahren der Erstellung ist ein Serverfehler aufgetreten.',
    create_tasks_asset: 'Hinzufügen von Aufgaben für aktuelle Assets',
    create_tasks_asset_explaination: 'Sie werden für jede Kühlstelle der aktuellen Liste für den angegebenen Aufgabentyp eine neue Aufgabe erstellen. Willst du fortfahren?',
    create_tasks_asset_failed: 'Beim Fortfahren der Erstellung ist ein Serverfehler aufgetreten.',
    current: 'Zu erledigende Aufgabe',
    current_status: 'Aktueller Status :',
    delete_all_text: 'Sind Sie sicher, dass Sie alle Aufgaben für bestimmte {name}} löschen möchten? Bitte bestätigen Sie dies, indem Sie den Namen des Aufgabentyps der zu löschenden Aufgaben in das Textfeld eingeben.',
    delete_all_error: 'Das Löschen aller Aufgaben für einen bestimmten Aufgabentyp ist fehlgeschlagen.',
    delete_error: 'Beim Löschen der Aufgabe ist ein Fehler aufgetreten.',
    delete_comment: 'Sind Sie sicher, dass Sie den letzten Kommentar löschen möchten?',
    delete_comment_error: 'Beim Löschen eines Kommentars ist ein Fehler aufgetreten.',
    delete_for_selection: 'Löschen Sie ausgewählte Aufgaben:',
    delete_preview: 'Sind Sie sicher, dass Sie diese Vorschau löschen möchten?',
    delete_preview_error: 'Beim Löschen der Vorschau ist ein Fehler aufgetreten.',
    edit_comment: 'Bearbeiten Sie, wie',
    done: 'Erledigt',
    download_pdf_file: 'Datei herunterladen .{extension} Datei',
    feedback: 'Rückmeldung',
    full_screen: 'Anzeige im Vollbildmodus',
    hide_assignations: 'Zuordnungen ausblenden',
    hide_infos: 'Zusätzliche Informationen ausblenden',
    my_tasks: 'Meine Aufgaben',
    next: 'nächste Aufgabe',
    no_assignation_right: 'Sie dürfen keine Zuordnungen verwalten.',
    no_comment: 'Zu dieser Aufgabe gibt es derzeit keinen Kommentar.',
    no_preview: 'Für diese Aufgabe gibt es derzeit keine Vorschau.',
    no_task_selected: 'Keine Aufgabe ausgewählt',
    number: 'Aufgabe | Aufgaben',
    preview: 'Vorschauen',
    previous: 'vorherige Aufgabe',
    unsubscribe_notifications: 'Abmeldung von Benachrichtigungen',
    set_estimations: 'Setzt Schätzungen für ausgewählte Aufgaben:',
    select_image_file: 'Bitte wählen Sie das Bild von Ihrer Festplatte aus, das Sie Ihrem Kommentar beifügen möchten',
    set_preview: 'Diese Vorschau als Miniaturansicht festlegen',
    set_preview_error: 'Bei der Einstellung der Vorschau als Miniaturansicht ist ein Fehler aufgetreten.',
    set_preview_done: 'Diese Vorschau wird als Miniaturansicht für das aktuelle Objekt verwendet.',
    select_preview_file: 'Bitte wählen Sie ein Bild von Ihrer Festplatte aus, das Sie als Vorschau für die aktuelle Aufgabe verwenden möchten:',
    show_assignations: 'Zuordnungen anzeigen',
    show_infos: 'Zusätzliche Informationen anzeigen',
    subscribe_notifications: 'Benachrichtigungen abonnieren',
    validation: 'Validierung',
    tasks: 'Aufgaben',
    with_comment: 'Mit einem Kommentar...',
    fields: {
      asset_type: 'Anlagenart',
      assignees: 'Zessionare',
      end_date: 'Enddatum',
      due_date: 'Zwei Termine',
      duration: 'Dauer',
      entity: 'Entität',
      entity_name: 'Name',
      estimation: 'Schätzung',
      frames: 'Fram.',
      last_comment: 'Letzter Kommentar',
      last_comment_date: 'Letzter Kommentar',
      priority: 'Priorität',
      production: 'Produkt',
      real_end_date: 'Validierungsdatum',
      real_start_date: 'WIP-Datum',
      retake_count: 'Wiederholungen',
      sequence: 'Sequenz',
      start_date: 'Startdatum',
      task_status: 'Status',
      task_status_short_name: 'Status',
      task_type: 'Typ'
    },
    colors: {
      title: 'Einfärbung',
      neutral: 'Neutral',
      status: 'Statusfarbe',
      late: 'Spät in Rot'
    },
    priority: {
      emergency: 'Notfall',
      normal: 'Normal',
      high: 'Hoch',
      very_high: 'Sehr hoch'
    }
  },

  timesheets: {
    detail_level: 'Detaillierungsgrad',
    done_tasks: 'Erledigte Aufgaben',
    export_timesheet: 'Zeiterfassung exportieren',
    hours: 'Stunden',
    month: 'Monat',
    time_spents: 'Zeitaufwand (Stunden)',
    title: 'Stundenzettel',
    year: 'Jahr'
  },

  wrong_browser: {
    title: 'Dein Browser wird von Kitsu nicht unterstützt.',
    text: 'Kitsu kann nur mit Firefox und Chrome-Browsern verwendet werden.'
  }
}
