from zou.app.models.comment import Comment
from zou.app.resources.data.base import BaseModelResource, BaseModelsResource


class CommentsResource(BaseModelsResource):

    def __init__(self):
        BaseModelsResource.__init__(self, Comment)


class CommentResource(BaseModelResource):

    def __init__(self):
        BaseModelResource.__init__(self, Comment)
