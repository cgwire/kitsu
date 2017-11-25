from flask import abort

from zou.app.models.person import Person
from zou.app.services import persons_service
from zou.app.utils import permissions

from .base import (
    BaseModelsResource,
    BaseModelResource
)


class PersonsResource(BaseModelsResource):

    def __init__(self):
        BaseModelsResource.__init__(self, Person)

    def post(self):
        abort(405)

    def check_read_permissions(self):
        return True


class PersonResource(BaseModelResource):

    def __init__(self):
        BaseModelResource.__init__(self, Person)

    def check_update_permissions(self, instance, data):
        if instance["id"] != persons_service.get_current_user()["id"]:
            self.check_escalation_permissions(instance, data)

    def check_delete_permissions(self, instance):
        self.check_escalation_permissions(instance)

    def check_escalation_permissions(self, instance, data=None):
        is_allowed = \
            permissions.admin_permission.can() or \
            (
                permissions.manager_permission.can() and
                instance["role"] not in ['admin', 'manager']
            )

        if is_allowed and data and not permissions.admin_permission.can():
            del data["role"]

        if is_allowed:
            return True
        else:
            raise permissions.PermissionDenied
