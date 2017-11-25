from sqlalchemy.exc import StatementError, IntegrityError

from zou.app.utils import events, fields

from zou.app.models.entity import Entity
from zou.app.models.entity_type import EntityType
from zou.app.models.project import Project
from zou.app.models.task import Task
from zou.app.models.task_status import TaskStatus
from zou.app.models.task_type import TaskType

from zou.app.services import shots_service, projects_service

from zou.app.services.exception import (
    AssetNotFoundException,
    AssetTypeNotFoundException
)


def get_asset_types(criterions={}):
    shot_type = shots_service.get_shot_type()
    sequence_type = shots_service.get_sequence_type()
    episode_type = shots_service.get_episode_type()
    scene_type = shots_service.get_scene_type()
    asset_type_filter = ~EntityType.id.in_([
        shot_type["id"],
        sequence_type["id"],
        episode_type["id"],
        scene_type["id"],
    ])
    query = EntityType.query \
        .filter_by(**criterions) \
        .filter(asset_type_filter)
    return EntityType.serialize_list(query.all(), obj_type="AssetType")


def get_asset_types_for_project(project_id):
    asset_type_ids = [
        x["entity_type_id"] for x in get_assets({"project_id": project_id})
    ]

    if len(asset_type_ids) > 0:
        query = EntityType.query
        query = query.filter(EntityType.id.in_(asset_type_ids))
        result = query.all()
    else:
        result = []
    return EntityType.serialize_list(result, obj_type="AssetType")


def get_asset_types_for_shot(shot_id):
    shot = Entity.get(shot_id)
    asset_type_ids = [x.entity_type_id for x in shot.entities_out]

    if len(asset_type_ids) > 0:
        query = EntityType.query
        query = query.filter(EntityType.id.in_(asset_type_ids))
        result = query.all()
    else:
        result = []
    return EntityType.serialize_list(result, obj_type="AssetType")


def get_assets(criterions={}):
    shot_type = shots_service.get_shot_type()
    scene_type = shots_service.get_scene_type()
    sequence_type = shots_service.get_sequence_type()
    episode_type = shots_service.get_episode_type()
    query = Entity.query.filter_by(**criterions)
    result = query.filter(
        ~Entity.entity_type_id.in_([
            shot_type["id"],
            scene_type["id"],
            sequence_type["id"],
            episode_type["id"]
        ])
    ).all()
    return EntityType.serialize_list(result, obj_type="Asset")


def get_asset_raw(entity_id):
    try:
        entity = Entity.get(entity_id)
    except StatementError:
        raise AssetNotFoundException

    if entity is None or not is_asset(entity):
        raise AssetNotFoundException

    return entity


def get_asset(entity_id):
    return get_asset_raw(entity_id).serialize(obj_type="Asset")


def get_asset_type_raw(asset_type_id):
    try:
        asset_type = EntityType.get(asset_type_id)
    except StatementError:
        raise AssetTypeNotFoundException

    if asset_type is None or not is_asset_type(asset_type):
        raise AssetTypeNotFoundException

    return asset_type


def get_asset_type(asset_type_id):
    return get_asset_type_raw(asset_type_id).serialize(obj_type="AssetType")


def get_asset_by_shotgun_id(shotgun_id):
    assets = get_assets({"shotgun_id": shotgun_id})
    if len(assets) > 0:
        return assets[0]
    else:
        raise AssetNotFoundException


def get_raw_asset_by_shotgun_id(shotgun_id):
    asset = get_asset_by_shotgun_id(shotgun_id)
    return get_asset_raw(asset["id"])


def is_asset(entity):
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


def is_asset_type(asset_type):
    shot_type = shots_service.get_shot_type()
    sequence_type = shots_service.get_sequence_type()
    scene_type = shots_service.get_scene_type()
    episode_type = shots_service.get_episode_type()

    return str(asset_type.id) not in [
        shot_type["id"],
        sequence_type["id"],
        scene_type["id"],
        episode_type["id"],
    ]


def get_or_create_type(name):
    asset_type = EntityType.get_by(name=name)
    if asset_type is None:
        asset_type = EntityType(
            name=name
        )
        asset_type.save()
    return asset_type.serialize(obj_type="AssetType")


def get_asset_type_by_name(asset_type_name):
    asset_type = EntityType.get_by(name=asset_type_name)

    if asset_type is None or not is_asset_type(asset_type):
        raise AssetTypeNotFoundException

    return asset_type.serialize(obj_type="AssetType")


def save_asset_types(asset_type_names):
    asset_types = []
    for asset_type_name in asset_type_names:
        asset_type = save_asset_type(asset_type_name)
        asset_types.append(asset_type)
    return asset_types


def save_asset_type(asset_type_name):
    asset_type = EntityType.get_by(name=asset_type_name)
    if asset_type is None:
        asset_type = EntityType.create(name=asset_type_name)
    return asset_type.serialize(obj_type="AssetType")


def create_asset(project_id, asset_type_id, name, description):
    project = projects_service.get_project_raw(project_id)
    asset_type = get_asset_type_raw(asset_type_id)

    name = name.capitalize()
    asset = Entity(
        project_id=project_id,
        entity_type_id=asset_type_id,
        name=name,
        description=description
    )
    asset.save()
    asset_dict = asset.serialize(obj_type="Asset")
    events.emit("asset:new", {
        "asset": asset_dict,
        "asset_type": asset_type.serialize(obj_type="AssetType"),
        "project": project.serialize()
    })
    return asset_dict


