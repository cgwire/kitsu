from flask_restful import Resource, reqparse
from flask_jwt_extended import jwt_required

from zou.app.services import persons_service
from zou.app.utils import auth, permissions


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
