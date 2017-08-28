from zou.app.models.project_status import ProjectStatus
from .base import BaseModelResource, BaseModelsResource


class ProjectStatussResource(BaseModelsResource):

    def __init__(self):
        BaseModelsResource.__init__(self, ProjectStatus)


class ProjectStatusResource(BaseModelResource):

    def __init__(self):
        BaseModelResource.__init__(self, ProjectStatus)
