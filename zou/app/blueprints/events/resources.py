from flask_restful import Resource
from flask_jwt_extended import jwt_required

from zou.app.mixin import ArgsMixin
from zou.app.utils import fields, permissions

from zou.app.services import (
    events_service
)


class EventsResource(Resource, ArgsMixin):

    @jwt_required
    def get(self):
        args = self.get_args([
            ("before", None, None),
            ("page_size", 100, False)
        ])
        permissions.check_manager_permissions()
        before = None
        if args["before"] is not None:
            before = fields.get_date_object(args["before"], "%Y-%m-%dT%H:%M:%S")
        page_size = args["page_size"]
        return events_service.get_last_events(before, page_size)


class LoginLogsResource(Resource, ArgsMixin):

    @jwt_required
    def get(self):
        args = self.get_args([
            ("before", None, None),
            ("page_size", 100, False)
        ])
        permissions.check_manager_permissions()
        before = None
        if args["before"] is not None:
            before = fields.get_date_object(args["before"], "%Y-%m-%dT%H:%M:%S")
        page_size = args["page_size"]
        return events_service.get_last_login_logs(before, page_size)
