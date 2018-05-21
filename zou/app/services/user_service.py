from sqlalchemy.orm import aliased
from flask import current_app

from zou.app.models.entity import Entity
from zou.app.models.entity_type import EntityType
from zou.app.models.project import Project
from zou.app.models.project_status import ProjectStatus
from zou.app.models.search_filters import SearchFilter
from zou.app.models.notifications import Notification
from zou.app.models.task import Task
from zou.app.models.task_type import TaskType
from zou.app.models.comment import Comment

from zou.app.services import (
    assets_service,
    notifications_service,
    persons_service,
    shots_service,
    tasks_service
)
from zou.app.services.exception import SearchFilterNotFoundException
from zou.app.utils import fields, permissions


def build_assignee_filter():
    """
    Query filter for task to retrieve only tasks assigned to current user.
    """
    current_user = persons_service.get_current_user_raw()
    return Task.assignees.contains(current_user)


def build_open_project_filter():
    """
    Query filter for project to retrieve only open projects.
    """
    return ProjectStatus.name.in_(("Active", "open", "Open"))


def build_related_projects_filter():
    """
    Query filter for project to retrieve open projects with at least
    one task assigned to current user.
    """
    projects = Project.query \
        .join(Task) \
        .filter(build_assignee_filter()) \
        .filter(build_open_project_filter()) \
        .all()
    project_ids = [project.id for project in projects]
    if len(project_ids) > 0:
        return Project.id.in_(project_ids)
    else:
        return Project.id.in_(["00000000-0000-0000-0000-000000000000"])


def related_projects():
    """
    Return all projects related to current user: open projects with at least
    one task assigned to current user.
    """
    projects = Project.query \
        .join(Task) \
        .filter(build_assignee_filter()) \
        .filter(build_open_project_filter()) \
        .all()
    return Project.serialize_list(projects)


def get_todos():
    """
    Get all unfinished tasks assigned to current user.
    """
    current_user = persons_service.get_current_user_raw()
    projects = related_projects()
    return tasks_service.get_person_tasks(current_user.id, projects)


def get_done_tasks():
    """
    Get all finished tasks assigned to current user for open projects.
    """
    current_user = persons_service.get_current_user_raw()
    projects = related_projects()
    return tasks_service.get_person_done_tasks(current_user.id, projects)


def get_tasks_for_entity(entity_id):
    """
    Get all tasks assigned to current user and related to given entity.
    """
    query = Task.query \
        .join(Project, ProjectStatus) \
        .filter(Task.entity_id == entity_id) \
        .filter(build_assignee_filter()) \
        .filter(build_open_project_filter())

    return fields.serialize_value(query.all())


def get_task_types_for_entity(entity_id):
    """
    Get all task types of tasks assigned to current user and related to given
    entity.
    """
    query = TaskType.query \
        .join(Task, Project, ProjectStatus) \
        .filter(Task.entity_id == entity_id) \
        .filter(build_assignee_filter()) \
        .filter(build_open_project_filter())

    return fields.serialize_value(query.all())


def get_assets_for_asset_type(project_id, asset_type_id):
    """
    Get all assets for given asset type anp project and for which user has
    a task related.
    """
    query = Entity.query \
        .join(EntityType) \
        .join(Project) \
        .join(Task, Task.entity_id == Entity.id) \
        .join(ProjectStatus) \
        .filter(EntityType.id == asset_type_id) \
        .filter(Project.id == project_id) \
        .filter(build_assignee_filter()) \
        .filter(build_open_project_filter())

    return Entity.serialize_list(query.all(), obj_type="Asset")


def get_asset_types_for_project(project_id):
    """
    Get all asset types for which there is an asset for which current user has a
    task assigned. Assets are listed in given project.
    """
    query = EntityType.query \
        .join(Entity, Entity.entity_type_id == EntityType.id) \
        .join(Task, Task.entity_id == Entity.id) \
        .join(Project, ProjectStatus) \
        .filter(Project.id == project_id) \
        .filter(build_assignee_filter()) \
        .filter(build_open_project_filter()) \
        .filter(assets_service.build_asset_type_filter())

    return EntityType.serialize_list(query.all(), obj_type="AssetType")


def get_sequences_for_project(project_id):
    """
    Return all sequences for given project and for which current user has
    a task assigned to a shot.
    """
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
        .filter(build_assignee_filter()) \
        .filter(build_open_project_filter())

    return Entity.serialize_list(query.all(), obj_type="Sequence")


def get_project_episodes(project_id):
    """
    Return all episodes for given project and for which current user has
    a task assigned to a shot.
    """
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
        .filter(build_assignee_filter()) \
        .filter(build_open_project_filter())

    return Entity.serialize_list(query.all(), obj_type="Episode")


def get_shots_for_sequence(sequence_id):
    """
    Get all shots for given sequence and for which the user has a task assigned.
    """
    shot_type = shots_service.get_shot_type()
    query = Entity.query \
        .join(Task, Project, ProjectStatus, EntityType) \
        .filter(Entity.entity_type_id == shot_type["id"]) \
        .filter(Entity.parent_id == sequence_id) \
        .filter(build_assignee_filter()) \
        .filter(build_open_project_filter())

    return Entity.serialize_list(query.all(), obj_type="Shot")


def get_scenes_for_sequence(sequence_id):
    """
    Get all layout scenes for given sequence and for which the user has a task
    assigned.
    """
    scene_type = shots_service.get_scene_type()
    query = Entity.query \
        .join(Task, Project, ProjectStatus, EntityType) \
        .filter(Entity.entity_type_id == scene_type["id"]) \
        .filter(Entity.parent_id == sequence_id) \
        .filter(build_assignee_filter()) \
        .filter(build_open_project_filter())

    return Entity.serialize_list(query.all(), obj_type="Scene")


