from test.base import ApiDBTestCase

from zou.app.services import persons_service

from zou.app.services.exception import PersonNotFoundException


class PersonServiceTestCase(ApiDBTestCase):

    def setUp(self):
        super(PersonServiceTestCase, self).setUp()

        self.generate_fixture_person()
        self.person_id = str(self.person.id)
        self.person_email = self.person.email
        self.person_desktop_login = self.person.desktop_login

    def test_get_all_active(self):
        self.assertEqual(len(persons_service.all()), 2)
        self.person.update({"active": False})
        self.assertEqual(len(persons_service.all_active()), 1)

    def test_get_person(self):
        self.assertRaises(
            PersonNotFoundException,
            persons_service.get_person,
            "wrong-id"
        )
        person = persons_service.get_person(self.person_id)
        self.assertEqual(self.person_id, person["id"])
        persons_service.delete_person(self.person_id)

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
        self.assertEqual(self.person_id, person["id"])
        persons_service.delete_person(person["id"])

        self.assertRaises(
            PersonNotFoundException,
            persons_service.get_by_email,
            self.person_email
        )

    def test_get_by_desktop_login(self):
        self.assertRaises(
            PersonNotFoundException,
            persons_service.get_by_desktop_login,
            "wrong-login"
        )
        person = persons_service.get_by_desktop_login(self.person_desktop_login)
        self.assertEqual(self.person_id, person["id"])
        persons_service.delete_person(person["id"])

        self.assertRaises(
            PersonNotFoundException,
            persons_service.get_by_desktop_login,
            self.person_desktop_login
        )

    def test_get_person_by_username(self):
        person = persons_service.get_person_by_email_username(
            "john.doe@gmail.com"
        )
        self.assertEquals(person["first_name"], "John")
        self.assertRaises(
            PersonNotFoundException,
            persons_service.get_person_by_email_username,
            "ema.doe@yahoo.com"
        )
