from zou.app.models.entity import Entity
from zou.app.models.preview_file import PreviewFile

from zou.app.services.exception import (
    PreviewFileNotFoundException,
    EntityNotFoundException
)


def update_entity_preview(entity_id, preview_file_id):
    entity = Entity.get(entity_id)
    if entity is None:
        raise EntityNotFoundException

    preview_file = PreviewFile.get(preview_file_id)
    if preview_file is None:
        raise PreviewFileNotFoundException

    entity.update({"preview_file_id": preview_file.id})
    return entity.serialize()
