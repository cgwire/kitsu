from flask_restful import Resource
from flask_jwt_extended import jwt_required

from zou.app.services import (
    playlists_service,
    user_service,
    shots_service,
    entities_service
)


class ProjectPlaylistsResource(Resource):

    @jwt_required
    def get(self, project_id):
        user_service.check_project_access(project_id)
        return playlists_service.all_playlists_for_project(project_id)


class EpisodePlaylistsResource(Resource):

    @jwt_required
    def get(self, project_id, episode_id):
        user_service.check_project_access(project_id)
        shots_service.get_episode(episode_id)
        return playlists_service.all_playlists_for_episode(episode_id)


class ProjectPlaylistResource(Resource):

    @jwt_required
    def get(self, project_id, playlist_id):
        user_service.check_project_access(project_id)
        return playlists_service.get_playlist_with_preview_file_revisions(
            playlist_id
        )


class EntityPreviewsResource(Resource):

    @jwt_required
    def get(self, entity_id):
        """
        Retrieve all previews related to a given entity. It sends them
        as a dict. Keys are related task type ids and values are arrays
        of preview for this task type.
        """
        entity = entities_service.get_entity(entity_id)
        user_service.check_project_access(entity["project_id"])
        return playlists_service.get_preview_files_for_entity(entity_id)
