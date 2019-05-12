import datetime
import re
import uuid

from sqlalchemy.exc import StatementError, IntegrityError, DataError
from sqlalchemy.orm import aliased

from zou.app import app
from zou.app.utils import events

from zou.app.models.comment import Comment
from zou.app.models.department import Department
from zou.app.models.entity import Entity
from zou.app.models.news import News
from zou.app.models.person import Person
from zou.app.models.task import Task
from zou.app.models.task_type import TaskType
from zou.app.models.task_status import TaskStatus
from zou.app.models.time_spent import TimeSpent
from zou.app.models.project import Project
from zou.app.models.entity_type import EntityType
from zou.app.models.preview_file import PreviewFile

from zou.app.utils import fields

from zou.app.services.exception import (
    CommentNotFoundException,
    TaskNotFoundException,
    TaskStatusNotFoundException,
    TaskTypeNotFoundException,
    DepartmentNotFoundException,
    WrongDateFormatException
)

from zou.app.services import (
    assets_service,
    base_service,
    files_service,
    persons_service,
    shots_service
)


def get_done_status():
    return get_or_create_status(
        app.config["DONE_TASK_STATUS"],
        "done",
        is_done=True
    )


def get_wip_status():
    return get_or_create_status(app.config["WIP_TASK_STATUS"], "wip")


def get_to_review_status():
    return get_or_create_status(
        app.config["TO_REVIEW_TASK_STATUS"],
        "pndng"
    )


def get_todo_status():
    return get_or_create_status("Todo")


def get_task_status_raw(task_status_id):
    """
    Get task status matching given id as an active record.
    """
    return base_service.get_instance(
        TaskStatus,
        task_status_id,
        TaskStatusNotFoundException
    )


def get_task_status(task_status_id):
    """
    Get task status matching given id  as a dictionary.
    """
    return get_task_status_raw(task_status_id).serialize()


def get_department(department_id):
    """
    Get department matching given id as a dictionary.
    """
    try:
        department = Department.get(department_id)
    except StatementError:
        raise DepartmentNotFoundException()

    if department is None:
        raise DepartmentNotFoundException()

    return department.serialize()


def get_department_from_task(task_id):
    """
    Get department of given task as dictionary
    """
    task = get_task_raw(task_id)
    task_type = get_task_type_raw(task.task_type_id)
    return get_department(task_type.department_id)


def get_task_type_raw(task_type_id):
    """
    Get task type matching given id as an active record.
    """
    try:
        task_type = TaskType.get(task_type_id)
    except StatementError:
        raise TaskTypeNotFoundException()

    if task_type is None:
        raise TaskTypeNotFoundException()

    return task_type


def get_task_type(task_type_id):
    """
    Get task type matching given id as a dictionary.
    """
    return get_task_type_raw(task_type_id).serialize()


def get_task_raw(task_id):
    """
    Get task matching given id as an active record.
    """
    try:
        task = Task.get(task_id)
    except StatementError:
        raise TaskNotFoundException()

    if task is None:
        raise TaskNotFoundException()

    return task


def get_task(task_id):
    """
    Get task matching given id as a dictionary.
    """
    return get_task_raw(task_id).serialize()


def get_task_by_shotgun_id(shotgun_id):
    """
    Get task matching given shotgun id as a dictionary.
    """
    task = Task.get_by(shotgun_id=shotgun_id)
    if task is None:
        raise TaskNotFoundException
    return task.serialize()


def get_tasks_for_shot(shot_id):
    """
    Get all tasks for given shot.
    """
    shot = shots_service.get_shot(shot_id)
    return get_task_dicts_for_entity(shot["id"])


def get_tasks_for_scene(scene_id):
    """
    Get all tasks for given scene.
    """
    scene = shots_service.get_scene(scene_id)
    return get_task_dicts_for_entity(scene["id"])


def get_tasks_for_sequence(sequence_id):
    """
    Get all tasks for given sequence.
    """
    sequence = shots_service.get_sequence(sequence_id)
    return get_task_dicts_for_entity(sequence["id"])


