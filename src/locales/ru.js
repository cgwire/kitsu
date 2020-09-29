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
    delete_error: 'Ошибка при удалении этого типа ассетов. Вероятнее всего к нему привязаны какие-то данные. Вы уверены, что этот тип ассетов не связан с каким-либо ассетом?', // An error occured while deleting this asset type. There are probably data linked to it. Are you sure this asset type has no asset linked to it?
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
    empty: 'Empty casting',
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
    retake: 'Retake',
    revision: 'ревизия', // revision
    set_status_to: 'Установить статус', // Set status to
    task_placeholder: 'New item...',
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
    delete_error: 'Ошибка при удалении этого специального действия', // An error occured while deleting this custom custom action.
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
      assignation_exists_for: 'Assignations exists for',
      assigned_to: 'Assigned to',
      descriptor: 'Metadata',
      equal: 'Equal',
      in: 'В', // In
      no_assignation_for: 'No assignation exists for',
      no_filter: 'Нет фильтра', // No filter
      not_equal: 'Not equal',
      not_assigned_to: 'Not assigned to',
      status: 'Статус задачи', // Task status
      thumbnail: 'Thumbnail presence',
      title: 'Filter on...',
      union_and: 'Match all the following filters',
      union_or: 'Match one of the following filters',
      with_thumbnail: 'С ярлыком', // With thumbnail
      without_thumbnail: 'Без ярлыка' // Without thumbnail
    },

    thumbnails: {
      error: 'An error occured while uploading thumbnails',
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
    delete_error: 'Ошибка при удалении этого эпизода. Вероятнее всего к нему привязаны какие-то данные. Вы уверены, что этот тип ассетов не связан с какой-либо секвенция?', // An error occured while deleting this episode. There are probably data linked to it. Are you sure this episode has no sequence linked to it?
    delete_text: 'Are you sure you want to remove {name} from your database? Every related shots and previews will be deleted. Pleas confirm by typing the episode name below.', // Are you sure you want to remove {name} from your database? Every related shots and previews will be deleted. Pleas confirm by typing the episode name below.
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
    reset_password_failed: 'Resetting you password failed. Please verify your email.',
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
    invite: 'Send an invitation',
    invite_error: 'An error occured while sending the invitation',
    invite_success: 'Invitation was successfully sent',
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
    create_title: 'Create playlist',
    created_at: 'Создан в:', // Created at:
    delete_text: 'Уверены, что хотите удалить {name} из своей базы данных?', // Are you sure you want to remove {name} from your database?
    delete_error: 'ошибка при удалении плейлиста.', // An error occured while deleting this playlist.
    edit_error: 'Ошибка при сохранении плейлиста.', // An error occured while saving this playlist.
    download_zip: 'Скачать .zip', // Download .zip
    failed: 'Failed',
    for_client: 'Клиент', // The client
    for_studio: 'Студия', // The Studio
    edit_title: 'Редактировать плейлист', // Edit playlist
    last_creation: 'Last creations',
    last_modification: 'Последние модификации', // Last modifications
    loading_error: 'A server error occured. Playlists cannot be loaded.',
    new_playlist: 'Добавить плейлист', // Add a playlist
    no_build: 'Нет сборки', // No build
    no_playlist: 'В настоящий момент нет плейлиста для этого проекта или эпизода', // There is currently no playlist for this project or episode.
    no_preview: 'Нет превью', // No preview
    no_selection: 'Выберите один из плейлистов слева.', // Please select a playlist on the left.
    no_sequence_for_episode: 'There is no sequence for this episode',
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
    create_error: 'An error occured while saving this task status. Are you sure there is no task status with similar name?',
    delete_text: 'Are you sure you want to remove {name} from your database?',
    delete_error: 'An error occured while deleting this task status. There are probably data linked to it. Are you sure this task status has no task linked to it?',
    edit_title: 'Edit task status',
    number: 'task status | task status',
    new_task_status: 'Add a task status',
    title: '', 
    fields: {
      color: 'Color',
      is_artist_allowed: 'Is artist allowed',
      is_client_allowed: 'Is client allowed',
      is_done: 'Is done',
      is_reviewable: 'Is reviewable',
      is_retake: 'Has retake value',
      name: 'Name',
      short_name: 'Short name'
    }
  },

  task_types: {
    delete_text: 'Are you sure you want to remove {name} from your database?',
    delete_error: 'An error occured while deleting this task type. There are probably data linked to it. Are you sure this task type has no task linked to it?',
    edit_title: 'Edit task type',
    create_error: 'An error occured while creating the task type. Please, check that there is no task type with similar name.',
    new_task_type: 'Add a task type',
    number: 'task type | task types',
    title: 'Task Types',
    fields: {
      dedicated_to: 'For',
      color: 'Color',
      name: 'Name',
      allow_timelog: 'Timelog',
      priority: 'Priority'
    }
  },

  sequences: {
    all_sequences: 'All sequences',
    edit_error: 'An error occured while saving this sequence. Are you sure there is no sequence with similar name?',
    delete_text: 'Are you sure you want to remove {name} from your database? Every related shots and previews will be deleted. Please confirm by typing the sequence name below.',
    delete_error: 'An error occured while deleting this sequence. There are probably data linked to it. Are you sure this sequence has no shot linked to it?',
    edit_title: 'Edit sequence',
    empty_list: 'There is no sequence in the production. What about creating some?',
    empty_list_client: 'There is no sequence in this production.',
    new_sequence: 'New sequence',
    number: 'sequence | sequences',
    title: 'Sequence Stats',
    fields: {
      name: 'name',
      description: 'description'
    }
  },

  schedule: {
    title: 'Schedule',
    title_main: 'Main Schedule',
    overall_man_days: 'Man-days',
    md: 'md',
    zoom_level: 'Zoom level',
    milestone: {
      add_milestone: 'Add milestone for',
      edit_milestone: 'Edit milestone for',
      name: 'Name',
      error: 'An error occured while adding or editing the milestone. Please try again.'
    }
  },

  quota: {
    average: 'Average',
    count_label: 'Count mode',
    detail_label: 'Detail level',
    details_name: 'Name',
    details_seconds: 'Seconds',
    details_frames: 'Frames',
    month_label: 'Month',
    no_quota: 'There is no quota for this task type.',
    name: 'Name',
    quota_day: 'Quota per day',
    quota_week: 'Quota per week',
    quota_month: 'Quota per month',
    year_label: 'Year',
    title: 'Quota',
    type_label: 'Type'
  },

  shots: {
    casting: 'Shot casting',
    creation_explaination: 'To add shots you need first to create an episode and a sequence. Type an episode name in the bottom of the left column then click on add to create a new episode. Select this episode and repeat the same operation for sequence. Finally select a sequence and type a shot name in the field in the bottom of the right column. Click on the add button below. Your first shot was created. You can now add many more! If it\'s not a TV Show, you have to directly create a sequence.',
    delete_text: 'Are you sure you want to remove {name} from your database?',
    delete_error: 'An error occured while deleting this shot. There are probably data linked to it. Are you sure this shot has no task linked to it?',
    edit_success: 'Shot {name} successfully edited.',
    edit_fail: 'Creation or edition failed, an error occured. Make sure that you are not renaming the shot with a name already listed for given sequence.',
    edit_title: 'Edit shot',
    empty_list: 'There is no shot in the production. What about creating some?',
    empty_list_client: 'There is no shot in this production.',
    episodes: 'Episodes',
    history: 'Shot values history',
    new_shot: 'Add a shot',
    new_shots: 'Add shots',
    new_sequences: 'Add sequences',
    new_episodes: 'Add episodes',
    no_casting: 'The shot casting is empty.',
    number: 'shot | shots',
    manage: 'Create shots',
    new_success: 'Shot {name} successfully created.',
    padding: 'Shot Padding',
    restore_text: 'Are you sure you want to restore {name} into your database?',
    restore_error: 'An error occured while restoring this shot.',
    sequences: 'Sequences',
    tasks: 'Shot Tasks',
    title: 'Shots',
    fields: {
      description: 'Description',
      nb_frames: 'Frames',
      episode: 'Episode',
      frame_in: 'In',
      frame_out: 'Out',
      fps: 'FPS',
      name: 'Name',
      production: 'Prod',
      sequence: 'Sequence',
      time_spent: 'Time'
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
    frames: 'Frames',
    pie: 'Pie charts',
    shots: 'Shots'
  },

  tasks: {
    add_preview: 'Add preview',
    add_preview_error: 'An error occured while adding preview.',
    assign: 'Assign one task to: | Assign {nbSelectedTasks} tasks to:',
    back_to_list: 'back to list',
    bigger: 'Widen task panel',
    change_status_to: 'Change task status to:',
    change_preview: 'Change preview',
    change_priority: 'Change priority to:',
    clear_assignations: 'clear assignations',
    comment_image: 'Attach an image to your comment',
    create_for_selection: 'Create task for each empty cell:',
    create_tasks: 'Add tasks',
    create_tasks_shot: 'Add tasks for current shots',
    create_tasks_shot_explaination: 'You are going to create a new task for each shot of current project for the given task type. Do you want to continue?',
    create_tasks_shot_failed: 'A server error occured while proceeding creations.',
    create_tasks_asset: 'Add tasks for current assets',
    create_tasks_asset_explaination: 'You are going to create a new task for each asset of current project for the given task type. Do you want to continue?',
    create_tasks_asset_failed: 'A server error occured while proceeding creations.',
    current: 'Task to do',
    current_status: 'Current status :',
    delete_all_text: 'Are you sure you want to delete all tasks for given {name}? Please, confirm by typing the task type name of the tasks you want to delete in the text field.',
    delete_all_error: 'Deleting all tasks for given task type failed.',
    delete_error: 'An error occured while deleting task.',
    delete_comment: 'Are you sure you want to delete last comment?',
    delete_comment_error: 'An error occured while deleting comment.',
    delete_for_selection: 'Delete selected tasks:',
    delete_preview: 'Are you sure you want to delete this preview?',
    delete_preview_error: 'An error occured while deleting preview.',
    edit_comment: 'Edit comment',
    done: 'Done',
    download_pdf_file: 'Download .{extension} file',
    feedback: 'feedback',
    full_screen: 'Display in full screen',
    hide_assignations: 'Hide assignations',
    hide_infos: 'Hide additional information',
    my_tasks: 'My tasks',
    next: 'next task',
    no_assignation_right: 'You are not allowed to manage assignations',
    no_comment: 'There is currently no comment for this task.',
    no_preview: 'There is currently no preview for this task.',
    no_task_selected: 'No task selected',
    number: 'task | tasks',
    preview: 'Previews',
    previous: 'previous task',
    unsubscribe_notifications: 'Unsubscribe from notifications',
    set_estimations: 'Set estimations for selected tasks:',
    set_preview: 'Set this preview as thumbnail',
    set_preview_error: 'An error occured while setting preview as thumbnail',
    set_preview_done: 'This preview is used as thumbnail for the current entity.',
    select_preview_file: 'Please select a picture from your hard drive to be used as a preview for the current task:',
    show_assignations: 'Show assignations',
    show_infos: 'Show additional information',
    subscribe_notifications: 'Subscribe to notifications',
    select_image_file: 'Please select the picture from your hard drive you want to attach to your comment:',
    tasks: 'Tasks',
    validation: 'Validation',
    with_comment: 'With a comment...',
    fields: {
      asset_type: 'Asset type',
      assignees: 'Assignees',
      count: 'Count',
      due_date: 'Due date',
      duration: 'Duration',
      end_date: 'Validation date',
      entity: 'Entity',
      entity_name: 'Name',
      estimated_quota: 'Avg. Quota',
      estimation: 'Estimation',
      frames: 'Fram.',
      last_comment: 'Last comment',
      last_comment_date: 'Last comment',
      priority: 'Priority',
      production: 'Prod',
      real_end_date: 'Validation date',
      real_start_date: 'WIP date',
      retake_count: 'Retakes',
      seconds: 'Seconds',
      sequence: 'Sequence',
      start_date: 'Start date',
      task_status: 'Status',
      task_status_short_name: 'Status',
      task_type: 'Type'
    },
    colors: {
      title: 'Coloring',
      neutral: 'Neutral',
      status: 'Status color',
      late: 'Late in red'
    },
    priority: {
      emergency: 'Emergency',
      normal: 'Normal',
      high: 'High',
      very_high: 'Very High'
    }
  },

  timesheets: {
    detail_level: 'Detail level',
    done_tasks: 'Done tasks',
    export_timesheet: 'Export Timesheet',
    hours: 'hours',
    month: 'Month',
    time_spents: 'Time Spent (hours)',
    title: 'Timesheets',
    year: 'Year'
  },

  wrong_browser: {
    title: 'Your browser is not supported by Kitsu',
    text: 'Kitsu can only be used with Firefox and Chrome browsers.'
  }
}
