import pytest

from tests.base import ApiDBTestCase

from zou.app.models.person import Person
from zou.app.services import persons_service
from zou.app.services.exception import PersonNotFoundException


class PersonCacheInvalidationTestCase(ApiDBTestCase):

    def setUp(self):
        super(PersonCacheInvalidationTestCase, self).setUp()
        self.generate_fixture_person()

    def test_add_logs(self):
        person = persons_service.get_person_by_email("john.doe@gmail.com")
        person_raw = Person.get(person["id"])
        person_raw.update({"email": "jhon.doe.bis@gmail.com"})
        person = persons_service.get_person_by_email("john.doe@gmail.com")

        person = persons_service.update_person(
            person["id"],
            {"email": "john.doe2@gmail.com"}
        )
        with pytest.raises(PersonNotFoundException):
            persons_service.get_person_by_email("john.doe@gmail.com")
        person = persons_service.get_person_by_email("john.doe2@gmail.com")
