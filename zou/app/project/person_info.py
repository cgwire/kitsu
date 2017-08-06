from sqlalchemy.exc import StatementError

from flask_login import current_user

from zou.app.models.person import Person
from zou.app.project.exception import PersonNotFoundException


def create_person(email, password, first_name, last_name):
    person = Person(
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name
    )
    person.save()
    return person


def update_password(user, password):
    person = get_person(user.id)
    person.update({"password": password})


def get_person(person_id):
    try:
        person = Person.get(person_id)
    except StatementError:
        raise PersonNotFoundException()

    if person is None:
        raise PersonNotFoundException()
    return person


def get_by_email(email):
    try:
        person = Person.get_by(email=email)
    except StatementError:
        raise PersonNotFoundException()

    if person is None:
        raise PersonNotFoundException()
    return person


def get_current_user():
    if current_user:
        return current_user
    else:
        return Person.query.first()
