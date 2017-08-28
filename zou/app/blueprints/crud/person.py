from zou.app.models.person import Person
from .base import (
    BaseModelsResource,
    BaseModelResource
)


class PersonsResource(BaseModelsResource):

    def __init__(self):
        BaseModelsResource.__init__(self, Person)


class PersonResource(BaseModelResource):

    def __init__(self):
        BaseModelResource.__init__(self, Person)
