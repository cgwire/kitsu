import flask_bcrypt as bcrypt

from flask_jwt_extended import get_jti
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
    WrongUserException,
    NoAuthStrategyConfigured,
    UnactiveUserException
)
from zou.app.stores import auth_tokens_store


def check_auth(app, email, password):
    """
    Depending on configured strategy, it checks if given email and password
    mach an active user in the database. It raises exceptions adapted to
    encountered error (no auth strategy configured, wrong email, wrong passwor
    or unactive user).
    App is needed as parameter to give access to configuration while avoiding
    cyclic imports.
    """
    strategy = app.config["AUTH_STRATEGY"]
    if strategy == "auth_local_classic":
        user = local_auth_strategy(email, password, app)
    elif strategy == "auth_local_no_password":
        user = no_password_auth_strategy(email)
    elif strategy == "auth_remote_active_directory":
        user = active_directory_auth_strategy(email, password, app)
    else:
        raise NoAuthStrategyConfigured

    if user is None:
        app.logger.error("No user found for: %s" % email)
        raise WrongUserException(email)

    if not user.get("active", False):
        raise UnactiveUserException(user["email"])

    return user


def check_credentials(email, password, app=None):
    """
    Check if given password and email match an user in database.
    Password hash comparison is based on BCrypt.
    """
    try:
        person = persons_service.get_person_by_email(email)
    except PersonNotFoundException:
        try:
            person = persons_service.get_person_by_desktop_login(email)
        except PersonNotFoundException:
            if app is not None:
                app.logger.error("Person not found: %s" % (email))
            raise WrongPasswordException()

    try:
        password_hash = person["password"] or u''

        if bcrypt.check_password_hash(password_hash, password):
            return person
        else:
            if app is not None:
                app.logger.error("Wrong password for person: %s" % person)
            raise WrongPasswordException()
    except ValueError:
        if app is not None:
            app.logger.error("Wrong password for: %s" % person)
        raise WrongPasswordException()


def no_password_auth_strategy(email):
    """
    If no password auth strategy is configured, it just checks that given email
    matches an user in the database.
    """
    try:
        person = persons_service.get_person_by_email(email)
    except PersonNotFoundException:
        try:
            person = persons_service.get_person_by_desktop_login(email)
        except PersonNotFoundException:
            return None
    return person


def local_auth_strategy(email, password, app=None):
    """
    Local strategy just checks that email and passwords are correct the
    traditional way (email is in database and related password hash corresponds
    to given password).
    """
    return check_credentials(email, password, app)


def active_directory_auth_strategy(email, password, app):
    """
    Connect to an active directory server to know if given user can be
    authenticated.
    """
    username = email.split("@")[0]
    domain = app.config["AUTH_AD_DOMAIN"]
    user = "%s\\%s" % (domain, username)

    server_ip = app.config["AUTH_AD_HOST"]
    server_port = app.config["AUTH_AD_PORT"]
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
    """
    Register access and refresh tokens to auth token store. That way they
    can be used like a session.
    """
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
    """
    Remove access and refresh tokens from auth token store.
    """
    auth_tokens_store.add(
        jti,
        'true',
        app.config["JWT_ACCESS_TOKEN_EXPIRES"]
    )
