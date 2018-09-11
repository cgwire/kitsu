from zou.app.models.playlist import Playlist
from zou.app.services import user_service

from .base import BaseModelResource, BaseModelsResource


class PlaylistsResource(BaseModelsResource):

    def __init__(self):
        BaseModelsResource.__init__(self, Playlist)

    def check_read_permissions(self):
        return True

    def check_create_permissions(self, playlist):
        user_service.check_manager_project_access(playlist["project_id"])


class PlaylistResource(BaseModelResource):

    def __init__(self):
        BaseModelResource.__init__(self, Playlist)

    def check_read_permissions(self, playlist):
        user_service.check_project_access(playlist["project_id"])

    def check_update_permissions(self, playlist, data):
        user_service.check_project_access(playlist["project_id"])
