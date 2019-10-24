import datetime
import gzip
import logging
import os
import sys

import gazu
import sqlalchemy

from sh import pg_dump

from zou.app.models.build_job import BuildJob
from zou.app.models.custom_action import CustomAction
from zou.app.models.comment import Comment
from zou.app.models.department import Department
from zou.app.models.entity import Entity, EntityLink
from zou.app.models.entity_type import EntityType
from zou.app.models.event import ApiEvent
from zou.app.models.organisation import Organisation
from zou.app.models.metadata_descriptor import MetadataDescriptor
from zou.app.models.milestone import Milestone
from zou.app.models.news import News
from zou.app.models.notification import Notification
from zou.app.models.person import Person
from zou.app.models.playlist import Playlist
from zou.app.models.preview_file import PreviewFile
from zou.app.models.project import Project
from zou.app.models.project_status import ProjectStatus
from zou.app.models.schedule_item import ScheduleItem
from zou.app.models.subscription import Subscription
from zou.app.models.search_filter import SearchFilter
from zou.app.models.task import Task
from zou.app.models.task_status import TaskStatus
from zou.app.models.task_type import TaskType
from zou.app.models.time_spent import TimeSpent

from zou.app.stores import file_store
from flask_fs.backends.local import LocalBackend
from zou.app.utils import events, date_helpers

logger = logging.getLogger()
logger.setLevel(logging.INFO)
console_handler = logging.StreamHandler(sys.stdout)
formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
console_handler.setFormatter(formatter)
logger.addHandler(console_handler)

event_name_model_map = {
    "asset": Entity,
    "asset-type": EntityType,
    "build-job": BuildJob,
    "custom-action": CustomAction,
    "comment": Comment,
    "department": Department,
    "entity": Entity,
    "entity-link": EntityLink,
    "entity-type": EntityType,
    "episode": Entity,
    "event": ApiEvent,
    "organisation": Organisation,
    "metadata-descriptor": MetadataDescriptor,
    "milestone": Milestone,
    "news": News,
    "notification": Notification,
    "person": Person,
    "playlist": Playlist,
    "preview-file": PreviewFile,
    "project": Project,
    "project-status": ProjectStatus,
    "sequence": Entity,
    "shot": Entity,
    "schedule-item": ScheduleItem,
    "subscription": Subscription,
    "search-filter": SearchFilter,
    "task": Task,
    "task-status": TaskStatus,
    "task-type": TaskType,
    "time-spent": TimeSpent,
}

event_name_model_path_map = {
    "asset": "assets",
    "episode": "episodes",
    "sequence": "sequences",
    "shot": "shots",
    "build-job": "build-jobs",
    "custom-action": "custom-actions",
    "comment": "comments",
    "department": "departments",
    "entity": "entities",
    "entity-link": "entity-links",
    "asset-type": "entity-types",
    "entity-type": "entity-types",
    "event": "events",
    "organisation": "organisations",
    "metadata-descriptor": "metadata-descriptors",
    "milestone": "milestones",
    "news": "news",
    "notification": "notifications",
    "person": "persons",
    "playlist": "playlists",
    "preview-file": "preview-files",
    "project": "projects",
    "project-status": "project-status",
    "schedule-item": "schedule-items",
    "subscription": "subscriptions",
    "search-filter": "search-filters",
    "task": "tasks",
    "task-status": "task-status",
    "task-type": "task-types",
    "time-spent": "time-spents",
}

project_events = [
    "episode",
    "sequence",
    "asset",
    "shot",
    "task",
    "time-spent",
    "preview-file",
    "playlist",
    "build-job",
    "comment",
    "metadata-descriptor",
    "schedule-item",
    "subscription",
    "notification",
    "entity-link",
    "news",
    "milestone",
]

main_events = [
    "person",
    "organisation",
    "project-status",
    "department",
    "task-type",
    "task-status",
    "custom-action",
    "asset-type",
    "project",
]

