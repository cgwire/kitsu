from slugify import slugify
from sqlalchemy import desc
from sqlalchemy.orm import aliased

from zou.app.models.asset_instance import AssetInstance
from zou.app.models.entity import Entity, EntityLink
from zou.app.models.entity_type import EntityType

from zou.app.utils import fields

from zou.app.services import (
    assets_service,
    shots_service,
    entities_service
)

"""
Breakdown can be represented in two ways:
* Relation entries linking an asset and a shot. A number of number of occurences
  can be mentioned.
* Storing an entry for each instance of an asset casted in a shot or a scene.

Warning: These two representations are not linked. Data are not synchronized.
"""


def get_casting(shot_id):
    """
    Return all assets and their number of occurences listed in given shot.
    """
    casting = []
    links = EntityLink.query \
        .filter_by(entity_in_id=shot_id) \
        .join(Entity, EntityLink.entity_out_id == Entity.id) \
        .join(EntityType, Entity.entity_type_id == EntityType.id) \
        .add_columns(Entity.name, EntityType.name, Entity.preview_file_id) \
        .order_by(EntityType.name, Entity.name)

    for (link, entity_name, entity_type_name, entity_preview_file_id) in links:
        casting.append({
            "asset_id": fields.serialize_value(link.entity_out_id),
            "asset_name": entity_name,
            "asset_type_name": entity_type_name,
            "preview_file_id": fields.serialize_value(entity_preview_file_id),
            "nb_occurences": link.nb_occurences
        })
    return casting


def update_casting(shot_id, casting):
    """
    Update casting for given shot. Casting is an array of dictionaries made of
    two fields: `asset_id` and `nb_occurences`.
    """
    shot = shots_service.get_shot_raw(shot_id)
    shot.update({"entities_out": []})
    for cast in casting:
        EntityLink.create(
            entity_in_id=shot.id,
            entity_out_id=cast["asset_id"],
            nb_occurences=cast["nb_occurences"]
        )
    return casting


def get_cast_in(asset_id):
    """
    Get the list of shots where an asset is casted in.
    """
    cast_in = []
    Sequence = aliased(Entity, name="sequence")
    Episode = aliased(Entity, name="episode")
    links = EntityLink.query \
        .filter_by(entity_out_id=asset_id) \
        .join(Entity, EntityLink.entity_in_id == Entity.id) \
        .join(Sequence, Entity.parent_id == Sequence.id) \
        .outerjoin(Episode, Sequence.parent_id == Episode.id) \
        .add_columns(
            Entity.name,
            Sequence.name,
            Episode.name,
            Entity.preview_file_id
        ) \
        .order_by(
            Episode.name,
            Sequence.name,
            Entity.name
        )

    for (
        link,
        entity_name,
        sequence_name,
        episode_name,
        entity_preview_file_id
    ) in links:
        shot = {
            "shot_id": fields.serialize_value(link.entity_in_id),
            "shot_name": entity_name,
            "sequence_name": sequence_name,
            "episode_name": episode_name,
            "preview_file_id": fields.serialize_value(entity_preview_file_id),
            "nb_occurences": link.nb_occurences
        }
        cast_in.append(shot)
    return cast_in


def get_asset_instances_for_entity(entity_id, entity_type_id=None):
    """
    Return all asset instances for given entity (shot or scene).

    Asset instances are a different way to represent the casting of a shot.
    """
    query = AssetInstance.query \
        .filter(AssetInstance.entity_id == entity_id) \
        .order_by(AssetInstance.asset_id, AssetInstance.number) \

    if entity_type_id is not None:
        query = query \
            .join(Entity, AssetInstance.asset_id == Entity.id) \
            .filter(Entity.entity_type_id == entity_type_id)
    instances = query.all()

    result = {}
    for instance in instances:
        asset_id = str(instance.asset_id)
        if asset_id not in result:
            result[asset_id] = []
        result[asset_id].append(instance.serialize())
    return result


def get_asset_instances_for_asset_and_entity_type(asset_id, entity_type_id):
    """
    Return all asset instances for given asset and entity type (shot or scene).
    """
    instances = AssetInstance.query \
        .filter(AssetInstance.asset_id == asset_id) \
        .filter(AssetInstance.entity_type_id == entity_type_id) \
        .order_by(AssetInstance.entity_id, AssetInstance.number) \
        .all()

    result = {}
    for instance in instances:
        entity_id = str(instance.entity_id)
        if entity_id not in result:
            result[entity_id] = []
        result[entity_id].append(instance.serialize())
    return result


def add_asset_instance_to_entity(entity_id, asset_id, description=""):
    """
    Add an asset instance to given entity (scene or shot).
    """
    entity = entities_service.get_entity_raw(entity_id)
    instance = AssetInstance.query \
        .filter(AssetInstance.entity_type_id == entity.entity_type_id) \
        .filter(AssetInstance.entity_id == entity_id) \
        .filter(AssetInstance.asset_id == asset_id) \
        .order_by(desc(AssetInstance.number)) \
        .first()

    number = 1
    if instance is not None:
        number = instance.number + 1

    name = build_asset_instance_name(asset_id, number)

    return AssetInstance.create(
        asset_id=asset_id,
        entity_id=entity_id,
        entity_type_id=entity.entity_type_id,
        number=number,
        name=name,
        description=description
    ).serialize()


def build_asset_instance_name(asset_id, number):
    """
    Helpers to generate normalized asset instance name. It is used to build
    default instance names.
    """
    asset = Entity.get(asset_id)
    asset_name = slugify(asset.name, separator="_")
    number = str(number).zfill(4)

    return "%s_%s" % (asset_name, number)


def get_asset_instances_for_shot(shot_id):
    """
    Return asset instances for given shot.
    """
    return get_asset_instances_for_entity(shot_id)


def get_shot_asset_instances_for_asset(asset_id):
    """
    Return asset instances casted in a shot for given asset.
    """
    return get_asset_instances_for_asset_and_entity_type(
        asset_id,
        shots_service.get_shot_type()["id"]
    )


def add_asset_instance_to_shot(shot_id, asset_id, description=""):
    """
    Add asset instance to given shot.
    """
    return add_asset_instance_to_entity(shot_id, asset_id, description)


def get_asset_instances_for_scene(scene_id):
    """
    Return asset instance casted in given scene.
    """
    return get_asset_instances_for_entity(scene_id)


def get_camera_instances_for_scene(scene_id):
    """
    Return all instances of type Camera for given layout scene.
    """
    camera_entity_type = assets_service.get_or_create_asset_type("Camera")
    return get_asset_instances_for_entity(scene_id, camera_entity_type["id"])


def get_scene_asset_instances_for_asset(asset_id):
    """
    Return all asset instances of an asset casted in layout scenes.
    """
    return get_asset_instances_for_asset_and_entity_type(
        asset_id,
        shots_service.get_scene_type()["id"]
    )


def add_asset_instance_to_scene(scene_id, asset_id, description=""):
    """
    Create a new asset instance for given asset and scene.
    """
    return add_asset_instance_to_entity(scene_id, asset_id, description)
