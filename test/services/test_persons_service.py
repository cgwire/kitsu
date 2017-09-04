from test.base import ApiDBTestCase

from zou.app.services import persons_service

from zou.app.services.exception import PersonNotFoundException


class PersonServiceTestCase(ApiDBTestCase):

    def setUp(self):
        super(PersonServiceTestCase, self).setUp()

        self.generate_fixture_person()
        self.person_id = self.person.id
        self.person_email = self.person.email

    def test_get_person(self):
        self.assertRaises(
            PersonNotFoundException,
            persons_service.get_person,
            "wrong-id"
        )
        person = persons_service.get_person(self.person_id)
        self.assertEqual(self.person_id, person.id)
        person.delete()

        self.assertRaises(
            PersonNotFoundException,
            persons_service.get_person,
            self.person_id
        )

    def test_get_by_email(self):
        self.assertRaises(
            PersonNotFoundException,
            persons_service.get_by_email,
            "wrong-email"
        )
        person = persons_service.get_by_email(self.person_email)
        self.assertEqual(self.person_id, person.id)
        person.delete()

        self.assertRaises(
            PersonNotFoundException,
            persons_service.get_by_email,
            self.person_email
        )

    def test_get_person_by_username(self):
        person = persons_service.get_person_by_username("john.doe@gmail.com")
        self.assertEquals(person["first_name"], "John")
        self.assertRaises(
            PersonNotFoundException,
            persons_service.get_person_by_username,
            "ema.doe@yahoo.com"
        )
