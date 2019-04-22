import uuid

from flask import request, jsonify, abort
from flask_restful import Resource, reqparse, current_app
from flask_principal import (
    Identity,
    AnonymousIdentity,
    RoleNeed,
    UserNeed,
    identity_changed,
    identity_loaded
)
from flask_mail import Message
from werkzeug.exceptions import Unauthorized

from sqlalchemy.exc import OperationalError, TimeoutError

from zou.app import app, mail
from zou.app.mixin import ArgsMixin
from zou.app.utils import auth
from zou.app.services import persons_service, auth_service, events_service
from zou.app.stores import auth_tokens_store
from zou.app.services.exception import (
    NoAuthStrategyConfigured,
    PersonNotFoundException,
    WrongPasswordException,
    WrongUserException,
    UnactiveUserException
)


from flask_jwt_extended import (
    jwt_required,
    jwt_refresh_token_required,
    create_access_token,
    create_refresh_token,
    get_jwt_identity,
    get_raw_jwt,
    set_access_cookies,
    set_refresh_cookies,
    unset_jwt_cookies
)


def is_from_browser(user_agent):
    return user_agent.browser in [
        "camino",
        "chrome",
        "firefox",
        "galeon",
        "kmeleon",
        "konqueror",
        "links",
        "lynx",
        "msie",
        "msn",
        "netscape",
        "opera",
        "safari",
        "seamonkey",
        "webkit"
    ]


def logout():
    try:
        current_token = get_raw_jwt()
        jti = current_token['jti']
        auth_service.revoke_tokens(app, jti)
    except:
        pass


def wrong_auth_handler(identity_user=None):
    if request.path not in [
        "/auth/login",
        "/auth/logout"
    ]:
        abort(401)
    else:
        return identity_user


@identity_loaded.connect_via(app)
def on_identity_loaded(sender, identity):

    if identity.id is not None:
        from zou.app.services import persons_service
        try:
            identity.user = persons_service.get_person(identity.id)

            if hasattr(identity.user, "id"):
                identity.provides.add(UserNeed(identity.user["id"]))

            if identity.user["role"] == "admin":
                identity.provides.add(RoleNeed("admin"))
                identity.provides.add(RoleNeed("manager"))

            if identity.user["role"] == "manager":
                identity.provides.add(RoleNeed("manager"))

            if not identity.user["active"]:
                current_app.logger.error("Current user is not active anymore")
                logout()
                return wrong_auth_handler(identity.user)

            return identity
        except PersonNotFoundException:
            return wrong_auth_handler()
        except TimeoutError:
            current_app.logger.error("Identity loading timed out")
            return wrong_auth_handler()
        except Exception as exception:
            current_app.logger.error(exception)
            if hasattr(exception, 'message'):
                current_app.logger.error(exception.message)
            return wrong_auth_handler()


class AuthenticatedResource(Resource):
    """
    Returns information if the user is authenticated else it returns a 401
    response.
    It can be used by third party tools, especially browser frontend, to know
    if current user is still logged in.
    """

    @jwt_required
    def get(self):
        try:
            person = persons_service.get_person_by_email(get_jwt_identity())
            del person["password"]
            organisation = persons_service.get_organisation()
            return {
                "authenticated": True,
                "user": person,
                "organisation": organisation,
                "ldap": app.config["AUTH_STRATEGY"] == "auth_remote_ldap"
            }
        except PersonNotFoundException:
            abort(401)


class LogoutResource(Resource):
    """
    Log user out by revoking his auth tokens. Once log out, current user
    cannot access to API anymore.
    """

    @jwt_required
    def get(self):
        try:
            logout()
            identity_changed.send(
                current_app._get_current_object(),
                identity=AnonymousIdentity()
            )
        except KeyError:
            return {
                "Access token not found."
            }, 500

        logout_data = {
            "logout": True
        }

        if is_from_browser(request.user_agent):
            response = jsonify(logout_data)
            unset_jwt_cookies(response)
            return response
        else:
            return logout_data


