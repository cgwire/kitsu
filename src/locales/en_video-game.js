/*
 * Production-type terminology overlay for video-game productions.
 *
 * This is NOT a standalone locale: it is a PARTIAL override merged on top of
 * en.js (the English source of truth). It must contain only the keys whose
 * wording differs from en.js — never a key whose value is identical to the base.
 *
 * Vocabulary mapping vs en.js:
 *   shot / Shot          ->  map / Map
 *   sequence / Sequence  ->  level / Level
 *   episode / Episode    ->  chapter / Chapter
 *   (asset and edit are unchanged)
 *
 * Keep in sync with en.js:
 *   - Mirror en.js key names exactly. If a key is renamed in en.js, rename it
 *     here too — a stale key is a dead override and the new base key then leaks
 *     untranslated vocabulary.
 *   - When a key added to en.js has a value mentioning a remapped word
 *     (shot / sequence / episode), add the matching override here.
 */
export default {

  assets: {
    casted_in_shots: 'Cast in {count} map | Cast in {count} maps',
    only_current_episode: 'Only current chapter',
    no_cast_in: 'This asset is not cast in any map.',
    fields: {
      episode: 'Chapter'
    }
  },

  breakdown: {
    remove: {
      confirm: 'Remove asset from its chapter',
      text: 'If you remove this asset from the selected chapter, it will also be removed from all the underlying maps. Are you sure you want to remove it?'
    }
  },

  custom_actions: {
    entity_types: {
      shot: 'Map',
      sequence: 'Level',
      episode: 'Chapter'
    }
  },

  status_automations: {
    entity_types: {
      shot: 'Map',
      sequence: 'Level',
      episode: 'Chapter'
    }
  },

  entities: {
    thumbnails: {
      edits_tvshow_pattern: '"ChapterName EditName" e.g. CH01_Trailer.',
      shots_pattern: '"LevelName MapName" e.g. LV01_MP01.'
    }
  },

  episodes: {
    all_hidden: 'All chapters are hidden.',
    edit_error: 'An error occurred while saving this chapter. Are you sure there is no chapter with a similar name?',
    delete_error: 'An error occurred while deleting this chapter. There may be existing data currently linked to it. Are you sure this chapter has no level linked to it?',
    delete_text: 'Are you sure you want to remove {name} from your database? All related maps and previews will also be deleted. Please confirm by typing the chapter name below.',
    edit_title: 'Edit chapter',
    empty_list: 'There are no chapters in the production. How about creating some?',
    empty_list_read_only: 'There are no chapters in this production.',
    new_episode: 'New chapter',
    new_episodes: 'Create chapters',
    no_casting: 'The chapter casting is empty.',
    number: 'chapter | chapters',
    restore_error: 'An error occurred while restoring this chapter.',
    tasks: 'Chapter tasks',
    title: 'Chapters',
    stats_title: 'Chapter Stats',
    fields: {
      placeholder: 'CH01'
    }
  },

  keyboard: {
    plaltleft: 'Go to the last frame of the previous map',
    plaltright: 'Go to the first frame of the next map'
  },

  main: {
    all_shots: 'All maps',
    csv: {
      preview_episode_name: 'Chapter name'
    },
    edl: {
      explanation: 'It\'s possible to import common OpenTimelineIO supported files (otio, fcp_xml, fcpx_xml, edl). Maps will be created or updated with the given frame range, frame in, and frame out. Frame in starts at 0.'
    }
  },

  menu: {
    delete_shots: 'Delete maps'
  },


  playlists: {
    add_sequences: 'Add levels',
    add_episodes: 'Add chapters',
    add_shots: 'Add maps',
    add_sequence: 'Add entire level',
    add_episode: 'Add entire chapter',
    no_playlist: 'There are currently no playlists for this production or chapter.'
  },

  productions: {
    delete_error: 'An error occurred while deleting this production. There may be existing data currently linked to it. Are you sure this production has no task, map, or asset linked to it? Kitsu doesn\'t allow production deletion. If you don\'t want to see the production anymore, you can close it instead.',
    clients: {
      access_task_list: 'Asset, map, and edit lists',
      access_task_list_description: 'Clients can open the asset, map, and edit lists and their pages.',
      metadata_description: 'Checked metadata columns are shown to clients in the asset and map lists.'
    },
    creation: {
      add_shots: 'Add maps (optional)',
      add_shots_description: 'Add or import the maps for your production.',
      errorImportingShots: 'An error occurred while importing your maps. The production has been created though!',
      explanation_type: 'Selecting TV Show will split the production into chapters.',
      import_shots_button: 'Import maps',
      select_shot_task_type: 'Select map task types',
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
    },
    video: {
      frame_in_description: "The player counter starts at the map's frame in instead of 0."
    }
  },

  task_status: {
    help: {
      entities: 'Assets, maps, levels, ...'
    }
  },

  sequences: {
    all_hidden: 'All levels are hidden.',
    all_sequences: 'All levels',
    edit_error: 'An error occurred while saving this level. Are you sure there is no level with a similar name?',
    delete_text: 'Are you sure you want to remove {name} from your database? All related maps and previews will also be deleted. Please confirm by typing the level name below.',
    delete_error: 'An error occurred while deleting this level. There may be existing data currently linked to it. Are you sure this level has no map linked to it?',
    edit_title: 'Edit level',
    empty_list: 'There are no levels in the production. How about creating some?',
    empty_list_read_only: 'There are no levels in this production.',
    new_sequence: 'New level',
    new_sequences: 'Create levels',
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
    explanation_feedback: 'The map is considered complete on the first feedback request. Its number of frames is added to the quotas for that day.',
    explanation_done: 'The map is considered complete on the last approval. Its number of frames is added to the quotas for that day.',
    explanation_weighted: 'Maps are considered complete upon the first feedback request. Then, quotas are weighted based on the time spent on the task, as recorded in the artist\'s timesheet.\n\nIf no time is recorded, it is assumed that:\n* The task started at the first status change to WIP.\n* The task was completed on the day the feedback request was made.\n* The completed frames are distributed evenly among all business days between the start and end dates.',
    explanation_weighteddone: 'Maps are considered complete upon the last approval. Then, quotas are weighted based on the time spent on the task, as recorded in the artist\'s timesheet.\n\nIf no time is recorded, it is assumed that:\n* The task started at the first status change to WIP.\n* The task was completed on the day it was approved.\n* The completed frames are distributed evenly among all business days between the start and end dates.'
  },

  shots: {
    casting: 'Map casting',
    creation_explanation: 'To add maps, you first need to create a chapter and a level. Type a chapter name at the bottom of the left column, then click "Add" to create a new chapter. Select this chapter and repeat the same operation for the level. Finally, select a level and type a map name in the field at the bottom of the right column. Click the "Add" button below. Your first map is now created. You can add many more! If it\'s not a TV show, you can directly create a level.',
    delete_for_selection: 'Delete the selected map | Delete the {nbSelectedShots} selected maps',
    delete_for_selection_hard_text: 'Are you sure you want to permanently remove the selected maps? All related tasks, comments and previews will also be deleted. Please confirm by typing \'DELETE\' below.',
    delete_error: 'An error occurred while deleting this map. There may be existing data currently linked to it. Are you sure this map has no task linked to it?',
    edit_success: 'Map {name} successfully edited.',
    edit_fail: 'Creation or edit failed, an error occurred. Make sure that you are not renaming the map with a name already listed for a given level.',
    edit_title: 'Edit map',
    empty_list: 'There are no maps in the production. How about creating some?',
    empty_list_read_only: 'There are no maps in this production.',
    episodes: 'Chapters',
    history: 'Map values history',
    multiple_delete_error: 'An error occurred while deleting a map. There may be existing data currently linked to the map. Are you sure there is no task linked to a selected map?',
    new_shot: 'New map',
    new_shots: 'Create maps',
    no_casting: 'The map casting is empty.',
    number: 'map | maps',
    new_success: 'Map {name} successfully created.',
    restore_error: 'An error occurred while restoring this map.',
    sequences: 'Levels',
    tasks: 'Map tasks',
    title: 'Maps',
    wrong_file_duration: 'The duration of one of the uploaded video files doesn\'t match the expected duration of the current map.',
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
    create_tasks_shot_explanation: 'You are about to create a new task for each map of the current production for the given task type. Do you want to continue?',
    create_tasks_episode: 'Add tasks for current chapters',
    create_tasks_episode_explanation: 'You are about to create a new task for each chapter of the current production for the given task type. Do you want to continue?',
    create_tasks_sequence: 'Add tasks for current levels',
    create_tasks_sequence_explanation: 'You are about to create a new task for each level of the current production for the given task type. Do you want to continue?',
    fields: {
      sequence: 'Level'
    }
  }
}
