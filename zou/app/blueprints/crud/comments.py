from zou.app.models.comment import Comment

from zou.app.services import tasks_service, user_service

from .base import BaseModelResource, BaseModelsResource


class CommentsResource(BaseModelsResource):

    def __init__(self):
        BaseModelsResource.__init__(self, Comment)


class CommentResource(BaseModelResource):

    def __init__(self):
        BaseModelResource.__init__(self, Comment)

    def check_read_permissions(self, instance):
        comment = self.get_model_or_404(instance["id"])
        task = tasks_service.get_task(comment.object_id)
        return user_service.check_has_task_related(task.project_id)
