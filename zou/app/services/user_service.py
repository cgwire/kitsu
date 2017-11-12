from sqlalchemy.orm import aliased

from zou.app.models.entity import Entity
from zou.app.models.entity_type import EntityType
from zou.app.models.project import Project
from zou.app.models.project_status import ProjectStatus
from zou.app.models.task import Task
from zou.app.models.task_type import TaskType
from zou.app.models.task_status import TaskStatus

from zou.app.services import persons_service, shots_service, tasks_service
from zou.app.utils import fields, permissions


def assignee_filter():
    current_user = persons_service.get_current_user()
    return Task.assignees.contains(current_user)


def open_project_filter():
    return ProjectStatus.name.in_(("Active", "open", "Open"))


def asset_type_filter():
    shot_type = shots_service.get_shot_type()
    sequence_type = shots_service.get_sequence_type()
    episode_type = shots_service.get_episode_type()
    return ~EntityType.id.in_([
        shot_type.id,
        sequence_type.id,
        episode_type.id,
    ])


def get_todos():
    done_status = tasks_service.get_done_status()

    Sequence = aliased(Entity, name='sequence')
    Episode = aliased(Entity, name='episode')
    query = Task.query \
        .join(Project, ProjectStatus, TaskType, TaskStatus) \
        .join(Entity, Entity.id == Task.entity_id) \
        .join(EntityType, EntityType.id == Entity.entity_type_id) \
        .outerjoin(Sequence, Sequence.id == Entity.parent_id) \
        .outerjoin(Episode, Episode.id == Sequence.parent_id) \
        .filter(assignee_filter()) \
        .filter(open_project_filter()) \
        .filter(Task.task_status_id != done_status.id) \
        .add_columns(
            Project.name,
            Entity.name,
            Entity.preview_file_id,
            EntityType.name,
            Sequence.name,
            Episode.name,
            TaskType.name,
            TaskStatus.name,
            TaskType.color,
            TaskStatus.color,
            TaskStatus.short_name
        )

    tasks = []
    for (
        task,
        project_name,
        entity_name,
        entity_preview_file_id,
        entity_type_name,
        sequence_name,
        episode_name,
        task_type_name,
        task_status_name,
        task_type_color,
        task_status_color,
        task_status_short_name
    ) in query.all():
        if entity_preview_file_id is None:
            entity_preview_file_id = ""

        task_dict = task.serialize()
        task_dict["project_name"] = project_name
        task_dict["entity_name"] = entity_name
        task_dict["entity_preview_file_id"] = str(entity_preview_file_id)
        task_dict["entity_type_name"] = entity_type_name
        task_dict["sequence_name"] = sequence_name
        task_dict["episode_name"] = episode_name
        task_dict["task_type_name"] = task_type_name
        task_dict["task_status_name"] = task_status_name
        task_dict["task_type_color"] = task_type_color
        task_dict["task_status_color"] = task_status_color
        task_dict["task_status_short_name"] = task_status_short_name
        tasks.append(task_dict)

    return tasks


def get_entity_tasks(entity_id):
    query = Task.query \
        .join(Project, ProjectStatus) \
        .filter(Task.entity_id == entity_id) \
        .filter(assignee_filter()) \
        .filter(open_project_filter())

    return fields.serialize_value(query.all())


def get_entity_task_types(entity_id):
    query = TaskType.query \
        .join(Task, Project, ProjectStatus) \
        .filter(Task.entity_id == entity_id) \
        .filter(assignee_filter()) \
        .filter(open_project_filter())

    return fields.serialize_value(query.all())


def get_asset_type_assets(project_id, asset_type_id):
    query = Entity.query \
        .join(EntityType) \
        .join(Project) \
        .join(Task, Task.entity_id == Entity.id) \
        .join(ProjectStatus) \
        .filter(EntityType.id == asset_type_id) \
        .filter(Project.id == project_id) \
        .filter(assignee_filter()) \
        .filter(open_project_filter())

    return Entity.serialize_list(query.all(), obj_type="Asset")


def get_project_asset_types(project_id):
    query = EntityType.query \
        .join(Entity, Entity.entity_type_id == EntityType.id) \
        .join(Task, Task.entity_id == Entity.id) \
        .join(Project, ProjectStatus) \
        .filter(Project.id == project_id) \
        .filter(assignee_filter()) \
        .filter(open_project_filter()) \
        .filter(asset_type_filter())

    return EntityType.serialize_list(query.all(), obj_type="AssetType")


def get_project_sequences(project_id):
    shot_type = shots_service.get_shot_type()
    sequence_type = shots_service.get_sequence_type()

    Shot = aliased(Entity, name='shot')
    query = Entity.query \
        .join(Shot, Shot.parent_id == Entity.id) \
        .join(Task, Task.entity_id == Shot.id) \
        .join(EntityType, EntityType.id == Entity.entity_type_id) \
        .join(Project, Project.id == Entity.project_id) \
        .join(ProjectStatus) \
        .filter(Shot.entity_type_id == shot_type.id) \
        .filter(Entity.entity_type_id == sequence_type.id) \
        .filter(Project.id == project_id) \
        .filter(assignee_filter()) \
        .filter(open_project_filter())

    return Entity.serialize_list(query.all(), obj_type="Sequence")


def get_sequence_shots(sequence_id):
    shot_type = shots_service.get_shot_type()
    query = Entity.query \
        .join(Task, Project, ProjectStatus, EntityType) \
        .filter(Entity.entity_type_id == shot_type.id) \
        .filter(Entity.parent_id == sequence_id) \
        .filter(assignee_filter()) \
        .filter(open_project_filter())

    return Entity.serialize_list(query.all(), obj_type="Shot")


def get_projects():
    query = Project.query \
        .join(Task, ProjectStatus) \
        .filter(assignee_filter()) \
        .filter(open_project_filter())

    return fields.serialize_value(query.all())


def check_assigned(task_id):
    query = Task.query \
        .filter(assignee_filter()) \
        .filter(Task.id == task_id)

    if query.first() is None:
        raise permissions.PermissionDenied

    return True


def check_has_task_related(project_id):
    query = Project.query \
        .join(Task) \
        .filter(assignee_filter()) \

    if query.first() is None:
        raise permissions.PermissionDenied

    return True


def check_criterions_has_task_related(criterions):
    if "project_id" in criterions:
        check_has_task_related(criterions["project_id"])
        return True
    else:
        raise permissions.PermissionDenied
