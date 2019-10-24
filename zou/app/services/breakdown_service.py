from slugify import slugify
from sqlalchemy import desc
from sqlalchemy.orm import aliased

from zou.app.models.asset_instance import AssetInstance
from zou.app.models.entity import Entity, EntityLink
from zou.app.models.entity_type import EntityType

from zou.app.utils import fields, events

from zou.app.services import assets_service, entities_service, shots_service

"""
Breakdown can be represented in two ways:

* Relation entries linking an asset and a shot. A number of number of occurences
  can be mentioned.
* Storing an entry for each instance of an asset casted in a shot or a scene.

Warning: These two representations are not linked. Data are not synchronized.
"""


def get_casting(shot_id):
    """
    Return all assets and their number of occurences listed in given shot
    (or asset for set dressing).
    """
    casting = []
    links = (
        EntityLink.query.filter_by(entity_in_id=shot_id)
        .join(Entity, EntityLink.entity_out_id == Entity.id)
        .join(EntityType, Entity.entity_type_id == EntityType.id)
        .filter(Entity.canceled != True)
        .add_columns(Entity.name, EntityType.name, Entity.preview_file_id)
        .order_by(EntityType.name, Entity.name)
    )

    for (link, entity_name, entity_type_name, entity_preview_file_id) in links:
        casting.append(
            {
                "asset_id": fields.serialize_value(link.entity_out_id),
                "asset_name": entity_name,
                "asset_type_name": entity_type_name,
                "preview_file_id": fields.serialize_value(
                    entity_preview_file_id
                ),
                "nb_occurences": link.nb_occurences,
            }
        )
    return casting


def get_sequence_casting(sequence_id):
    """
    Return all assets and their number of occurences listed in shots of given
    sequence.  Result is returned as a map where keys are shot IDs and values
    are casting for given shot.
    """
    castings = {}
    Shot = aliased(Entity, name="shot")
    links = (
        EntityLink.query.join(Shot, EntityLink.entity_in_id == Shot.id)
        .join(Entity, EntityLink.entity_out_id == Entity.id)
        .join(EntityType, Entity.entity_type_id == EntityType.id)
        .filter(Shot.parent_id == sequence_id)
        .filter(Entity.canceled != True)
        .add_columns(Entity.name, EntityType.name, Entity.preview_file_id)
        .order_by(EntityType.name, Entity.name)
    )

    for (link, entity_name, entity_type_name, entity_preview_file_id) in links:
        shot_id = str(link.entity_in_id)
        if shot_id not in castings:
            castings[shot_id] = []
        castings[shot_id].append(
            {
                "asset_id": fields.serialize_value(link.entity_out_id),
                "name": entity_name,
                "asset_name": entity_name,
                "asset_type_name": entity_type_name,
                "preview_file_id": fields.serialize_value(
                    entity_preview_file_id
                ),
                "nb_occurences": link.nb_occurences,
            }
        )
    return castings


def get_asset_type_casting(project_id, asset_type_id):
    """
    Return all assets and their number of occurences listed in asset of given
    asset type. Result is returned as a map where keys are asset IDs and values
    are casting for given asset.
    """
    castings = {}
    Asset = aliased(Entity, name="asset")
    links = (
        EntityLink.query.join(Asset, EntityLink.entity_in_id == Asset.id)
        .join(Entity, EntityLink.entity_out_id == Entity.id)
        .join(EntityType, Entity.entity_type_id == EntityType.id)
        .filter(Asset.project_id == project_id)
        .filter(Asset.entity_type_id == asset_type_id)
        .filter(Entity.canceled != True)
        .add_columns(Entity.name, EntityType.name, Entity.preview_file_id)
        .order_by(EntityType.name, Entity.name)
    )

    for (link, entity_name, entity_type_name, entity_preview_file_id) in links:
        asset_id = str(link.entity_in_id)
        if asset_id not in castings:
            castings[asset_id] = []
        castings[asset_id].append(
            {
                "asset_id": fields.serialize_value(link.entity_out_id),
                "name": entity_name,
                "asset_name": entity_name,
                "asset_type_name": entity_type_name,
                "preview_file_id": fields.serialize_value(
                    entity_preview_file_id
                ),
                "nb_occurences": link.nb_occurences,
            }
        )
    return castings


def update_casting(entity_id, casting):
    """
    Update casting for given entity. Casting is an array of dictionaries made of
    two fields: `asset_id` and `nb_occurences`.
    """
    entity = entities_service.get_entity_raw(entity_id)
    entity.update({"entities_out": []})
    casting_ids = []
    for cast in casting:
        if "asset_id" in cast and "nb_occurences" in cast:
            create_casting_link(
                entity.id, cast["asset_id"], cast["nb_occurences"]
            )
    entity_id = str(entity.id)
    if shots_service.is_shot(entity.serialize()):
        events.emit(
            "shot:casting-update", {"shot": entity_id, "casting": casting_ids}
        )
        events.emit("shot:update", {"shot_id": entity_id})
    else:
        events.emit(
            "asset:casting-update", {"asset": entity_id, "casting": casting_ids}
        )
        events.emit("asset:update", {"asset_id": entity_id})
    return casting


