export default {

  assets: {
    cast_in: 'عوامل',
    delete_error: 'خطایی در زمان حذف کردن این منبع رخ داده. آیا مطمئن هستید که برای این منبع وظیفه ای تعریف نشده؟',
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
    altdown: 'جابجایی وظایف انتخاب شده به پایین',
    altj: 'انتخاب پیش نمایش قبلی',
    altk: 'انتخاب پیش نمایش بعدی',
    altleft: 'جابجایی وظایف انتخاب شده به چپ',
    altright: 'جابجایی وظایف انتخاب شده به راست',
    altup: 'جابجایی وظایف انتخاب شده به بالا',
    annotations: 'حاشیه نویسی',
    draw: 'حالت طراحی روشن',
    navigation: 'ناوبری',
    redo: 'انجام دوباره',
    undo: 'برگشت',
    playlist_navigation: 'ناوبری لیست پخش',
    remove_annotation: 'حذف حاشیه نویسی',
    shortcuts: 'میانبر ها'
  },

  login: {
    back_to_login: 'به صفحه ورود برگردید',
    forgot_password: 'رمز ورود را فراموش کرده اید؟',
    login: 'ورود',
    login_failed: 'خطا در ورود، لطفا مشخصات خود را بررسی کنید.',
    login_page: 'لغو',
    redirecting: 'هدایت در {secondsLeft} ثانیه...',
    reset_change_password: 'تغییر رمز ورود',
    reset_change_password_form_failed: 'رمز وارد شده معتبر نیست. رمز وارد شده باید حداقل 7 کاراکتر و هردو باهم تطابق داشته باشند.',
    reset_change_password_failed: 'تغییر رمز انجام نشد. کل فرایند را مجدد انجام دهید.',
    reset_change_password_succeed: 'رمز ورود شما با موفقیت تغییر کرد. لطفا به صفحه ورود برگردید وبا رمز جدید وارد شوید.',
    reset_change_password_title: 'رمز جدید را وارد کنید',
    reset_password: 'بازگردانی رمز ورود',
    reset_password_failed: 'بازیابی رمز ورود انجام نشد. لطفا ایمیل خود را چک کنید.',
    reset_password_succeed: 'بازیابی رمز ورود با موفقیت انجام شد. ایمیل خود را چک کنید.',
    reset_password_title: 'برای بازیابی رمز ورود، ایمیل خود را وارد کنید.',
    title: 'ورود به Kitsu',
    fields: {
      email: 'ایمیل',
      password: 'رمز جدید',
      password2: 'تایپ مجدد رمز جدید'
    }
  },

  main: {
    about: 'درباره',
    add: 'اضافه کردن',
    all: 'همه',
    all_assets: 'تمام منابع',
    admin: 'مدیر',
    cancel: 'لغو',
    clear_selection: 'عدم انتخاب',
    close: 'خروج',
    confirmation: 'تایید',
    confirmation_and_stay: 'تایید و ماندن',
    date: 'تاریخ',
    dark_theme: 'تم مشکی',
    days_spent: 'روز/روزهای برآورد شده',
    days_estimated: 'روز/روزهای برآورد شده',
    delete: 'حذف',
    delete_all: 'حذف همه',
    delete_text: 'آیا مطمئن هستید که میخواهید {name} را حذف کنید؟',
    documentation: 'مستندات',
    edit: 'اصلاح',
    empty_comment: 'پاک کردن نظر',
    end_date: 'تاریخ پایان',
    files_selected: 'فایل های انتخاب شده',
    for: 'برای',
    go_productions: 'به پروژه ها بروید',
    history: 'تاریخچه',
    info: 'اطلاعات',
    or: 'یا',
    no: 'نه',
    loading: 'بارگذاری...',
    loading_data: 'بارگذاری داده ها',
    loading_error: 'خطایی هنگام بارگذاری داده ها رخ داد.',
    logout: 'خروج',
    modify: 'تغییر دادن',
    minimize: 'کوچک کردن',
    main_pack: 'بسته اصلی',
    maximize: 'تمام صفحه',
    nb_frames: 'فریم | فریم ها',
    person: 'شخص',
    profile: 'پروفایل',
    production: 'پروژه',
    remove: 'حذف',
    save: 'ذخیره',
    sort_by: 'مرتب بر اساس',
    sorted_by: 'مرتب شده بر اساس',
    start_date: 'تاریخ شروع',
    studio: 'استودیو',
    tutorials: 'آموزش ها',
    user: 'کاربر',
    white_theme: 'تم سفید',
    yes: 'بله',
    csv: {
      choose: 'انتخاب',
      error_upload: 'هنگام بارگذاری CSV خطایی رخ داد.',
      export_file: 'صادر',
      import_file: 'وارد',
      import_title: 'وارد کردن داده ها از CSV',
      legend: 'راهنما',
      legend_ok: 'داده ها تایید شد',
      legend_ignored: 'داده ها رد شد',
      legend_missing: 'عدم وجود داده ها',
      legend_disabled: 'داده ها ایجاد یا برزورسانی نخواهند شد.',
      legend_overwrite: 'داده ها بروزرسانی خواهند شد',
      paste: 'چسباندن',
      paste_code: 'لطفا داده های CSV خود را اینجا بچسبانید.:',
      preview: 'پیش نمایش',
      preview_episode_name: 'نام قسمت',
      preview_title: 'پیش نمایش داده های که وارد شده',
      preview_description: 'Upload a .csv file to populate your board with posts.',
      preview_required: 'NB: Headers must be included as first row.',
      preview_reupload: 'بارگذاری مجدد فایل .CSV',
      required_fields: 'فایل CSV شما نیاز مند ستون های ذیل است.',
      select_file: 'لطفا فایل CSV را انتخاب کنید :',
      tab_select_file: 'بارگذاری فایل CSV',
      tab_paste_code: 'چسباندن داده های CSV',
      unknown: 'ستون ناشناخته',
      upload_file: 'گزینش',
      options: {
        title: 'گزینه ها',
        update: 'بروزرسانی داده های موجود'
      }
    }
  },

  menu: {
    assign_tasks: 'محول کردن وظایف',
    change_priority: 'تغییر اولویت',
    change_status: 'تغییر وضعیت',
    create_tasks: 'ایجاد وظایف',
    delete_tasks: 'حذف وظایف',
    generate_playlists: 'ساخت لیست پخش',
    run_custom_action: 'اجرای کار سفارشی',
    set_estimations: 'تعیین برآورد'
  },

  news: {
    all: 'همه',
    commented_on: 'نظر داده شده در',
    infos: 'اطلاعات',
    no_news: 'خبری برای این پروژه یا فیلتر وجود ندارد.',
    only_comments: 'تنها نظرات',
    only_previews: 'تنها پیش نمایش ها',
    set_preview_on: 'روشن کردن پیش نمایش',
    task_status: 'وضعیت وظیفه',
    task_type: 'نوع وظیفه',
    title: 'خوراک خبری'
  },

  not_found: {
    text: 'لینکی که بر روی آن کلیک کرده اید مشکل دارد یا چیزی نادرست است . لطفه به صفحه اصلی برگردید.',
    title: 'صفحه مورد نظر پیدا مشد... آیا به دنبال چیزی که حذف کرده اید میگردید؟'
  },

  notifications: {
    and_change_status: 'و وضعیت تغییر کرد به',
    assigned_you: 'محول شده به شما در',
    commented_on: 'نظر داده شده در',
    mention_you_on: 'از شما نام برده شده در',
    no_notifications: 'در حال حاظر اعلانی برای شما در پروژه های جاریوجود ندارد.',
    unread_notifications: 'اعلان|اعلان های خوانده نشده',
    title: 'اعلانات',
    with_preview: 'همراه پیش نمایش'
  },

  people: {
    active: 'فعال',
    active_persons: 'شخص | اشخاص فعال',
    add_member_to_team: 'اضافه کردن عضو به تیم : ',
    create_invite: 'ایجاد و فرستادن دعوت نامه',
    delete_error: 'خطایی در زمان حذف کردن شخص رخ داد. احتمالا داده های به این شخص متصل است. آیا مطمئن هستید به این شخص کاری محول یا نظری توسطش نوشته نشده است؟',
    delete_text: 'آیا مطمئن هستید که میخواهید {personName} راحذف کنید؟ تمای داده های متصل حذف خواهد شد. برای تایید اسم کامل فرد را تایپ کنید.',
    edit_title: 'اصلاح شخص',
    empty_team: 'کسی در تیم این پروژه وجود ندارد',
    invite: 'ارسال دعوت نامه',
    invite_error: 'هنگام ارسال دعوت نامه خطایی رخ داد.',
    invite_success: 'دعوت نامه با موفقیت ارسال شد.',
    new_person: 'اضافه کردن کارمند جدید',
    no_task_assigned: 'هیچ وظیفه ای که به شما محول شده باشد، وجود ندارد.',
    persons: 'شخص | اشخاص',
    running_tasks: 'وظایف در حا اجرا',
    select_person: 'انتخاب شخص...',
    team: 'تیم',
    title: 'افراد',
    unactive: 'غیرفعال',
    csv: {
      import_file: 'وارد کردن فایل .csv',
      export_file: 'دانلود به عنوان فایل .csv',
      import_title: 'وارد کردن داده هااز فایل csv',
      required_fields: 'فایل csv شما نیازمند ستون های ذیل است:',
      select_file: 'لطفا فایل مرود نظر خود را انتخاب کنید:',
      error_upload: 'به هنگام بارگذاری فایل خطایی رخ داده.'
    },
    fields: {
      first_name: 'نام',
      last_name: 'نام خانوادگی',
      email: 'ایمیل',
      phone: 'همراه',
      role: 'نقش',
      old_password: 'رمز جاری',
      password: 'رمز جدید',
      password_2: 'رمز جدید ( تکرار)',
      active: 'فعال'
    },
    list: {
      name: 'نام',
      email: 'ایمیل',
      phone: 'همراه',
      role: 'نقش',
      active: 'فعال'
    },
    role: {
      admin: 'مدیر استودیو',
      client: 'مشتری',
      manager: 'سوپروایزر',
      user: 'هنرمند',
      undefined: '',
      vendor: 'فروشنده'
    }
  },

  playlists: {
    add_assets: 'اضافه کردن منابع',
    add_selection: 'اضافه کردن انتخاب',
    add_shots: 'اضافه کردن شات ها',
    add_sequence: 'اضافه کردن کل سکانس',
    add_episode: 'اضافه کردن کل قسمت ها',
    add_movie: 'اضافه کردن کل ویدئوها',
    apply_task_type_change: 'این کار نوع وظیفه را در تمام شات ها تغییر خواهد داد.',
    available_build: 'ساخته های دردسترس',
    build_daily: 'دردست انجام روزانه',
    build_weekly: 'تمام دردست انجام ها',
    build_mp4: 'Build .mp4 (beta)',
    building: 'در حال ساختن...',
    client_playlist: 'لیست پخش مشتری',
    create_for_selection: 'ایجاد لیست پخش برای شات های انتخابی',
    create_title: 'ساخت لیست پخش',
    created_at: 'ساخته شده در :',
    delete_text: 'آیا مطمئنید که می خواهید {name} را حذف کنید؟',
    delete_error: 'هنگام حذف این لیست پخش خطایی رخ داد.',
    download_zip: 'Download .zip',
    failed: 'ناموفق',
    for_client: 'مشتری',
    for_studio: 'استودیو',
    edit_title: 'اصلاح لیست پخش',
    last_creation: 'آخرین ساخته ها',
    last_modification: 'آخرین تغییرات',
    loading_error: 'خطا در سرور. لیست پخش نمی تواند بارگذاری شود.',
    new_playlist: 'اضافه کردن لیست پخش',
    no_build: 'بدون ساخت',
    no_playlist: 'در حال حاظر هیچ لیست پخشی برای این پروژه یا قسمت وجود ندارد.',
    no_preview: 'بدون پیش نمایش',
    no_selection: 'لطفا از سمت چپ یک لیست پخش انتخاب کنید.',
    no_sequence_for_episode: 'هیچ سکانسی برای این قسمت وجود ندارد.',
    no_shot_for_production: 'هیچ شاتی برای این پروژه وجود ندارد.',
    select_shot: 'لطفا از ستون سمت راست  یک شات انتخاب کنید.',
    select_playlist: 'لطفا از ستون سمت چپ یک لیست پخش انتخاب کنید.',
    select_task_type: 'تغییر وظیفه برای تمام شات ها',
    title: 'لسیت پخش',
    updated_at: 'بروزرسانی شده در :',
    remove: 'حذف',
    fields: {
      name: 'نام',
      created_at: 'تاریخ ساخت',
      updated_at: 'تاریخ بروزرسانی',
      for_entity: 'موجودیتی را برای نمایش انتخاب کنید.',
      for_client: 'برای اشتراک گذاری با'
    },
    actions: {
      edit: 'اصلاح لیست پخش',
      delete: 'حذف کردن لیست پخش',
      fullscreen: 'تمام صفحه',
      download: 'دانلود...',
      entity_list: 'نمایش/مخفی لیست موجودیت',
      comments: 'نمایش/مخفی نظرات',
      annotation: 'حاشیه نویسی',
      annotation_text: 'برای ایجاد متن دوبار کلیلک کنید.',
      annotation_delete: 'حذف حاشیه نویسی',
      annotation_redo: 'انجام دوباره',
      annotation_undo: 'برگشت به قبل',
      annotation_big: 'بزرگ',
      annotation_medium: 'متوسط',
      annotation_small: 'کوچک',
      change_task_type: 'تغییر نوع وظیفه',
      split_screen: 'جدا کردن صفح نمایش',
      next_shot: 'شات بعدی',
      previous_shot: 'شات قبلی',
      next_frame: 'فریم بعدی',
      previous_frame: 'فریم قبلی',
      play: 'پخش',
      pause: 'توقف'
    }
  },

  productions: {
    current: 'پروژه انتخاب شده',
    delete_text: 'آیا مطمئنید که می خواهید {name} را حذف کنید؟ لطفا برای تایید این عمل در فیلد بعدی اسم پروژه را تایپ کنید.',
    delete_error: 'هنگام حذف این پروژه خطایی رخ داده. آیا مطمئن هستید که وظیفه،شات ویا منبعی به این پروژه متصل نیست؟ Kitsu اجازه حذف پروژه را ندارد. اگر نمیخواهید این پروژه را ببینید میتوانید آن را ببندید.',
    edit_title: 'اصلاح پروژه',
    new_production: 'اضافه کردن پروژه',
    number: 'پروژه | پروژه ها',
    open_productions: 'پروژه های من',
    picture: 'تغییر تصویر',
    title: 'پروژه ها',
    home: {
      create_new: 'ایجاد پروژه جدید',
      empty: 'شما هیچ پروژه ای  بازی ندارید. آیا مایلید پروژه ای جدید ایجاد کنید؟',
      no_task: 'به شما کاری محول نشده. با سوپروایزر خود تماس وببیند چه کاری میتوانید انجام دهید.',
      no_prod_for_client: 'شما به هیچ پروژه ای دسترسی ندارید. با تهیه کننده و یا مدیر خود تماس بگیرید.',
      title: 'پروژه های در حال انجام',
      welcome: 'به Kitsu خوش آمدید.'
    },
    fields: {
      fps: 'FPS',
      name: 'نام',
      ratio: 'نسبت تصویر',
      resolution: 'ابعاد تصویر',
      status: 'وضعیت',
      type: 'نوع'
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
      closed: 'بسته شده',
      open: 'باز',
      active: 'باز',
      archived: 'بسته شده'
    },

    type: {
      short: 'فیلم کوتاه',
      featurefilm: 'فیلم بلند',
      tvshow: 'سریال'
    }
  },

  profile: {
    change_avatar: 'تغییرآواتار',
    info_title: 'اطلاعات',
    language: 'زبان',
    notifications_enabled: 'اعلانات ایمیل فعال',
    notifications_slack_enabled: 'اعلانات اسلک فعال',
    notifications_slack_user: 'نام کاربری اسلک',
    password_title: 'تغییر رمز ورود',
    timezone: 'موقعیت زمانی',
    title: 'پروفایل شما',
    avatar: {
      title: 'تغییر آواتار',
      error_upload: 'در زمان بارگذاری تصویر خطایی رخ داد.'
    },
    change_password: {
      button: 'تغییر رمز ورود',
      error: 'هنگام تغییر رمز خطایی رخ داد. لطفا رمز پیشین خود را بررسی کنید.',
      success: 'رمز شما با موفقیت تغییر کرد!',
      unvalid: 'رمز جدید شما یا باهم مطابقت ندارد ویا کوتاه است (رمز باید حداقل 7 کاراکتر باشد).'
    },
    save: {
      button: 'ذخیره تغییرات',
      error: 'هنگام ذخیره تغییرات خطایی رخ داد.'
    }
  },

  settings: {
    change_logo: 'تغییر لوگو',
    integrations: 'ادغام',
    logo: 'لوگو استودیو',
    no_logo: 'هیچ لوگوی تعیین نشده.',
    set_logo: 'تعیین لوگوی استودیو',
    title: 'تنظیمات',
    fields: {
      name: 'نام استودیو',
      hours_by_day: 'ساعت در روز',
      slack_token: 'Slack Token (Optional)',
      use_original_name: 'استفاده از اسم اصلی فایل برای دانلود.'
    },
    save: {
      button: 'ذخیره تغییرات',
      error: 'هنگام ذخیره تغییرات خطایی رخ داد.'
    }
  },

  task_status: {
    delete_text: 'آیا مطمئنید که می خواهید {name} را حذف کنید؟',
    delete_error: 'هنگام حذف وضعیت این وظیفه خطایی رخ داده. آیا مطمئنید این وضعیت وظیفه به هیچ وظیفه ای متصل نیست؟',
    edit_title: 'اصلاح وضعیت وظیفه',
    number: 'وضعیت | وضعیت های وظیفه',
    new_task_status: 'اضافه کردن وضعیت وظیفه',
    title: 'وضعیت وظیفه',
    fields: {
      is_artist_allowed: 'این هنرمند اجازه دارد',
      is_client_allowed: 'این مشتری اجازه دارد',
      color: 'رنگ',
      is_done: 'انجام شده',
      is_reviewable: 'قابل بررسی',
      is_retake: 'بازنگری',
      name: 'نام',
      short_name: 'اسم کوتاه'
    }
  },

  task_types: {
    delete_text: 'آیا مطمئنید که می خواهید {name} را حذف کنید؟',
    delete_error: 'هنگام حذف نوع این وظیفه خطایی رخ داده. آیا مطمئنید این نوع وظیفه به هیچ وظیفه ای متصل نیست؟',
    edit_title: 'اصلاح نوع وظیفه',
    new_task_type: 'اضافه کردن نوع وظیفه',
    number: 'نوع | انواع وظیفه',
    title: 'انواع وظیفه',
    fields: {
      dedicated_to: 'برای',
      color: 'رنگ',
      name: 'نام',
      allow_timelog: 'ضبط زمان',
      priority: 'اولویت'
    }
  },

  sequences: {
    all_sequences: 'تمام سکانس ها',
    delete_text: 'آیا مطمئنید که می خواهید {name} را حذف کنید؟ تمام شات ها و پیش نمایش های مرتبط حذف خواهد شد. لطفا برای تایید اسم کامل سکانس را تایپ کنید.',
    delete_error: 'هنگام حذف این سکانس خطایی رخ داده. آیا مطمئنید این سکانس به شاتی لینک نشده؟',
    edit_title: 'اصلاح سکانس',
    empty_list: 'هیچ سکانسی در این پروژه وجود ندارد.آیا میلید سکانسی ایجاد کنید؟',
    empty_list_client: 'هیچ سکانسی در این پروژه وجود ندارد.',
    new_sequence: 'سکانس جدید',
    number: 'سکانس | سکانس ها',
    title: 'وضعیت سکانس ها',
    fields: {
      name: 'نام',
      description: 'توضیحات'
    }
  },

  schedule: {
    title: 'برنامه ریزی',
    title_main: 'برنامه ریزی اصلی',
    overall_man_days: 'فرد-روز',
    md: 'md',
    zoom_level: 'سطح بزرگنمایی',
    milestone: {
      add_milestone: 'اضافه کردن نقطه عطف برای',
      edit_milestone: 'اصلاح نقطه عطف برای',
      name: 'نام',
      error: 'خطایی هنگام اضافه کردن یا اصلاح کردن نقطه عطف رخ داد. لطفا مجدد تاش کنید.'
    }
  },

  quota: {
    average: 'Average',
    count_label: 'حالت شمارش',
    detail_label: 'سطح جزئیات',
    details_name: 'نام',
    details_seconds: 'ثانیه',
    details_frames: 'فریم',
    month_label: 'ماه',
    no_quota: 'برای این نوع وظیفه سهمیه یا میزانی وجود ندارد.',
    name: 'نام',
    quota_day: 'سهم بر روز',
    quota_week: 'سهم بر هفته',
    quota_month: 'سهم بر ماه',
    year_label: 'سال',
    title: 'سهم/ میزان',
    type_label: 'نوع'
  },

  shots: {
    casting: 'Shot casting',
    creation_explaination: 'To add shots you need first to create an episode and a sequence. Type an episode name in the bottom of the left column then click on add to create a new episode. Select this episode and repeat the same operation for sequence. Finally select a sequence and type a shot name in the field in the bottom of the right column. Click on the add button below. Your first shot was created. You can now add many more! If it\'s not a TV Show, you have to directly create a sequence.',
    delete_text: 'آیا مطمئنید که می خواهید {name} را حذف کنید؟',
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
    set_preview_error: 'خطایی هنگام تنظیم پیش نمایش به عنوان بند انگشتی رخ داد.',
    set_preview_done: 'این پیش نمایش به عنوان بندانگشتی موجودیت جاری استفاده شده.',
    select_preview_file: 'لطفا تصویری برای پیش نمایش وضیفه جاری انتخاب کنید.',
    show_assignations: 'نمایش کارهای محول شده',
    show_infos: 'نمایش اطلاعات اضافی',
    subscribe_notifications: 'اشتراک برای اعلانات',
    select_image_file: 'لطفا تصویری که میخواهید به نظر خود پیوست کنید را انتخاب کنید.',
    tasks: 'وظایف',
    validation: 'تایید',
    with_comment: 'همراه یک نظر...',
    fields: {
      asset_type: 'نوع منبع',
      assignees: 'عامل',
      count: 'تعداد',
      due_date: 'تاریخ انجام',
      duration: 'مدت',
      end_date: 'تاریخ تایید',
      entity: 'ماهیت',
      entity_name: 'نام',
      estimated_quota: 'Avg. Quota',
      estimation: 'برآورد',
      frames: 'فریم.',
      last_comment: 'آخرین نظر',
      last_comment_date: 'آخرین نظر',
      priority: 'اولویت',
      production: 'پروژه',
      real_end_date: 'تاریخ تایید',
      real_start_date: 'تاریخ در حال انجام',
      retake_count: 'برداشت مجدد',
      seconds: 'ثانیه',
      sequence: 'سکانس',
      start_date: 'تاریخ شروع',
      task_status: 'وضعیت',
      task_status_short_name: 'وضعیت',
      task_type: 'نوع'
    },
    colors: {
      title: 'رنگ بندی',
      neutral: 'خنثی',
      status: 'وضعیت رنگ',
      late: 'تاخیر به رنگ قرمز'
    },
    priority: {
      emergency: 'اورژانسی',
      normal: 'عادی',
      high: 'ضروری',
      very_high: 'خیلی ضروری'
    }
  },

  timesheets: {
    detail_level: 'سطح جزئیات',
    done_tasks: 'وظایف انجام شده',
    export_timesheet: 'صادر کردن جدول زمانی',
    hours: 'ساعت',
    month: 'ماه',
    time_spents: 'زمان صرف شده ( ساعت )',
    title: 'جداول زمانی',
    year: 'سال'
  },

  wrong_browser: {
    title: 'Kitsu توسط مرورگر شما پشتیبانی نمی شود.',
    text: 'Kitsu میتواند با مرورگر فایرفاکس یا کروم به درستی کار کنند.'
  }
}
