export default {

  assets: {
    cast_in: 'Используется в', // Cast in
    delete_error: 'Ошибка при удалении ассета. Вероятнее всего к нему привязаны какие-то данные. Вы уверены что этот ассет не связан с текущей задачей?', // An error occured while deleting this asset. There are probably data linked to it. Are you sure this asset type has no task linked to it?
    delete_text: 'Уверены, что хотите удалить {name} из своей базы данных?', // Are you sure you want to remove {name} from your database?
    edit_fail: 'Не удалось сохранить. Возможно, что файл с таким же названием уже существует.', // Saving failed, it may be due to the fact that an asset with a similar name already exists.
    edit_success: 'Ассет {name} успешно изменён.', // Asset {name} successfully edited.
    edit_title: 'Редактировать ассет', // Edit asset
    empty_list: 'В проекте нет ни одного ассета. Не хотите ли создать?', // There is no asset in the production. What about creating some?
    empty_list_client: 'В этом проекте нет ни одного ассета.', // There is no asset in this production.
    new_asset: 'Создать ассет', // Create an asset
    new_assets: 'Добавить ассеты', // Add assets
    new_success: 'Ассет {name} успешно создан.', // Asset {name} successfully created.
    no_cast_in: 'Этот ассет не задействован ни в одном шоте.', // This asset is not cast in any shot.
    number: 'ассет | ассеты', // asset | assets
    restore_text: 'Вы уверены, что хотите восстановить {name} в вашей базе данных?', // Are you sure you want to restore {name} into your database?
    restore_error: 'Ошибка при восстановлении ассета.', // An error occured while restoring this asset.
    tasks: 'Задачи ассета', // Asset tasks
    title: 'Ассеты', // Assets
    fields: {
      description: 'Описание', // Description
      episode: 'Эп.', // Ep.
      name: 'Назв.', // Name
      production: 'Проект', // Prod
      time_spent: 'Время', // Time
      type: 'Тип', // Type
      hidden_from_client: 'Отображено клиенту' // Displayed to client
    }
  },

  asset_types: {
    all_asset_types: 'Все типы ассетов', // All asset types
    create_error: 'Ошибка при сохранении этого типа ассетов. Вы уверены, что нет типа ассетов с таким же названием?', // An error occured while saving this asset type. Are you sure there is no asset type with similar name?
    delete_text: 'Вы уверены, что хотите удалить {name} из своей базы данных?', // Are you sure you want to remove {name} from your database?
    delete_error: 'Ошибка при удалении типа ассетов. Вероятнее всего к нему привязаны какие-то данные. Вы уверены, что этот тип ассетов не связан с каким-либо ассетом?', // An error occured while deleting this asset type. There are probably data linked to it. Are you sure this asset type has no asset linked to it?
    edit_title: 'Редактировать тип ассетов', // Edit asset type
    new_asset_type: 'Добавить тип ассетов', // Add an asset type
    number: 'тип ассетов | типы ассетов', // asset type | asset types
    title: 'Типы Ассетов', // Asset Types
    production_title: 'Стат. Типов Ассетов', // Asset Types Stats
    fields: {
      name: 'Назв.' // Name
    }
  },

  breakdown: {
    all_assets: 'Все доступные ассеты', // All available assets
    edit_label: 'Изменить метку ассета', // Change the asset\'s label
    empty: 'Пустое задействование', // Empty casting
    label: 'Метка', // Label
    picture_mode: 'Перепключиться в режим изображения', // Switch to picture mode
    text_mode: 'Перепключиться в режим текста', // Switch to text mode
    title: 'Breakdown',
    options: {
      fixed: 'fixed',
      animate: 'анимировать' // animate
    }
  },

  comments: {
    add_attachment: 'Добавить вложение', // Add attachment
    add_checklist: 'Добавить чеклист', // Add checklist
    add_comment: 'Оставить комментарий...', // Add a comment...
    add_preview: 'Добавить превью', // Attach preview
    change_preview: 'Изменить превью', // Change preview
    comment_from_client: 'Комментарий клиента', // Comment from client
    edit_title: 'Редактировать комментарий', // Edit comment
    empty_text: 'Этот комментарий пустой', // This comment is empty
    edit_error: 'Ошибка при редактировании комментария. Пожалуйста, обратитесь в поддержку.', // An error occured while editing comment. Please contact our support team.
    error: 'Ошибка при размещении комментария', // An error occured while posting comment
    no_file_attached: 'Файл не прикреплён', // No file attached
    pin: 'Закрепить', // Pin
    pinned: 'Закреплено', // Pinned
    post_status: 'Опубликовать комментарий', // Post comment
    retake: 'Повтор', // Retake
    revision: 'ревизия', // revision
    set_status_to: 'Установить статус', // Set status to
    task_placeholder: 'Новый предмет...', // New item...
    text: 'Текст', // Text
    unpin: 'Открепить', // Unpin
    validated: 'Проверено!', // Validated!
    validation_required: 'Необходима Проверка', // Validation Required
    fields: {
      text: 'текст' // text
    }
  },

  custom_actions: {
    create_error: 'Ошибка при сохранении этого специального действия. Вы уверены, что нет действия с таким же названием?', // An error occured while saving this custom custom action. Are you sure that there is no other action with the same name?
    delete_text: 'Уверены, что хотите удалить специальное действие {name} из своей базы данных?', // Are you sure you want to remove custom action {name} from your database?
    delete_error: 'Ошибка при удалении специального действия', // An error occured while deleting this custom custom action.
    edit_title: 'Редактировать специальное действие', // Edit a custom action
    new_custom_action: 'Добавить специальное действие', // Add a custom action
    number: 'специальное действие | специальные действия', // custom action | custom actions
    run_for_selection: 'Выполнить специальное действие для следующих задач:', // Run custom action for selected tasks:
    title: 'Специальные Действия', // Custom Actions
    fields: {
      name: 'Назв.', // Name
      url: 'URL',
      entity_type: 'Тип Объекта', // Entity Type
      is_ajax: 'Исп. AJAX' // Use AJAX
    },
    entity_types: {
      all: 'Все', // All
      shot: 'Шот', // Shot
      asset: 'Ассет' // Asset
    }
  },

  entities: {
    build_filter: {
      asset_type: 'Тип ассетов', // Asset type
      all_types: 'Все типы ассетов', // All asset types
      assignation: 'Назначение', // Assignation
      assignation_exists_for: 'Есть назначения для', // Assignations exists for
      assigned_to: 'Назначен на', // Assigned to
      descriptor: 'Metadata',
      equal: 'Equal',
      in: 'В', // In
      no_assignation_for: 'Нет назначений для', // No assignation exists for
      no_filter: 'Нет фильтра', // No filter
      not_equal: 'Not equal',
      not_assigned_to: 'Не назначен на', // Not assigned to
      status: 'Статус задачи', // Task status
      thumbnail: 'Наличие ярлыка', // Thumbnail presence
      title: 'Filter on...',
      union_and: 'Match all the following filters',
      union_or: 'Match one of the following filters',
      with_thumbnail: 'С ярлыком', // With thumbnail
      without_thumbnail: 'Без ярлыка' // Without thumbnail
    },

    thumbnails: {
      error: 'Ошибка при загрузке ярлыков', // An error occured while uploading thumbnails
      explaination: 'Для добавления ярлыка нужно новое превью. Чтобы сделать сразу несколько ярлыков, необходимо сначала выбрать тип задачи для создания новых превью. Ярлыки будут сделаны на основании этого нового превью.', // Adding a thumbnail requires to set a new preview. In order to set several thumbnails at the same time, you must chose first a task type that will be used to create the new previews. The thumbnails will be set from this new preview.
      explaination_two: 'Далее выберите файлы для использования. Чтобы найти правильные объекты, имена файлов должны соответсвовать шаблону:', // Then you have to select the files you want to upload. To find the right entities, the file names must match the following pattern:
      shots_pattern: '"SequenceName ShotName" пр. SQ01_SH01.', // "SequenceName ShotName" eg. SQ01_SH01.
      assets_pattern: '"AssetType AssetName" пр. Окружение_Лес.', // "AssetType AssetName" eg. Environment_Forest.
      select_files: 'Выбрать Файлы', // Select Files
      selected_files: 'Выбранные Файлы', // Selected Files
      select_task_type: 'Выбрать Тип Задачи', // Select Task Type
      title: 'Добавить Ярлыки', // Add Thumbnails
      undefined: 'Неопределён', // Undefined
      undefined_pattern: 'Неопределён', // Undefined
      upload: 'Добавить Ярлыки' // Add Thumbnails
    }
  },

  estimation: {
    title: 'Вычисление' // Estimation
  },

  episodes: {
    all_episodes: 'Все эпизоды', // All episodes
    edit_error: 'Ошибка при сохранении этого эпизода. Вы уверены, что нет эпизода с таким же названием?', // An error occured while saving this episode. Are you sure there is no episode with similar name?
    delete_error: 'Ошибка при удалении эпизода. Вероятнее всего к нему привязаны какие-то данные. Вы уверены, что этот тип ассетов не связан с какой-либо секвенции?', // An error occured while deleting this episode. There are probably data linked to it. Are you sure this episode has no sequence linked to it?
    delete_text: 'Уверены, что хотите удалить {name} из своей базы данных? Все связанные шоты и превью будут удалены. Для подтверждения введите название эпизода внизу.', // Are you sure you want to remove {name} from your database? Every related shots and previews will be deleted. Pleas confirm by typing the episode name below.
    edit_title: 'Редактировать эпизод', // Edit episode
    empty_list: 'В проекте нет ни одного эпизода. Не хотите ли создать?', // There is no episode in the production. What about creating some?
    empty_list_client: 'В этом проекте нет ни одного эпизода.', // There is no episode in this production.
    new_episode: 'Новый эпизод', // New episode
    number: 'эпизод | эпизоды', // episode | episodes
    title: 'Статистика эпизода', // Episode Stats
    fields: {
      name: 'назв.', // name
      description: 'описание' // description
    }
  },

  keyboard: {
    altdown: 'Move task selection down',
    altj: 'Выбрать предыдущее превью ', // Select previous preview
    altk: 'Выбрать следующее превью', // Select next preview
    altleft: 'Move task selection left',
    altright: 'Move task selection right',
    altup: 'Move task selection up',
    annotations: 'Аннотации', // Annotations
    draw: 'Set draw mode on',
    navigation: '', // Navigation
    redo: 'Повторить', // Redo
    undo: 'Отменить', // Undo
    playlist_navigation: 'Навигация по плейлисту', // Playlist navigation
    remove_annotation: 'Убрать аннотацию', // Remove annotation
    shortcuts: 'Ссылки' // Shortcuts
  },

  login: {
    back_to_login: 'Вернуться к регистрации', // Go back to login page
    forgot_password: 'Забыли пароль?', // Forgot password?
    login: 'Войти', // Log in
    login_failed: 'Ошибка входа. Пожалуйста, подтвердите ваши полномочия', // Log in failed, please verify your credentials
    login_page: 'Отмена', // Cancel
    redirecting: 'Перенаправление через {secondsLeft} секунд...', // Redirecting in {secondsLeft} seconds...
    reset_change_password: 'Сменить пароль', // Change password
    reset_change_password_form_failed: 'С паролем, который вы дали, возникла проблема. Убедитесь в том, что он состоит как минимум из 7 знаков и что оба пароля совпадают', // There is a problem with the password you gave. Please, verify that it is at least 7 chars long and that both passwords match.
    reset_change_password_failed: 'Не удалось изменить пароль. Пожалуйста, пройдите процедуру ещё раз.', // Changing password failed. Please, restart the whole procedure again.
    reset_change_password_succeed: 'Ваш пароль успешно изменён. Пожалуйста вернитесь к регистрации, чтобы использовать его.', // Your password was changed successfully. Please, go back to the login page to use it.
    reset_change_password_title: 'Введите новый пароль', // Enter a new password
    reset_password: 'Сбросить Пароль', // Reset Password
    reset_password_failed: 'Не удалось сбросить пароль. Подтврдите вашу почту.', // Resetting you password failed. Please verify your email.
    reset_password_succeed: 'Пароль успешно сброшен. Пожалуйста, проверьте вашу почту.', // Resetting your password succeeded. Please check your inbox.
    reset_password_title: 'Введите вашу почту, чтобы сбросить пароль', // Enter your email to reset your password
    title: 'Войти в Kitsu', // Log in to Kitsu
    fields: {
      email: 'Почта', // Email
      password: 'Пароль', // Password
      password2: 'Пароль повторно' // Password again
    }
  },

  main: {
    about: 'About',
    add: 'добавить', // add
    all: 'Все', // All
    all_assets: 'Все ассеты', // All assets
    admin: 'Администратор', // Admin
    cancel: 'Отмена', // Cancel
    clear_selection: 'Очистить выбранное', // Clear current selection
    close: 'Закрыть', // Close
    confirmation: 'Подтвердить', // Confirm
    confirmation_and_stay: 'Подтвердить и остаться', // Confirm and stay
    date: 'Дата', // Date
    dark_theme: 'Тёмная Тема', // Dark Theme
    days_spent: 'день потрачен | дней потрачено', // day spent | days spent
    days_estimated: 'день ожидается | дней ожидается', // day estimated | days estimated
    delete: 'Удалить', // Delete
    delete_all: 'Удалить все', // Delete all
    delete_text: 'Уверены, что хотите удалить {name} из своей базы данных?', // Are you sure you want to remove {name} from your database?
    documentation: 'Документация', // Documentation
    edit: 'Редактировать', // Edit
    empty_comment: 'Пустой комментарий', // Empty comment
    end_date: 'Дата окончания', // End date
    files_selected: 'выбранные файлы', // files selected
    for: 'Для', // For
    go_productions: 'Перейти к проектам', // Go to productions
    history: 'история', // history
    info: 'Информация', // Information
    or: 'или', // or
    no: 'Нет', // No
    loading: 'Загрузка...', // Loading...
    loading_data: 'Загрузка данных', // Loading data
    loading_error: 'Ошибка при загрузке данных', // An error occured while loading data.
    logout: 'Logout',
    modify: 'Modify',
    minimize: 'Минимизировать', // Minimize
    main_pack: 'Main Pack',
    maximize: 'Максимизировать', // Maximize
    nb_frames: 'frame | frames',
    person: 'Person',
    profile: 'Профиль', // Profile
    production: 'Проэкт', // Production
    remove: 'Remove',
    save: 'Схранить', // Save
    sort_by: 'Сортировать', // Sort by
    sorted_by: 'Отсортировано', // Sorted by
    start_date: 'Дата начала', // Start date
    studio: 'Студия', // Studio
    tutorials: 'Руководства', // Tutorials
    user: 'Пользователь', // User
    white_theme: 'Белая Тема', // White Theme
    yes: 'Да', // Yes
    csv: {
      choose: 'Выбрать', // Choose
      error_upload: 'Ошибка при загрузке вашего CSV.', // An error occured while uploading your CSV.
      export_file: 'Экспортировать', // Export
      import_file: 'Импортировать', // Import
      import_title: 'импортировать данные с CSV', // Import data from a CSV
      legend: 'Легенда', // Legend
      legend_ok: 'Опознанные данные', // Recognized data
      legend_ignored: 'Пропущенные данные', // Ignored data
      legend_missing: 'Недостающие данные', // Missing data
      legend_disabled: 'Данные не подлежащие обновлению или созданию', // Data that will no be updated or created
      legend_overwrite: 'Данные подлежащие обновлению', // Data that will be updated
      paste: 'Вставить', // Paste
      paste_code: 'Вставьте сюда данные вашего CSV:', // Please paste here your CSV data:
      preview: 'Превью', // Preview
      preview_episode_name: 'Название эпизода', // Episode name
      preview_title: 'Превью импортированных данных', // Preview of your imported data
      preview_description: 'Upload a .csv file to populate your board with posts.',
      preview_required: 'NB: Headers must be included as first row.',
      preview_reupload: 'Reupload .CSV file',
      required_fields: 'Вашему CSV нужны следующие столбцы', // Your CSV requires the following columns
      select_file: 'Выберите файл из одной из ваших папок:', // Please select a file from one of your folder:
      tab_select_file: 'Загрузить файл CSV', // Upload a CSV file
      tab_paste_code: 'Вставить данные CSV', // Paste a CSV data
      unknown: 'Неизвестный столбец', // Unknown column
      upload_file: 'Искать', // Browse
      options: {
        title: 'Опции', // Options
        update: 'Обновить существующие данные' // Update existing data
      }
    }
  },

  menu: {
    assign_tasks: 'Распределить задачи', // Assign tasks
    change_priority: 'Изменить приоритет', // Change priority
    change_status: 'Изменить статус', // Change status
    create_tasks: 'Создать задачи', // Create tasks
    delete_tasks: 'Удалить задачи', // Delete tasks
    generate_playlists: 'Сгенерировать плейлист', // Generate playlists
    run_custom_action: 'Запустить специальное действие', // Run custom action
    set_estimations: 'Set estimations'
  },

  news: {
    all: 'Все', // All
    commented_on: 'прокомментировал(а)', // commented on
    infos: 'Информация', // Infos
    no_news: 'There is no news for this production or for this filter.',
    only_comments: 'Только комментарии', // Only comments
    only_previews: 'Только превью', // Only previews
    set_preview_on: 'set preview on',
    task_status: 'Статус задачи', // Task status
    task_type: 'Тип задачи', // Task type
    title: 'Лента новостей' // News Feed
  },

  not_found: {
    text: 'Ссылка на которую вы кликнули ненадёжна, мы рекомендуем вам вернуться на главную страницу.', // There was something wrong with the link you clicked on, we encourage you to come back on the home page.
    title: 'Страница не найдена...  вы ищете что-то, что уже удалили?' // Page not found... are your looking for something you deleted?
  },

  notifications: {
    and_change_status: 'и изменил(а) статус на', // and changed status to
    assigned_you: 'назначил(а) вас на', // assigned you to
    commented_on: 'прокомментировал(а)', // commented on
    mention_you_on: 'упомянул(а) вас в', // mentioned you on
    no_notifications: 'сейчас для вас нет комментариев по вашим текущим проэктам', // There is currently no notification for you for your current projects.
    unread_notifications: 'непрочитанное уведомление | непрочитанные уведомления', // unread notification | unread notifications
    title: 'Уведомления', // Notifications
    with_preview: 'с превью' // with a preview
  },

  people: {
    active: 'Активный', // Active
    active_persons: 'active person | active persons',
    add_member_to_team: 'Добавить члена в команду', // Add a member to the team: 
    create_invite: 'Создать и отослать приглашение', // Create and send invitation
    create_error: 'An  error occured while creating this person. Please contact our support team for more information.',
    delete_error: 'An error occured while deleting this person. There are probably data linked to it. Are you sure this person has no assignation or wrote no comment?',
    delete_text: 'Are you sure you want to remove {personName} from your database? Every related comments and previews will be deleted. Please confirm by typing the full person name below.',
    edit_title: 'Edit person',
    empty_team: 'There is no one listed in the project team.',
    invite: 'Отправить приглашение', // Send an invitation
    invite_error: 'Ошибка при отправке приглашения', // An error occured while sending the invitation
    invite_success: 'Приглашение успешно отправлено', // Invitation was successfully sent
    new_person: 'Add a new employee',
    no_task_assigned: 'There are no running tasks assigned to you',
    persons: 'person | persons',
    running_tasks: 'Running tasks',
    select_person: 'Select a person...',
    team: 'Команда', // Team
    title: 'People',
    unactive: 'Неактивный', // Unactive
    csv: {
      import_file: 'Импортироать .csv файл', // Import a .csv file
      export_file: 'Сохранить как .csv файл', // Download as a .csv file
      import_title: 'Импортировать данные с файла CSV', // Import data from a CSV file
      required_fields: 'Вашему файлу CSV нужны седующие столбцы', // Your CSV file requires the following columns
      select_file: 'Выберите файл из одной из ваших папок:', // Please select a file from one of your folder:
      error_upload: 'Ошибка при загрузке вашего файла CSV.', // An error occured while uploading your CSV file.
    },
    fields: {
      first_name: 'Имя', // First name
      last_name: 'Фамилия', // Last name
      email: 'Почта', // Email
      phone: 'Телефон', // Phone
      role: 'Роль', // Role
      old_password: 'Текущий пароль', // Current password
      password: 'Новый пароль', // New password
      password_2: 'Новый пароль (повторно)', // New password (repeat)
      active: 'Активный' // Active
    },
    list: {
      name: 'Имя', // Name
      email: 'Почта', // Email
      phone: 'Телефон', // Phone
      role: 'Роль', // Role
      active: 'Активный' // Active
    },
    role: {
      admin: 'Студийный Менеджер', // Studio Manager
      client: 'Клиент', // Client
      manager: 'Диспетчер', // Supervisor
      user: 'Художник', // Artist
      undefined: '',
      vendor: 'Подрядчик' // Vendor
    }
  },

  playlists: {
    add_assets: 'Добавить ассеты', // Add assets
    add_selection: 'Add selection',
    add_shots: 'Добавить шоты', // Add shots
    add_sequence: 'Add whole sequence',
    add_episode: 'Добавить целый эпизод', // Add whole episode
    add_movie: 'Добавить целый фильм', // Add whole movie
    apply_task_type_change: 'This will set the last revison for given task type on all shots.',
    available_build: 'Доступные сборки', // Available builds
    build_daily: 'Daily pending',
    build_weekly: 'All Pending',
    build_mp4: 'Build .mp4 (beta)',
    building: 'Building...',
    client_playlist: 'Клиентский Плейлист', // Client Playlist
    create_for_selection: 'Generate a playlist for shot selection',
    create_title: 'Создать плейлист', // Create playlist
    created_at: 'Создан в:', // Created at:
    delete_text: 'Уверены, что хотите удалить {name} из своей базы данных?', // Are you sure you want to remove {name} from your database?
    delete_error: 'Ошибка при удалении плейлиста.', // An error occured while deleting this playlist.
    edit_error: 'Ошибка при сохранении плейлиста.', // An error occured while saving this playlist.
    download_zip: 'Скачать .zip', // Download .zip
    failed: 'Failed',
    for_client: 'Клиент', // The client
    for_studio: 'Студия', // The Studio
    edit_title: 'Редактировать плейлист', // Edit playlist
    last_creation: 'Last creations',
    last_modification: 'Последние модификации', // Last modifications
    loading_error: 'Ошибка сервера. Нельзя загрузить плейлисты.', // A server error occured. Playlists cannot be loaded.
    new_playlist: 'Добавить плейлист', // Add a playlist
    no_build: 'Нет сборки', // No build
    no_playlist: 'В настоящий момент нет плейлиста для этого проекта или эпизода', // There is currently no playlist for this project or episode.
    no_preview: 'Нет превью', // No preview
    no_selection: 'Выберите один из плейлистов слева.', // Please select a playlist on the left.
    no_sequence_for_episode: 'Нет секвенций для этого эпизода', // There is no sequence for this episode
    no_shot_for_production: 'нет шота для этого проекта', // There is no shot for this production
    select_shot: 'Веыберите шот из правого столбца', // Please select a shot in the right column
    select_playlist: 'Выберите плейлист из левого столбца', // Please select a playlist in the left column
    select_task_type: 'Изменить тип задачи для всех шотов', // Change task type for all shots
    title: 'Плейлисты', // Playlists
    updated_at: 'Updated at:',
    remove: 'удалить', // remove
    fields: {
      name: 'Назв.', // Name
      created_at: 'Дата создания', // Creation date
      updated_at: 'Дата апдейта', // Update date
      for_entity: 'Выбрать объект для отображения', // Select entity to display
      for_client: 'To be shared with'
    },
    actions: {
      annotation: 'Аннотация', // Annotation
      annotation_text: 'Дважды кликните по превью, чтобы добавить текст', // Double click on the preview to add some text
      annotation_delete: 'Удалить аннотацию', // Delete annotation
      annotation_redo: 'Повторить аннотацию', // Redo annotation
      annotation_undo: 'Отменить аннотацию', // Undo annotation
      annotation_big: 'Большой', // Big
      annotation_medium: 'Средний', // Medium
      annotation_small: 'Маленький', // Small
      change_task_type: 'Изменить тип задачи', // Change task type
      comments: 'Показать/Скрыть комментарии', // Show/Hide comments
      delete: 'Удалить плейлист', // Delete playlist
      download: 'Скачать...', // Download…
      edit: 'Редактировать плейлист', // Edit playlist
      entity_list: 'Показать/Скрыть список объектов', // Show/Hide entity list
      fullscreen: 'Полный экран', // Fullscreen
      next_frame: 'Next frame',
      next_shot: 'Следующий шот', // Next shot
      pause: 'Пауза', // Pause
      play: 'Пуск', // Play
      previous_frame: 'Previous frame',
      previous_shot: 'предыдущий шот', // Previous shot
      save_playlist: 'Сохранить плейлист', // Save playlist
      speed: 'Изменить скорость', // Change speed
      split_screen: 'Двойной экран' // Split screen
    }
  },

  productions: {
    current: 'Выбраный проект', // Selected production
    delete_text: 'Are you sure you want to remove {name} from your database? Please, confirm by typing the name of the project you want to delete in the text field.',
    delete_error: 'An error occured while deleting this production. There are probably data linked to it. Are you sure this production has no task, shot or asset linked to it? Kitsu doesn\'t allow production deletion. If you don\'t want to see the production anymore, you can close it instead.',
    edit_error: 'An error occured while editing production. Please contact our support team.',
    edit_title: 'Редактировать проект', // Edit production
    new_production: 'Добавить проект', // Add a production
    number: 'проект | проекты', // production | productions
    open_productions: 'Мои проекты', // My productions
    picture: 'Изменить изображение', // Change picture
    title: 'Проекты', // Productions
    home: {
      create_new: 'Создать новый проект', // Create a new production
      empty: 'У вас нет открытых проектов. Не хотите ли создать новый?', // You don't have any production open. What about creating a new one?
      no_task: 'У вас не распределены задачи. Обратитесь к вашему диспетчеру за помощью', // You have no task assigned. See your supervisor to see what you can do!
      no_prod_for_client: 'You don\'t have access to any production. Contact your contractor to obtain an access.',
      title: 'Running Productions',
      welcome: 'Добро пожаловать в Kitsu' // Welcome to Kitsu
    },
    fields: {
      fps: 'FPS',
      name: 'Назв.', // Name
      ratio: 'Ratio',
      resolution: 'Разрешение', // Resolution
      status: 'Статус', // Status
      type: 'Тип' // Type
    },
    metadata: {
      add_explaination: 'Add specific data required by this project.',
      add_failed: 'An error occured while adding metadata to your project.',
      add_new_values: 'There is currently no available values.',
      available_values: 'Available values',
      choices: 'List of values',
      delete_text: 'Are you sure you want to delete this column and related data for all assets of this production?',
      delete_error: 'An error occured while deleting this metadata column.',
      error: 'An error occured while adding the metadata column. Make sure there is no column with similar name and that all fields are filled. If the problem is persists, please contact the support team.',
      free: 'Free value',
      title: 'Add metadata column'
    },

    status: {
      closed: 'Закрыт', // Closed
      open: 'Открыт', // Open
      active: 'Открыт', // Open
      archived: 'Закрыт' // Closed
    },

    type: {
      short: 'Короткий', // Short
      featurefilm: 'Feature Film',
      tvshow: 'ТВ шоу' // TV Show
    }
  },

  profile: {
    change_avatar: 'Изменить аватар', // Change avatar
    info_title: 'Информация', // Information
    language: 'Язык', // Language
    notifications_enabled: 'Уведомления на почту включены', // Email notifications enabled
    notifications_slack_enabled: 'Slack notifications enabled',
    notifications_slack_user: 'Slack username',
    password_title: 'Изменить пароль', // Change password
    timezone: 'Временная зона', // Timezone
    title: 'Ваш Профиль', // Your Profile
    avatar: {
      title: 'Изменить аватар', // Change avatar
      error_upload: 'Ошибка при загрузке изображения' // There was an error while uploading picture.
    },
    change_password: {
      button: 'Изменить пароль', // Change password
      error: 'Ошибка при смене пароля. Подтвердите ваш текущий пароль.', // An error occured while changing password. Please verify your current password.
      success: 'Ваш пароль успешно изменён!', // Your password was successfully changed!
      unvalid: 'Your new password confirmation doesn\'t match or your password is too short (7 chars, at least, is expected).'
    },
    save: {
      button: 'Сохранить изменения', // Save changes
      error: 'Ошибка при сохраниении изменений' // An error occured while saving changes
    }
  },

  settings: {
    change_logo: 'Изменить логотип', // Change logo
    integrations: 'Интеграции', // Integrations
    logo: 'Логотип студии', // Studio logo
    no_logo: 'Логотип не установлен', // There is no logo set.
    set_logo: 'Установить логотип студии', // Set studio logo
    title: 'Настройки', // Settings
    fields: {
      name: 'Название студии', // Studio name
      hours_by_day: 'Часов в день', // Hours by day
      slack_token: 'Slack Token (Опционально)', // Slack Token (Optional)
      use_original_name: 'Use original file name for downloads'
    },
    production: {
      empty_list: 'The list is currently empty. It means that all data from the main settings are available to users. Add some entries to limit choices for this production.'
    },
    save: {
      button: 'Сохранить настройки', // Save settings
      error: 'Ошибка сервера при сохранении настроек' // A server error occured while saving settings
    }
  },

  task_status: {
    create_error: 'Ошибка при сохранении этого статуса задачи. Вы уверены, что нет статуса задачи с таким же названием?', // An error occured while saving this task status. Are you sure there is no task status with similar name?
    delete_text: 'Уверены, что хотите удалить {name} из своей базы данных?', // Are you sure you want to remove {name} from your database?
    delete_error: 'Ошибка при удалении статуса задачи. Вероятнее всего к нему привязаны какие-то данные. Вы уверены, что этот статус задачи не связан с какой-либо задачей?', // An error occured while deleting this task status. There are probably data linked to it. Are you sure this task status has no task linked to it?
    edit_title: 'Редактировать статус задачи', // Edit task status
    number: 'статус задачи | статус задачи', // task status | task status
    new_task_status: 'Добавить статус задаци', // Add a task status
    title: 'Статус Задачи', // Task Status
    fields: {
      color: 'Цвет', // Color
      is_artist_allowed: 'Is artist allowed',
      is_client_allowed: 'Is client allowed',
      is_done: 'Завершена', // Is done 
      is_reviewable: 'Is reviewable',
      is_retake: 'Has retake value',
      name: 'Назв.', // Name 
      short_name: 'Сокр. назв.' // Short name
    }
  },

  task_types: {
    delete_text: 'Уверены, что хотите удалить {name} из своей базы данных?', // Are you sure you want to remove {name} from your database?
    delete_error: 'Ошибка при удалении этого типа задачи. Вероятнее всего к нему привязаны какие-то данные. Вы уверены, что этот статус задачи не связан с какой-либо задачей?', // An error occured while deleting this task type. There are probably data linked to it. Are you sure this task type has no task linked to it?
    edit_title: 'Редактировать тип задачи', // Edit task type
    create_error: 'An error occured while creating the task type. Please, check that there is no task type with similar name.',
    new_task_type: 'Добавить тип задачи', // Add a task type
    number: 'тпип задачи | типы задач', // task type | task types
    title: 'типы Задач', // Task Types
    fields: {
      dedicated_to: 'Для', // For
      color: 'Цвет', // Color
      name: 'Назв.', // Name
      allow_timelog: 'Timelog',
      priority: 'Приоритет' // Priority
    }
  },

  sequences: {
    all_sequences: 'Все секвенции', // All sequences
    edit_error: 'Ошибка при сохранении этой секвенции. Вы уверены, что нет секвенции с таким же названием?', // An error occured while saving this sequence. Are you sure there is no sequence with similar name?
    delete_text: 'Уверены, что хотите удалить {name} из своей базы данных? Все связанные шоты и превью будут удалены. Для подтверждения введите название секвенции внизу.', // Are you sure you want to remove {name} from your database? Every related shots and previews will be deleted. Please confirm by typing the sequence name below.
    delete_error: 'Ошибка при удалении секвенции. Вероятнее всего к нему привязаны какие-то данные. Вы уверены, что этот тип ассетов не связан с каким-либо шотом?', // An error occured while deleting this sequence. There are probably data linked to it. Are you sure this sequence has no shot linked to it?
    edit_title: 'Редактировать секвенцию', // Edit sequence
    empty_list: 'В проекте нет ни одной секвенции. Не хотите ли создать?', // There is no sequence in the production. What about creating some?
    empty_list_client: 'В этом проекте нет ни одной секвенции.', // There is no sequence in this production.
    new_sequence: 'Новая секвенция', // New sequence
    number: 'секвенция | секвенции', // sequence | sequences
    title: 'Статистика Севенции', // Sequence Stats
    fields: {
      name: 'назв.', // name
      description: 'описание' // description
    }
  },

  schedule: {
    title: 'График', // Schedule
    title_main: 'Основной график', // Main Schedule
    overall_man_days: 'Man-days',
    md: 'md',
    zoom_level: 'Zoom level',
    milestone: {
      add_milestone: 'Добавить этапы для', // Add milestone for
      edit_milestone: 'Редактировать этапы для', // Edit milestone for
      name: 'Назв', // Name
      error: 'Ошибка при добавлении или редактировании этапа. Повторите попытку.' // An error occured while adding or editing the milestone. Please try again.
    }
  },

  quota: {
    average: 'Средний', // Average
    count_label: 'Count mode',
    detail_label: 'Detail level',
    details_name: 'Назв.', // Name
    details_seconds: 'Секунды', // Seconds
    details_frames: 'Кадры', // Frames
    month_label: 'Месяц', // Month
    no_quota: 'Нет квоты для этого типа задачи', // There is no quota for this task type.
    name: 'Назв.', // Name
    quota_day: 'Ежедневная квота', // Quota per day
    quota_week: 'Еженедельная квота', // Quota per week
    quota_month: 'Ежемесечная квота', // Quota per month
    year_label: 'Год', // Year
    title: 'Квота', // Quota
    type_label: 'Тип' // Type
  },

  shots: {
    casting: 'Задействование шота', // Shot casting
    creation_explaination: 'To add shots you need first to create an episode and a sequence. Type an episode name in the bottom of the left column then click on add to create a new episode. Select this episode and repeat the same operation for sequence. Finally select a sequence and type a shot name in the field in the bottom of the right column. Click on the add button below. Your first shot was created. You can now add many more! If it\'s not a TV Show, you have to directly create a sequence.',
    delete_text: 'Уверены, что хотите удалить {name} из своей базы данных?', // Are you sure you want to remove {name} from your database?
    delete_error: 'Ошибка при удалении шота. Вероятнее всего к нему привязаны какие-то данные. Вы уверены, что этот тип ассетов не связан с какой-либо задачей?', // An error occured while deleting this shot. There are probably data linked to it. Are you sure this shot has no task linked to it?
    edit_success: 'Шот {name} успешно изменён.', // Shot {name} successfully edited.
    edit_fail: 'Creation or edition failed, an error occured. Make sure that you are not renaming the shot with a name already listed for given sequence.',
    edit_title: 'Редактировать шот', // Edit shot
    empty_list: 'There is no shot in the production. What about creating some?',
    empty_list_client: 'There is no shot in this production.',
    episodes: 'Эпизоды', // Episodes
    history: 'История значений шота', // Shot values history
    new_shot: 'Добавить шот', // Add a shot
    new_shots: 'Добавить шоты', // Add shots
    new_sequences: 'добавить секвенции', // Add sequences
    new_episodes: 'Добавить эпизоды', // Add episodes
    no_casting: 'Пустое задействование шота', // The shot casting is empty.
    number: 'шот | шоты', // shot | shots
    manage: 'Создать шоты', // Create shots
    new_success: 'Shot {name} successfully created.',
    padding: 'Shot Padding',
    restore_text: 'Вы уверены, что хотите восстановить {name} в вашей базе данных?', // Are you sure you want to restore {name} into your database?
    restore_error: 'Ошибка при восстановлении шота', // An error occured while restoring this shot.
    sequences: 'Секвенции', // Sequences
    tasks: 'Задачи Шотов', // Shot Tasks
    title: 'Шоты', // Shots
    fields: {
      description: 'Описание', // Description
      nb_frames: 'Кадры', // Frames
      episode: 'Эпизод', // Episode
      frame_in: 'In',
      frame_out: 'Out',
      fps: 'FPS',
      name: 'Назв.', // Name
      production: 'Проект', // Prod
      sequence: 'Секвенция', // Sequence
      time_spent: 'Время' // Time
    }
  },

  server_down: {
    text: 'Please contact your vendor support, your system administrator or your IT department to understand what is going wrong.',
    title: 'Kitsu encountered an error while reaching its data API.'
  },

  statistics: {
    count: 'Counts',
    count_mode: 'Count mode',
    display_mode: 'Display mode',
    frames: 'Кадры', // Frames
    pie: 'Круговые диаграммы', // Pie charts
    shots: 'Шоты' // Shots
  },

  tasks: {
    add_preview: 'Добавить превью', // Add preview
    add_preview_error: 'An error occured while adding preview.',
    assign: 'Assign one task to: | Assign {nbSelectedTasks} tasks to:',
    back_to_list: 'назад к списку', // back to list
    bigger: 'расширить панель задач', // Widen task panel
    change_status_to: 'Изменить статус задачи на:', // Change task status to:
    change_preview: 'Изменить превью', // Change preview
    change_priority: 'Изменить приоритет на:', // Change priority to:
    clear_assignations: 'очистить назначения', // clear assignations
    comment_image: 'Прикрепить изображение к комментарию', // Attach an image to your comment
    create_for_selection: 'Create task for each empty cell:',
    create_tasks: 'Добавить задачи', // Add tasks
    create_tasks_shot: 'Добавть задачи для текущих шотов', // Add tasks for current shots
    create_tasks_shot_explaination: 'You are going to create a new task for each shot of current project for the given task type. Do you want to continue?',
    create_tasks_shot_failed: 'A server error occured while proceeding creations.',
    create_tasks_asset: 'Добавить задачи для текущих ассетов', // Add tasks for current assets
    create_tasks_asset_explaination: 'You are going to create a new task for each asset of current project for the given task type. Do you want to continue?',
    create_tasks_asset_failed: 'A server error occured while proceeding creations.',
    current: 'Задача на выполнение', // Task to do
    current_status: 'Текущий статус:', // Current status :
    delete_all_text: 'Are you sure you want to delete all tasks for given {name}? Please, confirm by typing the task type name of the tasks you want to delete in the text field.',
    delete_all_error: 'Deleting all tasks for given task type failed.',
    delete_error: 'Ошибка при удалении задачи', // An error occured while deleting task.
    delete_comment: 'Уверены, что хотите удалить последний комментарий?', // Are you sure you want to delete last comment?
    delete_comment_error: 'Ошибка при удалении комментария.', // An error occured while deleting comment.
    delete_for_selection: 'Удалить выбранные задачи:', // Delete selected tasks:
    delete_preview: 'Уверены, что хотите удалить этот превью? ', // Are you sure you want to delete this preview?
    delete_preview_error: 'ошибка при удвлении превью.', // An error occured while deleting preview.
    edit_comment: 'Редактировать комментарий', // Edit comment
    done: 'Завершено', // Done
    download_pdf_file: 'Скачать .{extension} файл', // Download .{extension} file 
    feedback: 'обратная связь', // feedback
    full_screen: 'Открыть на полный экран', // Display in full screen
    hide_assignations: 'Скрыть назначения', // Hide assignations
    hide_infos: 'Скрыть дополнительную информацию', // Hide additional information
    my_tasks: 'Мои задачи', // My tasks
    next: 'следующая задача', // next task
    no_assignation_right: 'You are not allowed to manage assignations',
    no_comment: 'В настоящий момент у этогй задачи нет комментариев.', // There is currently no comment for this task.
    no_preview: 'В настоящий момент у этогй задачи нет превью.', // There is currently no preview for this task.
    no_task_selected: 'Задачи не выбраны', // No task selected
    number: 'задача | задачи', // task | tasks
    preview: 'Превью', // Previews
    previous: 'предыдущая задача', // previous task
    unsubscribe_notifications: 'Отписаться от уведомлений', // Unsubscribe from notifications
    set_estimations: 'Выставить ожидания для выбранных задач:', // Set estimations for selected tasks:
    set_preview: 'Установить это превью как ярлык', // Set this preview as thumbnail
    set_preview_error: 'Ошибка при установлении превью как ярлыка', // An error occured while setting preview as thumbnail
    set_preview_done: 'Это превью используется как ярлык для текущего объекта', // This preview is used as thumbnail for the current entity.
    select_preview_file: 'Выберите изображение с диска для использования в качестве превью для текущей задачи', // Please select a picture from your hard drive to be used as a preview for the current task:
    show_assignations: 'Показать назначения', // Show assignations
    show_infos: 'Показать дополнитеьную информацию', // Show additional information
    subscribe_notifications: 'Подписаться на уведомления', // Subscribe to notifications
    select_image_file: 'Выберите изображение с диска, которе вы хотите прикрепить к комментарию.', // Please select the picture from your hard drive you want to attach to your comment:
    tasks: 'Задачи', // Tasks
    validation: 'Валидация', // Validation
    with_comment: 'С комменарием...', // With a comment...
    fields: {
      asset_type: 'Тип ассетов', // Asset type
      assignees: 'Назначенные', // Assignees
      count: 'Count',
      due_date: 'До даты', // Due date
      duration: 'Длительность', // Duration
      end_date: 'Дата валидации', // Validation date
      entity: 'Объект', // Entity
      entity_name: 'Назв', // Name
      estimated_quota: 'Средн. Квота', // Avg. Quota
      estimation: 'Вычисление', // Estimation
      frames: 'Кадр.', // Fram.
      last_comment: 'Последний комментарий', // Last comment
      last_comment_date: 'Последний комментарий', // Last comment
      priority: 'Приоритет', // Priority
      production: 'Проект', // Prod
      real_end_date: 'Дата валидации', // Validation date
      real_start_date: 'WIP дата', // WIP date
      retake_count: 'Повторы', // Retakes
      seconds: 'Секунды', // Seconds
      sequence: 'Секвенция', // Sequence
      start_date: 'Дата начала', // Start date
      task_status: 'Статус', // Status
      task_status_short_name: 'Статус', // Status
      task_type: 'Тип' // Type
    },
    colors: {
      title: 'Окрас', // Coloring
      neutral: 'Нейтральный', // Neutral
      status: 'Цвет стауса', // Status color
      late: 'Late in red'
    },
    priority: {
      emergency: 'Черезвычайная ситуация', // Emergency
      normal: 'Нормальный', // Normal
      high: 'высокий', // High
      very_high: 'Очень высокий' // Very High
    }
  },

  timesheets: {
    detail_level: 'Detail level',
    done_tasks: 'Выполненные задачи', // Done tasks
    export_timesheet: 'Export Timesheet',
    hours: 'часы', // hours
    month: 'Месяц', // Month
    time_spents: 'Затраченное время (часы)', // Time Spent (hours)
    title: 'Timesheets',
    year: 'Год' // Year
  },

  wrong_browser: {
    title: 'Kitsu не поддерживает ваш браузер', // Your browser is not supported by Kitsu
    text: 'Kitsu поддерживает только Firefox и Chrome' // Kitsu can only be used with Firefox and Chrome browsers.
  }
}
