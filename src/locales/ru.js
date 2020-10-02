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
      error: 'An error occured while uploading thumbnails',
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
    create_error: 'An error occured while saving this task status. Are you sure there is no task status with similar name?',
    delete_text: 'Are you sure you want to remove {name} from your database?',
    delete_error: 'An error occured while deleting this task status. There are probably data linked to it. Are you sure this task status has no task linked to it?',
    edit_title: 'Edit task status',
    number: 'task status | task status',
    new_task_status: 'Add a task status',
    title: 'Статусы задач',
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
