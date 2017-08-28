import slugify
import flask_bcrypt as bcrypt
import email_validator

from flask_restful import current_app
from ldap3 import (
    Server,
    Connection,
    AUTO_BIND_NO_TLS,
    SUBTREE,
    ALL_ATTRIBUTES
)

from zou.app.services import persons_service
from zou.app.services.exception import PersonNotFoundException


class NoAuthStrategyConfigured(Exception):
    pass


class WrongPasswordException(BaseException):
    pass


class PasswordTooShortException(BaseException):
    pass


class PasswordsNoMatchException(BaseException):
    pass


class EmailNotValidException(BaseException):
    pass


def encrypt_password(password):
    return bcrypt.generate_password_hash(password)


def validate_email(email):
    try:
        return email_validator.validate_email(email)["email"]
    except email_validator.EmailNotValidError as e:
        raise EmailNotValidException(str(e))


def validate_password(password, password_2):
    if len(password) < 6:
        raise PasswordTooShortException()
    if password != password_2:
        raise PasswordsNoMatchException()
    return True


def check_credentials(email, password):
    try:
        person = persons_service.get_by_email(email)
        password_hash = person.password or u''

        if bcrypt.check_password_hash(password_hash, password):
            return True
        else:
            raise WrongPasswordException()
    except ValueError:
        raise WrongPasswordException()


def get_person_by_username(email):
    username = email.split("@")[0]
    persons = persons_service.all()
    username_map = {}
    for person in persons:
        first_name = slugify.slugify(person.first_name)
        last_name = slugify.slugify(person.last_name)
        person_username = "%s.%s" % (first_name, last_name)
        username_map[person_username] = person

    if username in username_map:
        return username_map.get(username, {"name": "anonymous"}).serialize()
    else:
        raise PersonNotFoundException


def no_password_auth_strategy(email):
    return get_person_by_username(email)


def local_auth_strategy(email, password):
    check_credentials(email, password)
    person = persons_service.get_by_email(email)
    return person.serialize()


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
            return get_person_by_username(email)
    except:
        raise PersonNotFoundException
