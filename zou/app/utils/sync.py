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

from zou.app.utils import events

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
    "time-spent": TimeSpent
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
    "time-spent": "time-spents"
}

project_events = [
    "episodes",
    "sequences",
    "assets",
    "shots",
    "tasks",
    "time-spents"
    "preview-files",
    "playlists",
    "build-jobs",
    "comments",
    "metadata-descriptors",
    "schedule-items",
    "subscriptions",
    "notifications",
    "entity-links",
    "news",
    "milestones"
]

main_events = [
    "person",
    "organisation",
    "project-status",
    "departements",
    "task-types",
    "task-status",
    "custom-actions",
    "asset-types",
    "projects"
]


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
    for event in main_events:
        path = event_name_model_path_map[event]
        model = event_name_model_map[event]
        sync_entries(path, model)


def run_open_project_data_sync():
    projects = gazu.project.all_open_projects()
    for project in projects:
        print("Syncing %s..." % project["name"])
        for event in project_events:
            path = event_name_model_path_map[event]
            model = event_name_model_map[event]
            sync_project_entries(path, model)
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

            model.create_from_import_list(results["data"])
            print("%s %s synced." % (len(results["data"]), model_name))
    print("%s %s synced." % (len(instances), model_name))


def sync_project_entries(project, model_name, model):
    instances = []
    page = 1
    init = True
    results = {"nb_pages": 2}

    if model_name not in [
        "tasks",
        "schedule-items"
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
    for event in main_events:
        path = event_name_model_path_map[event]
        model = event_name_model_map[event]
        add_sync_listeners(event_client, path, event, model)


def add_project_sync_listeners(event_client):
    for event in project_events:
        path = event_name_model_path_map[event]
        model = event_name_model_map[event]
        add_sync_listeners(event_client, path, event, model)


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
            import os
            full_event_name = "%s:%s" % (event_name, event_type)
            print("emit", os.getenv("KV_PORT"), full_event_name)
            events.emit(full_event_name, {
                model_id_field_name: model_id,
                "sync": True
            })
            print("%s created/updated %s" % (event_name, model_id))
        except gazu.exception.RouteNotFoundException as e:
            print(e)
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


def run_last_events_sync():
    events = gazu.client.fetch_all("events/last")

    for event in events:
        event_name = event["name"]
        [event_name, action] = event_name.split(":")

        if event_name in event_name_model_map:
            model = event_name_model_map[event_name]
            path = event_name_model_path_map[event_name]
            instance_id = event["data"]["%s_id" % event_name.replace("-", "_")]

            if action in ["update", "create"]:
                instance = gazu.client.fetch_one(path, instance_id)
                model.create_from_import(instance)
            elif action in ["delete"]:
                model.delete_from_import(instance_id)
