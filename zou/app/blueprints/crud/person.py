from flask import abort

from zou.app.models.person import Person
from zou.app.models.notification import Notification
from zou.app.models.search_filter import SearchFilter
from zou.app.services import persons_service
from zou.app.utils import permissions

from .base import (
    BaseModelsResource,
    BaseModelResource
)


class PersonsResource(BaseModelsResource):

    def __init__(self):
        BaseModelsResource.__init__(self, Person)

    def all_entries(self, query=None):
        if query is None:
            query = self.model.query

        if permissions.has_manager_permissions():
            return [person.serialize_safe() for person in query.all()]
        else:
            return [person.serialize_without_info() for person in query.all()]

    def post(self):
        abort(405)

    def check_read_permissions(self):
        return True


class PersonResource(BaseModelResource):

    def __init__(self):
        BaseModelResource.__init__(self, Person)
        self.protected_fields += [
            "password"
        ]

    def check_read_permissions(self, instance):
        return True

    def check_update_permissions(self, instance, data):
        if instance["id"] != persons_service.get_current_user()["id"]:
            self.check_escalation_permissions(instance, data)

    def check_delete_permissions(self, instance):
        self.check_escalation_permissions(instance)

    def check_escalation_permissions(self, instance, data=None):
        if permissions.admin_permission.can():
            return True
        else:
            raise permissions.PermissionDenied

    def serialize_instance(self, instance):
        if permissions.has_manager_permissions():
            return instance.serialize_safe()
        else:
            return instance.serialize_without_info()

    def post_update(self, instance_dict):
        persons_service.clear_person_cache()
        return instance_dict

    def pre_delete(self, instance_dict):
        Notification.delete_all_by(person_id=instance_dict["id"])
        SearchFilter.delete_all_by(person_id=instance_dict["id"])
        return instance_dict

    def post_delete(self, instance_dict):
        persons_service.clear_person_cache()
        return instance_dict

    def update_data(self, data, instance_id):
        if "password" in data:
            del data["password"]
        return data
