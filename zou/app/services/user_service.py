from sqlalchemy.orm import aliased

from zou.app.models.entity import Entity
from zou.app.models.entity_type import EntityType
from zou.app.models.project import Project
from zou.app.models.project_status import ProjectStatus
from zou.app.models.task import Task
from zou.app.models.task_type import TaskType

from zou.app.services import persons_service, shots_service, tasks_service
from zou.app.utils import fields, permissions


def assignee_filter():
    current_user = persons_service.get_current_user_raw()
    return Task.assignees.contains(current_user)


def open_project_filter():
    return ProjectStatus.name.in_(("Active", "open", "Open"))


def related_projects():
    projects = Project.query \
        .join(Task) \
        .filter(assignee_filter()) \
        .filter(open_project_filter()) \
        .all()
    return Project.serialize_list(projects)


def asset_type_filter():
    shot_type = shots_service.get_shot_type()
    sequence_type = shots_service.get_sequence_type()
    episode_type = shots_service.get_episode_type()
    scene_type = shots_service.get_scene_type()
    return ~EntityType.id.in_([
        scene_type["id"],
        shot_type["id"],
        sequence_type["id"],
        episode_type["id"]
    ])


def get_todos():
    current_user = persons_service.get_current_user_raw()
    projects = related_projects()
    return tasks_service.get_person_tasks(current_user.id, projects)


def get_done_tasks():
    current_user = persons_service.get_current_user_raw()
    projects = related_projects()
    return tasks_service.get_person_done_tasks(current_user.id, projects)


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
        .filter(Shot.entity_type_id == shot_type["id"]) \
        .filter(Entity.entity_type_id == sequence_type["id"]) \
        .filter(Project.id == project_id) \
        .filter(assignee_filter()) \
        .filter(open_project_filter())

    return Entity.serialize_list(query.all(), obj_type="Sequence")


def get_project_episodes(project_id):
    shot_type = shots_service.get_shot_type()
    sequence_type = shots_service.get_sequence_type()
    episode_type = shots_service.get_episode_type()

    Shot = aliased(Entity, name='shot')
    Sequence = aliased(Entity, name='sequence')
    query = Entity.query \
        .join(Sequence, Sequence.parent_id == Entity.id) \
        .join(Shot, Shot.parent_id == Sequence.id) \
        .join(Task, Task.entity_id == Shot.id) \
        .join(Project, Project.id == Entity.project_id) \
        .join(ProjectStatus) \
        .filter(Shot.entity_type_id == shot_type["id"]) \
        .filter(Sequence.entity_type_id == sequence_type["id"]) \
        .filter(Entity.entity_type_id == episode_type["id"]) \
        .filter(Project.id == project_id) \
        .filter(assignee_filter()) \
        .filter(open_project_filter())

    return Entity.serialize_list(query.all(), obj_type="Episode")


def get_sequence_shots(sequence_id):
    shot_type = shots_service.get_shot_type()
    query = Entity.query \
        .join(Task, Project, ProjectStatus, EntityType) \
        .filter(Entity.entity_type_id == shot_type["id"]) \
        .filter(Entity.parent_id == sequence_id) \
        .filter(assignee_filter()) \
        .filter(open_project_filter())

    return Entity.serialize_list(query.all(), obj_type="Shot")


def get_sequence_scenes(sequence_id):
    scene_type = shots_service.get_scene_type()
    query = Entity.query \
        .join(Task, Project, ProjectStatus, EntityType) \
        .filter(Entity.entity_type_id == scene_type["id"]) \
        .filter(Entity.parent_id == sequence_id) \
        .filter(assignee_filter()) \
        .filter(open_project_filter())

    return Entity.serialize_list(query.all(), obj_type="Scene")


def get_open_projects(name=None):
    query = Project.query \
        .join(Task, ProjectStatus) \
        .filter(assignee_filter()) \
        .filter(open_project_filter())

    if name is not None:
        query = query.filter(Project.name == name)

    return fields.serialize_value(query.all())


def get_projects(name=None):
    query = Project.query \
        .join(Task, ProjectStatus) \
        .filter(assignee_filter())

    if name is not None:
        query = query.filter(Project.name == name)

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


def check_project_access(project_id):
    return permissions.has_manager_permissions() or \
        check_has_task_related(project_id)
