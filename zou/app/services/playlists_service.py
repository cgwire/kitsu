import os
from slugify import slugify

from shutil import copyfile
from zipfile import ZipFile

from flask import current_app
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
    files_service,
    projects_service,
    shots_service,
    tasks_service,
    names_service,
)

from zou.app.services.exception import (
    BuildJobNotFoundException,
    PlaylistNotFoundException,
)


def all_playlists_for_project(project_id, for_client=False):
    """
    Return all playlists created for given project.
    """
    result = []
    if for_client:
        print("toto")
        playlists = Playlist.get_all_by(project_id=project_id, for_client=True)
    else:
        playlists = Playlist.get_all_by(project_id=project_id)
    for playlist in fields.serialize_value(playlists):
        del playlist["shots"]
        result.append(playlist)
    return result


def all_playlists_for_episode(episode_id, for_client=False):
    """
    Return all playlists created for given project.
    """
    result = []
    if for_client:
        playlists = Playlist.get_all_by(episode_id=episode_id, for_client=True)
    else:
        playlists = Playlist.get_all_by(episode_id=episode_id)
    for playlist in fields.serialize_value(playlists):
        del playlist["shots"]
        result.append(playlist)
    return result


def get_playlist_with_preview_file_revisions(playlist_id=False):
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
        playlist_dict["build_jobs"].append(
            fields.serialize_dict(
                {
                    "id": build_job.id,
                    "status": build_job.status,
                    "created_at": build_job.created_at,
                }
            )
        )

    if playlist_dict["shots"] is None:
        playlist_dict["shots"] = []

    (playlist_dict, preview_file_map) = set_preview_files_for_shots(
        playlist_dict
    )

    for shot in playlist_dict["shots"]:
        try:
            preview_file = preview_file_map.get(shot["preview_file_id"], None)
            if preview_file is not None:
                shot["preview_file_id"] = str(preview_file.id)
                shot["extension"] = preview_file.extension
                shot["annotations"] = preview_file.annotations
                shot["task_id"] = fields.serialize_value(preview_file.task_id)
            else:
                del shot["preview_file_id"]
        except Exception as e:
            print(e)

    return playlist_dict


def set_preview_files_for_shots(playlist_dict):
    """
    """
    shot_ids = [shot["shot_id"] for shot in playlist_dict["shots"]]
    previews = {}
    preview_file_map = {}

    preview_files = (
        PreviewFile.query.filter_by(extension="mp4")
        .join(Task)
        .join(TaskType)
        .filter(Task.entity_id.in_(shot_ids))
        .order_by(TaskType.priority.desc())
        .order_by(TaskType.name)
        .order_by(PreviewFile.revision.desc())
        .add_column(Task.task_type_id)
        .add_column(Task.entity_id)
        .all()
    )

    for (preview_file, task_type_id, shot_id) in preview_files:
        shot_id = str(shot_id)
        task_type_id = str(task_type_id)
        if shot_id not in previews:
            previews[shot_id] = {}

        if task_type_id not in previews[shot_id]:
            previews[shot_id][task_type_id] = []

        task_id = str(preview_file.task_id)
        preview_file_id = str(preview_file.id)

        previews[shot_id][task_type_id].append(
            {
                "id": preview_file_id,
                "revision": preview_file.revision,
                "extension": preview_file.extension,
                "annotations": preview_file.annotations,
                "created_at": fields.serialize_value(preview_file.created_at),
                "task_id": task_id,
            }
        )  # Do not add too much field to avoid building too big responses

        preview_file_map[preview_file_id] = preview_file

    for shot in playlist_dict["shots"]:
        if str(shot["shot_id"]) in previews:
            shot["preview_files"] = previews[str(shot["shot_id"])]
        else:
            shot["preview_files"] = []

    return (fields.serialize_value(playlist_dict), preview_file_map)


