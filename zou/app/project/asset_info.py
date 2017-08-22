from sqlalchemy.exc import StatementError

from zou.app.utils import events

from zou.app.models.entity import Entity
from zou.app.models.entity_type import EntityType
from zou.app.models.project import Project
from zou.app.models.task import Task
from zou.app.models.task_status import TaskStatus
from zou.app.models.task_type import TaskType

from zou.app.project import shot_info

from zou.app.project.exception import (
    AssetNotFoundException,
    AssetTypeNotFoundException
)


def get_asset_types(criterions={}):
    shot_type = shot_info.get_shot_type()
    sequence_type = shot_info.get_sequence_type()
    episode_type = shot_info.get_episode_type()
    query = EntityType.query.filter_by(**criterions)
    return query.filter(
        ~EntityType.id.in_([
            shot_type.id,
            sequence_type.id,
            episode_type.id,
        ])
    ).all()


def get_assets(criterions={}):
    shot_type = shot_info.get_shot_type()
    sequence_type = shot_info.get_sequence_type()
    episode_type = shot_info.get_episode_type()
    query = Entity.query.filter_by(**criterions)
    return query.filter(
        ~Entity.entity_type_id.in_([
            shot_type.id,
            sequence_type.id,
            episode_type.id
        ])
    ).all()


def all_assets(criterions={}):
    shot_type = shot_info.get_shot_type()
    sequence_type = shot_info.get_sequence_type()
    episode_type = shot_info.get_episode_type()
    query = Entity.query.filter_by(**criterions)
    query = query.filter(
        ~Entity.entity_type_id.in_([
            shot_type.id,
            sequence_type.id,
            episode_type.id
        ])
    )
    query = query.join(Project)
    query = query.join(EntityType)
    query = query.add_columns(Project.name)
    query = query.add_columns(EntityType.name)

    data = query.all()
    assets = []
    for (asset_model, project_name, asset_type_name) in data:
        asset = asset_model.serialize()
        asset["project_name"] = project_name
        asset["asset_type_name"] = asset_type_name
        assets.append(asset)

    return assets


def all_assets_and_tasks(criterions={}):
    assets = all_assets(criterions)
    asset_ids = [asset["id"] for asset in assets]
    tasks = Task.query.filter(Entity.id.in_(asset_ids)).all()

    task_map = {}
    task_status_map = {
        status.id: status for status in TaskStatus.query.all()
    }
    task_type_map = {
        task_type.id: task_type for task_type in TaskType.query.all()
    }

    for task in tasks:
        asset_id = str(task.entity_id)
        if asset_id not in task_map:
            task_map[asset_id] = []
        task_dict = task.serialize()
        task_status = task_status_map[task.task_status_id]
        task_type = task_type_map[task.task_type_id]
        task_dict.update({
            "task_status_name": task_status.name,
            "task_status_short_name": task_status.short_name,
            "task_status_color": task_status.color,
            "task_type_name": task_type.name,
            "task_type_color": task_type.color,
            "task_type_priority": task_type.priority
        })
        task_map[asset_id].append(task_dict)

    for asset in assets:
        asset["tasks"] = task_map.get(asset["id"], [])

    return assets


def get_asset(entity_id):
    entity = Entity.get(entity_id)
    if entity is None or not is_asset(entity):
        raise AssetNotFoundException

    return entity


def is_asset(entity):
    shot_type = shot_info.get_shot_type()
    sequence_type = shot_info.get_sequence_type()
    episode_type = shot_info.get_episode_type()

    return entity.entity_type_id not in [
        shot_type.id,
        sequence_type.id,
        episode_type.id,
    ]


def is_asset_type(asset_type):
    shot_type = shot_info.get_shot_type()
    sequence_type = shot_info.get_sequence_type()
    episode_type = shot_info.get_episode_type()

    return asset_type.id not in [
        shot_type.id,
        sequence_type.id,
        episode_type.id,
    ]


def get_or_create_type(name):
    asset_type = EntityType.get_by(name=name)
    if asset_type is None:
        asset_type = EntityType(
            name=name
        )
        asset_type.save()
    return asset_type


def get_asset_type(asset_type_id):
    try:
        asset_type = EntityType.get(asset_type_id)
    except StatementError:
        raise AssetTypeNotFoundException

    if asset_type is None or not is_asset_type(asset_type):
        raise AssetTypeNotFoundException

    return asset_type


def get_asset_type_by_name(asset_type_name):
    asset_type = EntityType.get_by(name=asset_type_name)

    if asset_type is None or not is_asset_type(asset_type):
        raise AssetTypeNotFoundException

    return asset_type


def save_asset_types(asset_type_names):
    asset_types = []
    for asset_type_name in asset_type_names:
        asset_type = save_asset_type(asset_type_name)
        asset_types.append(asset_type)
    return asset_types


def save_asset_type(asset_type_name):
    asset_type = EntityType.get_by(name=asset_type_name)
    if asset_type is None:
        asset_type = EntityType(name=asset_type_name)
        asset_type.save()
    return asset_type


def create_asset(project, asset_type, name, description):
    name = name.capitalize()
    asset = Entity(
        project_id=project.id,
        entity_type_id=asset_type.id,
        name=name,
        description=description
    )
    asset.save()
    events.emit("asset:new", {
        "asset": asset.serialize(),
        "asset_type": asset_type.serialize(),
        "project": project.serialize()
    })
    return asset


def remove_asset(asset_id):
    asset = get_asset(asset_id)
    deleted_asset = asset.serialize()
    asset.delete()
    events.emit("asset:deletion", {
        "deleted_asset": deleted_asset
    })
    return deleted_asset


def add_asset_link(asset_in, asset_out):
    if asset_out not in asset_in.entities_out:
        asset_in.entities_out.append(asset_out)
        asset_in.save()
        events.emit("asset:new-link", {
            "asset_in": asset_in.serialize(),
            "asset_out": asset_out.serialize()
        })
    return asset_in


def remove_asset_link(asset_in, asset_out):
    if asset_out in asset_in.entities_out:
        asset_in.entities_out = \
            [x for x in asset_in.entities_out if x.id != asset_out]
        asset_in.save()
        events.emit("asset:remove-link", {
            "asset_in": asset_in.serialize(),
            "asset_out": asset_out.serialize()
        })
    return asset_in
