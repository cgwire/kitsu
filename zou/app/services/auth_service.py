import flask_bcrypt as bcrypt

from flask_jwt_extended import get_jti
from ldap3 import (
    Server,
    Connection,
    ALL,
    NTLM,
    SIMPLE
)
from ldap3.core.exceptions import (
    LDAPSocketOpenError,
    LDAPInvalidCredentialsResult
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
    elif strategy == "auth_remote_ldap":
        user = ldap_auth_strategy(email, password, app)
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
                app.logger.error(
                    "Wrong password for person: %s" % person["full_name"]
                )
            raise WrongPasswordException()
    except ValueError:
        if app is not None:
            app.logger.error(
                "Wrong password for: %s" % person["full_name"]
            )
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


def ldap_auth_strategy(email, password, app):
    """
    Connect to an active directory server to know if given user can be
    authenticated.
    """
    person = None
    try:
        person = persons_service.get_person_by_email(email)
    except PersonNotFoundException:
        person = persons_service.get_person_by_desktop_login(email)

    try:
        ldap_server = "%s:%s" % (
            app.config["LDAP_HOST"],
            app.config["LDAP_PORT"]
        )
        server = Server(ldap_server, get_info=ALL)
        if app.config["LDAP_IS_AD"]:
            user = "%s\%s" % (
                app.config["LDAP_DOMAIN"],
                person["desktop_login"]
            )
            authentication = NTLM
        else:
            user = "uid=%s,%s" % (
                person["desktop_login"],
                app.config["LDAP_BASE_DN"]
            )
            authentication = SIMPLE

        conn = Connection(
            server,
            user=user,
            password=password,
            authentication=authentication,
            raise_exceptions=True
        )
        conn.bind()
        return person

    except LDAPSocketOpenError:
        app.logger.error("Cannot connect to LDAP/Active directory server")
        return ldap_auth_strategy_fallback(email, password, app, person)

    except LDAPInvalidCredentialsResult:
        app.logger.error("LDAP cannot authenticate user: %s" % email)
        return ldap_auth_strategy_fallback(email, password, app, person)


def ldap_auth_strategy_fallback(email, password, app, person):
    """
    When ldap auth fails, admin users can try to connect with default
    auth strategy.
    (only if fallback is activated (via LDAP_FALLBACK flag) in configuration)
    """
    if app.config["LDAP_FALLBACK"] and persons_service.is_admin(person):
        person = persons_service.get_person_by_email(email)
        return local_auth_strategy(email, password, app)
    else:
        raise WrongPasswordException


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