def get_tasks_for_asset(asset_id):
    """
    Get all tasks for given asset.
    """
    asset = assets_service.get_asset_raw(asset_id)
    return get_task_dicts_for_entity(asset.id)


def get_task_dicts_for_entity(entity_id):
    """
    Return all tasks related to given entity. Add extra information like
    project name, task type name, etc.
    """
    query = Task.query.order_by(Task.name) \
        .filter_by(entity_id=entity_id) \
        .join(Project) \
        .join(TaskType) \
        .join(TaskStatus) \
        .join(Entity, Task.entity_id == Entity.id) \
        .join(EntityType) \
        .add_columns(Project.name) \
        .add_columns(TaskType.name) \
        .add_columns(TaskStatus.name) \
        .add_columns(EntityType.name) \
        .add_columns(Entity.name) \
        .order_by(
            Project.name,
            TaskType.name,
            EntityType.name,
            Entity.name
        )
    results = []

    for entry in query.all():
        (
            task_object,
            project_name,
            task_type_name,
            task_status_name,
            entity_type_name,
            entity_name
        ) = entry

        task = task_object.serialize()
        task["project_name"] = project_name
        task["task_type_name"] = task_type_name
        task["task_status_name"] = task_status_name
        task["entity_type_name"] = entity_type_name
        task["entity_name"] = entity_name
        results.append(task)
    return results


def get_task_types_for_shot(shot_id):
    """
    Return all task types for which there is a task related to given shot.
    """
    return get_task_types_for_entity(shot_id)


def get_task_types_for_scene(scene_id):
    """
    Return all task types for which there is a task related to given scene.
    """
    return get_task_types_for_entity(scene_id)


def get_task_types_for_sequence(sequence_id):
    """
    Return all task types for which there is a task related to given sequence.
    """
    return get_task_types_for_entity(sequence_id)


def get_task_types_for_asset(asset_id):
    """
    Return all task types for which there is a task related to given asset.
    """
    return get_task_types_for_entity(asset_id)


def get_task_types_for_entity(entity_id):
    """
    Return all task types for which there is a task related to given entity.
    """
    task_types = TaskType.query \
        .join(Task, Entity) \
        .filter(Entity.id == entity_id) \
        .all()
    return fields.serialize_models(task_types)


def get_task_type_map():
    """
    Return a dict of which keys are task type ids and values are task types.
    """
    task_types = TaskType.query.all()
    return {
        str(task_type.id): task_type.serialize() for task_type in task_types
    }


def get_next_preview_revision(task_id):
    """
    Get upcoming revision for preview files of given task.
    """
    preview_files = PreviewFile.query.filter_by(
        task_id=task_id
    ).order_by(
        PreviewFile.revision.desc()
    ).all()
    revision = 1
    if len(preview_files) > 0:
        revision = preview_files[0].revision + 1
    return revision


def get_time_spents(task_id):
    """
    Return time spents for given task.
    """
    result = {"total": 0}
    time_spents = TimeSpent.query.filter_by(task_id=task_id).all()
    for time_spent in time_spents:
        result[str(time_spent.person_id)] = time_spent.serialize()
        result["total"] += time_spent.duration
    return result


