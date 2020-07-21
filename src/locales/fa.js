export default {

  assets: {
    cast_in: 'عوامل',
    delete_error: 'خطایی در زمان حذف کردن این منبع رخ داده. آیا مطمئن هستید که برای این منبع وظیفه ای تریف نشده؟',
    delete_text: 'آیا مطمئن هستید که {name} را میخواهید حذف کنید؟',
    edit_fail: 'در سرور مشکلی به وجود آمده.',
    edit_success: 'منبع {name} باموفقیت اصلاح شد.',
    edit_title: 'اصلاح منبع',
    empty_list: 'منبعی وجود ندارد آیا مایل هستید منبع جدیدی ایجاد کنید؟',
    empty_list_client: 'در این پروژه منبعی وجود ندارد.',
    new_asset: 'اضافه کردن منبع',
    new_assets: 'اضافه کردن منابع',
    new_success: 'منبع {name} با موفقیت ایجاد شد.',
    no_cast_in: 'این منبع در هیچ شاتی به کسی محول نشده.',
    number: 'منبع | منابع',
    restore_text: 'آیا میخواهید {name}  را بازگردانی کنید؟',
    restore_error: 'در زمان بازگردانی این منبع خطایی رخ داده',
    tasks: 'وظایف منبع',
    title: 'منابع',
    fields: {
      description: 'توضیحات',
      episode: 'قسمت',
      name: 'نام',
      production: 'تولید',
      time_spent: 'زمان',
      type: 'نوع',
      hidden_from_client: 'نمایش داده شده به مشتری'
    }
  },

  asset_types: {
    all_asset_types: 'انواع منابع',
    delete_text: 'آیا مطمئن هستید که {name} را میخواهید حذف کنید؟',
    delete_error: 'خطایی در زمان حذف کردن این منبع رخ داده. آیا مطمئن هستید این منبع به منبع دیگری متصل نیست؟',
    edit_title: 'اصلاح نوع منبع',
    new_asset_type: 'اضافه کردن نوع منبع',
    number: 'نوع منبع | انواع منبع',
    title: 'انواع منبع',
    production_title: 'آمار تمام منابع',
    fields: {
      name: 'نام'
    }
  },

  breakdown: {
    all_assets: 'همه منابع موجود',
    edit_label: 'تغییر برچسب منبع',
    empty: 'خالی کردن عوامل',
    label: 'برچسپ',
    text_mode: 'تغییر به حالت متن',
    title: 'مراحل انجام',
    options: {
      fixed: 'ثابت',
      animate: 'متحرک'
    }
  },

  comments: {
    add_comment: 'اضافه کردن نظر...',
    add_checklist: 'اضافه کردن چک لیست',
    add_attachment: 'اضافه کردن پیوست',
    add_preview: 'پیوست پیش نمایش',
    task_placeholder: 'آیتم جدید...',
    change_preview: 'تغییر پیش نمایش',
    comment_from_client: 'نظر مشتری',
    empty_text: 'فاقد نظر',
    edit_title: 'اصلاح نظر',
    error: 'هنگام ارسال نظر مشکلی رخ داده.',
    no_file_attached: 'هیچ فایلی پیوست نشده',
    post_status: 'ارسال نظر',
    retake: 'برداشت مجدد',
    pin: 'سنجاق کردن',
    pinned: 'سنجاق شده',
    revision: 'بازنگری',
    unpin: 'خروج از سنجاق کردن',
    validated: 'تایید شده!',
    validation_required: 'نیازمند تایید شدن',
    text: 'متن',
    set_status_to: 'تغییر وضعیت به',
    fields: {
      text: 'متن'
    }
  },

  custom_actions: {
    delete_text: 'آیا مطمئن هستید که میخوا هید عمل سفارشی {name} را حذف کنید؟',
    delete_error: 'هنگام حذف این کار سفارشی خطایی رخ داده.',
    edit_title: 'اصلاح یک کار سفارشی',
    new_custom_action: 'اضافه کردن یک کار سفارشی',
    number: 'کار سفارشی | کارهای سفارشی',
    run_for_selection: 'اجرای کار سفارشی برای وظیفه انتخاب شده:',
    title: 'کارهای سفارشی',
    fields: {
      name: 'نام',
      url: 'لینک',
      entity_type: 'متعلق',
      is_ajax: 'استفاده از AJAX'
    },
    entity_types: {
      all: 'همه',
      shot: 'شات',
      asset: 'منبع'
    }
  },

  entities: {
    build_filter: {
      asset_type: 'نوع منبع',
      all_types: 'تمام انواع منابع',
      assignation: 'واگذاری',
      assignation_exists_for: 'واگذاری وجود دارد برای',
      assigned_to: 'واگذارشده به',
      descriptor: 'Metadata',
      equal: 'برابر',
      in: 'در',
      no_assignation_for: 'واگذاری وجود ندارد برای',
      no_filter: 'بدون فیلتر',
      not_equal: 'برابر نیست',
      not_assigned_to: 'واگذار نشده به',
      status: 'وضعیت وظیفه',
      thumbnail: 'بندانگشتی دارد',
      title: 'فیلتر روشن ...',
      with_thumbnail: 'با بندانگشتی',
      without_thumbnail: 'بدون بند انگشتی'
    },
    thumbnails: {
      error: 'در هنگام بارگذاری بندانگشتی خطایی رخ داده.',
      explaination: 'اضافه کردن بندانگشتی نیازمند یک پیش نمایش است. در صورتی که مایلید چندین بندانگشتی تعیین کنید باید ابتدا یک نوع وظیفه ای را که برای ایجاد پیش نمایش جدید استفاده خواهد شد انتخاب کنید.',
      explaination_two: 'سپس می بایست فایلی که میخواهید بارگذاری کنید را انتخاب کنید. برای پیدا کرد متعلقات درست ، فایل باید با الگوی تعریف شده مطابقت کند :',
      shots_pattern: '"نام سکانس  نام شات" eg. SQ01_SH01.',
      assets_pattern: '"نوع منبع  نام منبع" eg. Environment_Forest.',
      select_files: 'انتخاب فایل ها',
      selected_files: 'فایل های انتخاب شده',
      select_task_type: 'انتخاب نوع وظیفه',
      title: 'اضافه کردن بندانگشتی ها',
      undefined: 'تعریف نشده',
      undefined_pattern: 'تعریف نشده',
      upload: 'اضافه کردن بندانگشتی ها'
    }
  },

  estimation: {
    title: 'برآورد'
  },

  episodes: {
    all_episodes: 'تمام قسمت ها',
    delete_error: 'به هنگام حذف کردن این قسمت خطایی رخ داد. احتمالا داده ای به ان متصل است. آیا مطمئنید  این قسمت به هیچ سکانسی لینک نشده؟',
    delete_text: 'آیا میخواهید {name} را از پایگاه داده حذف کنید؟ هر شات یا پیش نمایشی وابسته حذف خواهد شد. لطفا با تایپ نام قسمت در زیر این عمل را تایید کنید?',
    edit_title: 'اصلاح قسمت',
    empty_list: 'در این پروژه قسمتی تعرف نشده. آیا میخواهید یک قسمت ایجاد کنید؟',
    empty_list_client: 'در این پروژه هیچ قسمتی وجود ندارد.',
    new_episode: 'قسمت جدید',
    number: 'قسمت | قسمت ها',
    title: 'قسمت ها ',
    fields: {
      name: 'نام',
      description: 'توضیحات'
    }
  },

  keyboard: {
    altdown: 'Move task selection down',
    altj: 'Select previous preview',
    altk: 'Select next preview',
    altleft: 'Move task selection left',
    altright: 'Move task selection right',
    altup: 'Move task selection up',
    annotations: 'Annotations',
    draw: 'Set draw mode on',
    navigation: 'Navigation',
    redo: 'Redo',
    undo: 'Undo',
    playlist_navigation: 'Playlist navigation',
    remove_annotation: 'Remove annotation',
    shortcuts: 'Shortcuts'
  },

  login: {
    back_to_login: 'Go back to login page',
    forgot_password: 'Forgot password?',
    login: 'Log in',
    login_failed: 'Log in failed, please verify your credentials',
    login_page: 'Cancel',
    redirecting: 'Redirecting in {secondsLeft} seconds...',
    reset_change_password: 'Change password',
    reset_change_password_form_failed: 'There is a problem with the password you gave. Please, verify that it is at least 7 chars long and that both passwords match.',
    reset_change_password_failed: 'Changing password failed. Please, restart the whole procedure again.',
    reset_change_password_succeed: 'Your password was changed successfully. Please, go back to the login page to use it.',
    reset_change_password_title: 'Enter a new password',
    reset_password: 'Reset Password',
    reset_password_failed: 'Resetting you password failed. Please verify your email.',
    reset_password_succeed: 'Resetting your password succeeded. Please check your inbox.',
    reset_password_title: 'Enter your email to reset your password',
    title: 'Log in to Kitsu',
    fields: {
      email: 'Email',
      password: 'Password',
      password2: 'Password again'
    }
  },

  main: {
    about: 'About',
    add: 'add',
    all: 'همه',
    all_assets: 'All assets',
    admin: 'Admin',
    cancel: 'Cancel',
    clear_selection: 'Clear current selection',
    close: 'Close',
    confirmation: 'Confirm',
    confirmation_and_stay: 'Confirm and stay',
    date: 'Date',
    dark_theme: 'Dark Theme',
    days_spent: 'day spent | days spent',
    days_estimated: 'day estimated | days estimated',
    delete: 'Delete',
    delete_all: 'Delete all',
    delete_text: 'Are you sure you want to remove {name} from your database?',
    documentation: 'Documentation',
    edit: 'Edit',
    empty_comment: 'Empty comment',
    end_date: 'End date',
    files_selected: 'files selected',
    for: 'For',
    go_productions: 'Go to productions',
    history: 'history',
    info: 'Information',
    or: 'or',
    no: 'No',
    loading: 'Loading...',
    loading_data: 'Loading data',
    loading_error: 'An error occured while loading data.',
    logout: 'Logout',
    modify: 'Modify',
    minimize: 'Minimize',
    main_pack: 'Main Pack',
    maximize: 'Maximize',
    nb_frames: 'frame | frames',
    person: 'Person',
    profile: 'Profile',
    production: 'Production',
    remove: 'Remove',
    save: 'Save',
    sort_by: 'Sort by',
    sorted_by: 'Sorted by',
    start_date: 'Start date',
    studio: 'Studio',
    tutorials: 'Tutorials',
    user: 'User',
    white_theme: 'White Theme',
    yes: 'Yes',
    csv: {
      choose: 'Choose',
      error_upload: 'An error occured while uploading your CSV.',
      export_file: 'Export',
      import_file: 'Import',
      import_title: 'Import data from a CSV',
      legend: 'Legend',
      legend_ok: 'Recognized data',
      legend_ignored: 'Ignored data',
      legend_missing: 'Missing data',
      legend_disabled: 'Data that will no be updated or created',
      legend_overwrite: 'Data that will be updated',
      paste: 'Paste',
      paste_code: 'Please paste here your CSV data:',
      preview: 'Preview',
      preview_episode_name: 'Episode name',
      preview_title: 'Preview of your imported data',
      preview_description: 'Upload a .csv file to populate your board with posts.',
      preview_required: 'NB: Headers must be included as first row.',
      preview_reupload: 'Reupload .CSV file',
      required_fields: 'Your CSV requires the following columns',
      select_file: 'Please select a file from one of your folder:',
      tab_select_file: 'Upload a CSV file',
      tab_paste_code: 'Paste a CSV data',
      unknown: 'Unknown column',
      upload_file: 'Browse',
      options: {
        title: 'Options',
        update: 'Update existing data'
      }
    }
  },

  menu: {
    assign_tasks: 'Assign tasks',
    change_priority: 'Change priority',
    change_status: 'Change status',
    create_tasks: 'Create tasks',
    delete_tasks: 'Delete tasks',
    generate_playlists: 'Generate playlists',
    run_custom_action: 'Run custom action',
    set_estimations: 'Set estimations'
  },

  news: {
    all: 'همه',
    commented_on: 'commented on',
    infos: 'Infos',
    no_news: 'There is no news for this production or for this filter.',
    only_comments: 'Only comments',
    only_previews: 'Only previews',
    set_preview_on: 'set preview on',
    task_status: 'Task status',
    task_type: 'Task type',
    title: 'News Feed'
  },

  not_found: {
    text: 'There was something wrong with the link you clicked on, we encourage you to come back on the home page.',
    title: 'Page not found... are your looking for something you deleted?'
  },

  notifications: {
    and_change_status: 'and changed status to',
    assigned_you: 'assigned you to',
    commented_on: 'commented on',
    mention_you_on: 'mentioned you on',
    no_notifications: 'There is currently no notification for you for your current projects.',
    unread_notifications: 'unread notification | unread notifications',
    title: 'Notifications',
    with_preview: 'with a preview'
  },

  people: {
    active: 'Active',
    active_persons: 'active person | active persons',
    add_member_to_team: 'Add a member to the team: ',
    create_invite: 'Create and send invitation',
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
    team: 'Team',
    title: 'People',
    unactive: 'Unactive',
    csv: {
      import_file: 'Import a .csv file',
      export_file: 'Download as a .csv file',
      import_title: 'Import data from a CSV file',
      required_fields: 'Your CSV file requires the following columns',
      select_file: 'Please select a file from one of your folder:',
      error_upload: 'An error occured while uploading your CSV file.'
    },
    fields: {
      first_name: 'First name',
      last_name: 'Last name',
      email: 'Email',
      phone: 'Phone',
      role: 'Role',
      old_password: 'Current password',
      password: 'New password',
      password_2: 'New password (repeat)',
      active: 'Active'
    },
    list: {
      name: 'نام',
      email: 'Email',
      phone: 'Phone',
      role: 'Role',
      active: 'Active'
    },
    role: {
      admin: 'Studio Manager',
      client: 'Client',
      manager: 'Supervisor',
      user: 'Artist',
      undefined: '',
      vendor: 'Vendor'
    }
  },

  playlists: {
    add_assets: 'Add assets',
    add_selection: 'Add selection',
    add_shots: 'Add shots',
    add_sequence: 'Add whole sequence',
    add_episode: 'Add whole episode',
    add_movie: 'Add whole movie',
    apply_task_type_change: 'This will set the last revison for given task type on all shots.',
    available_build: 'Available builds',
    build_daily: 'Daily pending',
    build_weekly: 'All Pending',
    build_mp4: 'Build .mp4 (beta)',
    building: 'Building...',
    client_playlist: 'Client Playlist',
    create_for_selection: 'Generate a playlist for shot selection',
    create_title: 'Create playlist',
    created_at: 'Created at:',
    delete_text: 'Are you sure you want to remove {name} from your database?',
    delete_error: 'An error occured while deleting this playlist.',
    download_zip: 'Download .zip',
    failed: 'Failed',
    for_client: 'The client',
    for_studio: 'The Studio',
    edit_title: 'Edit playlist',
    last_creation: 'Last creations',
    last_modification: 'Last modifications',
    loading_error: 'A server error occured. Playlists cannot be loaded.',
    new_playlist: 'Add a playlist',
    no_build: 'No build',
    no_playlist: 'There is currently no playlist for this project or episode.',
    no_preview: 'No preview',
    no_selection: 'Please select a playlist on the left.',
    no_sequence_for_episode: 'There is no sequence for this episode',
    no_shot_for_production: 'There is no shot for this production',
    select_shot: 'Please select a shot in the right column',
    select_playlist: 'Please select a playlist in the left column',
    select_task_type: 'Change task type for all shots',
    title: 'Playlists',
    updated_at: 'Updated at:',
    remove: 'remove',
    fields: {
      name: 'نام',
      created_at: 'Creation date',
      updated_at: 'Update date',
      for_entity: 'Select entity to display',
      for_client: 'To be shared with'
    },
    actions: {
      edit: 'Edit playlist',
      delete: 'Delete playlist',
      fullscreen: 'Fullscreen',
      download: 'Download…',
      entity_list: 'Show/Hide entity list',
      comments: 'Show/Hide comments',
      annotation: 'Annotation',
      annotation_text: 'Double click on the preview to add some text',
      annotation_delete: 'Delete annotation',
      annotation_redo: 'Redo annotation',
      annotation_undo: 'Undo annotation',
      annotation_big: 'Big',
      annotation_medium: 'Medium',
      annotation_small: 'Small',
      change_task_type: 'Change task type',
      split_screen: 'Split screen',
      next_shot: 'Next shot',
      previous_shot: 'Previous shot',
      next_frame: 'Next frame',
      previous_frame: 'Previous frame',
      play: 'Play',
      pause: 'Pause'
    }
  },

  productions: {
    current: 'Selected production',
    delete_text: 'Are you sure you want to remove {name} from your database? Please, confirm by typing the name of the project you want to delete in the text field.',
    delete_error: 'An error occured while deleting this production. There are probably data linked to it. Are you sure this production has no task, shot or asset linked to it? Kitsu doesn\'t allow production deletion. If you don\'t want to see the production anymore, you can close it instead.',
    edit_title: 'Edit production',
    new_production: 'Add a production',
    number: 'production | productions',
    open_productions: 'My productions',
    picture: 'Change picture',
    title: 'Productions',
    home: {
      create_new: 'Create a new production',
      empty: 'You don\'t have any production open. What about creating a new one?',
      no_task: 'You have no task assigned. See your supervisor to see what you can do!',
      no_prod_for_client: 'You don\'t have access to any production. Contact your contractor to obtain an access.',
      title: 'Running Productions',
      welcome: 'Welcome to Kitsu'
    },
    fields: {
      fps: 'FPS',
      name: 'نام',
      ratio: 'Ratio',
      resolution: 'Resolution',
      status: 'Status',
      type: 'Type'
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
      closed: 'Closed',
      open: 'Open',
      active: 'Open',
      archived: 'Closed'
    },

    type: {
      short: 'Short',
      featurefilm: 'Feature Film',
      tvshow: 'TV Show'
    }
  },

  profile: {
    change_avatar: 'Change avatar',
    info_title: 'Information',
    language: 'Language',
    notifications_enabled: 'Email notifications enabled',
    notifications_slack_enabled: 'Slack notifications enabled',
    notifications_slack_user: 'Slack username',
    password_title: 'Change password',
    timezone: 'Timezone',
    title: 'Your Profile',
    avatar: {
      title: 'Change avatar',
      error_upload: 'There was an error while uploading picture.'
    },
    change_password: {
      button: 'Change password',
      error: 'An error occured while changing password. Please verify your current password.',
      success: 'Your password was successfully changed!',
      unvalid: 'Your new password confirmation doesn\'t match or your password is too short (7 chars, at least, is expected).'
    },
    save: {
      button: 'Save changes',
      error: 'An error occured while saving changes'
    }
  },

  settings: {
    change_logo: 'Change logo',
    integrations: 'Integrations',
    logo: 'Studio logo',
    no_logo: 'There is no logo set.',
    set_logo: 'Set studio logo',
    title: 'Settings',
    fields: {
      name: 'Studio name',
      hours_by_day: 'Hours by day',
      slack_token: 'Slack Token (Optional)',
      use_original_name: 'Use original file name for downloads'
    },
    save: {
      button: 'Save settings',
      error: 'A server error occured while saving settings'
    }
  },

  task_status: {
    delete_text: 'Are you sure you want to remove {name} from your database?',
    delete_error: 'An error occured while deleting this task status. There are probably data linked to it. Are you sure this task status has no task linked to it?',
    edit_title: 'Edit task status',
    number: 'task status | task status',
    new_task_status: 'Add a task status',
    title: 'Task Status',
    fields: {
      is_artist_allowed: 'Is artist allowed',
      is_client_allowed: 'Is client allowed',
      color: 'Color',
      is_done: 'Is done',
      is_reviewable: 'Is reviewable',
      is_retake: 'Has retake value',
      name: 'نام',
      short_name: 'Short name'
    }
  },

  task_types: {
    delete_text: 'Are you sure you want to remove {name} from your database?',
    delete_error: 'An error occured while deleting this task type. There are probably data linked to it. Are you sure this task type has no task linked to it?',
    edit_title: 'Edit task type',
    new_task_type: 'Add a task type',
    number: 'task type | task types',
    title: 'Task Types',
    fields: {
      dedicated_to: 'For',
      color: 'Color',
      name: 'نام',
      allow_timelog: 'Timelog',
      priority: 'Priority'
    }
  },

  sequences: {
    all_sequences: 'All sequences',
    delete_text: 'Are you sure you want to remove {name} from your database? Every related shots and previews will be deleted. Please confirm by typing the sequence name below.',
    delete_error: 'An error occured while deleting this sequence. There are probably data linked to it. Are you sure this sequence has no shot linked to it?',
    edit_title: 'Edit sequence',
    empty_list: 'There is no sequence in the production. What about creating some?',
    empty_list_client: 'There is no sequence in this production.',
    new_sequence: 'New sequence',
    number: 'sequence | sequences',
    title: 'Sequence Stats',
    fields: {
      name: 'نام',
      description: 'توضیحات'
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
      name: 'نام',
      error: 'An error occured while adding or editing the milestone. Please try again.'
    }
  },

  quota: {
    average: 'Average',
    count_label: 'Count mode',
    detail_label: 'Detail level',
    details_name: 'نام',
    details_seconds: 'Seconds',
    details_frames: 'Frames',
    month_label: 'Month',
    no_quota: 'There is no quota for this task type.',
    name: 'نام',
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
      description: 'توضیحات',
      nb_frames: 'Frames',
      episode: 'Episode',
      frame_in: 'In',
      frame_out: 'Out',
      fps: 'FPS',
      name: 'نام',
      production: 'Prod',
      sequence: 'Sequence',
      time_spent: 'Time'
    }
  },

  server_down: {
    text: 'Please contact your vendor support, your system administrator or your IT department to understand what is going wrong.',
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
      entity_name: 'نام',
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
