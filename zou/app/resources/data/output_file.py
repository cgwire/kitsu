from zou.app.resources.data.base import BaseModelsResource, BaseModelResource
from zou.app.models.output_file import OutputFile


class OutputFilesResource(BaseModelsResource):

    def __init__(self):
        BaseModelsResource.__init__(self, OutputFile)


class OutputFileResource(BaseModelResource):

    def __init__(self):
        BaseModelResource.__init__(self, OutputFile)
