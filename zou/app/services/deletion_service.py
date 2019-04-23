from zou.app.models.comment import Comment
from zou.app.models.entity import Entity
from zou.app.models.subscription import Subscription
from zou.app.models.notification import Notification
from zou.app.models.output_file import OutputFile
from zou.app.models.preview_file import PreviewFile
from zou.app.models.task import Task
from zou.app.models.task_status import TaskStatus
from zou.app.models.time_spent import TimeSpent
from zou.app.models.working_file import WorkingFile

from zou.app.utils import events
from zou.app.stores import file_store

from zou.app.services.exception import CommentNotFoundException


def remove_comment(comment_id):
    comment = Comment.get(comment_id)
    if comment is not None:
        notifications = Notification.query.filter_by(comment_id=comment.id)
        for notification in notifications:
            notification.delete()

        if comment.preview_file_id is not None:
            preview_file = PreviewFile.get(comment.preview_file_id)
            comment.preview_file_id = None
            comment.save()
            remove_preview_file(preview_file)

        previews = [preview for preview in comment.previews]
        comment.delete()

        for preview in previews:
            remove_preview_file(preview)

        reset_task_data(comment.object_id)
        events.emit("comment:delete", {
            "comment_id": comment.id
        })
        return comment.serialize()
    else:
        raise CommentNotFoundException


def reset_task_data(task_id):
    task = Task.get(task_id)
    retake_count = 0
    real_start_date = None
    last_comment_date = None
    end_date = None
    task_status_id = TaskStatus.get_by(short_name="todo").id
    comments = Comment.query \
        .join(TaskStatus) \
        .filter(Comment.object_id == task_id) \
        .order_by(Comment.created_at) \
        .add_columns(
            TaskStatus.is_retake,
            TaskStatus.is_done,
            TaskStatus.short_name
        ) \
        .all()

    previous_is_retake = False
    for (
        comment,
        task_status_is_retake,
        task_status_is_done,
        task_status_short_name
    ) in comments:
        if task_status_is_retake and not previous_is_retake:
            retake_count += 1
        previous_is_retake = task_status_is_retake

        if task_status_short_name.lower() == "wip" \
           and real_start_date is None:
            real_start_date = comment.created_at

        if task_status_is_done:
            end_date = comment.created_at
        else:
            end_date = None

        task_status_id = comment.task_status_id
        last_comment_date = comment.created_at

    duration = 0
    time_spents = TimeSpent.get_all_by(task_id=task.id)
    for time_spent in time_spents:
        duration += time_spent.duration

    task.update({
        "duration": duration,
        "retake_count": retake_count,
        "real_start_date": real_start_date,
        "last_comment_date": last_comment_date,
        "end_date": end_date,
        "task_status_id": task_status_id
    })
    events.emit("task:new", {
        "task_id": task.id
    })
    return task.serialize()


def remove_task(task_id, force=False):
    """
    Remove given task. Force deletion if the task has some comments and files
    related. This will lead to the deletion of all of them.
    """
    task = Task.get(task_id)
    entity = Entity.get(task.entity_id)

    if force:
        working_files = WorkingFile.query.filter_by(task_id=task_id)
        for working_file in working_files:
            output_files = OutputFile.query.filter_by(
                source_file_id=working_file.id
            )
            for output_file in output_files:
                output_file.delete()
            working_file.delete()

        comments = Comment.query.filter_by(object_id=task_id)
        for comment in comments:
            notifications = Notification.query.filter_by(comment_id=comment.id)
            for notification in notifications:
                notification.delete()
            comment.delete()

        subscriptions = Subscription.query.filter_by(task_id=task_id)
        for subscription in subscriptions:
            subscription.delete()

        preview_files = PreviewFile.query.filter_by(task_id=task_id)
        for preview_file in preview_files:
            remove_preview_file(preview_file)

        time_spents = TimeSpent.query.filter_by(task_id=task_id)
        for time_spent in time_spents:
            time_spent.delete()

        notifications = Notification.query.filter_by(task_id=task_id)
        for notification in notifications:
            notification.delete()

    task.delete()
    events.emit("task:delete", {
        "task_id": task_id
    })
    return task.serialize()


def remove_preview_file_by_id(preview_file_id):
    preview_file = PreviewFile.get(preview_file_id)
    return remove_preview_file(preview_file)


def remove_preview_file(preview_file):
    """
    Remove all files related to given preview file, then remove the preview file
    entry from the database.
    """
    task = Task.get(preview_file.task_id)
    entity = Entity.get(task.entity_id)
    if entity.preview_file_id == preview_file.id:
        entity.update({"preview_file_id": None})

    if preview_file.extension == "png":
        clear_picture_files(preview_file.id)
    elif preview_file.extension == "mp4":
        clear_movie_files(preview_file.id)
    else:
        clear_generic_files(preview_file.id)

    preview_file.comments = []
    preview_file.save()
    preview_file.delete()
    return preview_file.serialize()


def clear_picture_files(preview_file_id):
    """
    Remove all files related to given preview file, supposing the original file
    was a picture.
    """
    for image_type in [
        "originals",
        "thumbnails",
        "thumbnails-square",
        "previews"
    ]:
        try:
            file_store.remove_picture(image_type, preview_file_id)
        except:
            pass


def clear_movie_files(preview_file_id):
    """
    Remove all files related to given preview file, supposing the original file
    was a movie.
    """
    try:
        file_store.remove_movie("previews", preview_file_id)
    except:
        pass
    for image_type in [
        "thumbnails",
        "thumbnails-square",
        "previews"
    ]:
        try:
            file_store.remove_picture(image_type, preview_file_id)
        except:
            pass


def clear_generic_files(preview_file_id):
    """
    Remove all files related to given preview file, supposing the original file
    was a generic file.
    """
    try:
        file_store.remove_file("previews", preview_file_id)
    except:
        pass


def remove_tasks_for_project_and_task_type(project_id, task_type_id):
    """
    Remove fully all tasks and related for given project and task type.
    """
    tasks = Task.query.filter_by(
        project_id=project_id, task_type_id=task_type_id
    )
    for task in tasks:
        remove_task(task.id, force=True)