def create_casting_link(entity_in_id, asset_id, nb_occurences=1, label=""):
    """
    Add a link between given entity and given asset.
    """
    link = EntityLink.get_by(entity_in_id=entity_in_id, entity_out_id=asset_id)
    if link is None:
        link = EntityLink.create(
            entity_in_id=entity_in_id,
            entity_out_id=asset_id,
            nb_occurences=nb_occurences,
            label=label,
        )
    else:
        link.update({"nb_occurences": nb_occurences, "label": label})
    return link


def get_cast_in(asset_id):
    """
    Get the list of shots where an asset is casted in.
    """
    cast_in = []
    Sequence = aliased(Entity, name="sequence")
    Episode = aliased(Entity, name="episode")
    links = (
        EntityLink.query.filter_by(entity_out_id=asset_id)
        .filter(Entity.canceled != True)
        .join(Entity, EntityLink.entity_in_id == Entity.id)
        .join(Sequence, Entity.parent_id == Sequence.id)
        .outerjoin(Episode, Sequence.parent_id == Episode.id)
        .add_columns(
            Entity.name, Sequence.name, Episode.name, Entity.preview_file_id
        )
        .order_by(Episode.name, Sequence.name, Entity.name)
    )

    for (
        link,
        entity_name,
        sequence_name,
        episode_name,
        entity_preview_file_id,
    ) in links:
        shot = {
            "shot_id": fields.serialize_value(link.entity_in_id),
            "shot_name": entity_name,
            "sequence_name": sequence_name,
            "episode_name": episode_name,
            "preview_file_id": fields.serialize_value(entity_preview_file_id),
            "nb_occurences": link.nb_occurences,
        }
        cast_in.append(shot)

    links = (
        EntityLink.query.filter_by(entity_out_id=asset_id)
        .filter(Entity.canceled != True)
        .filter(assets_service.build_entity_type_asset_type_filter())
        .join(Entity, EntityLink.entity_in_id == Entity.id)
        .join(EntityType, EntityType.id == Entity.entity_type_id)
        .add_columns(Entity.name, EntityType.name, Entity.preview_file_id)
        .order_by(EntityType.name, Entity.name)
    )

    for (link, entity_name, entity_type_name, entity_preview_file_id) in links:
        shot = {
            "asset_id": fields.serialize_value(link.entity_in_id),
            "asset_name": entity_name,
            "asset_type_name": entity_type_name,
            "preview_file_id": fields.serialize_value(entity_preview_file_id),
            "nb_occurences": link.nb_occurences,
        }
        cast_in.append(shot)

    return cast_in


def get_asset_instances_for_scene(scene_id, asset_type_id=None):
    """
    Return all asset instances for given scene.

    Asset instances are a different way to represent the casting of a shot.
    They allow to track precisely output files generated when building a shot.
    """
    query = AssetInstance.query.filter(
        AssetInstance.scene_id == scene_id
    ).order_by(AssetInstance.asset_id, AssetInstance.number)

    if asset_type_id is not None:
        query = query.join(Entity, AssetInstance.asset_id == Entity.id).filter(
            Entity.entity_type_id == asset_type_id
        )

    asset_instances = query.all()

    result = {}
    for asset_instance in asset_instances:
        asset_id = str(asset_instance.asset_id)
        if asset_id not in result:
            result[asset_id] = []
        result[asset_id].append(asset_instance.serialize())
    return result


def get_asset_instances_for_shot(shot_id):
    """
    Return asset instances casted in given shot.
    """
    shot = shots_service.get_shot_raw(shot_id)

    result = {}
    for asset_instance in shot.instance_casting:
        asset_id = str(asset_instance.asset_id)
        if asset_id not in result:
            result[asset_id] = []
        result[asset_id].append(asset_instance.serialize())
    return result


def group_by(models, field):
    result = {}
    for asset_instance in models:
        asset_id = asset_instance.serialize()
        if asset_id not in result:
            result[asset_id] = []
        result[asset_id].append(asset_instance.serialize())
    return result


def get_shot_asset_instances_for_asset(asset_id):
    """
    Return asset instances casted in a shot for given asset.
    """
    asset_instances = (
        AssetInstance.query.filter(AssetInstance.asset_id == asset_id)
        .order_by(AssetInstance.asset_id, AssetInstance.number)
        .all()
    )

    result = {}
    for asset_instance in asset_instances:
        for shot in asset_instance.shots:
            shot_id = str(shot.id)
            if shot_id not in result:
                result[shot_id] = []
            result[shot_id].append(asset_instance.serialize())

    return result


