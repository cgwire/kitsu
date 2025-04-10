export default {

  assets: {
    only_current_episode: 'Only current chapter',
    no_cast_in: 'This asset is not cast in any map.',
    fields: {
      episode: 'Chapter'
    }
  },

  breakdown: {
    episode_casting: 'Chapter casting',
    remove: {
      confirm: 'Remove asset from its chapter',
      text: 'If you remove this asset from the selected chapter, it will remove the assets in all the underlying maps. Are you sure you want to remove it?'
    }
  },

  custom_actions: {
    entity_types: {
      shot: 'Map'
    }
  },

  status_automations: {
    entity_types: {
      shot: 'Map'
    }
  },

  entities: {
    nb_selected_shots: '{nbSelectedShots} map selected | {nbSelectedShots} maps selected',
    thumbnails: {
      edits_tvshow_pattern: '"ChapterName EditName" eg. CH01_Trailer.',
      shots_pattern: '"LevelName MapName" eg. LV01_MP01.'
    }
  },

  episodes: {
    edit_error: 'An error occurred while saving this chapter. Are you sure there is no chapter with similar name?',
    delete_error: 'An error occurred while deleting this chapter. There are probably data linked to it. Are you sure this chapter has no level linked to it?',
    delete_text: 'Are you sure you want to remove {name} from your database? Every related maps and previews will be deleted. Please confirm by typing the chapter name below.',
    edit_title: 'Edit chapter',
    empty_list: 'There is no chapter in the production. What about creating some?',
    empty_list_client: 'There is no chapter in this production.',
    new_episode: 'New chapter',
    no_casting: 'The chapter casting is empty.',
    number: 'chapter | chapters',
    restore_error: 'An error occurred while restoring given chapter.',
    tasks: 'Chapter tasks',
    title: 'Chapters',
    stats_title: 'Chapters Stats',
    fields: {
      placeholder: 'CH01'
    }
  },

  main: {
    all_shots: 'All maps',
    csv: {
      preview_episode_name: 'Chapter name'
    }
  },

  menu: {
    delete_shots: 'Delete maps'
  },


  playlists: {
    add_sequences: 'Add levels',
    add_shots: 'Add maps',
    add_sequence: 'Add the whole level',
    add_episode: 'Add the whole chapter',
    no_playlist: 'There is currently no playlist for this project or chapter.',
    no_sequence_for_episode: 'There is no level for this chapter',
    no_shot_for_production: 'There is no map for this production',
    select_shot: 'Please select a map in the right column'
  },

  productions: {
    delete_error: 'An error occurred while deleting this production. There are probably data linked to it. Are you sure this production has no task, map, or asset linked to it? Kitsu doesn\'t allow production deletion. If you don\'t want to see the production anymore, you can close it instead.',
    creation: {
      add_shots: 'Add maps (optional)',
      add_shots_button: 'Add maps',
      add_shots_description: 'Add or import the maps for your production.',
      errorImportingShots: 'An error occurred while importing your maps. The production has been created though!',
      explaination_type: 'If you choose TV Show, the production will be splitted in chapters.',
      import_shots_button: 'Import maps',
      select_shot_task_type: 'Select map task type',
      select_shot_task_type_description: 'These task types define the building steps of your maps.',
      shots_to_import: 'maps to import'
    },
    fields: {
      episode_span: 'Chapter spacing',
      nb_episodes: 'Number of chapters'
    },
    homepage: {
      'shots': 'Maps',
      'sequences': 'Levels'
    },
    type: {
      shots: 'Only maps'
    }
  },

  task_status: {
    help: {
      entities: 'Assets, maps, levels, ...'
    }
  },

  sequences: {
    all_sequences: 'All levels',
    edit_error: 'An error occurred while saving this level. Are you sure there is no level with a similar name?',
    delete_text: 'Are you sure you want to remove {name} from your database? All related maps and previews will be deleted. Please confirm by typing the level name below.',
    delete_error: 'An error occurred while deleting this level. There are probably data linked to it. Are you sure this level has no map linked to it?',
    edit_title: 'Edit level',
    empty_list: 'There is no level in the production. What about creating some?',
    empty_list_client: 'There is no level in this production.',
    new_sequence: 'New level',
    no_casting: 'The level casting is empty.',
    number: 'level | levels',
    stats_title: 'Level Stats',
    title: 'Levels',
    fields: {
      placeholder: 'LV01'
    }
  },

  edits: {
    fields: {
      episode: 'Chapter'
    }
  },

  quota: {
    explaination: 'Maps are considered ended on the first feedback request. Then, quotas are weighted following time spent on the task (when the artist filled his timesheet).\n If no time is filled, it considers that:\n * The task was started at the first status change to WIP \n* The task was done the day the feedback request was made.\n * It splits the done frames among all business days between the start and the end.',
    explaination_feedback: 'The map is done on the first feedback request. Its number of frames is added to the quotas for this day.'
  },

  shots: {
    casting: 'Map casting',
    creation_explaination: 'To add maps you need first to create an chapter and a level. Type an chapter name in the bottom of the left column then click on add to create a new chapter. Select this chapter and repeat the same operation for level. Finally, select a level and type a map name in the field at the bottom of the right column. Click on the add button below. Your first map was created. You can now add many more! If it\'s not a TV Show, you have to directly create a level.',
    delete_for_selection: 'Delete the selected map | Delete the {nbSelectedShots} selected maps',
    delete_error: 'An error occurred while deleting this map. There are probably data linked to it. Are you sure this map has no task linked to it?',
    edit_success: 'Map {name} successfully edited.',
    edit_fail: 'Creation or edition failed, an error occurred. Make sure that you are not renaming the map with a name already listed for a given level.',
    edit_title: 'Edit map',
    empty_list: 'There is no map in the production. What about creating some?',
    empty_list_client: 'There is no map in this production.',
    episodes: 'Chapters',
    history: 'Map values history',
    multiple_delete_error: 'An error occurred while deleting a map. There is probably some data linked to a map. Are you sure there is no task linked to a selected map?',
    new_shot: 'Add a map',
    new_shots: 'Create maps',
    new_sequences: 'Add levels',
    new_episodes: 'Add chapters',
    no_casting: 'The map casting is empty.',
    number: 'map | maps',
    manage: 'Create Maps',
    new_success: 'Map {name} successfully created.',
    padding: 'Map Padding',
    restore_error: 'An error occurred while restoring this map.',
    sequences: 'Levels',
    tasks: 'Map Tasks',
    title: 'Maps',
    wrong_file_duration: 'One of the uploaded video file duration doesn\'t match the expected duration of the current map.',
    fields: {
      episode: 'Chapter',
      placeholder: 'MP01',
      sequence: 'Level'
    }
  },

  statistics: {
    episode_status: 'Chapter status',
    shots: 'Maps'
  },

  tasks: {
    create_tasks_shot: 'Add tasks for current maps',
    create_tasks_shot_explaination: 'You are going to create a new task for each map of the current project for the given task type. Do you want to continue?',
    create_tasks_episode: 'Add tasks for current chapters',
    create_tasks_episode_explaination: 'You are going to create a new task for each chapter of the current project for the given task type. Do you want to continue?',
    create_tasks_sequence: 'Add tasks for current levels',
    create_tasks_sequence_explaination: 'You are going to create a new task for each level of the current project for the given task type. Do you want to continue?',
    fields: {
      sequence: 'Level'
    }
  }
}
