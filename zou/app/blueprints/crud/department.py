from zou.app.models.department import Department
from .base import BaseModelResource, BaseModelsResource


class DepartmentsResource(BaseModelsResource):

    def __init__(self):
        BaseModelsResource.__init__(self, Department)


class DepartmentResource(BaseModelResource):

    def __init__(self):
        BaseModelResource.__init__(self, Department)
