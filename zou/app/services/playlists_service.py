from zou.app.models.playlist import Playlist

from zou.app.utils import fields

from zou.app.services import shots_service

from zou.app.services.exception import PlaylistNotFoundException


def all_playlists_for_project(project_id):
    return fields.serialize_value(Playlist.get_all_by(project_id=project_id))


def get_playlist_with_preview_file_revisions(playlist_id):
    playlist = Playlist.get(playlist_id)

    if playlist is None:
        raise PlaylistNotFoundException()

    playlist_dict = playlist.serialize()

    if playlist_dict["shots"] is None:
        playlist_dict["shots"] = []

    for shot in playlist_dict["shots"]:
        shot["preview_files"] = shots_service.get_preview_files_for_shot(
            shot["shot_id"]
        )
    return playlist_dict
