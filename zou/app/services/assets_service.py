from sqlalchemy.exc import StatementError

from zou.app.utils import events, fields, cache
from zou.app.utils import query as query_utils

from zou.app.models.entity import Entity
from zou.app.models.entity_type import EntityType
from zou.app.models.project import Project
from zou.app.models.task import Task
from zou.app.models.asset_instance import AssetInstance
from zou.app.models.task import assignees_table

from zou.app.services import (
    base_service,
    deletion_service,
    projects_service,
    shots_service,
)

from zou.app.services.exception import (
    AssetNotFoundException,
    AssetInstanceNotFoundException,
    AssetTypeNotFoundException,
)


def clear_asset_cache(asset_id):
    cache.cache.delete_memoized(get_asset, asset_id)
    cache.cache.delete_memoized(get_full_asset, asset_id)


def get_temporal_type_ids():
    shot_type = shots_service.get_shot_type()
    if shot_type is None:
        cache.cache.delete_memoized(shots_service.get_shot_type)
        shot_type = shots_service.get_shot_type()

    scene_type = shots_service.get_scene_type()
    if scene_type is None:
        cache.cache.delete_memoized(shots_service.get_scene_type)
        scene_type = shots_service.get_scene_type()

    sequence_type = shots_service.get_sequence_type()
    if sequence_type is None:
        cache.cache.delete_memoized(shots_service.get_sequence_type)
        sequence_type = shots_service.get_sequence_type()

    episode_type = shots_service.get_episode_type()
    if episode_type is None:
        cache.cache.delete_memoized(shots_service.get_episode_type)
        episode_type = shots_service.get_episode_type()

    ids_to_exclude = [shot_type["id"], sequence_type["id"], episode_type["id"]]
    if scene_type is not None:
        ids_to_exclude.append(scene_type["id"])

    return ids_to_exclude


def build_asset_type_filter():
    """
    Generate a query filter to filter entity that are assets (it means not shot,
    not sequence, not episode and not scene)
    """
    ids_to_exclude = get_temporal_type_ids()
    return ~Entity.entity_type_id.in_(ids_to_exclude)


def build_entity_type_asset_type_filter():
    """
    Generate a query filter to filter entity types that are asset types (it
    means not shot, not sequence, not episode and not scene)
    """
    ids_to_exclude = get_temporal_type_ids()
    return ~EntityType.id.in_(ids_to_exclude)


def get_assets(criterions={}):
    """
    Get all assets for given criterions.
    """
    query = Entity.query.filter(build_asset_type_filter())
    query = query_utils.apply_criterions_to_db_query(Entity, query, criterions)
    result = query.all()
    return EntityType.serialize_list(result, obj_type="Asset")


def get_full_assets(criterions={}):
    """
    Get all assets for given criterions with additional informations: project
    name and asset type name.
    """
    query = (
        Entity.query.filter_by(**criterions)
        .filter(build_asset_type_filter())
        .join(Project, EntityType)
        .add_columns(Project.name, EntityType.name)
        .order_by(Project.name, EntityType.name, Entity.name)
    )

    data = query.all()
    assets = []
    for (asset_model, project_name, asset_type_name) in data:
        asset = asset_model.serialize(obj_type="Asset")
        asset["project_name"] = project_name
        asset["asset_type_name"] = asset_type_name
        assets.append(asset)
    return assets


def get_assets_and_tasks(criterions={}, page=1):
    """
    Get all assets for given criterions with related tasks for each asset.
    """
    asset_map = {}
    task_map = {}

    query = (
        Entity.query.filter(build_asset_type_filter())
        .join(EntityType)
        .outerjoin(Task)
        .outerjoin(assignees_table)
        .add_columns(
            EntityType.name,
            Task.id,
            Task.task_type_id,
            Task.task_status_id,
            Task.priority,
            Task.estimation,
            Task.duration,
            Task.retake_count,
            Task.real_start_date,
            Task.end_date,
            Task.start_date,
            Task.due_date,
            Task.last_comment_date,
            assignees_table.columns.person,
        )
        .order_by(EntityType.name, Entity.name)
    )

    if "id" in criterions:
        query = query.filter(Entity.id == criterions["id"])

    if "project_id" in criterions:
        query = query.filter(Entity.project_id == criterions["project_id"])

    if "episode_id" in criterions:
        query = query.filter(Entity.source_id == criterions["episode_id"])

    for (
        asset,
        entity_type_name,
        task_id,
        task_type_id,
        task_status_id,
        task_priority,
        task_estimation,
        task_duration,
        task_retake_count,
        task_real_start_date,
        task_end_date,
        task_start_date,
        task_due_date,
        task_last_comment_date,
        person_id,
    ) in query.all():

        if asset.source_id is None:
            source_id = ""
        else:
            source_id = str(asset.source_id)

        if asset.id not in asset_map:
            asset_map[asset.id] = {
                "id": str(asset.id),
                "name": asset.name,
                "preview_file_id": str(asset.preview_file_id or ""),
                "description": asset.description,
                "asset_type_name": entity_type_name,
                "asset_type_id": str(asset.entity_type_id),
                "canceled": asset.canceled,
                "episode_id": source_id,
                "data": fields.serialize_value(asset.data),
                "tasks": [],
            }

        if task_id is not None:
            if task_id not in task_map:
                task_dict = {
                    "id": str(task_id),
                    "entity_id": str(asset.id),
                    "task_status_id": str(task_status_id),
                    "task_type_id": str(task_type_id),
                    "priority": task_priority or 0,
                    "estimation": task_estimation,
                    "duration": task_duration,
                    "retake_count": task_retake_count,
                    "real_start_date": fields.serialize_value(
                        task_real_start_date
                    ),
                    "end_date": fields.serialize_value(task_end_date),
                    "start_date": fields.serialize_value(task_start_date),
                    "due_date": fields.serialize_value(task_due_date),
                    "last_comment_date": fields.serialize_value(
                        task_last_comment_date
                    ),
                    "assignees": [],
                }
                task_map[task_id] = task_dict
                asset_dict = asset_map[asset.id]
                asset_dict["tasks"].append(task_dict)

            if person_id:
                task_map[task_id]["assignees"].append(str(person_id))

    return list(asset_map.values())


