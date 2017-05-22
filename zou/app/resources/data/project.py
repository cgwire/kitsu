from zou.app.models.project import Project
from zou.app.resources.data.base import BaseModelResource, BaseModelsResource


class ProjectsResource(BaseModelsResource):

    def __init__(self):
        BaseModelsResource.__init__(self, Project)


class ProjectResource(BaseModelResource):

    def __init__(self):
        BaseModelResource.__init__(self, Project)