special_events = [
    "preview-file:add-file",
    "preview-file:set-main",
    "shot:casting-update",
    "task:unassign",
    "task:assign",
]


def init(target, login, password):
    """
    Set parameters for the client that will retrieve data from the target.
    """
    gazu.set_host(target)
    gazu.log_in(login, password)


def init_events_listener(target, event_target, login, password, logs_dir=None):
    """
    Set parameters for the client that will listen to events from the target.
    """
    gazu.set_event_host(event_target)
    gazu.set_host(target)
    gazu.log_in(login, password)
    if logs_dir is not None:
        file_name = os.path.join(logs_dir, "zou_sync_changes.log")
        file_handler = logging.TimedRotatingFileHandler(file_name, when="D")

        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)

    return gazu.events.init()


def run_listeners(event_client):
    """
    Run event listener which will run all previously associated callbacks to
    """
    try:
        gazu.events.run_client(event_client)
    except KeyboardInterrupt:
        raise
    except Exception:
        logger.error("An error occured.", exc_info=1)
        run_listeners(event_client)


def run_main_data_sync():
    """
    Retrieve and import all cross-projects data from target instance.
    """
    for event in main_events:
        path = event_name_model_path_map[event]
        model = event_name_model_map[event]
        sync_entries(path, model)


def run_open_project_data_sync():
    """
    Retrieve and import all data related to projects from target instance.
    """
    projects = gazu.project.all_open_projects()
    for project in projects:
        logger.info("Syncing %s..." % project["name"])
        for event in project_events:
            path = event_name_model_path_map[event]
            model = event_name_model_map[event]
            sync_project_entries(project, path, model)
        sync_entity_thumbnails(project, "assets")
        sync_entity_thumbnails(project, "shots")
        logger.info("Sync of %s complete." % project["name"])


def run_other_sync():
    """
    Retrieve and import all search filters and events from target instance.
    """
    sync_entries("search-filters", SearchFilter)
    sync_entries("events", ApiEvent)


def run_last_events_sync():
    """
    Retrieve last events from target instance and import related data and
    action.
    """
    events = gazu.client.fetch_all("events/last")
    for event in events.reverse():
        event_name = event["name"]
        if event_name in event_name_model_map:
            sync_event(event)


def sync_event(event):
    """
    From information given by an event, retrieve related data and apply it.
    """
    event_name = event["name"]
    [event_name, action] = event_name.split(":")

    model = event_name_model_map[event_name]
    path = event_name_model_path_map[event_name]

    if event_name == "metadata-descriptor":  # Backward compatibility
        if "metadata_descriptor_id" not in event["data"]:
            event_name = "descriptor"
    instance_id = event["data"]["%s_id" % event_name.replace("-", "_")]

    if action in ["update", "new"]:
        instance = gazu.client.fetch_one(path, instance_id)
        model.create_from_import(instance)
    elif action in ["delete"]:
        model.delete_from_import(instance_id)


def sync_entries(model_name, model):
    """
    Retrieve cross-projects data from target instance.
    """
    instances = []

    if model_name in ["organisations", "persons"]:
        instances = gazu.client.fetch_all(model_name)
        model.create_from_import_list(instances)
    else:
        page = 1
        init = True
        results = {"nb_pages": 2}
        while init or results["nb_pages"] >= page:
            results = gazu.client.fetch_all("%s?page=%d" % (model_name, page))
            instances += results["data"]
            page += 1
            init = False
            model.create_from_import_list(results["data"])

    logger.info("%s %s synced." % (len(instances), model_name))


