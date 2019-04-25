import os

from slugify import slugify

from flask import send_file as flask_send_file
from flask_restful import Resource
from flask_jwt_extended import jwt_required

from zou.app import config

from zou.app.services import (
    entities_service,
    playlists_service,
    persons_service,
    projects_service,
    shots_service,
    user_service
)
from zou.app.stores import queue_store


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


class PlaylistDownloadResource(Resource):

    @jwt_required
    def get(self, playlist_id):
        playlist = playlists_service.get_playlist(playlist_id)
        user_service.check_project_access(playlist["project_id"])
        movie_file_path = playlists_service.get_playlist_movie_file_path(
            playlist
        )
        attachment_filename = movie_file_path.split(os.sep)[-1]
        return flask_send_file(
            movie_file_path,
            conditional=True,
            mimetype="video/mp4",
            as_attachment=True,
            attachment_filename=attachment_filename
        )


class BuildPlaylistMovieResource(Resource):

    @jwt_required
    def get(self, playlist_id):
        playlist = playlists_service.get_playlist(playlist_id)
        user_service.check_project_access(playlist["project_id"])

        if config.ENABLE_JOB_QUEUE:
            current_user = persons_service.get_current_user()
            queue_store.job_queue.enqueue(
                playlists_service.build_playlist_job,
                playlist,
                current_user["email"]
            )
            return {"job": "running"}
        else:
            movie_file_path = playlists_service.build_playlist_movie_file(
                playlist
            )
            attachment_filename = movie_file_path.split(os.sep)[-1]
            return flask_send_file(
                movie_file_path,
                conditional=True,
                mimetype="video/mp4",
                as_attachment=True,
                attachment_filename=attachment_filename
            )


class PlaylistZipDownloadResource(Resource):

    @jwt_required
    def get(self, playlist_id):
        playlist = playlists_service.get_playlist(playlist_id)
        user_service.check_project_access(playlist["project_id"])
        zip_file_path = playlists_service.build_playlist_zip_file(playlist)
        attachment_filename = zip_file_path.split(os.sep)[-1]
        return flask_send_file(
            zip_file_path,
            conditional=True,
            mimetype="application/zip",
            as_attachment=True,
            attachment_filename=attachment_filename
        )
