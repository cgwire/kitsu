from zou.app.models.playlist import Playlist
from zou.app.models.preview_file import PreviewFile

from zou.app.utils import fields

from zou.app.services import tasks_service

from zou.app.services.exception import (
    PlaylistNotFoundException,
    ShotNotFoundException
)


def all_playlists_for_project(project_id):
    """
    Return all playlists created for given project.
    """
    return fields.serialize_value(Playlist.get_all_by(project_id=project_id))


def all_playlists_for_episode(episode_id):
    """
    Return all playlists created for given project.
    """
    return fields.serialize_value(Playlist.get_all_by(episode_id=episode_id))


def get_playlist_with_preview_file_revisions(playlist_id):
    """
    Return given playlist. Shot list is augmented with all previews available
    for a given shot.
    """
    playlist = Playlist.get(playlist_id)

    if playlist is None:
        raise PlaylistNotFoundException()

    playlist_dict = playlist.serialize()

    if playlist_dict["shots"] is None:
        playlist_dict["shots"] = []

    for shot in playlist_dict["shots"]:
        try:
            shot["preview_files"] = get_preview_files_for_shot(
                shot["shot_id"]
            )
        except ShotNotFoundException:
            playlist_dict["shots"].remove(shot)
    return playlist_dict


def get_preview_files_for_shot(shot_id):
    """
    Get all preview files available for given shot.
    """
    tasks = tasks_service.get_tasks_for_shot(shot_id)
    previews = {}

    for task in tasks:
        preview_files = PreviewFile.query \
            .filter_by(task_id=task["id"]) \
            .order_by(PreviewFile.revision.desc()) \
            .all()
        task_type_id = task["task_type_id"]

        if len(preview_files) > 0:
            previews[task_type_id] = [
                {
                    "id": str(preview_file.id),
                    "revision": preview_file.revision
                }
                for preview_file in preview_files
            ]  # Do not add too much field to avoid building too big responses

    return previews


def get_preview_files_for_entity(entity_id):
    """
    Get all preview files available for given entity.
    """
    tasks = tasks_service.get_task_dicts_for_entity(entity_id)
    previews = {}

    for task in tasks:
        preview_files = PreviewFile.query \
            .filter_by(task_id=task["id"]) \
            .filter_by(extension="mp4") \
            .order_by(PreviewFile.revision.desc()) \
            .all()
        task_type_id = task["task_type_id"]

        if len(preview_files) > 0:
            previews[task_type_id] = [
                {
                    "id": str(preview_file.id),
                    "revision": preview_file.revision
                }
                for preview_file in preview_files
            ]  # Do not add too much field to avoid building too big responses

    return previews
