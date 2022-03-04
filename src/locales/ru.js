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
    delete_text: 'Уверены, что хотите удалить {name} из базы данных? Каждый связаный шот и превью будет удален. Пожалуйста, введите название эпизода для подтверждения.',
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
    no_notifications: 'Сейчас нет комментариев по вашим текущим проектам',
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
      add_explaination: 'Добавить данные специально для этого проекта.',
      add_failed: 'Ошибка при добавлении метаданных в ваш проект.',
      add_new_values: 'В настоящий момент нет доступных значений.',
      available_values: 'Доступные значения',
      choices: 'Доступные значения',
      delete_text: 'Уверены, что хотите удалить этот столбец и связанные данные для всех ассетов этого проекта?',
      delete_error: 'Ошибка при удалении этого столбца метаданных.',
      error: 'Ошибка при добавлении столбца метаданных. Убедитесь, нет ли уже столбца с таким названием и что все строки заполнены. Если проблема осталась, обратитесь в поддержку.',
      free: 'Свободные значения',
      title: 'Добавить столбец метаданных'
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
    notifications_mattermost_enabled: 'Отправлять уведомления в Mattermost?',
    notifications_mattermost_user: 'Имя пользователя в Mattermost',
    notifications_discord_enabled: 'Отправлять уведомления в Discord?',
    notifications_discord_user: 'Имя пользователя в Discord',
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
    webhook_error: 'Une erreur est survenue en postant le webhook',
    fields: {
      name: 'Название студии',
      hours_by_day: 'Часов в день',
      slack_token: 'Токен Slack (Опционально)',
      mattermost_webhook: 'Webhook Mattermost (Опционально)',
      discord_token: 'Токен Discord (Опционально)',
      use_original_name: 'Использовать оригинальное название файла при скачивании'
    },
    production: {
      empty_list: 'Список пуст. Это значит, что все данные основных настроек доступны пользователям. Внесите изменения, чтобы ограничить доступ к этому проекту.'
    },
    save: {
      button: 'Сохранить настройки',
      error: 'При сохранении настроек на сервере произошла ошибка'
    }
  },

  task_status: {
    create_error: 'Ошибка при сохранении этого статуса задачи. Вы уверены, что нет статуса с таким же названием?',
    delete_text: 'Уверены, что хотите удалить {name} из базы данных?',
    delete_error: 'Ошибка при удалении статуса задачи. Вероятнее всего к нему привязаны какие-то данные. Вы уверены, что этот статус не связан с какой-либо задачей?',
    edit_title: 'Редактировать статус задачи',
    number: 'статус задачи | статус задачи',
    new_task_status: 'Добавить статус задачи',
    title: 'Статус Задачи',
    fields: {
      color: 'Цвет',
      is_artist_allowed: 'Видна художнику',
      is_client_allowed: 'Видна клиенту',
      is_done: 'Готово',
      is_reviewable: 'Можно проверить',
      is_retake: 'Отправлялся на доработку',
      name: 'Название',
      short_name: 'Краткое название'
    }
  },

  task_types: {
    delete_text: 'Уверены, что хотите удалить {name} из базы данных?',
    delete_error: 'Ошибка при удалении этого типа задач. Вероятнее всего к нему привязаны какие-то данные. Вы уверены, что этот статус не связан с какой-либо задачей?',
    edit_title: 'Редактировать тип задачи',
    create_error: 'Ошибка при создании типа задач. Убедитесь, нет ли уже типа задач с таким же названием.',
    new_task_type: 'Добавить тип задачи',
    number: 'тпип задачи | типы задач',
    title: 'типы Задач',
    fields: {
      dedicated_to: 'Для',
      color: 'Цвет',
      name: 'Название',
      allow_timelog: 'Лог времени',
      priority: 'Приоритет'
    }
  },

  sequences: {
    all_sequences: 'Все секвенции',
    edit_error: 'Ошибка при сохранении этой секвенции. Вы уверены, что нет секвенции с таким же названием?',
    delete_text: 'Уверены, что хотите удалить {name} из базы данных? Все связанные шоты и превью будут удалены. Для подтверждения введите название секвенции.',
    delete_error: 'Ошибка при удалении секвенции. Вероятнее всего к нему привязаны какие-то данные. Вы уверены, что эта секвенция не связана с каким-либо шотом?',
    edit_title: 'Редактировать секвенцию',
    empty_list: 'В проекте нет ни одной секвенции. Создать?',
    empty_list_client: 'В этом проекте нет ни одной секвенции.',
    new_sequence: 'Новая секвенция',
    number: 'секвенция | секвенции',
    title: 'Статистика Севенции',
    fields: {
      name: 'назв.',
      description: 'описание'
    }
  },

  schedule: {
    title: 'График',
    title_main: 'Основной график',
    overall_man_days: 'Человеко-дни',
    md: 'ч/д',
    zoom_level: 'Зум',
    milestone: {
      add_milestone: 'Добавить этапы для',
      edit_milestone: 'Редактировать этапы для',
      name: 'Назв',
      error: 'Ошибка при добавлении или редактировании этапа. Повторите попытку.'
    }
  },

  quota: {
    average: 'Средний',
    count_label: 'Счет',
    detail_label: 'Уровень детализации',
    details_name: 'Название',
    details_seconds: 'Секунд',
    details_frames: 'Кадры',
    month_label: 'Месяц',
    no_quota: 'Нет оценки трудозатрат для этого типа задачи',
    name: 'Название',
    quota_day: 'Трудозатраты в день',
    quota_week: 'Трудозатраты в неделю',
    quota_month: 'Трудозатраты в месяц',
    year_label: 'Год',
    title: 'Трудозатраны',
    type_label: 'Тип'
  },

  shots: {
    casting: 'Использование шота',
    creation_explaination: 'Чтобы добавить шоты вам необходиме сначала создать эпизод и секвенции. Впишите имя эпизода внизу левого столбца и нажмите "добавить", чтобы создать новый эпизод. Выберите этот эпизод и повторите то же самое для секвенции. В конце выдерите секвенцию и в поле внизу правого столбца впишите имя шота. Нажмите "добавить" внизу. Вы создали ваш первый шот. Вы можете создать ещё! Если это не ТВ шоу, вам необходимо создать дополнительную секвенцию.', // 'To add shots you need first to create an episode and a sequence. Type an episode name in the bottom of the left column then click on add to create a new episode. Select this episode and repeat the same operation for sequence. Finally select a sequence and type a shot name in the field in the bottom of the right column. Click on the add button below. Your first shot was created. You can now add many more! If it's not a TV Show, you have to directly create a sequence.'
    delete_text: 'Уверены, что хотите удалить {name} из базы данных?',
    delete_error: 'Ошибка при удалении шота. Вероятнее всего к нему привязаны какие-то данные. Вы уверены, что этот шот не связан с какой-либо задачей?',
    edit_success: 'Шот {name} отредактирован.',
    edit_fail: 'Ошибка: не удалось создать или отредактировать. Убедитесь, что вы не называете шот именем, которое уже в списке данной секвенции.',
    edit_title: 'Редактировать шот',
    empty_list: 'В проекте нет ни одного шота. Создать?',
    empty_list_client: 'В этом проекте нет ни одного шота.',
    episodes: 'Эпизоды',
    history: 'История шота',
    new_shot: 'Добавить шот',
    new_shots: 'Добавить шоты',
    new_sequences: 'Добавить секвенции',
    new_episodes: 'Добавить эпизоды',
    no_casting: 'Шот нигде не используется',
    number: 'шот | шоты',
    manage: 'Создать шоты',
    new_success: 'Шот {name} успешно создан.',
    padding: 'Shot Padding', // 'Shot Padding'
    restore_text: 'Вы уверены, что хотите восстановить {name} в базе данных?',
    restore_error: 'Ошибка при восстановлении шота',
    sequences: 'Секвенции',
    tasks: 'Задачи по Шотам',
    title: 'Шоты',
    fields: {
      description: 'Описание',
      nb_frames: 'Кадры',
      episode: 'Эпизод',
      frame_in: 'In',
      frame_out: 'Out',
      fps: 'FPS',
      name: 'Название',
      production: 'Проект',
      sequence: 'Секвенция',
      time_spent: 'Время'
    }
  },

  server_down: {
    text: 'Обратитесь к вашему вендору, системному администратору или отделу ИТ, чтобы определить причину проблем.',
    title: 'Ошибка при получении данных из Kitsu.'
  },

  statistics: {
    count: 'Счет',
    count_mode: 'Тип счета',
    display_mode: 'Тип отображения',
    frames: 'Кадры',
    pie: 'Круговые диаграммы',
    shots: 'Шоты'
  },

  tasks: {
    add_preview: 'Добавить превью',
    add_preview_error: 'Ошибка при добавлении превью.',
    assign: 'Назначить задачу: | Назначить {nbSelectedTasks} задач:',
    back_to_list: 'Назад к списку',
    bigger: 'Расширить панель задач',
    change_status_to: 'Изменить статус задачи на:',
    change_preview: 'Изменить превью',
    change_priority: 'Изменить приоритет на:',
    clear_assignations: 'Очистить назначения',
    comment_image: 'Прикрепить изображение к комментарию',
    create_for_selection: 'Создать задачу для пустых ячеек:',
    create_tasks: 'Добавить задачи',
    create_tasks_shot: 'Добавть задачи для текущих шотов',
    create_tasks_shot_explaination: 'Вы хотите создать новые задачи данного типа для каждого шота текущего проекта. Продолжить?',
    create_tasks_shot_failed: 'Ошибка сервера при создании задач для шотов.',
    create_tasks_asset: 'Добавить задачи для текущих ассетов',
    create_tasks_asset_explaination: 'Вы создадите новые задачи данного типа для каждого ассета текущего проекта. Продолжить?',
    create_tasks_asset_failed: 'Ошибка сервера при создании задач для ассетов.',
    current: 'Текущая задача',
    current_status: 'Текущий статус:',
    delete_all_text: 'Уверены, что хотите удалить все задачи типа {name}? Для подтверждения введите названия типа задач, которые хотите удалить.',
    delete_all_error: 'Не удалось удалить все задачи данного типа.',
    delete_error: 'Ошибка при удалении задачи',
    delete_comment: 'Уверены, что хотите удалить последний комментарий?',
    delete_comment_error: 'Ошибка при удалении комментария.',
    delete_for_selection: 'Удалить выбранные задачи:',
    delete_preview: 'Уверены, что хотите удалить это превью? ',
    delete_preview_error: 'Ошибка при удалении превью.',
    edit_comment: 'Редактировать комментарий',
    done: 'Готово',
    download_pdf_file: 'Скачать .{extension} файл',
    feedback: 'обратная связь',
    full_screen: 'Открыть на весь экран',
    hide_assignations: 'Скрыть назначения',
    hide_infos: 'Скрыть дополнительную информацию',
    my_tasks: 'Мои задачи',
    next: 'Следующая задача',
    no_assignation_right: 'Вы не можете управлять назначениями',
    no_comment: 'В настоящий момент у этой задачи нет комментариев.',
    no_preview: 'В настоящий момент у этой задачи нет превью.',
    no_task_selected: 'Задачи не выбраны',
    number: 'задача | задачи',
    preview: 'Превью',
    previous: 'Предыдущая задача',
    unsubscribe_notifications: 'Отписаться от уведомлений',
    set_estimations: 'Оценить выбранные задачи:',
    set_preview: 'Установить это превью как ярлык',
    set_preview_error: 'Ошибка при установлении превью как ярлыка',
    set_preview_done: 'Это превью используется как ярлык для текущего объекта',
    select_preview_file: 'Выберите изображение с диска для использования в качестве превью текущей задачи',
    show_assignations: 'Показать назначения',
    show_infos: 'Показать дополнитеьную информацию',
    subscribe_notifications: 'Подписаться на уведомления',
    select_image_file: 'Выберите изображение с диска, которе вы хотите прикрепить к комментарию.',
    tasks: 'Задачи',
    validation: 'Валидация',
    with_comment: 'С комменарием...',
    fields: {
      asset_type: 'Тип ассета',
      assignees: 'Назначенные',
      count: 'Кол-во',
      due_date: 'Крайний срок',
      duration: 'Длительность',
      end_date: 'Дата валидации',
      entity: 'Объект',
      entity_name: 'Название',
      estimated_quota: 'Оценка трудозатрат',
      estimation: 'Оценка',
      frames: 'Кадр',
      last_comment: 'Последний комментарий',
      last_comment_date: 'Последний комментарий',
      priority: 'Приоритет',
      production: 'Проект',
      real_end_date: 'Дата валидации',
      real_start_date: 'WIP дата',
      retake_count: 'Повторы',
      seconds: 'Секунды',
      sequence: 'Секвенция',
      start_date: 'Дата начала',
      task_status: 'Статус',
      task_status_short_name: 'Статус',
      task_type: 'Тип'
    },
    colors: {
      title: 'Цвет',
      neutral: 'Нейтральный',
      status: 'Цвет стауса',
      late: 'КРАСНЫЙ!'
    },
    priority: {
      emergency: 'СРОЧНО!',
      normal: 'Нормальный',
      high: 'Высокий',
      very_high: 'Очень высокий'
    }
  },

  timesheets: {
    detail_level: 'Уровень детализации',
    done_tasks: 'Выполненные задачи',
    export_timesheet: 'Экспортировать План',
    hours: 'часы',
    month: 'Месяц',
    time_spents: 'Затраченное время (часы)',
    title: 'План',
    year: 'Год'
  },

  wrong_browser: {
    title: 'Kitsu не поддерживает ваш браузер',
    text: 'Kitsu поддерживает только Firefox и Chrome'
  }
}