def get_comments(task_id):
    """
    Return all comments related to given task.
    """
    comments = []
    query = Comment.query.order_by(Comment.created_at.desc()) \
        .filter_by(object_id=task_id) \
        .join(Person, TaskStatus) \
        .add_columns(
            TaskStatus.name,
            TaskStatus.short_name,
            TaskStatus.color,
            Person.first_name,
            Person.last_name,
            Person.has_avatar
        )

    for result in query.all():
        (
            comment,
            task_status_name,
            task_status_short_name,
            task_status_color,
            person_first_name,
            person_last_name,
            person_has_avatar
        ) = result

        comment_dict = comment.serialize()
        comment_dict["person"] = {
            "first_name": person_first_name,
            "last_name": person_last_name,
            "has_avatar": person_has_avatar,
            "id": str(comment.person_id)
        }
        comment_dict["task_status"] = {
            "name": task_status_name,
            "short_name": task_status_short_name,
            "color": task_status_color,
            "id": str(comment.task_status_id)
        }

        if comment.preview_file_id is not None:
            preview = PreviewFile.get(comment.preview_file_id)
            comment_dict["previews"] = [{
                "id": str(preview.id),
                "revision": preview.revision,
                "is_movie": preview.is_movie,
                "extension": preview.extension,
                "annotations": preview.annotations
            }]
        else:
            comment_dict["previews"] = []
            previews = sorted(
                comment.previews,
                key=lambda x: x.created_at
            )
            for preview in previews:
                comment_dict["previews"].append({
                    "id": str(preview.id),
                    "revision": preview.revision,
                    "is_movie": preview.is_movie,
                    "extension": preview.extension,
                    "annotations": preview.annotations
                })
        comments.append(comment_dict)
    return comments


def get_comment_raw(comment_id):
    """
    Return comment matching give id as an active record.
    """
    try:
        comment = Comment.get(comment_id)
    except StatementError:
        raise CommentNotFoundException()

    if comment is None:
        raise CommentNotFoundException()
    return comment


def get_comment(comment_id):
    """
    Return comment matching give id as an active record.
    """
    comment = get_comment_raw(comment_id)
    return comment.serialize()


def get_comment_by_preview_file_id(preview_file_id):
    """
    Return comment related to given preview file as a dict.
    """
    preview_file = files_service.get_preview_file_raw(preview_file_id)
    comment = Comment.query \
         .filter(Comment.previews.contains(preview_file)) \
         .first()
    if comment is not None:
        return comment.serialize()
    else:
        return None


def create_comment(
    object_id,
    task_status_id,
    person_id,
    text,
    object_type="Task"
):
    """
    Create a new comment for given object (by default, it considers this object
    as a Task).
    """
    comment = Comment.create(
        object_id=object_id,
        object_type=object_type,
        task_status_id=task_status_id,
        person_id=person_id,
        mentions=get_comment_mentions(object_id, text),
        text=text
    )
    events.emit("comment:new", {
        "comment_id": comment.id,
    })
    return comment.serialize()


def get_comment_mentions(object_id, text):
    """
    Check for people mention (@full name) in text and returns matching person
    active records.
    """
    task = get_task_raw(object_id)
    project = Project.get(task.project_id)
    mentions = []
    for person in project.team:
        if re.search("@%s( |$)" % person.full_name(), text) is not None:
            mentions.append(person)
    return mentions


def delete_comment(comment_id):
    comment = get_comment_raw(comment_id)
    comment.delete()
    events.emit("comment:delete", {
        "comment_id": comment_id,
    })
    return comment.serialize()


def get_tasks_for_entity_and_task_type(entity_id, task_type_id):
    """
    For a task type, returns all tasks related to given entity.
    """
    tasks = Task.query \
        .filter_by(entity_id=entity_id, task_type_id=task_type_id) \
        .order_by(Task.name) \
        .all()
    return Task.serialize_list(tasks)


def get_task_statuses():
    """
    Get all available task status.
    """
    return fields.serialize_list(TaskStatus.query.all())


def get_task_status_map():
    """
    Return a dict of which keys are task status ids and values are task
    statuses.
    """
    return {
        str(status.id): status.serialize() for status in TaskStatus.query.all()
    }


def get_person_done_tasks(person_id, projects):
    """
    Return all finished tasks performed by a person.
    """
    return get_person_tasks(
        person_id,
        projects,
        is_done=True
    )


