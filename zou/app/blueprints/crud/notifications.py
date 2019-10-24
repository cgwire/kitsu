from zou.app.models.notification import Notification
from zou.app.utils import permissions

from .base import BaseModelResource, BaseModelsResource


class NotificationsResource(BaseModelsResource):
    def __init__(self):
        BaseModelsResource.__init__(self, Notification)

    def check_create_permissions(self, data):
        return permissions.check_admin_permissions()


class NotificationResource(BaseModelResource):
    def __init__(self):
        BaseModelResource.__init__(self, Notification)

    def check_read_permissions(self, instance):
        return permissions.check_admin_permissions()

    def check_update_permissions(self, instance, data):
        return permissions.check_admin_permissions()

    def check_delete_permissions(self, instance):
        return permissions.check_admin_permissions()
