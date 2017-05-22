from zou.app.resources.data.base import BaseModelsResource, BaseModelResource

from zou.app.models.working_file import WorkingFile


class WorkingFilesResource(BaseModelsResource):

    def __init__(self):
        BaseModelsResource.__init__(self, WorkingFile)


class WorkingFileResource(BaseModelResource):

    def __init__(self):
        BaseModelResource.__init__(self, WorkingFile)
