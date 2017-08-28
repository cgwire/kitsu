from zou.app.models.preview_file import PreviewFile
from .base import BaseModelsResource, BaseModelResource


class PreviewFilesResource(BaseModelsResource):

    def __init__(self):
        BaseModelsResource.__init__(self, PreviewFile)


class PreviewFileResource(BaseModelResource):

    def __init__(self):
        BaseModelResource.__init__(self, PreviewFile)