def get_open_projects(name=None):
    """
    Get all open projects for which current user has a task assigned.
    """
    query = Project.query \
        .join(Task, ProjectStatus) \
        .filter(build_assignee_filter()) \
        .filter(build_open_project_filter())

    if name is not None:
        query = query.filter(Project.name == name)

    return fields.serialize_value(query.all())


def get_projects(name=None):
    """
    Get all projects for which current user has a task assigned.
    """
    query = Project.query \
        .join(Task, ProjectStatus) \
        .filter(build_assignee_filter())

    if name is not None:
        query = query.filter(Project.name == name)

    return fields.serialize_value(query.all())


def check_assigned(task_id):
    """
    Return true if current user is assiged to task related to given ID.
    """
    query = Task.query \
        .filter(build_assignee_filter()) \
        .filter(Task.id == task_id)

    if query.first() is None:
        raise permissions.PermissionDenied

    return True


def check_working_on_entity(entity_id):
    """
    Return True if user has task assigned which is related to given entity.
    """
    query = Task.query \
        .filter(build_assignee_filter()) \
        .filter(Task.entity_id == entity_id)

    if query.first() is None:
        raise permissions.PermissionDenied

    return True


def check_has_task_related(project_id):
    """
    Return true if current user is assigned to a task of the given project.
    """
    query = Project.query \
        .join(Task) \
        .filter(build_assignee_filter()) \

    if query.first() is None:
        raise permissions.PermissionDenied

    return True


def check_criterions_has_task_related(criterions):
    """
    Extract project id from criterions and return true if the current user
    has a task assigned for this project.
    """
    if "project_id" in criterions:
        check_has_task_related(criterions["project_id"])
        return True
    else:
        raise permissions.PermissionDenied


def check_project_access(project_id):
    """
    Return true if current user is manager or has a task assigned for this
    project.
    """
    return permissions.has_manager_permissions() or \
        check_has_task_related(project_id)


def is_current_user_manager():
    """
    Return true is current user is manager or admin.
    """
    return permissions.has_manager_permissions()


def get_filters():
    """
    Retrieve search filters used by current user. It groups them by
    list type and project_id. If the filter is not related to a project,
    the project_id is all.
    """
    result = {}
    current_user = persons_service.get_current_user_raw()

    filters = SearchFilter.query \
        .join(Project, ProjectStatus) \
        .filter(SearchFilter.person_id == current_user.id) \
        .filter(build_open_project_filter()) \
        .all()

    filters = filters + SearchFilter.query \
        .filter(SearchFilter.person_id == current_user.id) \
        .filter(SearchFilter.project_id == None) \
        .all()

    for search_filter in filters:
        if search_filter.list_type not in result:
            result[search_filter.list_type] = {}
        subresult = result[search_filter.list_type]

        if search_filter.project_id is None:
            project_id = "all"
        else:
            project_id = str(search_filter.project_id)

        if project_id not in subresult:
            subresult[project_id] = []

        subresult[project_id].append(search_filter.serialize())

    return result


def create_filter(list_type, name, query, project_id=None):
    """
    Add a new search filter to the database.
    """
    current_user = persons_service.get_current_user_raw()
    search_filter = SearchFilter.create(
        list_type=list_type,
        name=name,
        search_query=query,
        project_id=project_id,
        person_id=current_user.id
    )
    search_filter.serialize()
    return search_filter.serialize()


def remove_filter(search_filter_id):
    """
    Remove given filter from database.
    """
    current_user = persons_service.get_current_user_raw()
    search_filter = SearchFilter.get_by(
        id=search_filter_id,
        person_id=current_user.id
    )
    if search_filter is None:
        raise SearchFilterNotFoundException
    search_filter.delete()
    return search_filter.serialize()


def get_last_notifications():
    """
    Return last 100 user notifications.
    """
    current_user = persons_service.get_current_user_raw()
    result = []
    notifications = Notification.query \
        .filter_by(person_id=current_user.id) \
        .order_by(Notification.created_at) \
        .join(Task, Project, Comment) \
        .add_columns(
            Project.id,
            Project.name,
            Task.task_type_id,
            Comment.preview_file_id,
            Comment.task_status_id,
            Comment.text,
            Task.entity_id
        ) \
        .limit(100) \
        .all()

    for (
        notification,
        project_id,
        project_name,
        task_type_id,
        preview_file_id,
        task_status_id,
        comment_text,
        task_entity_id
    ) in notifications:
        current_app.logger.info(task_entity_id)
        full_entity_name = notifications_service.get_full_entity_name(
            task_entity_id
        )
        result.append(fields.serialize_dict({
            "id": notification.id,
            "author_id": notification.author_id,
            "task_id": notification.task_id,
            "task_type_id": task_type_id,
            "task_status_id": task_status_id,
            "preview_file_id": preview_file_id,
            "project_id": project_id,
            "project_name": project_name,
            "comment_text": comment_text,
            "created_at": notification.created_at,
            "read": notification.read,
            "change": notification.change,
            "full_entity_name": full_entity_name
        }))

    return result


def mark_notifications_as_read():
    """
    Mark all recent notifications for current_user as read. It is useful
    to mark a list of notifications as read after an user retrieved them.
    """
    current_user = persons_service.get_current_user_raw()
    notifications = Notification.query \
        .filter_by(person_id=current_user.id, read=False) \
        .order_by(Notification.created_at) \
        .limit(100) \
        .all()

    for notification in notifications:
        notification.update({"read": True})

    return fields.serialize_list(notifications)
