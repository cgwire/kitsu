import flask_bcrypt as bcrypt
import email_validator

from zou.app.utils import fields

from zou.app.project import person_info
from zou.app.project.exception import PersonNotFoundException


class WrongPasswordException(BaseException):
    pass


class PasswordTooShortException(BaseException):
    pass


class PasswordsNoMatchException(BaseException):
    pass


class EmailNotValidException(BaseException):
    pass


class User(object):
    is_active = True
    is_authenticated = True
    is_anonymous = False

    def __init__(self, email, id, first_name, last_name):
        self.email = email
        self.id = id
        self.first_name = first_name
        self.last_name = last_name

    def get_id(self):
        return self.id

    def to_dict(self):
        return fields.serialize_value({
            "id": self.id,
            "email": self.email,
            "first_name": self.first_name,
            "last_name": self.last_name
        })


def load_user(user_id):
    try:
        person = person_info.get_person(user_id)
        return person_to_user(person)
    except PersonNotFoundException:
        return None


def person_to_user(person):
    return User(
        email=person.email,
        id=person.id,
        first_name=person.first_name,
        last_name=person.last_name
    )


def get_user_by_email(email):
    person = person_info.get_by_email(email)
    return person_to_user(person)


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
        person = person_info.get_by_email(email)
        password_hash = person.password or u''

        if bcrypt.check_password_hash(password_hash, password):
            return True
        else:
            raise WrongPasswordException()
    except ValueError:
        raise WrongPasswordException()
