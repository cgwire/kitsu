from zou.app.models.playlist import Playlist

from zou.app.utils import fields


def all_playlists_for_project(project_id):
    return fields.serialize_value(Playlist.get_all_by(project_id=project_id))