def get_person_tasks(person_id, projects, is_done=None):
    """
    Retrieve all tasks for given person and projects.
    """
    person = Person.get(person_id)
    project_ids = [project["id"] for project in projects]

    Sequence = aliased(Entity, name='sequence')
    Episode = aliased(Entity, name='episode')
    query = Task.query \
        .join(Project, TaskType, TaskStatus) \
        .join(Entity, Entity.id == Task.entity_id) \
        .join(EntityType, EntityType.id == Entity.entity_type_id) \
        .outerjoin(Sequence, Sequence.id == Entity.parent_id) \
        .outerjoin(Episode, Episode.id == Sequence.parent_id) \
        .filter(Task.assignees.contains(person)) \
        .filter(Project.id.in_(project_ids)) \
        .add_columns(
            Project.name,
            Project.has_avatar,
            Entity.id,
            Entity.name,
            Entity.description,
            Entity.preview_file_id,
            Entity.source_id,
            EntityType.name,
            Sequence.name,
            Episode.id,
            Episode.name,
            TaskType.name,
            TaskStatus.name,
            TaskType.color,
            TaskStatus.color,
            TaskStatus.short_name
        )

    if is_done:
        query = query \
            .filter(TaskStatus.is_done == True) \
            .order_by(Task.end_date.desc(), TaskType.name, Entity.name)
    else:
        query = query.filter(TaskStatus.is_done == False)

    tasks = []
    for (
        task,
        project_name,
        project_has_avatar,
        entity_id,
        entity_name,
        entity_description,
        entity_preview_file_id,
        entity_source_id,
        entity_type_name,
        sequence_name,
        episode_id,
        episode_name,
        task_type_name,
        task_status_name,
        task_type_color,
        task_status_color,
        task_status_short_name
    ) in query.all():
        if entity_preview_file_id is None:
            entity_preview_file_id = ""

        if entity_source_id is None:
            entity_source_id = ""

        if episode_id is None:
            episode_id = entity_source_id

        task_dict = task.serialize()
        task_dict.update({
            "project_name": project_name,
            "project_id": str(task.project_id),
            "project_has_avatar": project_has_avatar,
            "entity_id": str(entity_id),
            "entity_name": entity_name,
            "entity_description": entity_description,
            "entity_preview_file_id": str(entity_preview_file_id),
            "entity_source_id": str(entity_source_id),
            "entity_type_name": entity_type_name,
            "sequence_name": sequence_name,
            "episode_id": str(episode_id),
            "episode_name": episode_name,
            "task_estimation": task.estimation,
            "task_type_name": task_type_name,
            "task_status_name": task_status_name,
            "task_type_color": task_type_color,
            "task_status_color": task_status_color,
            "task_status_short_name": task_status_short_name
        })
        tasks.append(task_dict)

    task_ids = [task["id"] for task in tasks]

    task_comment_map = {}
    comments = Comment.query \
        .filter(Comment.object_id.in_(task_ids)) \
        .order_by(Comment.object_id, Comment.created_at) \
        .all()

    task_id = None
    for comment in comments:
        if comment.object_id != task_id:
            task_id = fields.serialize_value(comment.object_id)
            task_comment_map[task_id] = {
                "text": comment.text,
                "date": fields.serialize_value(comment.created_at),
                "person_id": fields.serialize_value(comment.person_id)
            }
    for task in tasks:
        if task["id"] in task_comment_map:
            task["last_comment"] = task_comment_map[task["id"]]
        else:
            task["last_comment"] = {}

    return tasks


def create_task(task_type, entity, name="main"):
    """
    Create a new task for given task type and entity.
    """
    task_status = get_todo_status()
    try:
        try:
            current_user_id = persons_service.get_current_user()["id"]
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
            task_status_id=task_status["id"],
            entity_id=entity["id"],
            assigner_id=current_user_id,
            assignees=[]
        )
        task_dict = task.serialize()
        task_dict.update({
            "task_status_id": task_status["id"],
            "task_status_name": task_status["name"],
            "task_status_short_name": task_status["short_name"],
            "task_status_color": task_status["color"],
            "task_type_id": task_type["id"],
            "task_type_name": task_type["name"],
            "task_type_color": task_type["color"],
            "task_type_priority": task_type["priority"]
        })
        events.emit("task:new", {
            "task_id": task.id
        })
        return task_dict

    except IntegrityError:
        pass  # Tasks already exists, no need to create it.


