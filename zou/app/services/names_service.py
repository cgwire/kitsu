import slugify

from zou.app.models.entity import Entity
from zou.app.models.entity_type import EntityType
from zou.app.services import (
    files_service,
    projects_service,
    tasks_service,
    shots_service
)


def get_full_entity_name(entity_id):
    """
    Get full entity name whether it's an asset or a shot. If it's a shot
    the result is "Episode name / Sequence name / Shot name". If it's an
    asset the result is "Asset type name / Asset name".
    """
    entity = Entity.get(entity_id)
    episode_id = None
    if shots_service.is_shot(entity.serialize()):
        sequence = Entity.get(entity.parent_id)
        if sequence.parent_id is None:
            name = "%s / %s" % (sequence.name, entity.name)
        else:
            episode = Entity.get(sequence.parent_id)
            episode_id = str(episode.id)
            name = "%s / %s / %s" % (
                episode.name,
                sequence.name,
                entity.name
            )
    else:
        asset_type = EntityType.get(entity.entity_type_id)
        episode_id = entity.source_id
        name = "%s / %s" % (asset_type.name, entity.name)
    return (name, episode_id)


def get_preview_file_name(preview_file_id):
    """
    Build unique and human readable file name for preview downloads. The
    convention followed is:
    [project_name]_[entity_name]_[task_type_name]_v[revivision].[extension].
    """
    preview_file = files_service.get_preview_file(preview_file_id)
    task = tasks_service.get_task(preview_file["task_id"])
    task_type = tasks_service.get_task_type(task["task_type_id"])
    project = projects_service.get_project(task["project_id"])
    (entity_name, _) = get_full_entity_name(
        task["entity_id"]
    )
    name = "%s_%s_%s_v%s" % (
        project["name"],
        entity_name,
        task_type["name"],
        preview_file["revision"]
    )
    return "%s.%s" % (
        slugify.slugify(name, separator="_"),
        preview_file["extension"]
    )
