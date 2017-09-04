import datetime

from sqlalchemy.exc import StatementError, IntegrityError

from zou.app import app
from zou.app.utils import events

from zou.app.models.task import Task
from zou.app.models.task_type import TaskType
from zou.app.models.department import Department
from zou.app.models.entity import Entity
from zou.app.models.task_status import TaskStatus
from zou.app.models.project import Project
from zou.app.models.entity_type import EntityType
from zou.app.models.preview_file import PreviewFile

from zou.app.services.exception import (
    TaskNotFoundException,
    TaskTypeNotFoundException
)

from zou.app.services import (
    shots_service,
    assets_service,
    persons_service
)


def get_task_types_for_asset(asset):
    tasks = Task.query.filter_by(entity_id=asset.id).all()

    task_types = []
    if len(tasks) > 0:
        task_type_ids = [task.task_type_id for task in tasks]
        task_types = TaskType.query.filter(
            TaskType.id.in_(task_type_ids)
        )

    return TaskType.serialize_list(task_types)


def get_wip_status():
    return get_or_create_status(app.config["WIP_TASK_STATUS"], "wip")


def get_to_review_status():
    return get_or_create_status(app.config["TO_REVIEW_TASK_STATUS"], "pndng")


def get_todo_status():
    return get_or_create_status("Todo")


def start_task(task):
    wip_status = get_wip_status()
    task_is_not_already_wip = \
        task.task_status_id is None \
        or task.task_status_id != wip_status.id

    if task_is_not_already_wip:
        task_dict_before = task.serialize()

        new_data = {"task_status_id": wip_status.id}
        if task.real_start_date is None:
            new_data["real_start_date"] = datetime.datetime.now()

        task.update(new_data)

        task_dict_after = task.serialize()
        events.emit("task:start", {
            "task_before": task_dict_before,
            "task_after": task_dict_after
        })

    return task


def task_to_review(task, person, comment, preview_path=""):
    to_review_status = get_to_review_status()
    task_dict_before = task.serialize()

    task.update({"task_status_id": to_review_status.id})
    task.save()

    project = Project.get(task.project_id)
    entity = Entity.get(task.entity_id)
    entity_type = EntityType.get(entity.entity_type_id)

    task_dict_after = task.serialize()
    task_dict_after["project"] = project.serialize()
    task_dict_after["entity"] = entity.serialize()
    task_dict_after["entity_type"] = entity_type.serialize()
    task_dict_after["person"] = person.serialize()
    task_dict_after["comment"] = comment
    task_dict_after["preview_path"] = preview_path

    events.emit("task:to-review", {
        "task_before": task_dict_before,
        "task_after": task_dict_after
    })

    return task_dict_after


def get_task(task_id):
    try:
        task = Task.get(task_id)
    except StatementError:
        raise TaskNotFoundException()

    if task is None:
        raise TaskNotFoundException()

    return task


def get_task_type(task_type_id):
    try:
        task_type = TaskType.get(task_type_id)
    except StatementError:
        raise TaskTypeNotFoundException()

    if task_type is None:
        raise TaskTypeNotFoundException()

    return task_type.serialize()


def create_task(task_type, entity, name="main"):
    task_status = get_todo_status()
    try:
        try:
            current_user_id = persons_service.get_current_user().id
        except RuntimeError:
            current_user_id = None
        task = Task.create(
            name=name,
            duration=0,
            estimation=0,
            completion_rate=0,
            start_date=None,
            end_date=None,
            due_date=None,
            real_start_date=None,
            project_id=entity["project_id"],
            task_type_id=task_type["id"],
            task_status_id=task_status.id,
            entity_id=entity["id"],
            assigner_id=current_user_id,
            assignees=[]
        )
        return task.serialize()
    except IntegrityError:
        pass  # Tasks already exists, no need to create it.


def delete_task(task):
    task.delete()


def assign_task(task, person):
    task.assignees.append(person)
    task.save()
    return task


def get_department_from_task_type(task_type):
    return Department.get(task_type.department_id)


def get_task_dicts_for_shot(shot_id):
    shot = shots_service.get_shot(shot_id)
    return get_task_dicts_for_entity(shot.id)


def get_task_dicts_for_asset(asset_id):
    asset = assets_service.get_asset(asset_id)
    return get_task_dicts_for_entity(asset.id)


def get_task_dicts_for_entity(entity_id):
    query = Task.query.order_by(Task.name)
    query = query.filter_by(entity_id=entity_id)
    query = query.join(Project)
    query = query.join(TaskType)
    query = query.join(Department)
    query = query.join(TaskStatus)
    query = query.join(Entity, Task.entity_id == Entity.id)
    query = query.join(EntityType)
    query = query.add_columns(Project.name)
    query = query.add_columns(Department.name)
    query = query.add_columns(TaskType.name)
    query = query.add_columns(TaskStatus.name)
    query = query.add_columns(EntityType.name)
    query = query.add_columns(Entity.name)
    query = query.order_by(
        Project.name,
        Department.name,
        TaskType.name,
        EntityType.name,
        Entity.name
    )
    results = []

    for entry in query.all():
        (
            task_object,
            project_name,
            department_name,
            task_type_name,
            task_status_name,
            entity_type_name,
            entity_name
        ) = entry

        task = task_object.serialize()
        task["project_name"] = project_name
        task["department_name"] = department_name
        task["task_type_name"] = task_type_name
        task["task_status_name"] = task_status_name
        task["entity_type_name"] = entity_type_name
        task["entity_name"] = entity_name
        results.append(task)
    return results


def get_or_create_task_type(
    department,
    name,
    color="#888888",
    priority=1,
    for_shots=False
):
    task_type = TaskType.get_by(name=name)
    if task_type is None:
        task_type = TaskType(
            name=name,
            department_id=department.id,
            color=color,
            priority=priority,
            for_shots=for_shots
        )
        task_type.save()
    return task_type


def get_or_create_status(name, short_name="", color="#f5f5f5"):
    status = TaskStatus.get_by(name=name)
    if status is None and len(short_name) > 0:
        status = TaskStatus.get_by(short_name=short_name)

    if status is None:
        status = TaskStatus.create(
            name=name,
            short_name=short_name or name.lower(),
            color=color
        )
    return status


def get_or_create_department(name):
    departmemt = Department.get_by(name=name)
    if departmemt is None:
        departmemt = Department(
            name=name,
            color="#000000"
        )
        departmemt.save()
    return departmemt


def get_next_preview_revision(task_id):
    preview_files = PreviewFile.query.filter_by(
        task_id=task_id
    ).order_by(
        PreviewFile.revision.desc()
    ).all()

    revision = 1
    if len(preview_files) > 0:
        revision = preview_files[0].revision + 1

    return revision


def get_task_types_for_shot(shot):
    tasks = Task.query.filter_by(entity_id=shot.id).all()
    task_types = []

    if len(tasks) > 0:
        task_type_ids = [task.task_type_id for task in tasks]
        task_types = TaskType.query.filter(TaskType.id.in_(task_type_ids))

    return TaskType.serialize_list(task_types)
