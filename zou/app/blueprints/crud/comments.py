from zou.app.models.comment import Comment

from zou.app.services import notifications_service, tasks_service, user_service
from zou.app.utils import permissions

from .base import BaseModelResource, BaseModelsResource


class CommentsResource(BaseModelsResource):

    def __init__(self):
        BaseModelsResource.__init__(self, Comment)


class CommentResource(BaseModelResource):

    def __init__(self):
        BaseModelResource.__init__(self, Comment)

    def post_update(self, instance_dict):
        comment = tasks_service.reset_mentions(instance_dict)
        notifications_service.reset_notifications_for_mentions(comment)
        return comment

    def check_read_permissions(self, instance):
        if permissions.has_admin_permissions():
            return True
        else:
            comment = self.get_model_or_404(instance["id"])
            task = tasks_service.get_task(comment.object_id)
            return user_service.check_project_access(task["project_id"])
