from zou.app.models.comment import Comment
from zou.app.models.news import News
from zou.app.models.preview_file import PreviewFile
from zou.app.models.project import Project
from zou.app.models.task import Task

from zou.app.utils import events, fields
from zou.app.services import (
    names_service,
    tasks_service
)


def create_news(
    comment_id=None,
    author_id=None,
    task_id=None,
    preview_file_id=None,
    change=False
):
    """
    Create a new news for given person and comment.
    """
    news = News.create(
        change=change,
        author_id=author_id,
        comment_id=comment_id,
        preview_file_id=preview_file_id,
        task_id=task_id
    )
    return news.serialize()


def create_news_for_task_and_comment(task, comment, change=False):
    """
    For given task and comment, create a news matching comment and change
    that occured on the task.
    """
    task = tasks_service.get_task(task["id"])
    news = create_news(
        comment_id=comment["id"],
        preview_file_id=comment["preview_file_id"],
        author_id=comment["person_id"],
        task_id=comment["object_id"],
        change=change
    )
    events.emit("news:new", {
        "news_id": news["id"],
        "project_id": task["project_id"]
    }, persist=False)
    return news


def delete_news_for_comment(comment_id):
    """
    Delete all news related to comment. It's mandatory to be able to delete the
    comment afterwards.
    """
    news_list = News.get_all_by(comment_id=comment_id)
    for news in news_list:
        news.delete()
    return fields.serialize_list(news_list)


def get_last_news_for_project(
    project_id,
    filters={},
    news_id=None,
    page=1
):
    """
    Return last 100 user notifications. Add related information to make it
    displayable.
    """
    limit = 50
    offset = (page - 1) * limit

    query = News.query \
        .order_by(News.created_at.desc()) \
        .join(Task, News.task_id == Task.id) \
        .join(Project) \
        .outerjoin(Comment, News.comment_id == Comment.id) \
        .outerjoin(PreviewFile, News.preview_file_id == PreviewFile.id) \
        .filter(Task.project_id == project_id) \
        .add_columns(
            Project.id,
            Project.name,
            Task.task_type_id,
            Comment.id,
            Comment.task_status_id,
            Task.entity_id,
            PreviewFile.extension
        )

    if news_id is not None:
        query = query.filter(News.id == news_id)

    query = query.limit(limit)
    query = query.offset(offset)
    news_list = query.limit(50).all()
    result = []

    for (
        news,
        project_id,
        project_name,
        task_type_id,
        comment_id,
        task_status_id,
        task_entity_id,
        preview_file_extension
    ) in news_list:
        (full_entity_name, episode_id) = \
            names_service.get_full_entity_name(task_entity_id)

        result.append(fields.serialize_dict({
            "id": news.id,
            "author_id": news.author_id,
            "comment_id": news.comment_id,
            "task_id": news.task_id,
            "task_type_id": task_type_id,
            "task_status_id": task_status_id,
            "preview_file_id": news.preview_file_id,
            "preview_file_extension": preview_file_extension,
            "project_id": project_id,
            "project_name": project_name,
            "created_at": news.created_at,
            "change": news.change,
            "full_entity_name": full_entity_name,
            "episode_id": episode_id
        }))
    return result
