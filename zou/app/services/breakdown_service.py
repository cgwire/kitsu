from sqlalchemy import desc

from zou.app.models.asset_instance import AssetInstance
from zou.app.models.entity import Entity, EntityLink

from zou.app.services import shots_service


def get_casting(shot_id):
    casting = []
    links = EntityLink.get_all_by(entity_in_id=shot_id)
    for link in links:
        casting.append({
            "asset_id": str(link.entity_out_id),
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
    shot = Entity.get(shot.id)
    return casting


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
