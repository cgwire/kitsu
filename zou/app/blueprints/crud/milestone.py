from zou.app.models.milestone import Milestone
from zou.app.services import user_service

from .base import BaseModelResource, BaseModelsResource


class MilestonesResource(BaseModelsResource):
    def __init__(self):
        BaseModelsResource.__init__(self, Milestone)

    def check_create_permissions(self, milestone):
        user_service.check_manager_project_access(milestone["project_id"])


class MilestoneResource(BaseModelResource):
    def __init__(self):
        BaseModelResource.__init__(self, Milestone)

    def check_read_permissions(self, milestone):
        user_service.check_project_access(milestone["project_id"])

    def check_update_permissions(self, milestone, data):
        user_service.check_manager_project_access(milestone["project_id"])
