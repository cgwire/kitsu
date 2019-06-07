import os
from slugify import slugify

from shutil import copyfile
from zipfile import ZipFile

from flask_mail import Message

from zou.app import config
from zou.app.stores import file_store

from zou.app.models.build_job import BuildJob
from zou.app.models.playlist import Playlist
from zou.app.models.preview_file import PreviewFile
from zou.app.models.task import Task
from zou.app.models.task_type import TaskType

from zou.app.utils import fields, movie_utils, events

from zou.app.services import (
    base_service,
    projects_service,
    tasks_service,
    names_service
)

from zou.app.services.exception import (
    BuildJobNotFoundException,
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

    playlist_dict["build_jobs"] = []
    for build_job in reversed(playlist.build_jobs):
        playlist_dict["build_jobs"].append(fields.serialize_dict({
          "id": build_job.id,
          "status": build_job.status,
          "created_at": build_job.created_at
        }))

    if playlist_dict["shots"] is None:
        playlist_dict["shots"] = []

    for shot in playlist_dict["shots"]:
        try:
            preview_file = PreviewFile.get(shot["preview_file_id"])
            if preview_file is None or preview_file.extension != 'mp4':
                preview_file = PreviewFile.query \
                    .filter_by(task_id=preview_file.task_id) \
                    .filter_by(extension="mp4") \
                    .join(Task) \
                    .join(TaskType) \
                    .order_by(TaskType.priority.desc()) \
                    .order_by(TaskType.name) \
                    .order_by(PreviewFile.revision.desc()) \
                    .first()
            if preview_file is not None:
                shot["preview_file_id"] = str(preview_file.id)
                shot["extension"] = preview_file.extension
                shot["annotations"] = preview_file.annotations
                shot["task_id"] = fields.serialize_value(preview_file.task_id)
            else:
                del shot["preview_file_id"]
        except Exception as e:
            print(e)

        try:
            shot["preview_files"] = get_preview_files_for_shot(shot["shot_id"])
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
            .filter_by(extension="mp4") \
            .join(Task) \
            .join(TaskType) \
            .order_by(TaskType.priority.desc()) \
            .order_by(TaskType.name) \
            .order_by(PreviewFile.revision.desc()) \
            .all()
        task_type_id = task["task_type_id"]

        if len(preview_files) > 0:
            previews[task_type_id] = [
                {
                    "id": str(preview_file.id),
                    "revision": preview_file.revision,
                    "extension": preview_file.extension,
                    "annotations": preview_file.annotations,
                    "task_id": str(preview_file.task_id)
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
            .join(Task) \
            .join(TaskType) \
            .order_by(TaskType.priority.desc()) \
            .order_by(TaskType.name) \
            .order_by(PreviewFile.revision.desc()) \
            .all()
        task_type_id = task["task_type_id"]

        if len(preview_files) > 0:
            previews[task_type_id] = [
                {
                    "id": str(preview_file.id),
                    "revision": preview_file.revision,
                    "extension": preview_file.extension,
                    "task_id": str(preview_file.task_id)
                }
                for preview_file in preview_files
            ]  # Do not add too much field to avoid building too big responses

    return previews


def get_playlist_raw(playlist_id):
    """
    Return given playlist as active record.
    """
    return base_service.get_instance(
        Playlist,
        playlist_id,
        PlaylistNotFoundException
    )


def get_playlist(playlist_id):
    """
    Return given playlist as a dict.
    """
    return get_playlist_raw(playlist_id).serialize()


def retrieve_playlist_tmp_files(playlist):
    """
    Retrieve all files for a given playlist into the temporary folder.
    """
    preview_file_ids = []
    for shot in playlist["shots"]:
        if shot["preview_file_id"] is not None \
           and len(shot["preview_file_id"]) > 0:
            preview_file = PreviewFile.get(shot["preview_file_id"])
            if preview_file is not None and preview_file.extension == "mp4":
                preview_file_ids.append(preview_file.id)

    file_paths = []
    for preview_file_id in preview_file_ids:
        if config.FS_BACKEND == "local":
            file_path = file_store.get_local_movie_path(
                "previews",
                preview_file_id
            )
        else:
            file_path = os.path.join(
                config.TMP_DIR,
                "cache-previews-%s.%s" % (preview_file_id, "mp4")
            )
            if not os.path.exists(file_path):
                with open(file_path, 'wb') as tmp_file:
                    for chunk in file_store.open_file(
                        "previews",
                        preview_file_id
                    ):
                        tmp_file.write(chunk)

        file_name = names_service.get_preview_file_name(preview_file_id)
        tmp_file_path = os.path.join(
            config.TMP_DIR,
            file_name
        )
        copyfile(file_path, tmp_file_path)
        file_paths.append((tmp_file_path, file_name))
    return file_paths


def build_playlist_zip_file(playlist):
    """
    Build a zip for all files for a given playlist into the temporary folder.
    """
    tmp_file_paths = retrieve_playlist_tmp_files(playlist)
    zip_file_path = get_playlist_zip_file_path(playlist)
    with ZipFile(zip_file_path, 'w') as zip:
        for file_path, file_name in tmp_file_paths:
            zip.write(file_path, file_name)
    return zip_file_path


def build_playlist_movie_file(playlist):
    """
    Build a movie for all files for a given playlist into the temporary folder.
    """
    job = start_build_job(playlist)
    tmp_file_paths = retrieve_playlist_tmp_files(playlist)
    movie_file_path = get_playlist_movie_file_path(playlist, job)
    movie_utils.build_playlist_movie(tmp_file_paths, movie_file_path)
    end_build_job(playlist, job)
    return movie_file_path


def start_build_job(playlist):
    """
    Register in database that a new build is running. Emits an event to notify
    clients that a new job is running.
    """
    job = BuildJob.create(
        status="running",
        job_type="movie",
        playlist_id=playlist["id"]
    )
    events.emit("build-job:new", {
        "build_job_id": str(job.id),
        "playlist_id": playlist["id"],
        "created_at": fields.serialize_value(job.created_at)
    })
    return job.serialize()


def end_build_job(playlist, job):
    """
    Register in database that a build is finished. Emits an event to notify
    clients that the build is done.
    """
    build_job = BuildJob.get(job["id"])
    build_job.end()
    events.emit("build-job:success", {
        "build_job_id": str(build_job.id),
        "playlist_id": playlist["id"]
    })
    return build_job.serialize()


def build_playlist_job(playlist, email):
    """
    Build playlist file (concatenate all mnovie previews). This function is
    aimed at being runned as a job in a job queue.
    """
    from zou.app import app, mail
    with app.app_context():
        build_playlist_movie_file(
            playlist
        )
        message_text = """
Your playlist %s is available at:
https://%s/api/data/playlists/%s/download/mp4
""" % (playlist["name"], config.DOMAIN_NAME, playlist["id"])
        message = Message(
            body=message_text,
            subject="CGWire playlist download",
            recipients=[email]
        )
        mail.send(message)


def get_playlist_file_name(playlist):
    """
    Build file name for the movie file matching given playlist.
    """
    project = projects_service.get_project(playlist["project_id"])
    attachment_filename = "%s_%s" % (
        project["name"],
        playlist["name"]
    )
    return slugify(attachment_filename)


def get_playlist_movie_file_path(playlist, build_job):
    """
    Build file path for the movie file matching given playlist.
    """
    movie_file_name = "%s-%s.mp4" % (
        get_playlist_file_name(playlist),
        build_job["id"]
    )
    return os.path.join(config.TMP_DIR, movie_file_name)


def get_playlist_zip_file_path(playlist):
    """
    Build file path for the archive file matching given playlist.
    """
    zip_file_name = "%s.zip" % get_playlist_file_name(playlist)
    return os.path.join(config.TMP_DIR, zip_file_name)


def get_build_job_raw(build_job_id):
    """
    Return given build job as active record.
    """
    return base_service.get_instance(
        BuildJob,
        build_job_id,
        BuildJobNotFoundException
    )


def get_build_job(build_job_id):
    """
    Return given build job as a dict.
    """
    return get_build_job_raw(build_job_id).serialize()


def remove_build_job(playlist, build_job_id):
    """
    Remove build job from database and remove related temporary file from
    hard drive.
    """
    job = BuildJob.get(build_job_id)
    movie_file_path = get_playlist_movie_file_path(playlist, job.serialize())
    if os.path.exists(movie_file_path):
        os.remove(movie_file_path)
    job.delete()
    events.emit("build-job:delete", {
        "build_job_id": build_job_id,
        "playlist_id": playlist["id"]
    })
    return movie_file_path