def get_scene_asset_instances_for_asset(asset_id):
    """
    Return all asset instances of an asset casted in layout scenes.
    """
    asset_instances = (
        AssetInstance.query.filter(AssetInstance.asset_id == asset_id)
        .order_by(AssetInstance.asset_id, AssetInstance.number)
        .all()
    )

    result = {}
    for asset_instance in asset_instances:
        scene_id = str(asset_instance.scene_id)
        if scene_id not in result:
            result[scene_id] = []
        result[scene_id].append(asset_instance.serialize())

    return result


def get_camera_instances_for_scene(scene_id):
    """
    Return all instances of type Camera for given layout scene.
    """
    camera_entity_type = assets_service.get_or_create_asset_type("Camera")
    return get_asset_instances_for_scene(scene_id, camera_entity_type["id"])


def add_asset_instance_to_scene(scene_id, asset_id, description=""):
    """
    Create a new asset instance for given asset and scene.
    """
    instance = (
        AssetInstance.query.filter(AssetInstance.scene_id == scene_id)
        .filter(AssetInstance.asset_id == asset_id)
        .order_by(desc(AssetInstance.number))
        .first()
    )

    number = 1
    if instance is not None:
        number = instance.number + 1
    name = build_asset_instance_name(asset_id, number)

    asset_instance = AssetInstance.create(
        asset_id=asset_id,
        scene_id=scene_id,
        number=number,
        name=name,
        description=description,
    ).serialize()

    events.emit(
        "asset_instance:new",
        {
            "scene_id": scene_id,
            "asset_id": asset_id,
            "asset_instance_id": asset_instance["id"],
        },
    )
    return asset_instance


def add_asset_instance_to_shot(shot_id, asset_instance_id):
    """
    Add asset instance to instance casting of given shot.
    """
    shot = shots_service.get_shot_raw(shot_id)
    asset_instance = assets_service.get_asset_instance_raw(asset_instance_id)
    shot.instance_casting.append(asset_instance)
    shot.save()

    events.emit(
        "asset_instance:add-to-shot",
        {"shot_id": shot_id, "asset_instance_id": asset_instance_id},
    )
    return shot.serialize()


def remove_asset_instance_for_shot(shot_id, asset_instance_id):
    """
    Remove asset instance from instance casting of given shot.
    """
    shot = shots_service.get_shot_raw(shot_id)
    asset_instance = assets_service.get_asset_instance_raw(asset_instance_id)
    shot.instance_casting.remove(asset_instance)
    shot.save()
    events.emit(
        "asset_instance:remove-from-shot",
        {"shot_id": shot_id, "asset_instance_id": asset_instance_id},
    )
    return shot.serialize()


def build_asset_instance_name(asset_id, number):
    """
    Helpers to generate normalized asset instance name. It is used to build
    default instance names.
    """
    asset = Entity.get(asset_id)
    asset_name = slugify(asset.name, separator="_")
    number = str(number).zfill(4)
    return "%s_%s" % (asset_name, number)


def get_asset_instances_for_asset(asset_id, asset_type_id=None):
    """
    Return all asset instances inside given asset.

    Asset instances for asset are used for environment (instantiation of props)
    or for props (instantiation of sub props).
    """
    query = AssetInstance.query.filter(
        AssetInstance.target_asset_id == asset_id
    ).order_by(AssetInstance.asset_id, AssetInstance.number)

    if asset_type_id is not None:
        query = query.join(Entity, AssetInstance.asset_id == Entity.id).filter(
            Entity.entity_type_id == asset_type_id
        )

    asset_instances = query.all()

    result = {}
    for asset_instance in asset_instances:
        asset_id = str(asset_instance.asset_id)
        if asset_id not in result:
            result[asset_id] = []
        result[asset_id].append(asset_instance.serialize())
    return result


def add_asset_instance_to_asset(
    asset_id, asset_to_instantiate_id, description=""
):
    """
    Create a new asset instance for given asset and scene.
    """
    instance = (
        AssetInstance.query.filter(AssetInstance.target_asset_id == asset_id)
        .filter(AssetInstance.asset_id == asset_to_instantiate_id)
        .order_by(desc(AssetInstance.number))
        .first()
    )

    number = 1
    if instance is not None:
        number = instance.number + 1
    name = build_asset_instance_name(asset_to_instantiate_id, number)

    asset_instance = AssetInstance.create(
        asset_id=asset_to_instantiate_id,
        target_asset_id=asset_id,
        number=number,
        name=name,
        description=description,
    ).serialize()

    events.emit(
        "asset_instance:new",
        {
            "asset_id": asset_id,
            "asset_instantiated": asset_to_instantiate_id,
            "asset_instance_id": asset_instance["id"],
        },
    )
    return asset_instance


def get_entity_casting(entity_id):
    """
    Get entities related to entity as external entities.
    """
    entity = entities_service.get_entity_raw(entity_id)
    return Entity.serialize_list(entity.entities_out, obj_type="Asset")
