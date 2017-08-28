from zou.app.models.output_file import OutputFile
from .base import BaseModelsResource, BaseModelResource


class OutputFilesResource(BaseModelsResource):

    def __init__(self):
        BaseModelsResource.__init__(self, OutputFile)


class OutputFileResource(BaseModelResource):

    def __init__(self):
        BaseModelResource.__init__(self, OutputFile)
