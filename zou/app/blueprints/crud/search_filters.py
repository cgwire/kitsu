from zou.app.models.search_filters import SearchFilter
from zou.app.utils import permissions

from .base import BaseModelResource, BaseModelsResource


class SearchFiltersResource(BaseModelsResource):

    def __init__(self):
        BaseModelsResource.__init__(self, SearchFilter)

    def check_create_permissions(self, data):
        return permissions.check_admin_permissions()


class SearchFilterResource(BaseModelResource):

    def __init__(self):
        BaseModelResource.__init__(self, SearchFilterResource)

    def check_read_permissions(self, instance):
        return permissions.check_admin_permissions()

    def check_update_permissions(self, instance, data):
        return permissions.check_admin_permissions()

    def check_delete_permissions(self, instance):
        return permissions.check_admin_permissions()
