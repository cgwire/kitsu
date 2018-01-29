import slugify

from sqlalchemy.exc import StatementError

from flask import current_app
from flask_jwt_extended import get_jwt_identity

from zou.app.models.person import Person
from zou.app.utils import fields
from zou.app.services.exception import PersonNotFoundException


def all():
    return fields.serialize_models(Person.query.all())


def all_active():
    return fields.serialize_models(Person.query.filter_by(active=True).all())


def create_person(
    email,
    password,
    first_name,
    last_name,
    phone="",
    role="user"
):
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
    person = get_by_email_raw(email)
    person.update({"password": password})
    return person.serialize()


def get_person_raw(person_id):
    try:
        person = Person.get(person_id)
    except StatementError:
        raise PersonNotFoundException()

    if person is None:
        raise PersonNotFoundException()
    return person


def get_person(person_id):
    person = get_person_raw(person_id)
    return person.serialize()


def get_person_by_email_username(email):
    username = email.split("@")[0]

    for person in all():
        first_name = slugify.slugify(person["first_name"])
        last_name = slugify.slugify(person["last_name"])
        person_username = "%s.%s" % (first_name, last_name)
        if person_username == username:
            return person

    raise PersonNotFoundException


def get_by_email_raw(email):
    person = Person.get_by(email=email)

    if person is None:
        raise PersonNotFoundException()
    return person


def get_by_email(email):
    person = get_by_email_raw(email)
    return person.serialize()


def get_by_desktop_login(desktop_login):
    try:
        person = Person.get_by(desktop_login=desktop_login)
    except StatementError:
        raise PersonNotFoundException()

    if person is None:
        raise PersonNotFoundException()
    return person.serialize()


def get_current_user():
    return get_by_email(get_jwt_identity())


def get_current_user_raw():
    return get_by_email_raw(get_jwt_identity())


def update_person(person_id, changes):
    person = Person.get(person_id)
    person.update(changes)
    return person.serialize()


def delete_person(person_id):
    person = Person.get(person_id)
    person.delete()
    return person.serialize()
