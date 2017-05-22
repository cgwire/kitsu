from zou.app.resources.data.base import BaseModelsResource, BaseModelResource
from zou.app.models.person import Person


class PersonsResource(BaseModelsResource):

    def __init__(self):
        BaseModelsResource.__init__(self, Person)


class PersonResource(BaseModelResource):

    def __init__(self):
        BaseModelResource.__init__(self, Person)
