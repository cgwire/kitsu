from datetime import date, timedelta

from zou.app.models.entity import Entity
from zou.app.models.entity_type import EntityType
from zou.app.models.milestone import Milestone
from zou.app.models.schedule_item import ScheduleItem
from zou.app.utils import events, fields
from zou.app.services import (
    assets_service,
    base_service,
    shots_service,
    tasks_service,
)


def get_schedule_items(project_id):
    """
    Get all project schedule items (mainly for sync purpose).
    """
    schedule_items = ScheduleItem.query.filter_by(project_id=project_id).all()
    return fields.serialize_list(schedule_items)


def get_task_types_schedule_items(project_id):
    """
    Return all schedule items for given project. If no schedule item exists
    for a given task type, it creates one.
    """
    task_types = tasks_service.get_task_types_for_project(project_id)
    task_type_map = base_service.get_model_map_from_array(task_types)
    schedule_items = set(
        ScheduleItem.query.filter_by(project_id=project_id)
        .filter(ScheduleItem.object_id == None)
        .all()
    )
    schedule_item_map = {
        str(schedule_item.task_type_id): schedule_item
        for schedule_item in schedule_items
    }

    new_schedule_items = set()
    schedule_item_to_remove = set()
    for schedule_item in schedule_items:
        if schedule_item.task_type_id is not None:
            if str(schedule_item.task_type_id) not in task_type_map:
                schedule_item_to_remove.add(schedule_item)

    for task_type in task_types:
        if task_type["id"] not in schedule_item_map:
            new_schedule_item = ScheduleItem.create(
                project_id=project_id,
                start_date=date.today(),
                end_date=date.today() + timedelta(days=1),
                task_type_id=task_type["id"],
            )
            new_schedule_items.add(new_schedule_item)
            events.emit(
                "schedule-item:new",
                {"schedule_item_id": str(new_schedule_item.id)},
            )

    schedule_items = (
        schedule_items.union(new_schedule_items) - schedule_item_to_remove
    )
    return sorted(
        [schedule_item.present() for schedule_item in schedule_items],
        key=lambda x: x["start_date"],
    )


def get_asset_types_schedule_items(project_id, task_type_id):
    """
    Return all asset type schedule items for given project. If no schedule item
    exists for a given asset type, it creates one.
    """
    asset_types = assets_service.get_asset_types_for_project(project_id)
    asset_type_map = base_service.get_model_map_from_array(asset_types)
    existing_schedule_items = set(
        ScheduleItem.query.join(
            EntityType, ScheduleItem.object_id == EntityType.id
        )
        .filter(ScheduleItem.project_id == project_id)
        .filter(ScheduleItem.task_type_id == task_type_id)
        .all()
    )
    return get_entity_schedule_items(
        project_id,
        task_type_id,
        asset_types,
        asset_type_map,
        existing_schedule_items,
    )


def get_episodes_schedule_items(project_id, task_type_id):
    """
    Return all episode schedule items for given project. If no schedule item
    exists for a given asset type, it creates one.
    """
    episode_type = shots_service.get_episode_type()
    episodes = shots_service.get_episodes_for_project(project_id)
    episodes_map = base_service.get_model_map_from_array(episodes)
    existing_schedule_items = set(
        ScheduleItem.query.join(Entity, ScheduleItem.object_id == Entity.id)
        .filter(ScheduleItem.project_id == project_id)
        .filter(Entity.entity_type_id == episode_type["id"])
        .filter(ScheduleItem.task_type_id == task_type_id)
        .all()
    )
    return get_entity_schedule_items(
        project_id,
        task_type_id,
        episodes,
        episodes_map,
        existing_schedule_items,
    )


def get_sequences_schedule_items(project_id, task_type_id, episode_id=None):
    """
    Return all asset type schedule items for given project. If no schedule item
    exists for a given asset type, it creates one.
    """
    if episode_id is not None:
        sequences = shots_service.get_sequences_for_episode(episode_id)
    else:
        sequences = shots_service.get_sequences_for_project(project_id)
    sequence_map = base_service.get_model_map_from_array(sequences)
    sequence_type = shots_service.get_sequence_type()

    query = (
        ScheduleItem.query.join(Entity, ScheduleItem.object_id == Entity.id)
        .filter(ScheduleItem.project_id == project_id)
        .filter(Entity.entity_type_id == sequence_type["id"])
        .filter(ScheduleItem.task_type_id == task_type_id)
    )
    if episode_id is not None:
        query = query.filter(Entity.parent_id == episode_id)
    existing_schedule_items = set(query.all())

    return get_entity_schedule_items(
        project_id,
        task_type_id,
        sequences,
        sequence_map,
        existing_schedule_items,
    )


def get_entity_schedule_items(
    project_id, task_type_id, to_create, to_create_map, existing_schedule_items
):
    schedule_item_map = {
        str(schedule_item.object_id): schedule_item
        for schedule_item in existing_schedule_items
    }

    new_schedule_items = set()
    schedule_item_to_remove = set()
    for schedule_item in existing_schedule_items:
        if schedule_item.object_id is not None:
            if str(schedule_item.object_id) not in to_create_map:
                schedule_item_to_remove.add(schedule_item)

    for entity in to_create:
        if entity["id"] not in schedule_item_map:
            new_schedule_item = ScheduleItem.create(
                project_id=project_id,
                start_date=date.today(),
                end_date=date.today() + timedelta(days=1),
                object_id=entity["id"],
                task_type_id=task_type_id,
            )
            events.emit(
                "schedule-item:new",
                {"schedule_item_id": str(new_schedule_item.id)},
            )
            new_schedule_items.add(new_schedule_item)

    schedule_items = (
        existing_schedule_items.union(new_schedule_items)
        - schedule_item_to_remove
    )

    results = []
    for schedule_item in schedule_items:
        result = schedule_item.present()
        result["name"] = to_create_map[result["object_id"]]["name"]
        results.append(result)

    return sorted(results, key=lambda x: x["name"])


def get_milestones_for_project(project_id):
    """
    Return all milestones related to given project.
    """
    query = Milestone.query.filter_by(project_id=project_id)
    return [milestone.present() for milestone in query.all()]
