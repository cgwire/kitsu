from zou.app.services import base_service
from zou.app.utils import cache, events, fields

from zou.app.models.entity import Entity, EntityLink
from zou.app.models.entity_type import EntityType
from zou.app.models.preview_file import PreviewFile
from zou.app.models.task import assignees_table
from zou.app.models.task import Task

from zou.app.services.exception import (
    PreviewFileNotFoundException,
    EntityNotFoundException,
    EntityTypeNotFoundException,
)


def clear_entity_type_cache(entity_type_id):
    cache.cache.delete_memoized(get_entity_type, entity_type_id)
    cache.cache.delete_memoized(get_entity_type_by_name)


@cache.memoize_function(240)
def get_entity_type(entity_type_id):
    """
    Return an entity type matching given id, as a dict. Raises an exception
    if nothing is found.
    """
    return base_service.get_instance(
        EntityType, entity_type_id, EntityTypeNotFoundException
    ).serialize()


@cache.memoize_function(240)
def get_entity_type_by_name(name):
    """
    Return entity type maching *name*. If it doesn't exist, it creates it.
    """
    entity_type = EntityType.get_by(name=name)
    if entity_type is None:
        entity_type = EntityType.create(name=name)
    return entity_type.serialize()


def get_entity_raw(entity_id):
    """
    Return an entity type matching given id, as an active record. Raises an
    exception if nothing is found.
    """
    return base_service.get_instance(Entity, entity_id, EntityNotFoundException)


@cache.memoize_function(120)
def get_entity(entity_id):
    """
    Return an entity type matching given id, as a dict. Raises an exception if
    nothing is found.
    """
    return base_service.get_instance(
        Entity, entity_id, EntityNotFoundException
    ).serialize()


def update_entity_preview(entity_id, preview_file_id):
    """
    Update given entity main preview. If entity or preview is not found, it
    raises an exception.
    """
    entity = Entity.get(entity_id)
    if entity is None:
        raise EntityNotFoundException

    preview_file = PreviewFile.get(preview_file_id)
    if preview_file is None:
        raise PreviewFileNotFoundException

    entity.update({"preview_file_id": preview_file.id})
    events.emit(
        "preview-file:set-main",
        {"entity_id": entity_id, "preview_file_id": preview_file_id},
    )
    entity_type = EntityType.get(entity.entity_type_id)
    entity_type_name = "asset"
    if entity_type.name in ["Shot", "Scene", "Sequence", "Episode"]:
        entity_type_name = entity_type.name.lower()
    events.emit(
        "%s:update" % entity_type_name,
        {"%s_id" % entity_type_name: str(entity.id)},
    )
    return entity.serialize()


def get_entities_for_project(project_id, entity_type_id, obj_type="Entity"):
    """
    Retrieve all entities related to given project of which entity is entity
    type.
    """
    result = (
        Entity.query.filter(Entity.entity_type_id == entity_type_id)
        .filter(Entity.project_id == project_id)
        .order_by(Entity.name)
        .all()
    )
    return Entity.serialize_list(result, obj_type=obj_type)


def get_entity_links_for_project(project_id):
    """
    Retrieve entity links for
    """
    result = (
        EntityLink.query.join(Entity, EntityLink.entity_in_id == Entity.id)
        .filter(Entity.project_id == project_id)
        .all()
    )
    return Entity.serialize_list(result)


def get_entities_and_tasks(criterions={}):
    """
    Get all entities for given criterions with related tasks for each entity.
    """
    entity_map = {}
    task_map = {}

    query = (
        Entity.query.outerjoin(Task, Task.entity_id == Entity.id)
        .outerjoin(assignees_table)
        .add_columns(
            Task.id,
            Task.task_type_id,
            Task.task_status_id,
            Task.priority,
            assignees_table.columns.person,
        )
    )

    if "entity_type_id" in criterions:
        query = query.filter(
            Entity.entity_type_id == criterions["entity_type_id"]
        )

    if "project_id" in criterions:
        query = query.filter(Entity.project_id == criterions["project_id"])

    for (
        entity,
        task_id,
        task_type_id,
        task_status_id,
        task_priority,
        person_id,
    ) in query.all():
        entity_id = str(entity.id)

        entity.data = entity.data or {}

        if entity_id not in entity_map:
            entity_map[entity_id] = {
                "id": str(entity.id),
                "name": entity.name,
                "description": entity.description,
                "frame_in": entity.data.get("frame_in", None),
                "frame_out": entity.data.get("frame_out", None),
                "fps": entity.data.get("fps", None),
                "preview_file_id": str(entity.preview_file_id or ""),
                "canceled": entity.canceled,
                "data": fields.serialize_value(entity.data),
                "tasks": [],
            }

        if task_id is not None:

            if task_id not in task_map:
                task_dict = {
                    "id": str(task_id),
                    "entity_id": entity_id,
                    "task_status_id": str(task_status_id),
                    "task_type_id": str(task_type_id),
                    "priority": task_priority or 0,
                    "assignees": [],
                }
                task_map[task_id] = task_dict
                entity_dict = entity_map[entity_id]
                entity_dict["tasks"].append(task_dict)

            if person_id:
                task_map[task_id]["assignees"].append(str(person_id))

    return list(entity_map.values())
