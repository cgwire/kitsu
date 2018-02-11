from sqlalchemy import desc
from sqlalchemy.orm import aliased

from zou.app.models.asset_instance import AssetInstance
from zou.app.models.entity import Entity, EntityLink
from zou.app.models.entity_type import EntityType

from zou.app.services import shots_service
from zou.app.utils import fields


def get_casting(shot_id):
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


def get_asset_instances_for_shot(shot_id):
    instances = AssetInstance.query \
        .filter(AssetInstance.shot_id == shot_id) \
        .order_by(AssetInstance.asset_id, AssetInstance.number) \
        .all()

    result = {}
    for instance in instances:
        asset_id = str(instance.asset_id)
        if asset_id not in result:
            result[asset_id] = []
        result[asset_id].append(instance.serialize())
    return result


def get_asset_instances_for_asset(asset_id):
    instances = AssetInstance.query \
        .filter(AssetInstance.asset_id == asset_id) \
        .order_by(AssetInstance.shot_id, AssetInstance.number) \
        .all()

    result = {}
    for instance in instances:
        shot_id = str(instance.shot_id)
        if shot_id not in result:
            result[shot_id] = []
        result[shot_id].append(instance.serialize())
    return result


def add_asset_instance_to_shot(shot_id, asset_id, description=""):
    instance = AssetInstance.query \
        .filter(AssetInstance.shot_id == shot_id) \
        .filter(AssetInstance.asset_id == asset_id) \
        .order_by(desc(AssetInstance.number)) \
        .first()

    number = 1
    if instance is not None:
        number = instance.number + 1

    return AssetInstance.create(
        asset_id=asset_id,
        shot_id=shot_id,
        number=number,
        description=description
    ).serialize()
