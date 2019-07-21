import gazu

from zou.app.models.build_job import BuildJob
from zou.app.models.custom_action import CustomAction
from zou.app.models.comment import Comment
from zou.app.models.department import Department
from zou.app.models.entity import Entity, EntityLink
from zou.app.models.entity_type import EntityType
from zou.app.models.event import ApiEvent
from zou.app.models.organisation import Organisation
from zou.app.models.metadata_descriptor import MetadataDescriptor
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

from zou.app.utils import events


def init(target, login, password):
    """
    Set parameters for the client that will retrieve data from the target.
    """
    gazu.set_host(target)
    gazu.log_in(login, password)


def init_events_listener(target, event_target, login, password):
    """
    Set parameters for the client that will listen to events from the target.
    """
    gazu.set_event_host(event_target)
    gazu.set_host(target)
    gazu.log_in(login, password)
    return gazu.events.init()


def run_listeners(event_client):
    """
    Run event listener which will run all previously associated callbacks to
    """
    gazu.events.run_client(event_client)


def sync_entity_thumbnails(project, model_name):
    results = gazu.client.fetch_all(
        "projects/%s/%s" % (project["id"], model_name)
    )
    total = 0
    for result in results:
        if result.get("preview_file_id") is not None:
            entity = Entity.get(result["id"])
            entity.update({
                "preview_file_id": result["preview_file_id"],
                "updated_at": result["updated_at"]
            })
            total += 1
    print("    %s %s thumbnails synced." % (total, model_name))


def run_main_data_sync():
    sync_entries("persons", Person)
    sync_entries("organisations", Organisation)
    sync_entries("project-status", ProjectStatus)
    sync_entries("departments", Department)
    sync_entries("task-types", TaskType)
    sync_entries("task-status", TaskStatus)
    sync_entries("custom-actions", CustomAction)
    sync_entries("entity-types", EntityType)
    sync_entries("projects", Project)


def run_open_project_data_sync():
    projects = gazu.project.all_open_projects()
    for project in projects:
        print("Syncing %s..." % project["name"])
        sync_project_entries(project, "episodes", Entity)
        sync_project_entries(project, "sequences", Entity)
        sync_project_entries(project, "assets", Entity)
        sync_project_entries(project, "shots", Entity)
        sync_project_entries(project, "tasks", Task)
        sync_project_entries(project, "time-spents", TimeSpent)
        sync_project_entries(project, "preview-files", PreviewFile)
        sync_project_entries(project, "playlists", Playlist)
        sync_project_entries(project, "build-jobs", BuildJob)
        sync_project_entries(project, "comments", Comment)
        sync_project_entries(
            project,
            "metadata-descriptors",
            MetadataDescriptor
        )
        sync_project_entries(project, "schedule-items", ScheduleItem)
        sync_project_entries(project, "subscriptions", Subscription)
        sync_project_entries(project, "notifications", Notification)
        sync_project_entries(project, "entity-links", EntityLink)
        sync_project_entries(project, "news", News)
        sync_entity_thumbnails(project, "assets")
        sync_entity_thumbnails(project, "shots")
        print("Sync of %s complete." % project["name"])


def run_other_sync():
    sync_entries("search-filters", SearchFilter)
    sync_entries("events", ApiEvent)


def sync_entries(model_name, model):
    instances = []

    if model_name in [
        "organisations",
        "persons"
    ]:
        instances = gazu.client.fetch_all(model_name)
    else:
        page = 1
        init = True
        results = {"nb_pages": 2}

        while init or results["nb_pages"] >= page:
            results = gazu.client.fetch_all(
                "%s?page=%d" % (model_name, page)
            )
            instances += results["data"]
            page += 1
            init = False

    model.create_from_import_list(instances)
    print("%s %s synced." % (len(instances), model_name))


def sync_project_entries(project, model_name, model):
    instances = []
    page = 1
    init = True
    results = {"nb_pages": 2}

    if model_name in [
        "assets",
        "build-jobs",
        "comments",
        "entity-links",
        "episodes",
        "events",
        "metadata-descriptors",
        "news",
        "notifications",
        "playlists",
        "preview-files",
        "sequences",
        "shots",
        "subscriptions"
    ]:
        results = gazu.client.fetch_all(
            "projects/%s/%s" % (project["id"], model_name)
        )
        instances += results
    else:
        while init or results["nb_pages"] >= page:
            results = gazu.client.fetch_all(
                "%s?project_id=%s&page=%d" % (model_name, project["id"], page)
            )
            instances += results["data"]
            page += 1
            init = False

    print("    %s %s synced." % (len(instances), model_name))
    model.create_from_import_list(instances)


def add_main_sync_listeners(event_client):
    add_sync_listeners(
        event_client, "custom-actions", "custom-action", CustomAction)
    add_sync_listeners(
        event_client, "entity-types", "asset-type", EntityType)
    add_sync_listeners(
        event_client, "organisations", "organisation", Organisation)
    add_sync_listeners(
        event_client, "persons", "person", Person)
    add_sync_listeners(
        event_client, "project-status", "project-status", Project)
    add_sync_listeners(
        event_client, "projects", "project", Project)
    add_sync_listeners(
        event_client, "task-types", "task-type", TaskType)
    add_sync_listeners(
        event_client, "task-status", "task-status", TaskStatus)
    add_sync_listeners(
        event_client, "news", "news", TaskStatus)


def add_project_sync_listeners(event_client):
    add_sync_listeners(
        event_client, "entities", "asset", Entity)
    add_sync_listeners(
        event_client, "entities", "shot", Entity)
    add_sync_listeners(
        event_client, "entities", "sequence", Entity)
    add_sync_listeners(
        event_client, "entities", "episodes", Entity)
    add_sync_listeners(
        event_client, "tasks", "task", Task)
    add_sync_listeners(
        event_client, "comments", "comment", Comment)
    add_sync_listeners(
        event_client, "preview-files", "preview-file", PreviewFile)
    add_sync_listeners(
        event_client, "playlists", "playlist", Playlist)
    add_sync_listeners(
        event_client, "time-spents", "time-spent", TimeSpent)
    add_sync_listeners(
        event_client, "build-jobs", "build-job", TimeSpent)


def add_sync_listeners(event_client, model_name, event_name, model):
    gazu.events.add_listener(
        event_client,
        "%s:new" % event_name,
        create_entry(model_name, event_name, model, "new")
        )
    gazu.events.add_listener(
        event_client,
        "%s:update" % event_name,
        create_entry(model_name, event_name, model, "update")
    )
    gazu.events.add_listener(
        event_client,
        "%s:delete" % event_name,
        delete_entry(model_name, event_name, model)
    )


def create_entry(model_name, event_name, model, event_type):
    def create(data):
        if data.get("sync", False):
            return
        model_id_field_name = event_name.replace('-', "_") + "_id"
        model_id = data[model_id_field_name]
        try:
            instance = gazu.client.fetch_one(model_name, model_id)
            model.create_from_import(instance)
            events.emit("%s:%s" % (event_name, event_type), {
                model_id_field_name: model_id,
                "sync": True
            })
            print("%s created/updated %s" % (event_name, model_id))
        except gazu.exception.RouteNotFoundException:
            print("Fail %s created/updated %s" % (event_name, model_id))
    return create


def delete_entry(model_name, event_name, model):
    def delete(data):
        if data.get("sync", False):
            return

        model_id = data[event_name.replace('-', "_") + "_id"]
        model.delete_all_by(id=model_id)
        print("%s deleted %s" % (model_name, model_id))
    return delete