def get_preview_files_for_shot(shot_id):
    """
    Get all preview files available for given shot.
    """
    tasks = tasks_service.get_tasks_for_shot(shot_id)
    previews = {}

    for task in tasks:
        preview_files = (
            PreviewFile.query.filter_by(task_id=task["id"])
            .filter_by(extension="mp4")
            .join(Task)
            .join(TaskType)
            .order_by(TaskType.priority.desc())
            .order_by(TaskType.name)
            .order_by(PreviewFile.revision.desc())
            .all()
        )
        task_type_id = task["task_type_id"]

        if len(preview_files) > 0:
            previews[task_type_id] = [
                {
                    "id": str(preview_file.id),
                    "revision": preview_file.revision,
                    "extension": preview_file.extension,
                    "annotations": preview_file.annotations,
                    "created_at": fields.serialize_value(
                        preview_file.created_at
                    ),
                    "task_id": str(preview_file.task_id),
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
        preview_files = (
            PreviewFile.query.filter_by(task_id=task["id"])
            .filter_by(extension="mp4")
            .join(Task)
            .join(TaskType)
            .order_by(TaskType.priority.desc())
            .order_by(TaskType.name)
            .order_by(PreviewFile.revision.desc())
            .all()
        )
        task_type_id = task["task_type_id"]

        if len(preview_files) > 0:
            previews[task_type_id] = [
                {
                    "id": str(preview_file.id),
                    "revision": preview_file.revision,
                    "extension": preview_file.extension,
                    "task_id": str(preview_file.task_id),
                }
                for preview_file in preview_files
            ]  # Do not add too much field to avoid building too big responses

    return previews


def get_playlist_raw(playlist_id):
    """
    Return given playlist as active record.
    """
    return base_service.get_instance(
        Playlist, playlist_id, PlaylistNotFoundException
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
        if (
            "preview_file_id" in shot
            and shot["preview_file_id"] is not None
            and len(shot["preview_file_id"]) > 0
        ):
            preview_file = files_service.get_preview_file(
                shot["preview_file_id"]
            )
            if preview_file is not None and preview_file["extension"] == "mp4":
                preview_file_ids.append(preview_file["id"])

    file_paths = []
    for preview_file_id in preview_file_ids:
        if config.FS_BACKEND == "local":
            file_path = file_store.get_local_movie_path(
                "previews", preview_file_id
            )
        else:
            file_path = os.path.join(
                config.TMP_DIR,
                "cache-previews-%s.%s" % (preview_file_id, "mp4"),
            )
            if not os.path.exists(file_path) or os.path.getsize(file_path) == 0:
                with open(file_path, "wb") as tmp_file:
                    for chunk in file_store.open_movie(
                        "previews", preview_file_id
                    ):
                        tmp_file.write(chunk)

        file_name = names_service.get_preview_file_name(preview_file_id)
        tmp_file_path = os.path.join(config.TMP_DIR, file_name)
        copyfile(file_path, tmp_file_path)
        file_paths.append((tmp_file_path, file_name))
    return file_paths


def build_playlist_zip_file(playlist):
    """
    Build a zip for all files for a given playlist into the temporary folder.
    """
    tmp_file_paths = retrieve_playlist_tmp_files(playlist)
    zip_file_path = get_playlist_zip_file_path(playlist)
    if os.path.exists(zip_file_path):
        os.remove(zip_file_path)
    with ZipFile(zip_file_path, "w") as zip:
        for file_path, file_name in tmp_file_paths:
            zip.write(file_path, file_name)
    return zip_file_path


def build_playlist_movie_file(playlist):
    """
    Build a movie for all files for a given playlist into the temporary folder.
    """
    job = start_build_job(playlist)
    project = projects_service.get_project(playlist["project_id"])
    tmp_file_paths = retrieve_playlist_tmp_files(playlist)
    movie_file_path = get_playlist_movie_file_path(playlist, job)
    (width, height) = shots_service.get_preview_dimensions(project)
    fps = shots_service.get_preview_fps(project)

    result = movie_utils.build_playlist_movie(
        tmp_file_paths, movie_file_path, width, height, fps
    )
    file_store.add_movie("playlists", job["id"], movie_file_path)
    end_build_job(playlist, job, result)
    return job


def start_build_job(playlist):
    """
    clients that a new job is running.
    Register in database that a new build is running. Emits an event to notify
    """
    job = BuildJob.create(
        status="running", job_type="movie", playlist_id=playlist["id"]
    )
    events.emit(
        "build-job:new",
        {
            "build_job_id": str(job.id),
            "playlist_id": playlist["id"],
            "created_at": fields.serialize_value(job.created_at),
        },
    )
    return job.serialize()


def end_build_job(playlist, job, result):
    """
    Register in database that a build is finished. Emits an event to notify
    clients that the build is done.
    """
    build_job = BuildJob.get(job["id"])
    build_job.end()
    status = "succeeded"
    if not result["success"]:
        status = "failed"
    events.emit(
        "build-job:update",
        {
            "build_job_id": str(build_job.id),
            "playlist_id": playlist["id"],
            "status": status,
        },
    )
    return build_job.serialize()


def build_playlist_job(playlist, email):
    """
    Build playlist file (concatenate all mnovie previews). This function is
    aimed at being runned as a job in a job queue.
    """
    from zou.app import app, mail

    with app.app_context():
        job = None
        try:
            job = build_playlist_movie_file(playlist)
        except:
            if job is not None:
                end_build_job(playlist, job)
            raise

        message_text = """
Your playlist %s is available at:
https://%s/api/data/playlists/%s/jobs/%s/build/mp4
""" % (
            playlist["name"],
            config.DOMAIN_NAME,
            playlist["id"],
            job["id"],
        )
        message = Message(
            body=message_text,
            subject="CGWire playlist download",
            recipients=[email],
        )
        mail.send(message)


def get_playlist_file_name(playlist):
    """
    Build file name for the movie file matching given playlist.
    """
    project = projects_service.get_project(playlist["project_id"])
    attachment_filename = "%s_%s" % (
        slugify(project["name"]),
        slugify(playlist["name"]),
    )
    return slugify(attachment_filename)


def get_playlist_movie_file_path(playlist, build_job):
    """
    Build file path for the movie file matching given playlist.
    """
    movie_file_name = "cache-playlists-%s.mp4" % build_job["id"]
    return os.path.join(config.TMP_DIR, movie_file_name)


def get_playlist_zip_file_path(playlist):
    """
    Build file path for the archive file matching given playlist.
    """
    zip_file_name = "%s.zip" % playlist["id"]
    return os.path.join(config.TMP_DIR, zip_file_name)


def get_build_job_raw(build_job_id):
    """
    Return given build job as active record.
    """
    return base_service.get_instance(
        BuildJob, build_job_id, BuildJobNotFoundException
    )


def get_build_job(build_job_id):
    """
    Return given build job as a dict.
    """
    return get_build_job_raw(build_job_id).serialize()


def remove_playlist(playlist_id):
    """
    Remove given playlist from database (and delete related build jobs).
    """
    playlist = get_playlist_raw(playlist_id)
    playlist_dict = playlist.serialize()
    query = BuildJob.query.filter_by(playlist_id=playlist_id)
    for job in query.all():
        remove_build_job(playlist_dict, job.id)
    playlist.delete()
    events.emit("playlist:delete", {"playlist_id": playlist_dict["id"]})
    return playlist_dict


def remove_build_job(playlist, build_job_id):
    """
    Remove build job from database and remove related temporary file from
    hard drive.
    """
    job = BuildJob.get(build_job_id)
    movie_file_path = get_playlist_movie_file_path(playlist, job.serialize())
    if os.path.exists(movie_file_path):
        os.remove(movie_file_path)
    try:
        file_store.remove_movie("playlists", build_job_id)
    except:
        current_app.logger.error(
            "Playlist file can't be deleted: %s" % build_job_id
        )
    job.delete()
    events.emit(
        "build-job:delete",
        {"build_job_id": build_job_id, "playlist_id": playlist["id"]},
    )
    return movie_file_path


def get_build_jobs_for_project(project_id):
    """
    Return all build_jobs for given project.
    """
    build_jobs = BuildJob.query.join(Playlist).filter(
        Playlist.project_id == project_id
    )
    return fields.serialize_list(build_jobs)
