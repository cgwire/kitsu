import datetime

from flask_restful import Resource, reqparse
from flask_jwt_extended import jwt_required

from zou.app.services import persons_service
from zou.app.utils import auth, permissions, csv_utils


class NewPersonResource(Resource):
    """
    Create a new user in the database. Set "default" as password.
    User role can be set but only admins can create admin users.
    """

    @jwt_required
    def post(self):
        permissions.check_admin_permissions()
        data = self.get_arguments()
        person = persons_service.create_person(
            data["email"],
            auth.encrypt_password("default"),
            data["first_name"],
            data["last_name"],
            data["phone"],
            role=data["role"]
        )
        return person, 201

    def get_arguments(self):
        parser = reqparse.RequestParser()
        parser.add_argument(
            "email",
            help="The email is required.",
            required=True
        )
        parser.add_argument(
            "first_name",
            help="The first name is required.",
            required=True
        )
        parser.add_argument(
            "last_name",
            help="The last name is required.",
            required=True
        )
        parser.add_argument("phone", default="")
        parser.add_argument("role", default="user")
        args = parser.parse_args()
        return args


class DesktopLoginsResource(Resource):
    """
    Allow to create and retrieve desktop login logs. Desktop login logs can only
    be created by current user.
    """

    @jwt_required
    def get(self, person_id):
        current_user = persons_service.get_current_user()
        if current_user["id"] != person_id and \
           not permissions.has_manager_permissions():
            raise permissions.PermissionDenied

        persons_service.get_person(person_id)
        return persons_service.get_desktop_login_logs(person_id)

    @jwt_required
    def post(self, person_id):
        arguments = self.get_arguments()

        current_user = persons_service.get_current_user()
        if current_user["id"] != person_id and \
           not permissions.has_admin_permissions():
            raise permissions.PermissionDenied

        desktop_login_log = persons_service.create_desktop_login_logs(
            person_id,
            arguments["date"]
        )

        return desktop_login_log, 201

    def get_arguments(self):
        parser = reqparse.RequestParser()
        parser.add_argument("date", default=datetime.datetime.now())
        return parser.parse_args()


class PresenceLogsResource(Resource):
    """
    """

    @jwt_required
    def get(self, month_date):
        permissions.check_admin_permissions()
        date = datetime.datetime.strptime(month_date, "%Y-%m")
        presence_logs = persons_service.get_presence_logs(date.year, date.month)
        return csv_utils.build_csv_response(presence_logs)
