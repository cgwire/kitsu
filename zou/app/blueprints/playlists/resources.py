import slugify

from flask import send_file as flask_send_file
from flask_restful import Resource
from flask_jwt_extended import jwt_required

from zou.app import config
from zou.app.utils import permissions

from zou.app.services import (
    entities_service,
    playlists_service,
    persons_service,
    projects_service,
    shots_service,
    user_service,
)
from zou.app.stores import file_store, queue_store
from zou.app.utils import fs


class ProjectPlaylistsResource(Resource):
    @jwt_required
    def get(self, project_id):
        user_service.check_project_access(project_id)
        return playlists_service.all_playlists_for_project(
            project_id,
            permissions.has_client_permissions()
        )


class EpisodePlaylistsResource(Resource):
    @jwt_required
    def get(self, project_id, episode_id):
        user_service.check_project_access(project_id)
        shots_service.get_episode(episode_id)
        return playlists_service.all_playlists_for_episode(
            episode_id,
            permissions.has_client_permissions()
        )


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
    def get(self, playlist_id, build_job_id):
        playlist = playlists_service.get_playlist(playlist_id)
        project = projects_service.get_project(playlist["project_id"])
        build_job = playlists_service.get_build_job(build_job_id)
        user_service.check_manager_project_access(playlist["project_id"])

        if build_job["status"] != "succeeded":
            return {"error": True, "message": "Build is not finished"}, 400
        else:
            movie_file_path = fs.get_file_path(
                config,
                file_store.get_local_movie_path,
                file_store.open_movie,
                "playlists",
                build_job_id,
                "mp4",
            )
            context_name = slugify.slugify(project["name"], separator="_")
            if project["production_type"] == "tvshow":
                episode = shots_service.get_episode(playlist["episode_id"])
                context_name += "_%s" % slugify.slugify(
                    episode["name"], separator="_"
                )
            attachment_filename = "%s_%s_%s.mp4" % (
                slugify.slugify(build_job["created_at"], separator="").replace(
                    "t", "_"
                ),
                context_name,
                slugify.slugify(playlist["name"], separator="_"),
            )
            return flask_send_file(
                movie_file_path,
                conditional=True,
                mimetype="video/mp4",
                as_attachment=True,
                attachment_filename=attachment_filename,
            )


class BuildPlaylistMovieResource(Resource):
    @jwt_required
    def get(self, playlist_id):
        playlist = playlists_service.get_playlist(playlist_id)
        user_service.check_manager_project_access(playlist["project_id"])

        if config.ENABLE_JOB_QUEUE:
            current_user = persons_service.get_current_user()
            queue_store.job_queue.enqueue(
                playlists_service.build_playlist_job,
                args=(playlist, current_user["email"]),
                job_timeout=7200,
            )
            return {"job": "running"}
        else:
            playlists_service.build_playlist_movie_file(playlist)
            return {"job": "succeeded"}


class PlaylistZipDownloadResource(Resource):
    @jwt_required
    def get(self, playlist_id):
        playlist = playlists_service.get_playlist(playlist_id)
        project = projects_service.get_project(playlist["project_id"])
        user_service.check_playlist_access(playlist)
        zip_file_path = playlists_service.build_playlist_zip_file(playlist)

        context_name = slugify.slugify(project["name"], separator="_")
        if project["production_type"] == "tvshow":
            episode = shots_service.get_episode(playlist["episode_id"])
            context_name += "_%s" % slugify.slugify(
                episode["name"], separator="_"
            )
        attachment_filename = "%s_%s.zip" % (
            context_name,
            slugify.slugify(playlist["name"], separator="_"),
        )

        return flask_send_file(
            zip_file_path,
            conditional=True,
            mimetype="application/zip",
            as_attachment=True,
            attachment_filename=attachment_filename,
        )


class BuildJobResource(Resource):
    @jwt_required
    def get(self, playlist_id, build_job_id):
        playlist = playlists_service.get_playlist(playlist_id)
        user_service.check_playlist_access(playlist)
        return playlists_service.get_build_job(build_job_id)

    @jwt_required
    def delete(self, playlist_id, build_job_id):
        playlist = playlists_service.get_playlist(playlist_id)
        user_service.check_playlist_access(playlist)
        playlists_service.remove_build_job(playlist, build_job_id)
        return "", 204


class ProjectBuildJobsResource(Resource):
    """
    Retrieve all build jobs related to given project.
    It's mainly used for synchronisation purpose.
    """

    @jwt_required
    def get(self, project_id):
        permissions.check_admin_permissions()
        projects_service.get_project(project_id)
        return playlists_service.get_build_jobs_for_project(project_id)
