export default {

  assets: {
    cast_in: 'Используется в',
    delete_error: 'Ошибка при удалении ассета. Скорее всего к нему привязаны какие-то данные. Вы уверены что этот ассет не связан с существующей задачей?',
    delete_text: 'Уверены, что хотите удалить {name} из базы данных?',
    edit_fail: 'Не удалось сохранить. Возможно, что ассет с таким же именем уже существует.',
    edit_success: 'Ассет {name} успешно изменён.',
    edit_title: 'Редактировать ассет',
    empty_list: 'В проекте нет ни одного ассета. Создать?',
    empty_list_client: 'В этом проекте нет ни одного ассета.',
    new_asset: 'Создать ассет',
    new_assets: 'Добавить ассеты',
    new_success: 'Ассет {name} успешно создан.',
    no_cast_in: 'Этот ассет не используется ни в одном шоте.',
    number: 'ассет | ассеты',
    restore_text: 'Вы уверены, что хотите восстановить {name} в базу данных?',
    restore_error: 'Ошибка при восстановлении ассета.',
    tasks: 'Задачи по ассету',
    title: 'Ассеты',
    fields: {
      description: 'Описание',
      episode: 'Эпизод',
      name: 'Название',
      production: 'Проект',
      time_spent: 'Время',
      type: 'Тип',
      hidden_from_client: 'Отображается клиенту'
    }
  },

  asset_types: {
    all_asset_types: 'Все типы ассетов',
    create_error: 'Ошибка при сохранении этого типа ассетов. Вы уверены, что нет типа ассетов с таким же названием?',
    delete_text: 'Вы уверены, что хотите удалить {name} из базы данных?',
    delete_error: 'Ошибка при удалении этого типа ассетов. Скорее всего к нему привязаны какие-то данные. Вы уверены, что к этому типу не привязан какой-либо ассет?',
    edit_title: 'Редактировать тип ассетов',
    new_asset_type: 'Добавить тип ассетов',
    number: 'тип ассетов | типов ассетов',
    title: 'Типы Ассетов',
    production_title: 'Статистика по Типам Ассетов',
    fields: {
      name: 'Название'
    }
  },

  breakdown: {
    all_assets: 'Доступные ассеты',
    edit_label: 'Изменить лейбл ассета',
    empty: 'Не используется',
    label: 'Лейбл',
    picture_mode: 'Перепключиться в режим картинок',
    text_mode: 'Перепключиться в текстовый режим',
    title: 'Брейкдаун',
    options: {
      fixed: 'зафиксирован',
      animate: 'анимировать'
    }
  },

  comments: {
    add_attachment: 'Прикрепить вложение',
    add_checklist: 'Добавить чеклист',
    add_comment: 'Оставить комментарий...',
    add_preview: 'Добавить превью',
    change_preview: 'Изменить превью',
    comment_from_client: 'Комментарий клиента',
    edit_title: 'Редактировать комментарий',
    empty_text: 'Пустой комментарий',
    edit_error: 'Ошибка при редактировании комментария. Пожалуйста, обратитесь в поддержку.',
    error: 'Ошибка при создании комментария',
    no_file_attached: 'Файл не прикреплён',
    pin: 'Закрепить',
    pinned: 'Закреплён',
    post_status: 'Опубликовать комментарий',
    retake: 'Переделать',
    revision: 'Версия',
    set_status_to: 'Установить статус',
    task_placeholder: 'Новый объект...',
    text: 'Текст',
    unpin: 'Открепить',
    validated: 'Проверено!',
    validation_required: 'Необходима Проверка',
    fields: {
      text: 'текст'
    }
  },

  custom_actions: {
    create_error: 'Ошибка при сохранении специального действия. Вы уверены, что нет действия с таким же названием?',
    delete_text: 'Уверены, что хотите удалить специальное действие {name} из базы данных?',
    delete_error: 'Ошибка при удалении этого специального действия',
    edit_title: 'Редактировать специальное действие',
    new_custom_action: 'Добавить специальное действие',
    number: 'специальное действие | специальные действия',
    run_for_selection: 'Выполнять специальное действие для следующих задач:',
    title: 'Специальные Действия',
    fields: {
      name: 'Название',
      url: 'URL',
      entity_type: 'Тип Объекта',
      is_ajax: 'Использовать AJAX'
    },
    entity_types: {
      all: 'Все',
      shot: 'Шот',
      asset: 'Ассет'
    }
  },

  entities: {
    build_filter: {
      asset_type: 'Тип ассетов',
      all_types: 'Все типы ассетов',
      assignation: 'Назначение',
      assignation_exists_for: 'Назначения для',
      assigned_to: 'Назначен',
      descriptor: 'Метаданные',
      equal: 'Равно',
      in: 'В', // In
      no_assignation_for: 'Нет назначений для',
      no_filter: 'Нет фильтра',
      not_equal: 'Не равно',
      not_assigned_to: 'Не назначен',
      status: 'Статус задачи',
      thumbnail: 'Есть ярлык',
      title: 'Фильтр...',
      union_and: 'Применить все указанные фильтры',
      union_or: 'Применить один из указанных фильтров',
      with_thumbnail: 'С ярлыком',
      without_thumbnail: 'Без ярлыка'
    },

    thumbnails: {
      error: 'Ошибка при загрузке ярлыков',
      explaination: 'Для добавления ярлыка нужно новое превью. Чтобы сделать сразу несколько ярлыков, необходимо сначала выбрать тип задачи для создания новых превью. Ярлыки будут сделаны на основании этого нового превью.',
      explaination_two: 'Далее выберите файлы для загрузки. Чтобы найти правильные объекты, имена файлов должны соответсвовать маске:',
      shots_pattern: '"SequenceName_ShotName" пр. SQ01_SH01.',
      assets_pattern: '"AssetType_AssetName" пр. Окружение_Лес.',
      select_files: 'Выбрать Файлы',
      selected_files: 'Выбранные Файлы',
      select_task_type: 'Выбрать Тип Задачи',
      title: 'Добавить Ярлыки',
      undefined: 'Неопределён',
      undefined_pattern: 'Неопределён',
      upload: 'Добавить Ярлыки'
    }
  },

  estimation: {
    title: 'Оценка'
  },

  episodes: {
    all_episodes: 'Все эпизоды',
    edit_error: 'Ошибка при сохранении этого эпизода. Вы уверены, что нет эпизода с таким же названием?',
    delete_error: 'Ошибка при удалении этого эпизода. Вероятнее всего к нему привязаны какие-то данные. Вы уверены, что этот тип ассетов не связан с какой-либо секвенция?',
    delete_text: 'Уверены, что хотите удалить {name} из своей базы данных? Каждый связаный шот и превью будет удален. Пожалуйста, введите название эпизода для подтверждения.',
    edit_title: 'Редактировать эпизод',
    empty_list: 'В проекте нет ни одного эпизода. Создать?',
    empty_list_client: 'В этом проекте нет ни одного эпизода.',
    new_episode: 'Новый эпизод',
    number: 'эпизод | эпизоды',
    title: 'Статистика эпизодов',
    fields: {
      name: 'Название',
      description: 'Описание'
    }
  },

  keyboard: {
    altdown: 'Подвинуть выбранные задачи вниз',
    altj: 'Выбрать предыдущее превью ',
    altk: 'Выбрать следующее превью',
    altleft: 'Подвинуть выбранные задачи влево',
    altright: 'Подвинуть выбранные задачи вправо',
    altup: 'Подвинуть выбранные задачи вверх',
    annotations: 'Аннотации',
    draw: 'Включить режим рисования',
    navigation: 'Навигация',
    redo: 'Повторить',
    undo: 'Отменить',
    playlist_navigation: 'Навигация по плейлисту',
    remove_annotation: 'Убрать аннотацию',
    shortcuts: 'Хоткеи'
  },

  login: {
    back_to_login: 'Вернуться к странице логина',
    forgot_password: 'Забыли пароль?',
    login: 'Войти',
    login_failed: 'Ошибка входа. Пожалуйста, проверьте ваши имя пользователя и пароль',
    login_page: 'Отмена',
    redirecting: 'Перенаправление через {secondsLeft} секунд...',
    reset_change_password: 'Сменить пароль',
    reset_change_password_form_failed: 'С паролем, который вы дали, возникла проблема. Убедитесь в том, что он состоит как минимум из 7 знаков и что оба пароля совпадают',
    reset_change_password_failed: 'Не удалось изменить пароль. Пожалуйста, пройдите процедуру ещё раз.',
    reset_change_password_succeed: 'Ваш пароль успешно изменён. Пожалуйста вернитесь на страницу логина, чтобы использовать его.',
    reset_change_password_title: 'Введите новый пароль',
    reset_password: 'Сбросить Пароль',
    reset_password_failed: 'Ошибка при сбросе пароля. Проверьте правильность указанной почты.',
    reset_password_succeed: 'Пароль успешно сброшен. Пожалуйста, проверьте вашу почту.',
    reset_password_title: 'Введите вашу почту, чтобы сбросить пароль',
    title: 'Войти в Kitsu',
    fields: {
      email: 'Почта',
      password: 'Пароль',
      password2: 'Пароль повторно'
    }
  },

  main: {
    about: 'О системе',
    add: 'Добавить',
    all: 'Все',
    all_assets: 'Все ассеты',
    admin: 'Администратор',
    cancel: 'Отмена',
    clear_selection: 'Очистить выбранное',
    close: 'Закрыть',
    confirmation: 'Подтвердить',
    confirmation_and_stay: 'Подтвердить и прододжить',
    date: 'Дата',
    dark_theme: 'Тёмная Тема',
    days_spent: 'день затрачен | дней затрачено',
    days_estimated: 'день ожидается | дней ожидается',
    delete: 'Удалить',
    delete_all: 'Удалить все',
    delete_text: 'Уверены, что хотите удалить {name} из базы данных?',
    documentation: 'Документация',
    edit: 'Редактировать',
    empty_comment: 'Пустой комментарий',
    end_date: 'Дата окончания',
    files_selected: 'выбранные файлы', // files selected
    for: 'Для',
    go_productions: 'Перейти к проектам',
    history: 'История',
    info: 'Информация',
    or: 'или',
    no: 'Нет',
    loading: 'Загрузка...',
    loading_data: 'Загрузка данных',
    loading_error: 'Ошибка при загрузке данных',
    logout: 'Выйти',
    modify: 'Изменить',
    minimize: 'Свернуть',
    main_pack: 'Main Pack', // Main Pack
    maximize: 'Развернуть',
    nb_frames: 'Кадр | Кадры',
    person: 'Человек',
    profile: 'Профиль',
    production: 'Проект',
    remove: 'Удалить',
    save: 'Схранить',
    sort_by: 'Сортировать по',
    sorted_by: 'Отсортировано по',
    start_date: 'Дата начала',
    studio: 'Студия',
    tutorials: 'Туториалы',
    user: 'Пользователь',
    white_theme: 'Светлая Тема',
    yes: 'Да',
    csv: {
      choose: 'Выбрать',
      error_upload: 'Ошибка при загрузке CSV.',
      export_file: 'Экспортировать',
      import_file: 'Импортировать',
      import_title: 'импортировать данные с CSV',
      legend: 'Легенда',
      legend_ok: 'Опознанные данные',
      legend_ignored: 'Пропущенные данные',
      legend_missing: 'Недостающие данные',
      legend_disabled: 'Данные не получится создать или обновить',
      legend_overwrite: 'Данные будут обновлены',
      paste: 'Вставить',
      paste_code: 'Вставьте сюда данные из CSV:',
      preview: 'Превью',
      preview_episode_name: 'Название эпизода',
      preview_title: 'Посмотреть импортированные данные',
      preview_description: 'Загрузить .csv файл чтобы наполнить доску записями.',
      preview_required: 'NB: Заголовки должны быть на первой строчке.',
      preview_reupload: 'Загрузить .CSV файл заново',
      required_fields: 'Вашему CSV нужны следующие столбцы',
      select_file: 'Выберите файл:',
      tab_select_file: 'Загрузить файл CSV',
      tab_paste_code: 'Вставить данные CSV',
      unknown: 'Неизвестный столбец',
      upload_file: 'Найти',
      options: {
        title: 'Опции',
        update: 'Обновить существующие данные'
      }
    }
  },

  menu: {
    assign_tasks: 'Назначить задачи',
    change_priority: 'Изменить приоритет',
    change_status: 'Изменить статус',
    create_tasks: 'Создать задачи',
    delete_tasks: 'Удалить задачи',
    generate_playlists: 'Создать плейлист',
    run_custom_action: 'Выполнить специальное действие',
    set_estimations: 'Оценить задачу'
  },

  news: {
    all: 'Все',
    commented_on: 'прокомментировал(а)',
    infos: 'Информация',
    no_news: 'Для этого проекта или для этого фильтра нет новостей.',
    only_comments: 'Только комментарии',
    only_previews: 'Только превью',
    set_preview_on: 'Включить превью',
    task_status: 'Статус задачи',
    task_type: 'Тип задачи',
    title: 'Лента новостей'
  },

  not_found: {
    text: 'Что-то не так с этой ссылкой. Рекомендуем вернуться на главную страницу.',
    title: 'Страница не найдена...  вы ищете что-то, что уже удалили?'
  },

  notifications: {
    and_change_status: 'и изменил(а) статус на',
    assigned_you: 'назначил(а) вас на',
    commented_on: 'прокомментировал(а)',
    mention_you_on: 'упомянул(а) вас в',
    no_notifications: 'Сейчас нет комментариев по вашим текущим проэктам',
    unread_notifications: 'непрочитанное уведомление | непрочитанные уведомления',
    title: 'Уведомления',
    with_preview: 'с превью'
  },

  people: {
    active: 'Активный',
    active_persons: 'активный пользователь | активные пользователи',
    add_member_to_team: 'Добавить человека в команду',
    create_invite: 'Создать и отправить приглашение',
    create_error: 'Произошла ошибка при создании этого пользователя. Свяжитесь с поддержкой.',
    delete_error: 'Произошла ошибка при удалении этого пользователя. Скорее всего с ним связаны какие-то данные. Вы уверены что этого пользователь не участвует в задачах или не оставлял комментариев?',
    delete_text: 'Вы уверены что хотите удалить {personName} из базы данных? Каждый связанный комментарий и превью будет удален. Пожалуйста, для подтверждения введите полное имя пользователя.',
    edit_title: 'Редактировать пользователя',
    empty_team: 'В команде проекта никто не указан.',
    invite: 'Отправить приглашение',
    invite_error: 'Произошла ошибка при отправке приглашения',
    invite_success: 'Приглашение успешно отправлено',
    new_person: 'Добавить нового сотрудника',
    no_task_assigned: 'Для вас не назначено текущих задач',
    persons: 'пользователь | пользователи',
    running_tasks: 'Текущие задачи',
    select_person: 'Выберите пользователя...',
    team: 'Команда',
    title: 'Команда',
    unactive: 'Неактивный',
    csv: {
      import_file: 'Импортироать .csv файл',
      export_file: 'Сохранить как .csv файл',
      import_title: 'Импортировать данные из CSV',
      required_fields: 'Вашему файлу CSV нужны седующие столбцы',
      select_file: 'Выберите файл:',
      error_upload: 'При загрузке CSV произошла ошибка.'
    },
    fields: {
      first_name: 'Имя',
      last_name: 'Фамилия',
      email: 'Почта',
      phone: 'Телефон',
      role: 'Роль',
      old_password: 'Текущий пароль',
      password: 'Новый пароль',
      password_2: 'Новый пароль (повторно)',
      active: 'Активный'
    },
    list: {
      name: 'Имя',
      email: 'Почта',
      phone: 'Телефон',
      role: 'Роль',
      active: 'Активный'
    },
    role: {
      admin: 'Администратор',
      client: 'Клиент',
      manager: 'Супервайзер',
      user: 'Художник',
      undefined: 'Не определён',
      vendor: 'Вендор'
    }
  },

  playlists: {
    add_assets: 'Добавить ассеты',
    add_selection: 'Добавить selection',
    add_shots: 'Добавить шоты',
    add_sequence: 'Добавить секвенцию',
    add_episode: 'Добавить эпизод',
    add_movie: 'Добавить фильм',
    apply_task_type_change: 'Выбрать последнюю версию для типа задачи на всех шотах.',
    available_build: 'Доступные сборки',
    build_daily: 'Дейли собирается',
    build_weekly: 'Все собираются',
    build_mp4: 'Собрать .mp4 (beta)',
    building: 'Собираю...',
    client_playlist: 'Клиентский Плейлист',
    create_for_selection: 'Создать плейлист для выбранных шотов',
    create_title: 'Создать плейлист',
    created_at: 'Создан в:',
    delete_text: 'Уверены, что хотите удалить {name} из базы данных?',
    delete_error: 'Ошибка при удалении плейлиста.',
    edit_error: 'Ошибка при сохранении плейлиста.',
    download_zip: 'Скачать .zip',
    failed: 'Облом',
    for_client: 'Клиент',
    for_studio: 'Студия',
    edit_title: 'Редактировать плейлист',
    last_creation: 'Последнее создание',
    last_modification: 'Последняя модификация',
    loading_error: 'На сервере произошла ошибка. Не получилось загрузить плейлисты.',
    new_playlist: 'Добавить плейлист',
    no_build: 'Нет сборки',
    no_playlist: 'Для этого проекта или эпизода сейчас нет плейлиста',
    no_preview: 'Нет превью',
    no_selection: 'Выберите плейлист слева.',
    no_sequence_for_episode: 'Для этого эпизода нет секвенций',
    no_shot_for_production: 'Для этого проекта нет шотов',
    select_shot: 'Веыберите шот из правого столбца',
    select_playlist: 'Выберите плейлист из левого столбца',
    select_task_type: 'Изменить тип задачи для всех шотов',
    title: 'Плейлисты',
    updated_at: 'Обновлен:',
    remove: 'удалить',
    fields: {
      name: 'Название',
      created_at: 'Дата создания',
      updated_at: 'Дата обновления',
      for_entity: 'Выбрать объект для отображения',
      for_client: 'Поделиться с'
    },
    actions: {
      annotation: 'Аннотация',
      annotation_text: 'Чтобы добавить текст сделайте двойной клик по превью',
      annotation_delete: 'Удалить аннотацию',
      annotation_redo: 'Повторить аннотацию',
      annotation_undo: 'Отменить аннотацию',
      annotation_big: 'Большой',
      annotation_medium: 'Средний',
      annotation_small: 'Маленький',
      change_task_type: 'Изменить тип задачи',
      comments: 'Показать/Скрыть комментарии',
      delete: 'Удалить плейлист',
      download: 'Скачать...',
      edit: 'Редактировать плейлист',
      entity_list: 'Показать/Скрыть список объектов',
      fullscreen: 'Полный экран',
      next_frame: 'Следующий кадр',
      next_shot: 'Следующий шот',
      pause: 'Пауза',
      play: 'Пуск',
      previous_frame: 'Предыдущий кадр',
      previous_shot: 'Предыдущий шот',
      save_playlist: 'Сохранить плейлист',
      speed: 'Изменить скорость',
      split_screen: 'Двойной экран'
    }
  },

  productions: {
    current: 'Выбраный проект',
    delete_text: 'Вы уверены что хотите удалить {name} из базы данных? Пожалуйста, для подтверждения введите название проекта в текстовом поле.',
    delete_error: 'Возникла ошибка при удалении проекта. Скорее всего к нему привязаны какие-то данные. Вы уведомления что к этому проекту не привязаны задачи, шоты или ассеты? Kitsu не позволяет удалять не пустые проекты. Если вы больше не хотите видеть это проект, можете закрыть его вместо удаления.',
    edit_error: 'Возникла ошибка при редактировании проекта. Обратитесь в поддержку.',
    edit_title: 'Редактировать проект',
    new_production: 'Добавить проект',
    number: 'проект | проекты',
    open_productions: 'Мои проекты',
    picture: 'Изменить картинку',
    title: 'Проекты',
    home: {
      create_new: 'Создать новый проект',
      empty: 'У вас нет проектов в работе. Создать?',
      no_task: 'Вам не назначено задач. Попросите задачу у супервайзера',
      no_prod_for_client: 'У вас нет доступа к проектам. Обратитесь к заказчику для получения доступа.',
      title: 'Проекты в работе',
      welcome: 'Добро пожаловать в Kitsu'
    },
    fields: {
      fps: 'FPS',
      name: 'Название',
      ratio: 'Соотношение сторон',
      resolution: 'Разрешение',
      status: 'Статус',
      type: 'Тип'
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
      closed: 'Закрыт',
      open: 'Открыт',
      active: 'Открыт',
      archived: 'Закрыт'
    },

    type: {
      short: 'Видео',
      featurefilm: 'Фильм',
      tvshow: 'ТВ шоу'
    }
  },

  profile: {
    change_avatar: 'Изменить аватар',
    info_title: 'Информация',
    language: 'Язык',
    notifications_enabled: 'Отправлять уведомления на почту?',
    notifications_slack_enabled: 'Отправлять уведомления в Slack?',
    notifications_slack_user: 'Имя пользователя в Slack',
    password_title: 'Изменить пароль',
    timezone: 'Часовой пояс',
    title: 'Профиль',
    avatar: {
      title: 'Изменить аватар',
      error_upload: 'Ошибка при загрузке изображения'
    },
    change_password: {
      button: 'Изменить пароль',
      error: 'Ошибка при смене пароля. Подтвердите ваш текущий пароль.',
      success: 'Ваш пароль успешно изменён!',
      unvalid: 'Введенные пароли не совпадают или пароль слишком короткий (нужно не менее 7-ми символов).'
    },
    save: {
      button: 'Сохранить изменения',
      error: 'Ошибка при сохраниении изменений'
    }
  },

  settings: {
    change_logo: 'Изменить логотип',
    integrations: 'Интеграции',
    logo: 'Логотип студии',
    no_logo: 'Нет логотипа',
    set_logo: 'Добавить логотип студии',
    title: 'Настройки',
    fields: {
      name: 'Название студии',
      hours_by_day: 'Часов в день',
      slack_token: 'Токен Slack (Опционально)',
      use_original_name: 'Использовать оригинальное название файла при скачивании'
    },
    production: {
      empty_list: 'The list is currently empty. It means that all data from the main settings are available to users. Add some entries to limit choices for this production.'
    },
    save: {
      button: 'Сохранить настройки',
      error: 'При сохранении настроек на сервере произошна ошибка'
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
