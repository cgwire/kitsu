from flask import Blueprint
from zou.app.utils.api import configure_api_from_blueprint

from .resources import (
    TaskFullResource,
    TaskAssignResource,
    TaskStartResource,
    StartTaskFromShotAssetResource,
    CommentTaskResource,
    TaskCommentsResource,
    TaskPreviewsResource,
    AddPreviewResource,
    CreateShotTasksResource,
    CreateAssetTasksResource,
    ToReviewResource,
    GetTimeSpentResource,
    SetTimeSpentResource,
    AddTimeSpentResource
)


routes = [
    ("/data/tasks/<task_id>/comments", TaskCommentsResource),
    ("/data/tasks/<task_id>/previews", TaskPreviewsResource),
    ("/data/tasks/<task_id>/full", TaskFullResource),
    ("/actions/tasks/<task_id>/comment", CommentTaskResource),
    ("/actions/tasks/<task_id>/assign", TaskAssignResource),
    ("/actions/tasks/<task_id>/start", TaskStartResource),
    ("/actions/tasks/<task_id>/time-spents/<date>", GetTimeSpentResource),
    (
        "/actions/tasks/<task_id>/time-spents/<date>/persons/<person_id>",
        SetTimeSpentResource
    ),
    (
        "/actions/tasks/<task_id>/time-spents/<date>/persons/<person_id>/add",
        AddTimeSpentResource
    ),
    (
        "/actions/tasks/<task_id>/comments/<comment_id>/add-preview",
        AddPreviewResource
    ),
    ("/actions/tasks/<task_id>/to-review", ToReviewResource),
    (
        "/actions/task-types/<task_type_id>/shots/create-tasks",
        CreateShotTasksResource
    ),
    (
        "/actions/task-types/<task_type_id>/assets/create-tasks",
        CreateAssetTasksResource
    ),
    (
        "/actions/task-types/<task_type_id>/entity/<entity_id>/start",
        StartTaskFromShotAssetResource
    )
]

blueprint = Blueprint("tasks", "tasks")
api = configure_api_from_blueprint(blueprint, routes)