def update_task(task_id, data):
    """
    Update task with given data.
    """
    task = get_task_raw(task_id)

    if is_finished(task, data):
        data["end_date"] = datetime.datetime.now()

    task.update(data)
    events.emit("task:update", {
        "task_id": task_id
    })
    return task.serialize()


def get_or_create_status(
    name,
    short_name="",
    color="#f5f5f5",
    is_done=False,
    is_retake=False
):
    """
    Create a new task status if it doesn't exist. If it exists, it returns the
    status from database.
    """
    task_status = TaskStatus.get_by(name=name)
    if task_status is None and len(short_name) > 0:
        task_status = TaskStatus.get_by(short_name=short_name)

    if task_status is None:
        task_status = TaskStatus.create(
            name=name,
            short_name=short_name or name.lower(),
            color=color,
            is_reviewable=True,
            is_done=is_done,
            is_retake=is_retake
        )
        events.emit("task_status:new", {
            "task_status_id": task_status.id
        })
    return task_status.serialize()


def update_task_status(task_status_id, data):
    """
    Update task status data with given task_id.
    """
    task_status = get_task_status_raw(task_status_id)
    task_status.update(data)
    events.emit("task_status:update", {
        "task_status_id": task_status_id
    })
    return task_status.serialize()


def get_or_create_department(name):
    """
    Create a new department it doesn't exist. If it exists, it returns the
    department from database.
    """
    department = Department.get_by(name=name)
    if department is None:
        department = Department(
            name=name,
            color="#000000"
        )
        department.save()
        events.emit("department:new", {
            "department_id": department.id
        })
    return department.serialize()


def get_or_create_task_type(
    department,
    name,
    color="#888888",
    priority=1,
    for_shots=False,
    for_entity="Asset",
    short_name="",
    shotgun_id=None
):
    """
    Create a new task type if it doesn't exist. If it exists, it returns the
    type from database.
    """
    task_type = TaskType.get_by(name=name)
    if task_type is None:
        task_type = TaskType.create(
            name=name,
            short_name=short_name,
            department_id=department["id"],
            color=color,
            priority=priority,
            for_shots=for_shots,
            shotgun_id=shotgun_id
        )
        events.emit("task_type:new", {
            "task_type_id": task_type.id
        })
    return task_type.serialize()


def create_or_update_time_spent(task_id, person_id, date, duration, add=False):
    """
    Create a new time spent if it doesn't exist. If it exists, it update it
    with the new duratin and returns it from the database.
    """
    try:
        time_spent = TimeSpent.get_by(
            task_id=task_id,
            person_id=person_id,
            date=date
        )
    except DataError:
        raise WrongDateFormatException

    if time_spent is not None:
        if duration == 0:
            time_spent.delete()
        elif add:
            time_spent.update({"duration": time_spent.duration + duration})
        else:
            time_spent.update({"duration": duration})
    else:
        time_spent = TimeSpent.create(
            task_id=task_id,
            person_id=person_id,
            date=date,
            duration=duration
        )

    task = Task.get(task_id)
    task.duration = 0
    time_spents = TimeSpent.get_all_by(task_id=task_id)
    for time_spent in time_spents:
        task.duration += time_spent.duration
    task.save()
    events.emit("task:update", {"task_id": task_id})

    return time_spent.serialize()


def is_finished(task, data):
    """
    Return True if task status is set to done.
    """
    if "task_status_id" in data:
        task_status = get_task_status_raw(task.task_status_id)
        new_task_status = get_task_status_raw(data["task_status_id"])
        return new_task_status.id != task_status.id and new_task_status.is_done
    else:
        return False


