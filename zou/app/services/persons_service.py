import slugify

from sqlalchemy.exc import StatementError

from flask_jwt_extended import get_jwt_identity

from zou.app.models.person import Person
from zou.app.utils import fields
from zou.app.services.exception import PersonNotFoundException


def get_persons():
    """
    Return all person stored in database.
    """
    return fields.serialize_models(Person.query.all())


def get_active_persons():
    """
    Return all person with flag active set to True.
    """
    return fields.serialize_models(Person.query.filter_by(active=True).all())


def get_person_raw(person_id):
    """
    Return given person as an active record.
    """
    if person_id is None:
        raise PersonNotFoundException()

    try:
        person = Person.get(person_id)
    except StatementError:
        raise PersonNotFoundException()

    if person is None:
        raise PersonNotFoundException()
    return person


def get_person(person_id):
    """
    Return given person as a dictionary.
    """
    person = get_person_raw(person_id)
    return person.serialize()


def get_person_by_email_username(email):
    """
    Return person that matches given email as a dictionary.
    """
    username = email.split("@")[0]

    for person in get_persons():
        first_name = slugify.slugify(person["first_name"])
        last_name = slugify.slugify(person["last_name"])
        person_username = "%s.%s" % (first_name, last_name)
        if person_username == username:
            return person

    raise PersonNotFoundException


def get_person_by_email_raw(email):
    """
    Return person that matches given email as an active record.
    """
    person = Person.get_by(email=email)

    if person is None:
        raise PersonNotFoundException()
    return person


def get_person_by_email(email):
    """
    Return person that matches given email as a dictionary.
    """
    person = get_person_by_email_raw(email)
    return person.serialize()


def get_person_by_desktop_login(desktop_login):
    """
    Return person that matches given desktop login as a dictionary. It is useful
    to authenticate user from their desktop session login.
    """
    try:
        person = Person.get_by(desktop_login=desktop_login)
    except StatementError:
        raise PersonNotFoundException()

    if person is None:
        raise PersonNotFoundException()
    return person.serialize()


def get_current_user():
    """
    Return person from its auth token (the one that does the request) as a
    dictionary.
    """
    return get_person_by_email(get_jwt_identity())


def get_current_user_raw():
    """
    Return person from its auth token (the one that does the request) as an
    active record.
    """
    return get_person_by_email_raw(get_jwt_identity())


def create_person(
    email,
    password,
    first_name,
    last_name,
    phone="",
    role="user"
):
    """
    Create a new person entry in the database. No operation are performed on
    password, so encrypted password is expected.
    """
    person = Person.create(
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name,
        phone=phone,
        role=role
    )
    return person.serialize()


def update_password(email, password):
    """
    Update password field for use matching given email.
    """
    person = get_person_by_email_raw(email)
    person.update({"password": password})
    return person.serialize()


def update_person(person_id, data):
    """
    Update person entry with data given in parameter.
    """
    person = Person.get(person_id)
    person.update(data)
    return person.serialize()


def delete_person(person_id):
    """
    Delete person entry from database.
    """
    person = Person.get(person_id)
    person_dict = person.serialize()
    person.delete()
    return person_dict
