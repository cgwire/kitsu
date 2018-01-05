from zou.app.utils import events
from sqlalchemy.exc import StatementError

from zou.app.models.entity import Entity
from zou.app.models.entity_type import EntityType
from zou.app.models.preview_file import PreviewFile

from zou.app.services.exception import (
    PreviewFileNotFoundException,
    EntityNotFoundException
)


def get_model_raw(model, instance_id, exception):
    try:
        instance = model.get(instance_id)
    except StatementError:
        raise exception

    if instance is None:
        raise exception

    return instance


def get_entity_type(name):
    entity_type = EntityType.get_by(name=name)
    if entity_type is None:
        entity_type = EntityType.create(name=name)
    return entity_type.serialize()


def get_entity_raw(entity_id):
    return get_model_raw(
        Entity,
        entity_id,
        EntityNotFoundException
    )


def get_entity(entity_id):
    return get_model_raw(
        Entity,
        entity_id,
        EntityNotFoundException
    ).serialize()


def update_entity_preview(entity_id, preview_file_id):
    entity = Entity.get(entity_id)
    if entity is None:
        raise EntityNotFoundException

    preview_file = PreviewFile.get(preview_file_id)
    if preview_file is None:
        raise PreviewFileNotFoundException

    entity.update({"preview_file_id": preview_file.id})
    events.emit("preview-file:set-main", {
        "entity_id": entity_id,
        "preview_file_id": preview_file_id
    })
    return entity.serialize()