def clear_assignation(task_id):
    """
    Clear task assignation and emit a *task:unassign* event.
    """
    task = get_task_raw(task_id)
    assignees = [person.serialize() for person in task.assignees]
    task.update({"assignees": []})
    task_dict = task.serialize()
    for assignee in assignees:
        events.emit("task:unassign", {
            "person_id": assignee["id"],
            "task_id": task_id
        })
    return task_dict


def assign_task(task_id, person_id):
    """
    Assign given person to given task. Emit a *task:assign* event.
    """
    task = get_task_raw(task_id)
    person = persons_service.get_person_raw(person_id)
    task.assignees.append(person)
    task.save()
    task_dict = task.serialize()
    events.emit("task:assign", {
        "task_id": task.id,
        "person_id": person.id
    })
    return task_dict


def start_task(task_id):
    """
    Change the task status to wip if it is not already the case. It emits a
    *task:start* event. Change the real start date time to now.
    """
    task = get_task_raw(task_id)
    wip_status = get_wip_status()
    task_is_not_already_wip = \
        task.task_status_id is None \
        or task.task_status_id != wip_status["id"]

    if task_is_not_already_wip:
        task_dict_before = task.serialize()

        new_data = {"task_status_id": wip_status["id"]}
        if task.real_start_date is None:
            new_data["real_start_date"] = datetime.datetime.now()

        task.update(new_data)
        events.emit("task:start", {
            "task_id": task_id,
            "previous_task_status_id": task_dict_before["task_status_id"],
            "real_start_date": task.real_start_date,
            "shotgun_id": task_dict_before["shotgun_id"]
        })

    return task.serialize()


def task_to_review(
    task_id,
    person,
    comment,
    preview_path={},
    change_status=True
):
    """
    Change the task status to "waiting for approval" if it is not already the
    case. It emits a *task:to-review* event.
    """
    task = get_task_raw(task_id)
    to_review_status = get_to_review_status()
    task_dict_before = task.serialize()

    if change_status:
        task.update({"task_status_id": to_review_status["id"]})
        task.save()

    project = Project.get(task.project_id)
    entity = Entity.get(task.entity_id)
    entity_type = EntityType.get(entity.entity_type_id)

    task_dict_after = task.serialize()
    task_dict_after["project"] = project.serialize()
    task_dict_after["entity"] = entity.serialize()
    task_dict_after["entity_type"] = entity_type.serialize()
    task_dict_after["person"] = person
    task_dict_after["comment"] = comment
    task_dict_after["preview_path"] = preview_path

    events.emit("task:to-review", {
        "task_id": task_id,
        "task_shotgun_id": task_dict_before["shotgun_id"],
        "entity_type_name": entity_type.name,
        "previous_task_status_id": task_dict_before["task_status_id"],
        "entity_shotgun_id": entity.shotgun_id,
        "project_shotgun_id": project.shotgun_id,
        "person_shotgun_id": person["shotgun_id"],
        "comment": comment,
        "preview_path": preview_path,
        "change_status": change_status
    })

    return task_dict_after


def add_preview_file_to_comment(comment_id, person_id, task_id, revision=0):
    """
    Add a preview to comment preview list. Auto set the revision field
    (add 1 if it's a new preview, keep the preview revision in other cases).
    """
    comment = get_comment_raw(comment_id)
    news = News.get_by(comment_id=comment_id)
    if revision == 0 and len(comment.previews) == 0:
        revision = get_next_preview_revision(task_id)
    elif revision == 0:
        revision = comment.previews[0].revision

    preview_file = files_service.create_preview_file_raw(
        str(uuid.uuid4())[:13],
        revision,
        task_id,
        person_id
    )
    comment.previews.append(preview_file)
    comment.save()

    if news is not None:
        news.update({"preview_file_id": preview_file.id})

    return preview_file.serialize()


def reset_mentions(comment):
    task = get_task(comment["object_id"])
    mentions = get_comment_mentions(
        task["id"],
        comment["text"]
    )
    comment_to_update = Comment.get(comment["id"])
    comment_to_update.mentions = mentions
    comment_to_update.save()
    return comment_to_update.serialize()
