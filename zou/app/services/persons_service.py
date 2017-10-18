import slugify

from sqlalchemy.exc import StatementError

from flask_jwt_extended import get_jwt_identity

from zou.app.models.person import Person
from zou.app.services.exception import PersonNotFoundException


def all():
    return Person.query.all()


def all_active():
    return Person.query.filter_by(active=True).all()


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
    return person


def update_password(email, password):
    person = get_by_email(email)
    person.update({"password": password})


def get_person(person_id):
    try:
        person = Person.get(person_id)
    except StatementError:
        raise PersonNotFoundException()

    if person is None:
        raise PersonNotFoundException()
    return person


def get_person_by_email_username(email):
    username = email.split("@")[0]

    for person in all():
        first_name = slugify.slugify(person.first_name)
        last_name = slugify.slugify(person.last_name)
        person_username = "%s.%s" % (first_name, last_name)
        if person_username == username:
            return person.serialize()

    raise PersonNotFoundException


def get_by_email(email):
    try:
        person = Person.get_by(email=email)
    except StatementError:
        raise PersonNotFoundException()

    if person is None:
        raise PersonNotFoundException()
    return person


def get_by_desktop_login(desktop_login):
    try:
        person = Person.get_by(desktop_login=desktop_login)
    except StatementError:
        raise PersonNotFoundException()

    if person is None:
        raise PersonNotFoundException()
    return person


def get_current_user():
    return get_by_email(get_jwt_identity())