def sync_project_entries(project, model_name, model):
    """
    Retrieve all project data from target instance.
    """
    instances = []
    page = 1
    init = True
    results = {"nb_pages": 2}

    if model_name not in [
        "tasks",
        "comments",
        "notifications",
        "preview-files",
    ]:
        results = gazu.client.fetch_all(
            "projects/%s/%s" % (project["id"], model_name)
        )
        instances += results
        try:
            model.create_from_import_list(instances)
        except sqlalchemy.exc.IntegrityError:
            logger.error("An error occured", exc_info=1)

    else:
        while init or results["nb_pages"] >= page:
            results = gazu.client.fetch_all(
                "projects/%s/%s?page=%d" % (project["id"], model_name, page)
            )
            instances += results["data"]
            try:
                model.create_from_import_list(results["data"])
            except sqlalchemy.exc.IntegrityError:
                logger.error("An error occured", exc_info=1)
            page += 1
            init = False
    logger.info("    %s %s synced." % (len(instances), model_name))


def sync_entity_thumbnails(project, model_name):
    """
    Once every preview files and entities has been imported, this function
    allows you to import project entities again to set thumbnails (link to
    a preview file) all entities.
    """
    results = gazu.client.fetch_all(
        "projects/%s/%s" % (project["id"], model_name)
    )
    total = 0
    for result in results:
        if result.get("preview_file_id") is not None:
            entity = Entity.get(result["id"])
            try:
                entity.update(
                    {
                        "preview_file_id": result["preview_file_id"],
                        "updated_at": result["updated_at"],
                    }
                )
                total += 1
            except sqlalchemy.exc.IntegrityError:
                logger.error("An error occured", exc_info=1)
    logger.info("    %s %s thumbnails synced." % (total, model_name))


def add_main_sync_listeners(event_client):
    """
    Add listeners to manage CRUD events related to general data.
    """
    for event in main_events:
        path = event_name_model_path_map[event]
        model = event_name_model_map[event]
        add_sync_listeners(event_client, path, event, model)


def add_project_sync_listeners(event_client):
    """
    Add listeners to manage CRUD events related to open projects data.
    """
    for event in project_events:
        path = event_name_model_path_map[event]
        model = event_name_model_map[event]
        add_sync_listeners(event_client, path, event, model)


def add_special_sync_listeners(event_client):
    """
    Add listeners to forward all non CRUD events to local event broadcaster.
    """
    for event in special_events:
        gazu.events.add_listener(event_client, event, forward_event(event))


def add_sync_listeners(event_client, model_name, event_name, model):
    """
    Add Create, Update and Delete event listeners for givent model name to given
    event client.
    """
    gazu.events.add_listener(
        event_client,
        "%s:new" % event_name,
        create_entry(model_name, event_name, model, "new"),
    )
    gazu.events.add_listener(
        event_client,
        "%s:update" % event_name,
        create_entry(model_name, event_name, model, "update"),
    )
    gazu.events.add_listener(
        event_client,
        "%s:delete" % event_name,
        delete_entry(model_name, event_name, model),
    )


def create_entry(model_name, event_name, model, event_type):
    """
    Generate a function that creates a model each time a related creation event
    is retrieved. If it's an update event, it updates the model related to the
    event. Data are retrived through the HTTP client.
    It's useful to generate callbacks for event listener.
    """

    def create(data):
        if data.get("sync", False):
            return
        model_id_field_name = event_name.replace("-", "_") + "_id"
        model_id = data[model_id_field_name]
        try:
            instance = gazu.client.fetch_one(model_name, model_id)
            model.create_from_import(instance)
            forward_base_event(event_name, event_type, data)
            if event_type == "new":
                logger.info("Creation: %s %s" % (event_name, model_id))
            else:
                logger.info("Update: %s %s" % (event_name, model_id))
        except gazu.exception.RouteNotFoundException as e:
            logger.error("Route not found: %s" % e)
            logger.error("Fail %s created/updated %s" % (event_name, model_id))

    return create


def delete_entry(model_name, event_name, model):
    """
    Generate a function that delete a model each time a related deletion event
    is retrieved.
    It's useful to generate callbacks for event listener.
    """

    def delete(data):
        if data.get("sync", False):
            return
        model_id = data[event_name.replace("-", "_") + "_id"]
        model.delete_all_by(id=model_id)
        forward_base_event(event_name, "delete", data)
        logger.info("Deletion: %s %s" % (model_name, model_id))

    return delete