class LoginResource(Resource):
    """
    Log in user by creating and registering auth tokens. Login is based
    on email and password. If no user match given email and a destkop ID,
    it looks in matching the desktop ID with the one stored in database. It is
    useful for clients that run on desktop tools and that don't know user email.
    """

    def post(self):
        (email, password) = self.get_arguments()
        try:
            user = auth_service.check_auth(app, email, password)
            del user["password"]

            if password == "default":
                token = uuid.uuid4()
                auth_tokens_store.add(
                    "reset-%s" % token,
                    email,
                    ttl=3600 * 2
                )
                current_app.logger.info("User must change his password.")
                return {
                    "login": False,
                    "default_password": True,
                    "token": str(token)
                }, 400

            access_token = create_access_token(identity=user["email"])
            refresh_token = create_refresh_token(identity=user["email"])
            auth_service.register_tokens(app, access_token, refresh_token)
            identity_changed.send(
                current_app._get_current_object(),
                identity=Identity(user["id"])
            )

            if is_from_browser(request.user_agent):
                organisation = persons_service.get_organisation()
                response = jsonify({
                    "user": user,
                    "organisation": organisation,
                    "ldap": app.config["AUTH_STRATEGY"] == "auth_remote_ldap",
                    "login": True
                })
                set_access_cookies(response, access_token)
                set_refresh_cookies(response, refresh_token)
                events_service.create_login_log(
                    user["id"],
                    request.remote_addr,
                    "web"
                )

            else:
                events_service.create_login_log(
                    user["id"],
                    request.remote_addr,
                    "script"
                )
                response = {
                    "login": True,
                    "user": user,
                    "ldap": app.config["AUTH_STRATEGY"] == "auth_remote_ldap",
                    "access_token": access_token,
                    "refresh_token": refresh_token
                }

            return response
        except PersonNotFoundException:
            current_app.logger.info("User is not registered.")
            return {"login": False}, 400
        except WrongUserException:
            current_app.logger.info("User is not registered.")
            return {"login": False}, 400
        except WrongPasswordException:
            current_app.logger.info("User gave a wrong password.")
            return {"login": False}, 400
        except NoAuthStrategyConfigured:
            current_app.logger.info(
                "Authentication strategy is not properly configured."
            )
            return {"login": False}, 400
        except TimeoutError:
            current_app.logger.info(
                "Timeout occurs while logging in."
            )
            return {"login": False}, 400
        except UnactiveUserException:
            return {
                "error": True,
                "login": False,
                "message": "User is unactive, he cannot log in."
            }, 400
        except OperationalError as exception:
            current_app.logger.error(exception)
            return {
                "error": True,
                "login": False,
                "message": "Database doesn't seem reachable."
            }, 500
        except Exception as exception:
            if hasattr(exception, "message"):
                message = exception.message
            else:
                message = str(exception)
            return {
                "error": True,
                "login": False,
                "message": message
            }, 500

    def get_arguments(self):
        parser = reqparse.RequestParser()
        parser.add_argument(
            "email",
            required=True,
            help="User email is missing."
        )
        parser.add_argument("password", default="default")
        args = parser.parse_args()

        return (
            args["email"],
            args["password"],
        )


class RefreshTokenResource(Resource):
    """
    Tokens are considered as outdated every two weeks. This route allows to
    make their lifetime long. Before they get outdated.
    """

    @jwt_refresh_token_required
    def get(self):
        email = get_jwt_identity()
        access_token = create_access_token(identity=email)
        auth_service.register_tokens(app, access_token)
        if is_from_browser(request.user_agent):
            response = jsonify({'refresh': True})
            set_access_cookies(response, access_token)
        else:
            return {
                "access_token": access_token
            }


class RegistrationResource(Resource):
    """
    Allow an user to register himself to the service.
    """

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
            persons_service.create_person(
                email,
                password,
                first_name,
                last_name
            )
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
    """
    Allow the user to change his password. Prior to modify the password,
    it requires to give the current password (to make sure the user changing
    the password is not someone who stealed the session).
    The new password requires a confirmation to ensure that the user didn't
    make mistake by typing his new password.
    """

    @jwt_required
    def post(self):
        (
            old_password,
            password,
            password_2,
        ) = self.get_arguments()

        try:
            auth_service.check_auth(app, get_jwt_identity(), old_password)
            auth.validate_password(password, password_2)
            password = auth.encrypt_password(password)
            persons_service.update_password(get_jwt_identity(), password)
            return {"success": True}

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
        except UnactiveUserException:
            return {
                "error": True,
                "message": "Old password is wrong."
            }, 400
        except WrongPasswordException:
            return {
                "error": True,
                "message": "User is unactive."
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


class ResetPasswordResource(Resource, ArgsMixin):
    """
    Ressource to allow a user to change his password when he forgets it.
    It uses a classic scheme: a token is sent by email to the user. Then
    he can change his password.
    """

    def put(self):
        args = self.get_put_arguments()
        try:
            email = auth_tokens_store.get("reset-%s" % args["token"])
            if email:
                auth.validate_password(args["password"], args["password2"])
                password = auth.encrypt_password(args["password"])
                persons_service.update_password(email, password)
                auth_tokens_store.delete("reset-%s" % args["token"])
                return {"success": True}
            else:
                return {
                    "error": True,
                    "message": "Wrong or expired token."
                }, 400

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
        except UnactiveUserException:
            return {
                "error": True,
                "message": "User is unactive."
            }, 400

    def post(self):
        args = self.get_arguments()
        try:
            user = persons_service.get_person_by_email(args["email"])
        except PersonNotFoundException:
            return {
                "error": True,
                "message": "Email not listed in database."
            }, 400

        token = uuid.uuid4()
        auth_tokens_store.add(
            "reset-%s" % token,
            args["email"],
            ttl=3600 * 2
        )

        message_text = """Hello %s,

You have requested for a password reset. You can connect here to change your
password:
https://%s/reset-change-password/%s

Regards,

CGWire Team
""" % (
            user["first_name"],
            current_app.config["DOMAIN_NAME"],
            token
        )

        if current_app.config["MAIL_DEBUG"]:
            print(message_text)
        else:
            message = Message(
                body=message_text,
                subject="CGWire password recovery",
                recipients=[args["email"]]
            )
            mail.send(message)
        return {
            "success": "Reset token sent"
        }

    def get_arguments(self):
        return self.get_args([
            ("email", "", True),
        ])

    def get_put_arguments(self):
        return self.get_args([
            ("token", "", True),
            ("password", "", True),
            ("password2", "", True),
        ])