def get_asset_types(criterions={}):
    """
    Retrieve all asset types available.
    """
    query = EntityType.query.filter(build_entity_type_asset_type_filter())
    query = query_utils.apply_criterions_to_db_query(Entity, query, criterions)
    return EntityType.serialize_list(query.all(), obj_type="AssetType")


def get_asset_types_for_project(project_id):
    """
    Retrieve all asset types related to asset of a given project.
    """
    asset_type_ids = {
        x["entity_type_id"] for x in get_assets({"project_id": project_id})
    }

    if len(asset_type_ids) > 0:
        result = EntityType.query.filter(
            EntityType.id.in_(list(asset_type_ids))
        ).all()
    else:
        result = []
    return EntityType.serialize_list(result, obj_type="AssetType")


def get_asset_types_for_shot(shot_id):
    """
    Retrieve all asset types related to asset casted in a given shot.
    """
    shot = Entity.get(shot_id)
    asset_type_ids = {x.entity_type_id for x in shot.entities_out}

    if len(asset_type_ids) > 0:
        query = EntityType.query
        query = query.filter(EntityType.id.in_(list(asset_type_ids)))
        result = query.all()
    else:
        result = []
    return EntityType.serialize_list(result, obj_type="AssetType")


def get_asset_raw(entity_id):
    """
    Return a given asset as an active record.
    """
    try:
        entity = Entity.get(entity_id)
    except StatementError:
        raise AssetNotFoundException

    if entity is None or not is_asset(entity):
        raise AssetNotFoundException

    return entity


@cache.memoize_function(10)
def get_asset(entity_id):
    """
    Return a given asset as a dict.
    """
    return get_asset_raw(entity_id).serialize(obj_type="Asset")


def get_asset_by_shotgun_id(shotgun_id):
    """
    Return asset matching given shotgun ID as a dict.
    """
    assets = get_assets({"shotgun_id": shotgun_id})
    if len(assets) > 0:
        return assets[0]
    else:
        raise AssetNotFoundException


def get_raw_asset_by_shotgun_id(shotgun_id):
    """
    Return asset matching given shotgun ID as an active record.
    """
    asset = get_asset_by_shotgun_id(shotgun_id)
    return get_asset_raw(asset["id"])


@cache.memoize_function(3)
def get_full_asset(asset_id):
    """
    Return asset matching given id with additional information (project name,
    asset type name and tasks).
    """
    assets = get_assets_and_tasks({"id": asset_id})
    if len(assets) > 0:
        asset = get_asset(asset_id)
        asset_type_id = asset["entity_type_id"]
        asset_type = get_asset_type(asset_type_id)
        if asset_type is None:
            cache.cache.delete_memoized(get_asset_type, asset_type_id)
            asset_type = get_asset_type(asset_type_id)
        project = Project.get(asset["project_id"])

        asset["project_name"] = project.name
        asset["asset_type_id"] = asset_type["id"]
        asset["asset_type_name"] = asset_type["name"]
        del asset["source_id"]
        del asset["shotgun_id"]
        del asset["nb_frames"]
        del asset["parent_id"]
        del asset["entities_in"]
        asset.update(assets[0])
        return asset
    else:
        raise AssetNotFoundException


def get_asset_instance_raw(asset_instance_id):
    """
    Return given asset instance as active record.
    """
    return base_service.get_instance(
        AssetInstance, asset_instance_id, AssetInstanceNotFoundException
    )


def get_asset_instance(asset_instance_id):
    """
    Return given asset instance as a dict.
    """
    return get_asset_instance_raw(asset_instance_id).serialize()


def get_asset_type_raw(asset_type_id):
    """
    Return given asset type instance as active record.
    """
    try:
        asset_type = EntityType.get(asset_type_id)
    except StatementError:
        raise AssetTypeNotFoundException

    if asset_type is None or not is_asset_type(asset_type):
        raise AssetTypeNotFoundException

    return asset_type


