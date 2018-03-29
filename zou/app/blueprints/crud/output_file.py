from zou.app.models.output_file import OutputFile
from zou.app.services import user_service

from .base import BaseModelsResource, BaseModelResource


class OutputFilesResource(BaseModelsResource):

    def __init__(self):
        BaseModelsResource.__init__(self, OutputFile)


class OutputFileResource(BaseModelResource):

    def __init__(self):
        BaseModelResource.__init__(self, OutputFile)

    def check_read_permissions(self, instance):
        return user_service.check_project_access(instance.project_id)
