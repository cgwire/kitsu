from zou.app.resources.data.base import BaseModelsResource, BaseModelResource
from zou.app.models.preview_file import PreviewFile


class PreviewFilesResource(BaseModelsResource):

    def __init__(self):
        BaseModelsResource.__init__(self, PreviewFile)


class PreviewFileResource(BaseModelResource):

    def __init__(self):
        BaseModelResource.__init__(self, PreviewFile)
