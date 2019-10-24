from zou.app.models.metadata_descriptor import MetadataDescriptor

from .base import BaseModelResource, BaseModelsResource


class MetadataDescriptorsResource(BaseModelsResource):
    def __init__(self):
        BaseModelsResource.__init__(self, MetadataDescriptor)


class MetadataDescriptorResource(BaseModelResource):
    def __init__(self):
        BaseModelResource.__init__(self, MetadataDescriptor)
