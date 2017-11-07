import flask_bcrypt as bcrypt

from flask_jwt_extended import get_jti
from flask_restful import current_app
from ldap3 import (
    Server,
    Connection,
    AUTO_BIND_NO_TLS,
    SUBTREE,
    ALL_ATTRIBUTES
)

from zou.app.services import persons_service
from zou.app.services.exception import (
    PersonNotFoundException,
    WrongPasswordException,
    NoAuthStrategyConfigured,
    UnactiveUserException
)
from zou.app.stores import auth_tokens_store


def check_auth(app, email, password):
    strategy = app.config["AUTH_STRATEGY"]
    if strategy == "auth_local_classic":
        user = local_auth_strategy(email, password)
    elif strategy == "auth_local_no_password":
        user = no_password_auth_strategy(email)
    elif strategy == "auth_remote_active_directory":
        user = active_directory_auth_strategy(email, password)
    else:
        raise NoAuthStrategyConfigured

    if not user.get("active", False):
        raise UnactiveUserException(user["email"])

    return user


def check_credentials(email, password):
    try:
        person = persons_service.get_by_email(email)
    except PersonNotFoundException:
        person = persons_service.get_by_desktop_login(email)

    try:
        password_hash = person["password"] or u''

        if bcrypt.check_password_hash(password_hash, password):
            return person
        else:
            raise WrongPasswordException()
    except ValueError:
        raise WrongPasswordException()


def no_password_auth_strategy(email):
    try:
        person = persons_service.get_by_email(email)
    except PersonNotFoundException:
        person = persons_service.get_by_desktop_login(email)
    return person


def local_auth_strategy(email, password):
    return check_credentials(email, password)


def active_directory_auth_strategy(email, password):
    username = email.split("@")[0]
    domain = current_app.config["AUTH_AD_DOMAIN"]
    user = "%s\\%s" % (domain, username)

    server_ip = current_app.config["AUTH_AD_HOST"]
    server_port = current_app.config["AUTH_AD_PORT"]
    server = Server(server_ip, port=server_port, use_ssl=False)

    try:
        with Connection(
            server,
            auto_bind=AUTO_BIND_NO_TLS,
            read_only=True,
            check_names=True,
            user=user,
            password=password,
            pool_lifetime=3600
        ) as connection:
            connection.search(
                search_base='CN=Users,DC=domain,DC=local',
                search_filter='(&(samAccountName=%s))' % username,
                search_scope=SUBTREE,
                attributes=ALL_ATTRIBUTES,
                get_operational_attributes=True
            )
            return persons_service.get_person_by_email_username(email)
    except:
        raise PersonNotFoundException


def register_tokens(app, access_token, refresh_token=None):
    access_jti = get_jti(encoded_token=access_token)
    auth_tokens_store.add(
        access_jti,
        'false',
        app.config["JWT_ACCESS_TOKEN_EXPIRES"]
    )

    if refresh_token is not None:
        refresh_jti = get_jti(encoded_token=refresh_token)
        auth_tokens_store.add(
            refresh_jti,
            'false',
            app.config["JWT_REFRESH_TOKEN_EXPIRES"]
        )


def revoke_tokens(app, jti):
    auth_tokens_store.add(
        jti,
        'true',
        app.config["JWT_ACCESS_TOKEN_EXPIRES"]
    )