def forward_event(event_name):
    """
    Generate a function that takes data in argument and that forwards it as
    given event name to the local event brodcaster.
    It's useful to generate callbacks for event listener.
    """

    def forward(data):
        if not data.get("sync", False):
            data["sync"] = True
            logger.info("Forward event: %s" % event_name)
            events.emit(event_name, data, persist=False)

    return forward


def forward_base_event(event_name, event_type, data):
    """
    Forward given event to current instance event queue.
    """
    full_event_name = "%s:%s" % (event_name, event_type)
    data["sync"] = True
    logger.info("Forward event: %s" % full_event_name)
    events.emit(full_event_name, data)


def download_entity_thumbnails_from_storage():
    """
    Download all thumbnail files for non preview entries from object storage
    and store them locally.
    """
    for project in Project.query.all():
        download_entity_thumbnail(project)
    for organisation in Organisation.query.all():
        download_entity_thumbnail(organisation)
    for person in Person.query.all():
        download_entity_thumbnail(person)


def download_preview_files_from_storage():
    """
    Download all thumbnail and original files for preview entries from object
    storage and store them locally.
    """
    for preview_file in PreviewFile.query.all():
        download_preview(preview_file)


def download_entity_thumbnail(entity):
    """
    Download thumbnail file for given entity from object storage and store it
    locally.
    """
    preview_folder = os.getenv("PREVIEW_FOLDER", "/opt/zou/previews")
    local = LocalBackend(
        "local", {"root": os.path.join(preview_folder, "pictures")}
    )

    file_path = local.path("thumbnails-" + str(entity.id))
    dirname = os.path.dirname(file_path)
    if entity.has_avatar:
        if not os.path.exists(dirname):
            os.makedirs(dirname)
        with open(file_path, "wb") as tmp_file:
            for chunk in file_store.open_picture("thumbnails", str(entity.id)):
                tmp_file.write(chunk)


def download_file(file_path, prefix, dl_func, preview_file_id):
    """
    Download preview file for given preview from object storage and store it
    locally.
    """
    dirname = os.path.dirname(file_path)
    if not os.path.exists(dirname):
        os.makedirs(dirname)
    try:
        with open(file_path, "wb") as tmp_file:
            for chunk in dl_func(prefix, preview_file_id):
                tmp_file.write(chunk)
        print("%s downloaded" % file_path)
    except:
        pass


def download_preview(preview_file):
    """
    Download all files link to preview file entry: orginal file and variants.
    """
    print(
        "download preview %s (%s)" % (preview_file.id, preview_file.extension)
    )

    preview_folder = os.getenv("PREVIEW_FOLDER", "/opt/zou/previews")
    local_picture = LocalBackend(
        "local", {"root": os.path.join(preview_folder, "pictures")}
    )
    local_movie = LocalBackend(
        "local", {"root": os.path.join(preview_folder, "movies")}
    )
    local_file = LocalBackend(
        "local", {"root": os.path.join(preview_folder, "files")}
    )

    is_movie = preview_file.extension == "mp4"
    is_picture = preview_file.extension == "png"
    is_file = not is_movie and not is_picture

    preview_file_id = str(preview_file.id)
    file_key = "previews-%s" % preview_file_id
    if is_file:
        file_path = local_file.path(file_key)
        dl_func = file_store.open_picture
    elif is_movie:
        file_path = local_movie.path(file_key)
        dl_func = file_store.open_movie
    else:
        file_path = local_picture.path(file_key)
        dl_func = file_store.open_file

    if is_movie or is_picture:
        for prefix in ["thumbnails", "thumbnails-square", "original"]:
            pic_dl_func = file_store.open_picture
            pic_file_path = local_picture.path(
                "%s-%s" % (prefix, str(preview_file.id))
            )
            download_file(pic_file_path, prefix, pic_dl_func, preview_file_id)

    download_file(file_path, "previews", dl_func, preview_file_id)