def get_asset_type(asset_type_id):
    """
    Return given asset type instance as a dict.
    """
    return get_asset_type_raw(asset_type_id).serialize(obj_type="AssetType")


def get_or_create_asset_type(name):
    """
    For a given name, get matching asset type. Create if it does not exist.
    """
    asset_type = EntityType.get_by(name=name)
    if asset_type is None:
        asset_type = EntityType.create(name=name)
    return asset_type.serialize(obj_type="AssetType")


def get_asset_type_by_name(asset_type_name):
    """
    Return asset type matching given name.
    """
    asset_type = EntityType.get_by(name=asset_type_name)
    if asset_type is None or not is_asset_type(asset_type):
        raise AssetTypeNotFoundException
    return asset_type.serialize(obj_type="AssetType")


def is_asset(entity):
    """
    Returns true if given entity is an asset, not a shot.
    """
    shot_type = shots_service.get_shot_type()
    sequence_type = shots_service.get_sequence_type()
    scene_type = shots_service.get_scene_type()
    episode_type = shots_service.get_episode_type()

    return str(entity.entity_type_id) not in [
        shot_type["id"],
        scene_type["id"],
        sequence_type["id"],
        episode_type["id"],
    ]


def is_asset_type(entity_type):
    """
    Returns true if given entity type is an asset, not a shot.
    """
    shot_type = shots_service.get_shot_type()
    sequence_type = shots_service.get_sequence_type()
    scene_type = shots_service.get_scene_type()
    episode_type = shots_service.get_episode_type()

    return str(entity_type.id) not in [
        shot_type["id"],
        sequence_type["id"],
        scene_type["id"],
        episode_type["id"],
    ]


def create_asset_types(asset_type_names):
    """
    For each name, create a new asset type.
    """
    asset_types = []
    for asset_type_name in asset_type_names:
        asset_type = get_or_create_asset_type(asset_type_name)
        asset_types.append(asset_type)

        events.emit(
            "asset-type:new", {"name": asset_type_name, "id": asset_type["id"]}
        )
    return asset_types


def create_asset(
    project_id, asset_type_id, name, description, data, source_id=None
):
    """
    Create a new asset from given parameters.
    """
    project = projects_service.get_project_raw(project_id)
    asset_type = get_asset_type_raw(asset_type_id)
    asset = Entity.create(
        project_id=project_id,
        entity_type_id=asset_type_id,
        name=name,
        description=description,
        data=data,
    )
    asset_dict = asset.serialize(obj_type="Asset")
    events.emit(
        "asset:new",
        {
            "asset_id": asset.id,
            "asset_type": asset_type.id,
            "project_id": project.id,
        },
    )
    return asset_dict


def update_asset(asset_id, data):
    asset = get_asset_raw(asset_id)
    asset.update(data)
    events.emit("asset:update", {"asset_id": asset_id, "data": data})
    return asset.serialize(obj_type="Asset")


def remove_asset(asset_id, force=False):
    asset = get_asset_raw(asset_id)
    is_tasks_related = Task.query.filter_by(entity_id=asset_id).count() > 0

    if is_tasks_related and not force:
        asset.update({"canceled": True})
        clear_asset_cache(str(asset_id))
        events.emit("asset:update", {"asset_id": asset_id})
    else:
        from zou.app.services import tasks_service

        tasks = Task.query.filter_by(entity_id=asset_id).all()
        for task in tasks:
            deletion_service.remove_task(task.id, force=True)
            tasks_service.clear_task_cache(str(task.id))
        asset.delete()
        clear_asset_cache(str(asset_id))
        events.emit("asset:delete", {"asset_id": asset_id})
    deleted_asset = asset.serialize(obj_type="Asset")
    return deleted_asset


def add_asset_link(asset_in_id, asset_out_id):
    """
    Link asset together, mark asset_in as asset out dependency.
    """
    asset_in = get_asset_raw(asset_in_id)
    asset_out = get_asset_raw(asset_out_id)

    if asset_out not in asset_in.entities_out:
        asset_in.entities_out.append(asset_out)
        asset_in.save()
        events.emit(
            "asset:new-link",
            {"asset_in": asset_in.id, "asset_out": asset_out.id},
        )
    return asset_in.serialize(obj_type="Asset")


def remove_asset_link(asset_in_id, asset_out_id):
    """
    Remove link asset together, unmark asset_in as asset out dependency.
    """
    asset_in = get_asset_raw(asset_in_id)
    asset_out = get_asset_raw(asset_out_id)

    if asset_out in asset_in.entities_out:
        asset_in.entities_out = [
            x for x in asset_in.entities_out if x.id != asset_out_id
        ]
        asset_in.save()
        events.emit(
            "asset:remove-link",
            {"asset_in": asset_in.id, "asset_out": asset_out.id},
        )
    return asset_in.serialize(obj_type="Asset")


def cancel_asset(asset_id, force=True):
    """
    Set cancel flag on asset to true. Send an event to event queue.
    """
    asset = get_asset_raw(asset_id)

    asset.update({"canceled": True})
    asset_dict = asset.serialize(obj_type="Asset")
    events.emit("asset:delete", {"asset_id": asset_id})
    return asset_dict