def remove_asset(asset_id):
    asset = get_asset_raw(asset_id)
    try:
        asset.delete()
    except IntegrityError:
        asset.update({"canceled": True})
    deleted_asset = asset.serialize(obj_type="Asset")
    events.emit("asset:deletion", {
        "deleted_asset": deleted_asset
    })
    return deleted_asset


def add_asset_link(asset_in_id, asset_out_id):
    asset_in = get_asset_raw(asset_in_id)
    asset_out = get_asset_raw(asset_out_id)

    if asset_out not in asset_in.entities_out:
        asset_in.entities_out.append(asset_out)
        asset_in.save()
        events.emit("asset:new-link", {
            "asset_in": asset_in.serialize(obj_type="Asset"),
            "asset_out": asset_out.serialize(obj_type="Asset")
        })
    return asset_in.serialize(obj_type="Asset")


def remove_asset_link(asset_in_id, asset_out_id):
    asset_in = get_asset_raw(asset_in_id)
    asset_out = get_asset_raw(asset_out_id)

    if asset_out in asset_in.entities_out:
        asset_in.entities_out = \
            [x for x in asset_in.entities_out if x.id != asset_out]
        asset_in.save()
        events.emit("asset:remove-link", {
            "asset_in": asset_in.serialize(obj_type="Asset"),
            "asset_out": asset_out.serialize(obj_type="Asset")
        })
    return asset_in.serialize(obj_type="Asset")


def all_assets(criterions={}):
    shot_type = shots_service.get_shot_type()
    scene_type = shots_service.get_scene_type()
    sequence_type = shots_service.get_sequence_type()
    episode_type = shots_service.get_episode_type()
    query = Entity.query.filter_by(**criterions)
    query = query.filter(
        ~Entity.entity_type_id.in_([
            shot_type["id"],
            scene_type["id"],
            sequence_type["id"],
            episode_type["id"]
        ])
    )
    query = query.join(Project)
    query = query.join(EntityType)
    query = query.add_columns(Project.name)
    query = query.add_columns(EntityType.name)

    data = query.all()
    assets = []
    for (asset_model, project_name, asset_type_name) in data:
        asset = asset_model.serialize(obj_type="Asset")
        asset["project_name"] = project_name
        asset["asset_type_name"] = asset_type_name
        assets.append(asset)

    return assets


def get_task_status_map():
    return {
        status.id: status.serialize()
        for status in TaskStatus.query.all()
    }


def get_task_type_map():
    return {
        task_type.id: task_type.serialize()
        for task_type in TaskType.query.all()
    }


def get_asset_map(criterions={}):
    asset_map = {}

    shot_type = shots_service.get_shot_type()
    scene_type = shots_service.get_scene_type()
    sequence_type = shots_service.get_sequence_type()
    episode_type = shots_service.get_episode_type()
    asset_query = Entity.query \
        .join(EntityType) \
        .filter(
            ~Entity.entity_type_id.in_([
                shot_type["id"],
                scene_type["id"],
                sequence_type["id"],
                episode_type["id"]
            ])
        ) \
        .add_columns(EntityType.name)

    if "project_id" in criterions:
        asset_query = \
            asset_query.filter(Entity.project_id == criterions["project_id"])

    assets = asset_query.all()

    for (asset, entity_type_name) in assets:
        asset_id = str(asset.id)
        if asset.preview_file_id is not None:
            preview_file_id = str(asset.preview_file_id)
        else:
            preview_file_id = ""

        asset_map[asset_id] = {
            "id": str(asset.id),
            "name": asset.name,
            "preview_file_id": preview_file_id,
            "description": asset.description,
            "asset_type_name": entity_type_name,
            "canceled": asset.canceled,
            "data": fields.serialize_value(asset.data)
        }

    return asset_map


def all_assets_and_tasks(criterions={}):
    shot_type = shots_service.get_shot_type()
    sequence_type = shots_service.get_sequence_type()
    episode_type = shots_service.get_episode_type()
    scene_type = shots_service.get_scene_type()
    task_status_map = get_task_status_map()
    task_type_map = get_task_type_map()
    asset_map = get_asset_map(criterions)
    task_map = {}

    query = Task.query \
        .join(Entity) \
        .join(EntityType) \
        .filter(
            ~Entity.entity_type_id.in_([
                shot_type["id"],
                scene_type["id"],
                sequence_type["id"],
                episode_type["id"]
            ])
        )

    if "project_id" in criterions:
        query = query.filter(Entity.project_id == criterions["project_id"])

    tasks = query.all()

    for task in tasks:
        asset_id = str(task.entity_id)

        if asset_id not in task_map:
            task_map[asset_id] = []

        task_dict = {
            "id": str(task.id),
            "entity_id": asset_id
        }
        task_status = task_status_map[task.task_status_id]
        task_type = task_type_map[task.task_type_id]
        task_dict.update({
            "task_status_id": task_status["id"],
            "task_status_name": task_status["name"],
            "task_status_short_name": task_status["short_name"],
            "task_status_color": task_status["color"],
            "task_type_name": task_type["name"],
            "task_type_color": task_type["color"],
            "task_type_priority": task_type["priority"],
            "assignees": fields.serialize_value(task.assignees)
        })
        task_map[asset_id].append(task_dict)

    assets = []
    for asset in asset_map.values():
        asset["tasks"] = task_map.get(asset["id"], [])
        assets.append(asset)

    return assets


def cancel_asset(asset_id):
    asset = get_asset_raw(asset_id)
    asset.update({"canceled": True})
    asset_dict = asset.serialize(obj_type="Asset")
    events.emit("asset:deletion", {
        "deleted_asset": asset_dict
    })
    return asset_dict