def generate_db_backup(host, port, user, password, database):
    """
    Generate a Postgres dump file from the database.
    """
    now = datetime.datetime.now().strftime("%Y-%m-%d")
    filename = "%s-zou-db-backup.dump" % now
    with gzip.open(filename, "wb") as archive:
        pg_dump(
            "-h",
            host,
            "-p",
            port,
            "-U",
            user,
            database,
            _out=archive,
            _env={"PGPASSWORD": password},
        )
    return filename


def store_db_backup(filename):
    """
    Store given file located in the same directory, inside the files bucket
    using the `dbbackup` prefix.
    """
    from zou.app import app

    with app.app_context():
        file_store.add_file("dbbackup", filename, filename)


def upload_entity_thumbnails_to_storage(days=None):
    """
    Upload all thumbnail files for non preview entries to object storage.
    """
    upload_entity_thumbnails(Project, days)
    upload_entity_thumbnails(Organisation, days)
    upload_entity_thumbnails(Person, days)


def upload_entity_thumbnails(model, days=None):
    query = model.query
    if days is not None:
        limit_date = date_helpers.get_date_from_now(int(days))
        query = query.filter(model.updated_at >= limit_date)

    for entity in query.all():
        upload_entity_thumbnail(entity)


def upload_preview_files_to_storage(days=None):
    """
    Upload all thumbnail and original files for preview entries to object
    storage.
    """
    query = PreviewFile.query
    if days is not None:
        limit_date = date_helpers.get_date_from_now(int(days))
        query = query.filter(PreviewFile.updated_at >= limit_date)

    for preview_file in query.all():
        upload_preview(preview_file)


def upload_entity_thumbnail(entity):
    """
    Upload thumbnail file for given entity to object storage.
    """
    preview_folder = os.getenv("PREVIEW_FOLDER", "/opt/zou/previews")
    local = LocalBackend(
        "local", {"root": os.path.join(preview_folder, "pictures")}
    )

    file_path = local.path("thumbnails-" + str(entity.id))
    if entity.has_avatar:
        file_store.add_picture("thumbnails", str(entity.id), file_path)
        print("%s uploaded" % file_path)


def upload_preview(preview_file):
    """
    Upload all files link to preview file entry: orginal file and variants.
    """
    print("upload preview %s (%s)" % (preview_file.id, preview_file.extension))

    preview_folder = os.getenv("PREVIEW_FOLDER", "/opt/zou/previews")
    local_picture = LocalBackend(
        "local", {"root": os.path.join(preview_folder, "pictures")}
    )
    local_movie = LocalBackend(
        "local", {"root": os.path.join(preview_folder, "movies")}
    )
    local_file = LocalBackend(
        "local", {"root": os.path.join(preview_folder, "files")}
    )

    is_movie = preview_file.extension == "mp4"
    is_picture = preview_file.extension == "png"
    is_file = not is_movie and not is_picture

    preview_file_id = str(preview_file.id)
    file_key = "previews-%s" % preview_file_id
    if is_picture:
        file_path = local_picture.path(file_key)
        ul_func = file_store.add_picture
        exists_func = file_store.exists_picture
    elif is_movie:
        file_path = local_movie.path(file_key)
        ul_func = file_store.add_movie
        exists_func = file_store.exists_movie
    elif is_file:
        file_path = local_file.path(file_key)
        ul_func = file_store.add_file
        exists_func = file_store.exists_file

    if is_movie or is_picture:
        for prefix in ["thumbnails", "thumbnails-square", "original"]:
            pic_file_path = local_picture.path(
                "%s-%s" % (prefix, str(preview_file.id))
            )
            if os.path.exists(pic_file_path) and not file_store.exists_picture(
                prefix, preview_file_id
            ):
                file_store.add_picture(prefix, preview_file_id, pic_file_path)

    prefix = "previews"
    if os.path.exists(file_path) and not exists_func(prefix, preview_file_id):
        ul_func(prefix, preview_file_id, file_path)
    print("%s uploaded" % file_path)
