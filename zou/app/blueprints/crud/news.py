from zou.app.models.news import News

from .base import BaseModelResource, BaseModelsResource


class NewssResource(BaseModelsResource):
    def __init__(self):
        BaseModelsResource.__init__(self, News)


class NewsResource(BaseModelResource):
    def __init__(self):
        BaseModelResource.__init__(self, News)
