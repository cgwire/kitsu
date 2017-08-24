from flask import request
from flask_restful import Resource, reqparse
from flask_login import login_required, logout_user, login_user, current_user

from zou.app.project.exception import PersonNotFoundException

from zou.app.utils import auth
from zou.app.project import person_info


class AuthenticatedResource(Resource):

    @login_required
    def get(self):
        person = person_info.get_person(current_user.id)
        return {
            "authenticated": True,
            "user": person.serialize()
        }


class LogoutResource(Resource):

    @login_required
    def get(self):
        logout_user()
        return {
            "logout": True
        }


class LoginResource(Resource):

    def post(self):
        (email, password) = self.get_arguments()
        try:
            auth.check_credentials(email, password)

            user = auth.get_user_by_email(email)
            login_user(user)

            person = person_info.get_person(current_user.id)
            return {
                "login": True,
                "user": person.serialize()
            }
        except PersonNotFoundException:
            print("not registered")
            return {
                "login": False
            }, 400
        except auth.WrongPasswordException:
            print("wrong password")
            return {
                "login": False
            }, 400

    def get_arguments(self):
        parser = reqparse.RequestParser()
        parser.add_argument(
            "email",
            required=True,
            help="User email is missing."
        )
        parser.add_argument("password", default="")
        args = parser.parse_args()

        return (
            args["email"],
            args["password"],
        )


class RegistrationResource(Resource):

    def post(self):
        (
            email,
            password,
            password_2,
            first_name,
            last_name
        ) = self.get_arguments()

        try:
            email = auth.validate_email(email)
            auth.validate_password(password, password_2)
            password = auth.encrypt_password(password)
            person_info.create_person(email, password, first_name, last_name)
            return {"registration_success": True}, 201
        except auth.PasswordsNoMatchException:
            return {
                "error": True,
                "message": "Confirmation password doesn't match."
            }, 400
        except auth.PasswordTooShortException:
            return {
                "error": True,
                "message": "Password is too short."
            }, 400
        except auth.EmailNotValidException as exception:
            return {
                "error": True,
                "message": str(exception)
            }, 400

    def get_arguments(self):
        parser = reqparse.RequestParser()
        parser.add_argument(
            "email",
            required=True,
            help="User email is missing."
        )
        parser.add_argument(
            "first_name",
            required=True,
            help="First name is missing."
        )
        parser.add_argument(
            "last_name",
            required=True,
            help="Last name is missing."
        )
        parser.add_argument(
            "password",
            required=True,
            help="Password is missing."
        )
        parser.add_argument(
            "password_2",
            required=True,
            help="Confirmation password is missing."
        )
        args = parser.parse_args()

        return (
            args["email"],
            args["password"],
            args["password_2"],
            args["first_name"],
            args["last_name"]
        )


class ChangePasswordResource(Resource):

    @login_required
    def post(self):
        (
            old_password,
            password,
            password_2,
        ) = self.get_arguments()

        try:
            auth.check_credentials(current_user.email, old_password)
            auth.validate_password(password, password_2)
            password = auth.encrypt_password(password)
            person_info.update_password(current_user, password)
            return {"change_password_success": True}

        except auth.PasswordsNoMatchException:
            return {
                "error": True,
                "message": "Confirmation password doesn't match."
            }, 400
        except auth.PasswordTooShortException:
            return {
                "error": True,
                "message": "Password is too short."
            }, 400
        except auth.WrongPasswordException:
            return {
                "error": True,
                "message": "Old password is wrong."
            }, 400

    def get_arguments(self):
        parser = reqparse.RequestParser()
        parser.add_argument(
            "old_password",
            required=True,
            help="Old password is missing."
        )
        parser.add_argument(
            "password",
            required=True,
            help="New password is missing."
        )
        parser.add_argument(
            "password_2",
            required=True,
            help="New password confirmation is missing."
        )
        args = parser.parse_args()

        return (
            args["old_password"],
            args["password"],
            args["password_2"]
        )


class NewPersonResource(Resource):

    @login_required
    def post(self):
        data = request.json
        person = person_info.create_person(
            data["email"],
            auth.encrypt_password("default"),
            data["first_name"],
            data["last_name"],
            data["phone"]
        )

        return person.serialize(), 201
