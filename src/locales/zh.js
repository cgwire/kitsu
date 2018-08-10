export default {

  assets: {
    cast_in: '参演其中',
    delete_error: '删除此资源时出现错误. 很可能存在有链接至此的数据. 您确定没有任务链接至此资源类型吗?',
    delete_text: '您确定要从您的数据库移除{name}吗?',
    edit_fail: '创建或编辑失败, 有错误出现.',
    edit_success: '已成功编辑资源{name}.',
    edit_title: '编辑资源',
    empty_list: '制作中没有资源. 要创建一些吗?',
    new_asset: '添加资源',
    new_assets: '添加多个资源',
    new_success: '已成功创建资源{name}.',
    no_cast_in: '任何镜头中都没有此资源的参演.',
    number: '资源 | 资源(多个)',
    restore_text: '您确定要将{name}恢复进您的数据库吗?',
    restore_error: '恢复此资源时出现错误.',
    tasks: '资源任务(多个)',
    title: '资源(多个)',
    fields: {
      description: '说明',
      name: '资源',
      production: '制作',
      type: '类型'
    }
  },

  asset_types: {
    delete_text: '您确定要从您的数据库移除{name}吗?',
    delete_error: '删除此资源类型时出现错误. 很可能存在有链接至此的数据. 您确定没有资源链接至此资源类型吗?',
    edit_title: '编辑资源类型',
    new_asset_type: '添加资源类型',
    number: '资源类型 | 资源类型(多种)',
    title: '资源类型(多种)',
    fields: {
      name: '名称'
    }
  },

  breakdown: {
    all_assets: '所有可用资源',
    select_shot: '请从左侧选择一镜头来管理其角色分配.',
    selected_shot: '{sequence_name}中的多个资源 / {name}的角色分配',
    save_error: '保存支配表时出现错误.',
    title: '支配表'
  },

  comments: {
    add_comment: '添加注释...',
    change_preview: '更换预览',
    empty_text: '此条注释为空',
    edit_title: '编辑注释',
    post_status: '发布状态',
    retake: '重拍',
    validated: '已确认!',
    validation_required: '需要得到确认',
    fields: {
      text: '文本'
    }
  },

  custom_actions: {
    delete_text: '您确定要从您的数据库移除自定义操作{name}吗?',
    delete_error: '删除此自定义操作时出现错误.',
    edit_title: '编辑自定义操作',
    new_custom_action: '添加自定义操作',
    number: '自定义操作 | 自定义操作(多个)',
    run_for_selection: '为所选的多个任务执行自定义操作:',
    title: '自定义操作(多个)',
    fields: {
      name: '名称',
      url: 'URL',
      entity_type: '实体类型'
    },
    entity_types: {
      all: '所有',
      shot: '镜头',
      asset: '资源'
    }
  },

  episodes: {
    delete_error: '删除此片段时出现错误. 很可能存在有链接至此的数据. 您确定没有序列链接至此片段吗?',
    delete_text: '您确定要从您的数据库移除{name}吗?',
    edit_title: '编辑片段',
    empty_list: '制作中没有片段. 要创建一些吗?',
    new_episode: '新建片段',
    number: '片段 | 片段(多个)',
    title: '片段(多个)',
    fields: {
      name: '名称',
      description: '说明'
    }
  },

  login: {
    login: '登录',
    login_failed: '登录失败, 请验证您的凭据',
    title: '登录Kitsu',
    fields: {
      email: '电子邮箱',
      password: '密码'
    }
  },

  main: {
    add: '添加',
    admin: '管理员',
    cancel: '取消',
    clear_selection: '清除当前所选',
    delete_text: '您确定要从您的数据库移除{name}吗?',
    close: '关闭',
    confirmation: '确认',
    confirmation_and_stay: '确认保持这种状态',
    empty_comment: '空注释',
    info: '信息',
    or: '或',
    no: '否',
    loading_error: '加载数据时出现错误.',
    logout: '退出',
    profile: '简介',
    production: '制作',
    studio: '工作室',
    save: '保存',
    user: '用户',
    yes: '是',
    csv: {
      export_file: '导出',
      error_upload: '上传您的CSV文件时出现错误.',
      import_file: '导入',
      import_title: '从CSV文件导入数据',
      required_fields: '您的CSV文件需要有如下列项',
      select_file: '请从您的某个文件夹选择文件:'
    }
  },

  menu: {
    assign_tasks: '分配多个任务',
    change_status: '更改状态',
    create_tasks: '创建多个任务',
    run_custom_action: '执行自定义操作'
  },

  not_found: {
    text: '您点击的链接有问题, 我们提倡您返回主页.',
    title: '页面未找到..., 您要找一下自己已删除的内容吗?'
  },

  notifications: {
    and_change_status: ', 也已经将状态更改为了',
    commented_on: '已给出针对性注释, 注释对象为',
    title: '通知(多个)',
    with_preview: '带有预览'
  },

  people: {
    delete_text: '您确定要从您的数据库移除{personName}吗?',
    delete_error: '删除此人员时出现错误. 很可能存在有链接至此的数据. 您确定此人员没有分配任务或是没写注释吗?',
    edit_title: '编辑人员',
    new_person: '添加新员工',
    persons: '人员 | 人员(多名)',
    running_tasks: '执行多个任务',
    title: '人员(多名)',
    csv: {
      import_file: '导入.csv文件',
      export_file: '下载为.csv文件',
      import_title: '从CSV文件导入数据',
      required_fields: '您的CSV文件需要有如下列项',
      select_file: '请从您的某个文件夹选择文件:',
      error_upload: '上传您的CSV文件时出现错误.'
    },
    fields: {
      first_name: '名称',
      last_name: '姓氏',
      email: '电子邮箱',
      phone: '电话',
      role: '职责',
      old_password: '当前密码',
      password: '新密码',
      password_2: '新密码(重复)',
      active: '活动'
    },
    list: {
      name: '名称',
      email: '电子邮箱',
      phone: '电话',
      role: '职责',
      active: '活动'
    },
    role: {
      admin: '管理员',
      manager: '监制',
      user: 'CG艺术家'
    }
  },

  playlists: {
    add_shots: '选择多个镜头',
    delete_text: '您确定要从您的数据库移除{name}吗?',
    delete_error: '删除此播放列表时出现错误.',
    edit_title: '编辑播放列表',
    loading_error: '出现服务器错误. 多个播放列表无法被加载.',
    new_playlist: '添加播放列表',
    no_playlist: '此项目当前没有播放列表.',
    no_selection: '请从左侧选择播放列表.',
    no_sequence_for_episode: '此片段没有序列',
    no_shot_for_production: '此制作没有镜头',
    select_shot: '请从右列中选择镜头',
    select_playlist: '请从左列中选择播放列表',
    title: '播放列表(多个)',
    remove: '移除',
    fields: {
      name: '名称'
    }
  },

  productions: {
    current: '所选制作',
    delete_text: '您确定要从您的数据库移除{name}吗?',
    delete_error: '删除此制作时出现错误. 很可能存在有链接至此的数据. 您确定没有任务, 镜头或资源链接至此制作吗?',
    edit_title: '编辑制作',
    new_production: '添加制作',
    number: '制作 | 制作(多个)',
    picture: '更换图片',
    title: '制作(多个)',
    home: {
      create_new: '创建新制作',
      empty: '您什么制作也没开启. 要创建一个新的吗?',
      no_task: '还没有任务分配给您. 您可以到监制那儿了解一下自己能做些什么!',
      title: '执行多个制作',
      welcome: '欢迎使用Kitsu'
    },
    fields: {
      name: '名称',
      status: '状态'
    },
    status: {
      closed: '关闭',
      open: '打开'
    }
  },

  profile: {
    info_title: '信息',
    language: '语种',
    password_title: '更改密码',
    timezone: '时区',
    title: '您的简介',
    avatar: {
      title: '更换头像'
    },
    change_password: {
      button: '更改密码',
      error: '更改密码时出现错误. 请验证您当前的密码.',
      success: '您的密码已成功更改!',
      unvalid: '您的确认密码与新密码不相符或您的密码长度太短(预期至少是7个字符).'
    },
    save: {
      button: '保存更改',
      error: '保存更改时出现错误'
    }
  },

  task_status: {
    delete_text: '您确定要从您的数据库移除{name}吗?',
    delete_error: '删除此任务状态时出现错误. 很可能存在有链接至此的数据. 您确定没有任务链接至此任务状态吗?',
    edit_title: '编辑任务状态',
    number: '任务状态 | 任务状态(多种)',
    new_task_status: '添加任务状态',
    title: '任务状态(多种)',
    fields: {
      color: '颜色',
      is_reviewable: '可回顾',
      is_done: '已完成',
      name: '名称',
      short_name: '短名称'
    }
  },

  task_types: {
    delete_text: '您确定要从您的数据库移除{name}吗?',
    delete_error: '删除此任务类型时出现错误. 很可能存在有链接至此的数据. 您确定没有任务链接至此任务类型吗?',
    edit_title: '编辑任务类型',
    new_task_type: '添加任务类型',
    number: '任务类型 | 任务类型(多种)',
    title: '任务类型(多种)',
    fields: {
      name: '名称',
      color: '颜色',
      priority: '优先级',
      dedicated_to: '专用于'
    }
  },

  sequences: {
    delete_text: '您确定要从您的数据库移除{name}吗?',
    delete_error: '删除此序列时出现错误. 很可能存在有链接至此的数据. 您确定没有镜头链接至此序列吗?',
    edit_title: '编辑序列',
    empty_list: '制作中没有序列. 要创建一些吗?',
    new_sequence: '新建序列',
    number: '序列 | 序列(多个)',
    title: '序列(多个)',
    fields: {
      name: '名称',
      description: '说明'
    }
  },

  shots: {
    casting: '镜头的角色分配',
    delete_text: '您确定要从您的数据库移除{name}吗?',
    delete_error: '删除此镜头时出现错误. 很可能存在有链接至此的数据. 您确定没有任务链接至此镜头吗?',
    edit_success: '已成功编辑镜头{name}.',
    edit_fail: '创建或编辑失败, 有错误出现.',
    edit_title: '编辑镜头',
    empty_list: '制作中没有镜头. 要创建一些吗?',
    new_shot: '添加镜头',
    new_shots: '添加多个镜头',
    new_sequences: '添加多个序列',
    new_episodes: '添加多个片段',
    no_casting: '镜头的角色分配为空.',
    number: '镜头 | 镜头(多个)',
    manage: '管理多个镜头',
    new_success: '已成功创建镜头{name}.',
    restore_text: '您确定要将{name}恢复进您的数据库吗?',
    restore_error: '恢复此镜头时出现错误.',
    tasks: '镜头任务(多个)',
    title: '镜头(多个)',
    fields: {
      description: '说明',
      episode: '片段',
      frame_in: '入镜',
      frame_out: '出镜',
      fps: 'FPS',
      name: '镜头',
      production: '制作',
      sequence: '序列'
    }
  },

  server_down: {
    text: '请联系您的供应商支持, 您的系统管理员或您的IT部门来搞清楚出什么问题了.',
    title: 'Kitsu在访问其数据API时出现错误.'
  },

  tasks: {
    add_preview: '添加预览',
    add_preview_error: '添加预览时出现错误.',
    assign: '将单个任务分配给: | 将{nbSelectedTasks}个任务分配给:',
    back_to_list: '返回列表',
    change_status_to: '将任务状态改为:',
    change_preview: '更换预览',
    clear_assignations: '清除多个任务分配',
    create_for_selection: '为每个空单元格都创建任务:',
    create_tasks: '添加多个任务',
    create_tasks_shot: '为当前的多个镜头添加多个任务',
    create_tasks_shot_explaination: '您将要为当前列表的每个镜头都创建给定任务类型的新任务. 要继续吗?',
    create_tasks_shot_failed: '继续进行多个创建时出现服务器错误.',
    create_tasks_asset: '为当前的多个资源添加多个任务',
    create_tasks_asset_explaination: '您将要为当前列表的每个资源都创建给定任务类型的新任务. 要继续吗?',
    create_tasks_asset_failed: '继续进行多个创建时出现服务器错误.',
    current: '待执行任务',
    current_status: '当前状态:',
    delete_error: '删除任务时出现错误.',
    delete_comment: '您确定要删除最新注释吗?',
    delete_comment_error: '删除注释时出现错误',
    edit_comment: '编辑注释',
    done: '已完成',
    download_pdf_file: '下载PDF文件',
    feedback: '反馈',
    full_screen: '全屏显示',
    my_tasks: '我的任务(多个)',
    next: '下一个任务',
    no_assignation_right: '不允许您管理多个任务分配',
    no_comment: '此任务当前没有注释.',
    no_preview: '此任务当前没有预览.',
    preview: '预览(多个)',
    previous: '上一个任务',
    set_preview: '将此预览设置为缩略图',
    set_preview_error: '将预览设置为缩略图时出现错误',
    set_preview_done: '此预览被用作当前实体的缩略图.',
    select_preview_file: '请从您的硬盘选择一张要被用作当前任务的预览的图片:',
    validation: '确认',
    tasks: '任务(多个)',
    fields: {
      assignees: '被分配任务人员(多名)',
      end_date: '结束日期',
      entity: '实体',
      last_comment: '最新注释',
      production: '制作',
      task_status: '状态',
      task_type: '类型'
    }
  },

  timesheets: {
    detail_level: '细节层次',
    done_tasks: '已完成任务',
    hours: '小时',
    month: '月',
    time_spents: '已用时长(小时)',
    title: '时间表(多个)',
    year: '年'
  }
}
